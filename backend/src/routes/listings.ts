// Routes API pour les annonces
// GET /listings : liste les annonces avec filtres
// POST /listings : créer une annonce
// POST /listings/:id/close : clôturer une annonce

import { Router } from "express";
import type { Request, Response } from "express";
import type { AppSession } from "../types";
import { requireAuth } from "../middlewares/auth";
import {
  createListing,
  getListingById,
  closeListing,
  findListings,
  isListingOwner,
  isListingClosed,
  calculateDistances,
  type ListingType,
  type ListingFilters,
} from "../models/Listing";
import { geocodeAddress, validateManualFallback } from "../services/geocoding";
import {
  validateListingType,
  validateListingTitle,
  validateListingDescription,
  validateServiceTypeIds,
  validateAddress,
  validateRadius,
} from "../utils/validation";
import { toListingPublic, toListingsPublic } from "../utils/publicMappers";

const router = Router();

// Récupérer la liste des annonces avec filtres optionnels
router.get("/", (req: Request, res: Response) => {
  const filters: ListingFilters = {};

  // Type d'annonce
  if (req.query.type === "demande" || req.query.type === "proposition") {
    filters.type = req.query.type;
  }

  // Statut
  if (
    req.query.status === "active" ||
    req.query.status === "closed" ||
    req.query.status === "all"
  ) {
    filters.status = req.query.status;
  }

  // Types de service
  if (
    typeof req.query.serviceTypeIds === "string" &&
    req.query.serviceTypeIds
  ) {
    filters.serviceTypeIds = req.query.serviceTypeIds
      .split(",")
      .map((s) => s.trim());
  }

  // Ville
  if (typeof req.query.city === "string" && req.query.city) {
    filters.city = req.query.city;
  }

  // Département
  if (typeof req.query.department === "string" && req.query.department) {
    filters.department = req.query.department;
  }

  // Recherche textuelle
  if (typeof req.query.q === "string" && req.query.q) {
    filters.q = req.query.q;
  }

  // Filtre par auteur
  if (typeof req.query.authorId === "string" && req.query.authorId) {
    filters.authorId = req.query.authorId;
  }

  // Exclure les annonces d'un auteur
  if (
    typeof req.query.excludeAuthorId === "string" &&
    req.query.excludeAuthorId
  ) {
    filters.excludeAuthorId = req.query.excludeAuthorId;
  }

  // Filtrage par distance
  if (
    req.query.aroundLat !== undefined &&
    req.query.aroundLng !== undefined &&
    req.query.radiusKm !== undefined
  ) {
    const aroundLat = parseFloat(req.query.aroundLat as string);
    const aroundLng = parseFloat(req.query.aroundLng as string);
    const radiusKm = parseInt(req.query.radiusKm as string, 10);

    // Valider le rayon
    const radiusCheck = validateRadius(radiusKm);
    if (!radiusCheck.valid) {
      res.status(400).json({ error: radiusCheck.message });
      return;
    }

    if (!isNaN(aroundLat) && !isNaN(aroundLng)) {
      filters.aroundLat = aroundLat;
      filters.aroundLng = aroundLng;
      filters.radiusKm = radiusKm;
    }
  }

  const listings = findListings(filters);

  // Calculer les distances si un point de référence est fourni
  let distances: Map<string, number> | undefined;
  if (filters.aroundLat !== undefined && filters.aroundLng !== undefined) {
    distances = calculateDistances(
      listings,
      filters.aroundLat,
      filters.aroundLng,
    );
  }

  // TOUJOURS utiliser le mapper public avec les distances
  res.status(200).json({ listings: toListingsPublic(listings, distances) });
});

/**
 * GET /api/listings/:id
 * Détail d'une annonce.
 * Accès : public
 */
router.get("/:id", (req: Request, res: Response) => {
  const listing = getListingById(req.params.id as string);

  if (!listing) {
    res.status(404).json({ error: "Annonce introuvable." });
    return;
  }

  // TOUJOURS utiliser le mapper public
  res.status(200).json({ listing: toListingPublic(listing) });
});

/**
 * POST /api/listings
 * Crée une nouvelle annonce.
 * Accès : authentifié
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;

  const {
    type,
    title,
    description,
    serviceTypeIds,
    addressRaw,
    manualLocationFallback,
  } = req.body;

  // Validation des champs
  const typeCheck = validateListingType(type);
  if (!typeCheck.valid) {
    res.status(400).json({ error: typeCheck.message });
    return;
  }

  const titleCheck = validateListingTitle(title);
  if (!titleCheck.valid) {
    res.status(400).json({ error: titleCheck.message });
    return;
  }

  const descCheck = validateListingDescription(description);
  if (!descCheck.valid) {
    res.status(400).json({ error: descCheck.message });
    return;
  }

  const serviceCheck = validateServiceTypeIds(serviceTypeIds);
  if (!serviceCheck.valid) {
    res.status(400).json({ error: serviceCheck.message });
    return;
  }

  const addressCheck = validateAddress(addressRaw);
  if (!addressCheck.valid) {
    res.status(400).json({ error: addressCheck.message });
    return;
  }

  // Tentative de géocodage
  const geocodeResult = await geocodeAddress(addressRaw);

  if (geocodeResult) {
    // Géocodage réussi
    const listing = await createListing({
      createdByUserId: userId,
      type: type as ListingType,
      title: title.trim(),
      description: description.trim(),
      serviceTypeIds,
      addressRaw: addressRaw.trim(),
      cityName: geocodeResult.cityName,
      postalCode: geocodeResult.postalCode,
      departmentCode: geocodeResult.departmentCode,
      inseeCode: geocodeResult.inseeCode,
      geoLatRounded: geocodeResult.lat,
      geoLngRounded: geocodeResult.lng,
      geoSource: "geocoded",
    });

    res.status(201).json({ listing: toListingPublic(listing) });
    return;
  }

  // Géocodage échoué — vérifier le fallback manuel
  if (manualLocationFallback) {
    const fallbackCheck = validateManualFallback(manualLocationFallback);

    if (!fallbackCheck.valid) {
      res.status(400).json({ error: fallbackCheck.message });
      return;
    }

    const listing = await createListing({
      createdByUserId: userId,
      type: type as ListingType,
      title: title.trim(),
      description: description.trim(),
      serviceTypeIds,
      addressRaw: addressRaw.trim(),
      cityName: fallbackCheck.cityName,
      postalCode: fallbackCheck.postalCode ?? "",
      departmentCode: fallbackCheck.departmentCode,
      inseeCode: null,
      geoLatRounded: null,
      geoLngRounded: null,
      geoSource: "manual_fallback",
    });

    res.status(201).json({ listing: toListingPublic(listing) });
    return;
  }

  // Pas de fallback fourni — demander à l'utilisateur de le fournir
  res.status(422).json({
    error: "Nous n'avons pas pu localiser cette adresse automatiquement.",
    code: "GEOCODING_FAILED",
    message:
      "Merci de vérifier votre adresse ou de renseigner manuellement la ville et le département.",
    requiresManualFallback: true,
  });
});

/**
 * POST /api/listings/:id/close
 * Clôture une annonce.
 * Accès : authentifié + propriétaire
 */
router.post("/:id/close", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;
  const listingId = req.params.id as string;

  // Vérifier que l'annonce existe
  const listing = getListingById(listingId);
  if (!listing) {
    res.status(404).json({ error: "Annonce introuvable." });
    return;
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (!isListingOwner(listingId, userId)) {
    res
      .status(403)
      .json({ error: "Vous ne pouvez clôturer que vos propres annonces." });
    return;
  }

  // Vérifier que l'annonce n'est pas déjà clôturée
  if (isListingClosed(listingId)) {
    res.status(409).json({ error: "Cette annonce est déjà clôturée." });
    return;
  }

  const closedListing = await closeListing(listingId, userId);

  if (!closedListing) {
    res.status(500).json({ error: "Erreur lors de la clôture de l'annonce." });
    return;
  }

  res.status(200).json({ listing: toListingPublic(closedListing) });
});

export default router;

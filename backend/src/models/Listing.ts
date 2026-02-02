/**
 * Modèle Listing (Annonce).
 * Stockage en mémoire pour le MVP — sera remplacé par une vraie DB.
 *
 * Règles de confidentialité (non négociables) :
 * - addressRaw : JAMAIS exposé
 * - geoLatRounded / geoLngRounded : JAMAIS exposés via API publique
 * - Utiliser toPublic() pour toute réponse API
 */

import { v4 as uuidv4 } from "uuid";
import { readDb, writeDb } from "../db/fileDb";

/** Type d'annonce. */
export type ListingType = "demande" | "proposition";

/** Statut d'annonce. */
export type ListingStatus = "active" | "closed";

/** Source de géolocalisation. */
export type GeoSource = "geocoded" | "manual_fallback";

/** Représentation interne d'une annonce (avec données privées). */
export interface ListingInternal {
  id: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;

  type: ListingType;
  status: ListingStatus;
  title: string;
  description: string;
  serviceTypeIds: string[];

  // Localisation publique
  cityName: string;
  postalCode: string;
  departmentCode: string;
  inseeCode: string | null;

  // Localisation privée (JAMAIS exposée)
  addressRaw: string;
  geoLatRounded: number | null;
  geoLngRounded: number | null;
  geoSource: GeoSource;
}

/** Données pour créer une annonce. */
export interface CreateListingData {
  createdByUserId: string;
  type: ListingType;
  title: string;
  description: string;
  serviceTypeIds: string[];

  // Localisation
  addressRaw: string;
  cityName: string;
  postalCode: string;
  departmentCode: string;
  inseeCode: string | null;
  geoLatRounded: number | null;
  geoLngRounded: number | null;
  geoSource: GeoSource;
}

function fromDb(listing: any): ListingInternal {
  return {
    id: String(listing.id),
    createdByUserId: String(listing.createdByUserId),
    createdAt: new Date(listing.createdAt),
    updatedAt: new Date(listing.updatedAt),
    closedAt: listing.closedAt ? new Date(listing.closedAt) : null,

    type: listing.type,
    status: listing.status,
    title: String(listing.title),
    description: String(listing.description),
    serviceTypeIds: Array.isArray(listing.serviceTypeIds)
      ? listing.serviceTypeIds.map((s: any) => String(s))
      : [],

    cityName: String(listing.cityName),
    postalCode: String(listing.postalCode),
    departmentCode: String(listing.departmentCode),
    inseeCode: listing.inseeCode ? String(listing.inseeCode) : null,

    addressRaw: String(listing.addressRaw),
    geoLatRounded:
      listing.geoLatRounded === null || listing.geoLatRounded === undefined
        ? null
        : Number(listing.geoLatRounded),
    geoLngRounded:
      listing.geoLngRounded === null || listing.geoLngRounded === undefined
        ? null
        : Number(listing.geoLngRounded),
    geoSource: listing.geoSource,
  };
}

function toDb(listing: ListingInternal) {
  return {
    id: listing.id,
    createdByUserId: listing.createdByUserId,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    closedAt: listing.closedAt ? listing.closedAt.toISOString() : null,

    type: listing.type,
    status: listing.status,
    title: listing.title,
    description: listing.description,
    serviceTypeIds: listing.serviceTypeIds,

    cityName: listing.cityName,
    postalCode: listing.postalCode,
    departmentCode: listing.departmentCode,
    inseeCode: listing.inseeCode,

    addressRaw: listing.addressRaw,
    geoLatRounded: listing.geoLatRounded,
    geoLngRounded: listing.geoLngRounded,
    geoSource: listing.geoSource,
  };
}

/**
 * Crée une nouvelle annonce.
 */
export async function createListing(
  data: CreateListingData,
): Promise<ListingInternal> {
  const id = uuidv4();
  const now = new Date();

  const listing: ListingInternal = {
    id,
    createdByUserId: data.createdByUserId,
    createdAt: now,
    updatedAt: now,
    closedAt: null,

    type: data.type,
    status: "active",
    title: data.title,
    description: data.description,
    serviceTypeIds: data.serviceTypeIds,

    cityName: data.cityName,
    postalCode: data.postalCode,
    departmentCode: data.departmentCode,
    inseeCode: data.inseeCode,

    addressRaw: data.addressRaw,
    geoLatRounded: data.geoLatRounded,
    geoLngRounded: data.geoLngRounded,
    geoSource: data.geoSource,
  };

  const db = readDb();
  db.listings.push(toDb(listing));
  writeDb(db);
  return listing;
}

/**
 * Récupère une annonce par son ID.
 */
export function getListingById(id: string): ListingInternal | null {
  const db = readDb();
  const raw = db.listings.find((l) => String(l.id) === id);
  return raw ? fromDb(raw) : null;
}

/**
 * Clôture une annonce.
 * @returns L'annonce mise à jour ou null si non trouvée.
 */
export async function closeListing(
  id: string,
  userId: string,
): Promise<ListingInternal | null> {
  const db = readDb();
  const idx = db.listings.findIndex((l) => String(l.id) === id);
  if (idx === -1) return null;

  const listing = fromDb(db.listings[idx]);

  if (!listing) {
    return null;
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (listing.createdByUserId !== userId) {
    return null;
  }

  listing.status = "closed";
  listing.closedAt = new Date();
  listing.updatedAt = new Date();

  db.listings[idx] = toDb(listing);
  writeDb(db);

  return listing;
}

/**
 * Vérifie si une annonce appartient à un utilisateur.
 */
export function isListingOwner(id: string, userId: string): boolean {
  const listing = getListingById(id);
  return listing?.createdByUserId === userId;
}

/**
 * Vérifie si une annonce est déjà clôturée.
 */
export function isListingClosed(id: string): boolean {
  const listing = getListingById(id);
  return listing?.status === "closed";
}

/** Options de filtrage pour la recherche d'annonces. */
export interface ListingFilters {
  type?: ListingType;
  status?: ListingStatus | "all";
  serviceTypeIds?: string[];
  city?: string;
  department?: string;
  q?: string;
  aroundLat?: number;
  aroundLng?: number;
  radiusKm?: number;
  authorId?: string; // Filtrer par auteur
  excludeAuthorId?: string; // Exclure les annonces d'un auteur
}

/**
 * Recherche des annonces avec filtres.
 * Retourne les annonces triées par createdAt décroissant.
 */
export function findListings(filters: ListingFilters): ListingInternal[] {
  const db = readDb();
  let results = db.listings.map(fromDb);

  // Filtre par statut (défaut: active)
  const statusFilter = filters.status ?? "active";
  if (statusFilter !== "all") {
    results = results.filter((l) => l.status === statusFilter);
  }

  // Filtre par auteur
  if (filters.authorId) {
    results = results.filter((l) => l.createdByUserId === filters.authorId);
  }

  // Exclure les annonces d'un auteur
  if (filters.excludeAuthorId) {
    results = results.filter(
      (l) => l.createdByUserId !== filters.excludeAuthorId,
    );
  }

  // Filtre par type
  if (filters.type) {
    results = results.filter((l) => l.type === filters.type);
  }

  // Filtre par types de service
  if (filters.serviceTypeIds && filters.serviceTypeIds.length > 0) {
    const filterSet = new Set(filters.serviceTypeIds);
    results = results.filter((l) =>
      l.serviceTypeIds.some((st) => filterSet.has(st)),
    );
  }

  // Filtre par ville (insensible à la casse)
  if (filters.city) {
    const cityLower = filters.city.toLowerCase();
    results = results.filter((l) =>
      l.cityName.toLowerCase().includes(cityLower),
    );
  }

  // Filtre par département
  if (filters.department) {
    const deptUpper = filters.department.toUpperCase();
    results = results.filter((l) => l.departmentCode === deptUpper);
  }

  // Recherche textuelle (titre + description)
  if (filters.q) {
    const qLower = filters.q.toLowerCase();
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(qLower) ||
        l.description.toLowerCase().includes(qLower),
    );
  }

  // Filtre par distance (uniquement si toutes les coordonnées sont fournies)
  if (
    filters.aroundLat !== undefined &&
    filters.aroundLng !== undefined &&
    filters.radiusKm !== undefined
  ) {
    results = results.filter((l) => {
      // Exclure les annonces sans coordonnées fiables
      if (
        l.geoSource !== "geocoded" ||
        l.geoLatRounded === null ||
        l.geoLngRounded === null
      ) {
        return false;
      }

      const distance = haversineDistance(
        filters.aroundLat!,
        filters.aroundLng!,
        l.geoLatRounded,
        l.geoLngRounded,
      );

      return distance <= filters.radiusKm!;
    });

    // Trier par distance croissante quand géoloc active
    results.sort((a, b) => {
      const distA = haversineDistance(
        filters.aroundLat!,
        filters.aroundLng!,
        a.geoLatRounded!,
        a.geoLngRounded!,
      );
      const distB = haversineDistance(
        filters.aroundLat!,
        filters.aroundLng!,
        b.geoLatRounded!,
        b.geoLngRounded!,
      );
      return distA - distB;
    });
  } else {
    // Tri par date de création décroissante (si pas de géoloc)
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return results;
}

/**
 * Calcule les distances depuis un point de référence pour un ensemble d'annonces.
 * Retourne une Map id->distance.
 */
export function calculateDistances(
  listings: ListingInternal[],
  lat: number,
  lng: number,
): Map<string, number> {
  const distances = new Map<string, number>();

  for (const listing of listings) {
    if (
      listing.geoSource === "geocoded" &&
      listing.geoLatRounded !== null &&
      listing.geoLngRounded !== null
    ) {
      const distance = haversineDistance(
        lat,
        lng,
        listing.geoLatRounded,
        listing.geoLngRounded,
      );
      distances.set(listing.id, Math.round(distance * 10) / 10); // Arrondi à 0.1 km
    }
  }

  return distances;
}

/**
 * Calcule la distance en km entre deux points (formule de Haversine).
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Supprime une annonce et toutes les données associées (conversations, messages, signalements).
 * Utilisé par les administrateurs lors du traitement d'un signalement.
 * @returns true si supprimé, false si non trouvé
 */
export function deleteListing(id: string): boolean {
  const db = readDb();

  // Vérifier que l'annonce existe
  const listingIdx = db.listings.findIndex((l) => String(l.id) === id);
  if (listingIdx === -1) return false;

  // Trouver les conversations liées à cette annonce
  const conversationIds = db.conversations
    .filter((c) => c.listingId === id)
    .map((c) => c.id);

  // Supprimer les messages de ces conversations
  db.messages = db.messages.filter(
    (m) => !conversationIds.includes(m.conversationId),
  );

  // Supprimer les conversations
  db.conversations = db.conversations.filter((c) => c.listingId !== id);

  // Supprimer les signalements liés à cette annonce
  db.reports = db.reports.filter((r) => r.listingId !== id);

  // Supprimer l'annonce
  db.listings.splice(listingIdx, 1);

  writeDb(db);
  return true;
}

// POST /api/listings - Créer une annonce

import { supabase, getDisplayName } from "../../utils/supabase";
import { geocodeAddress, validateManualFallback } from "../../utils/geocoding";

export default defineEventHandler(async (event) => {
  // Vérifier l'authentification
  const cookies = parseCookies(event);
  const token = cookies["koudpouce.token"];

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Vous devez être connecté.",
    });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw createError({ statusCode: 401, message: "Session invalide." });
  }

  const body = await readBody(event);
  const {
    type,
    title,
    description,
    serviceTypeIds,
    addressRaw,
    manualLocationFallback,
  } = body;

  // Validation
  if (!type || (type !== "demande" && type !== "proposition")) {
    throw createError({ statusCode: 400, message: "Type d'annonce invalide." });
  }

  if (!title || title.trim().length < 5) {
    throw createError({
      statusCode: 400,
      message: "Le titre doit contenir au moins 5 caractères.",
    });
  }

  if (!description || description.trim().length < 20) {
    throw createError({
      statusCode: 400,
      message: "La description doit contenir au moins 20 caractères.",
    });
  }

  if (!addressRaw || addressRaw.trim().length < 3) {
    throw createError({ statusCode: 400, message: "L'adresse est requise." });
  }

  // Essayer le géocodage
  const geocodeResult = await geocodeAddress(addressRaw);

  if (geocodeResult) {
    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        author_id: user.id,
        type,
        title: title.trim(),
        description: description.trim(),
        service_type_ids: serviceTypeIds || [],
        address_raw: addressRaw.trim(),
        city_name: geocodeResult.cityName,
        postal_code: geocodeResult.postalCode,
        department_code: geocodeResult.departmentCode,
        insee_code: geocodeResult.inseeCode,
        geo_lat: geocodeResult.lat,
        geo_lng: geocodeResult.lng,
        geo_source: "geocoded",
        status: "active",
      })
      .select()
      .single();

    if (error || !listing) {
      console.error("Erreur création annonce:", error);
      throw createError({
        statusCode: 500,
        message: "Erreur lors de la création.",
      });
    }

    return {
      listing: {
        id: listing.id,
        type: listing.type,
        title: listing.title,
        description: listing.description,
        serviceTypeIds: listing.service_type_ids || [],
        authorId: listing.author_id,
        authorDisplayName: await getDisplayName(listing.author_id),
        cityName: listing.city_name,
        postalCode: listing.postal_code,
        departmentCode: listing.department_code,
        status: listing.status,
        createdAt: listing.created_at,
        closedAt: listing.closed_at,
      },
    };
  }

  // Géocodage échoué - vérifier le fallback manuel
  if (manualLocationFallback) {
    const fallbackCheck = validateManualFallback(manualLocationFallback);

    if (!fallbackCheck.valid) {
      throw createError({ statusCode: 400, message: fallbackCheck.message });
    }

    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        author_id: user.id,
        type,
        title: title.trim(),
        description: description.trim(),
        service_type_ids: serviceTypeIds || [],
        address_raw: addressRaw.trim(),
        city_name: fallbackCheck.cityName,
        postal_code: fallbackCheck.postalCode ?? "",
        department_code: fallbackCheck.departmentCode,
        insee_code: null,
        geo_lat: null,
        geo_lng: null,
        geo_source: "manual_fallback",
        status: "active",
      })
      .select()
      .single();

    if (error || !listing) {
      console.error("Erreur création annonce:", error);
      throw createError({
        statusCode: 500,
        message: "Erreur lors de la création.",
      });
    }

    return {
      listing: {
        id: listing.id,
        type: listing.type,
        title: listing.title,
        description: listing.description,
        serviceTypeIds: listing.service_type_ids || [],
        authorId: listing.author_id,
        authorDisplayName: await getDisplayName(listing.author_id),
        cityName: listing.city_name,
        postalCode: listing.postal_code,
        departmentCode: listing.department_code,
        status: listing.status,
        createdAt: listing.created_at,
        closedAt: listing.closed_at,
      },
    };
  }

  // Géocodage échoué et pas de fallback
  throw createError({
    statusCode: 422,
    message: "Nous n'avons pas pu localiser cette adresse automatiquement.",
    data: {
      code: "GEOCODING_FAILED",
      requiresManualFallback: true,
    },
  });
});

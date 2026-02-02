// GET /api/listings - Liste des annonces avec filtres

import { supabase, getDisplayName } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  // Construire la requête de base
  let dbQuery = supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  // Filtrer par type
  if (query.type === "demande" || query.type === "proposition") {
    dbQuery = dbQuery.eq("type", query.type);
  }

  // Filtrer par statut
  if (query.status === "active") {
    dbQuery = dbQuery.eq("status", "active");
  } else if (query.status === "closed") {
    dbQuery = dbQuery.eq("status", "closed");
  } else if (query.status !== "all") {
    // Par défaut, afficher uniquement les actives
    dbQuery = dbQuery.eq("status", "active");
  }

  // Filtrer par auteur
  if (query.authorId) {
    dbQuery = dbQuery.eq("author_id", query.authorId as string);
  }

  // Exclure un auteur
  if (query.excludeAuthorId) {
    dbQuery = dbQuery.neq("author_id", query.excludeAuthorId as string);
  }

  // Filtrer par ville
  if (query.city) {
    dbQuery = dbQuery.ilike("city_name", `%${query.city}%`);
  }

  // Filtrer par département
  if (query.department) {
    dbQuery = dbQuery.eq("department_code", query.department as string);
  }

  // Filtrer par types de service
  if (query.serviceTypeIds) {
    const ids = (query.serviceTypeIds as string).split(",");
    dbQuery = dbQuery.overlaps("service_type_ids", ids);
  }

  // Recherche textuelle
  if (query.q) {
    const searchTerm = `%${query.q}%`;
    dbQuery = dbQuery.or(
      `title.ilike.${searchTerm},description.ilike.${searchTerm}`,
    );
  }

  const { data: listings, error } = await dbQuery;

  if (error) {
    console.error("Erreur récupération annonces:", error);
    throw createError({ statusCode: 500, message: "Erreur serveur." });
  }

  // Calculer les distances si position fournie
  let distances: Map<string, number> | undefined;
  if (query.aroundLat && query.aroundLng) {
    const lat = parseFloat(query.aroundLat as string);
    const lng = parseFloat(query.aroundLng as string);
    const radiusKm = query.radiusKm
      ? parseInt(query.radiusKm as string)
      : undefined;

    distances = new Map();
    for (const listing of listings || []) {
      if (listing.geo_lat && listing.geo_lng) {
        const d = haversineDistance(lat, lng, listing.geo_lat, listing.geo_lng);
        if (!radiusKm || d <= radiusKm) {
          distances.set(listing.id, Math.round(d * 10) / 10);
        }
      }
    }
  }

  // Filtrer par distance si radius fourni
  let filteredListings = listings || [];
  if (distances && query.radiusKm) {
    filteredListings = filteredListings.filter((l) => distances!.has(l.id));
  }

  // Formater pour le frontend
  const formatted = await Promise.all(
    filteredListings.map(async (listing) => ({
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
      distanceKm: distances?.get(listing.id),
    })),
  );

  return { listings: formatted };
});

// Calcul de distance Haversine
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

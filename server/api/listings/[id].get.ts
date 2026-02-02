// GET /api/listings/:id - Détail d'une annonce

import { supabase, getDisplayName } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, message: "ID requis." });
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    throw createError({ statusCode: 404, message: "Annonce introuvable." });
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
});

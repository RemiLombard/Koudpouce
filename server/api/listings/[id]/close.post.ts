// POST /api/listings/:id/close - Clôturer une annonce

import { supabase, getDisplayName } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

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

  // Récupérer l'annonce
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !listing) {
    throw createError({ statusCode: 404, message: "Annonce introuvable." });
  }

  // Vérifier que c'est bien l'auteur
  if (listing.author_id !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Vous ne pouvez clôturer que vos propres annonces.",
    });
  }

  // Vérifier que l'annonce n'est pas déjà clôturée
  if (listing.status === "closed") {
    throw createError({
      statusCode: 409,
      message: "Cette annonce est déjà clôturée.",
    });
  }

  // Clôturer
  const { data: closedListing, error: updateError } = await supabase
    .from("listings")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by_user_id: user.id,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError || !closedListing) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors de la clôture.",
    });
  }

  return {
    listing: {
      id: closedListing.id,
      type: closedListing.type,
      title: closedListing.title,
      description: closedListing.description,
      serviceTypeIds: closedListing.service_type_ids || [],
      authorId: closedListing.author_id,
      authorDisplayName: await getDisplayName(closedListing.author_id),
      cityName: closedListing.city_name,
      postalCode: closedListing.postal_code,
      departmentCode: closedListing.department_code,
      status: closedListing.status,
      createdAt: closedListing.created_at,
      closedAt: closedListing.closed_at,
    },
  };
});

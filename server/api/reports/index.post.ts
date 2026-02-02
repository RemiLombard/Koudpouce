// POST /api/reports - Signaler une annonce

import { supabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies["koudpouce.token"];

  if (!token) {
    throw createError({ statusCode: 401, message: "Non connecté." });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw createError({ statusCode: 401, message: "Session invalide." });
  }

  const body = await readBody(event);
  const { listingId, reason, message } = body;

  if (!listingId || !reason) {
    throw createError({ statusCode: 400, message: "listingId et reason requis." });
  }

  // Vérifier que l'annonce existe
  const { data: listing } = await supabase
    .from("listings")
    .select("id, author_id")
    .eq("id", listingId)
    .single();

  if (!listing) {
    throw createError({ statusCode: 404, message: "Annonce introuvable." });
  }

  // On ne peut pas signaler sa propre annonce
  if (listing.author_id === user.id) {
    throw createError({ statusCode: 400, message: "Vous ne pouvez pas signaler votre propre annonce." });
  }

  // Créer le signalement
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      listing_id: listingId,
      reporter_id: user.id,
      reason,
      message: message || null,
    })
    .select()
    .single();

  if (reportError) {
    console.error("Erreur création signalement:", reportError);
    throw createError({ statusCode: 500, message: "Erreur lors du signalement." });
  }

  return { report: { id: report.id } };
});

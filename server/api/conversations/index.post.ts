// POST /api/conversations - Créer ou récupérer une conversation

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

  const userId = user.id;
  const body = await readBody(event);
  const { listingId, initialMessage } = body;

  if (!listingId || typeof listingId !== "string") {
    throw createError({ statusCode: 400, message: "listingId requis." });
  }

  // Vérifier que l'annonce existe
  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (!listing) {
    throw createError({ statusCode: 404, message: "Annonce introuvable." });
  }

  // On ne peut pas contacter sa propre annonce
  if (listing.author_id === userId) {
    throw createError({ statusCode: 400, message: "Vous ne pouvez pas contacter votre propre annonce." });
  }

  // Vérifier si une conversation existe déjà
  const { data: existingConv } = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .contains("participant_ids", [userId])
    .single();

  if (existingConv) {
    return { conversation: { id: existingConv.id } };
  }

  // Créer la conversation
  const { data: newConv, error: convError } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      participant_ids: [listing.author_id, userId],
    })
    .select()
    .single();

  if (convError || !newConv) {
    console.error("Erreur création conversation:", convError);
    throw createError({ statusCode: 500, message: "Erreur lors de la création." });
  }

  // Ajouter le message initial si fourni
  if (initialMessage && typeof initialMessage === "string" && initialMessage.trim()) {
    await supabase.from("messages").insert({
      conversation_id: newConv.id,
      sender_id: userId,
      content: initialMessage.trim(),
    });
  }

  return { conversation: { id: newConv.id } };
});

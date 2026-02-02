// POST /api/conversations/:id/read - Marquer comme lu

import { supabase } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
  const conversationId = getRouterParam(event, "id");
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

  // Vérifier que l'utilisateur participe à la conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("participant_ids")
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    throw createError({ statusCode: 404, message: "Conversation introuvable." });
  }

  if (!conversation.participant_ids.includes(userId)) {
    throw createError({ statusCode: 403, message: "Accès non autorisé." });
  }

  // Récupérer les messages non lus par l'utilisateur
  const { data: messages } = await supabase
    .from("messages")
    .select("id, read_by")
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId);

  // Mettre à jour chaque message pour ajouter l'utilisateur à read_by
  for (const msg of messages || []) {
    const currentReadBy = msg.read_by || [];
    if (!currentReadBy.includes(userId)) {
      await supabase
        .from("messages")
        .update({ read_by: [...currentReadBy, userId] })
        .eq("id", msg.id);
    }
  }

  return { success: true };
});

// POST /api/conversations/:id/messages - Envoyer un message

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
  const body = await readBody(event);
  const { content } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    throw createError({ statusCode: 400, message: "Message requis." });
  }

  // Vérifier que la conversation existe et que l'utilisateur y participe
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    throw createError({ statusCode: 404, message: "Conversation introuvable." });
  }

  if (!conversation.participant_ids.includes(userId)) {
    throw createError({ statusCode: 403, message: "Accès non autorisé." });
  }

  // Créer le message
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
    })
    .select()
    .single();

  if (msgError || !message) {
    throw createError({ statusCode: 500, message: "Erreur lors de l'envoi." });
  }

  // Mettre à jour la date de la conversation
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  // Récupérer le nom de l'expéditeur
  const { data: sender } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  return {
    message: {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      senderName: sender?.display_name || "Utilisateur",
      content: message.content,
      createdAt: message.created_at,
      isRead: true,
    },
  };
});

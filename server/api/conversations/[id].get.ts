// GET /api/conversations/:id - Détail d'une conversation

import { supabase } from "../../utils/supabase";

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

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select(`
      *,
      listing:listings(id, title, author_id, status),
      messages(id, content, sender_id, created_at)
    `)
    .eq("id", conversationId)
    .single();

  if (convError || !conversation) {
    throw createError({ statusCode: 404, message: "Conversation introuvable." });
  }

  // Vérifier que l'utilisateur participe à la conversation
  if (!conversation.participant_ids.includes(userId)) {
    throw createError({ statusCode: 403, message: "Accès non autorisé." });
  }

  // Récupérer les profils des participants
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", conversation.participant_ids);

  const profileMap = new Map(profiles?.map((p: any) => [p.id, p.display_name]) || []);

  // Trier les messages par date
  const sortedMessages = (conversation.messages || []).sort(
    (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const messages = sortedMessages.map((m: any) => ({
    id: m.id,
    conversationId: conversation.id,
    senderId: m.sender_id,
    senderName: profileMap.get(m.sender_id) || "Utilisateur",
    content: m.content,
    createdAt: m.created_at,
    isRead: true,
  }));

  // Identifier le contacteur
  const listingAuthorId = conversation.listing?.author_id;
  const contacterId = conversation.participant_ids.find((id: string) => id !== listingAuthorId);

  return {
    conversation: {
      id: conversation.id,
      listingId: conversation.listing?.id,
      listingTitle: conversation.listing?.title,
      listingClosed: conversation.listing?.status === "closed",
      participantIds: conversation.participant_ids,
      listingAuthorId,
      listingAuthorName: profileMap.get(listingAuthorId) || "Utilisateur",
      contacterId,
      contacterName: profileMap.get(contacterId) || "Utilisateur",
    },
    messages,
  };
});

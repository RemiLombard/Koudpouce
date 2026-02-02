// GET /api/conversations - Liste des conversations

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
  const query = getQuery(event);
  const filter = query.filter as string | undefined;

  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select(`
      *,
      listing:listings(id, title, author_id, status),
      messages(id, content, sender_id, created_at, read_by)
    `)
    .contains("participant_ids", [userId])
    .order("updated_at", { ascending: false });

  if (convError) {
    console.error("Erreur récupération conversations:", convError);
    throw createError({ statusCode: 500, message: "Erreur serveur." });
  }

  // Filtrer selon le critère
  let filteredConversations = conversations || [];

  if (filter === "received") {
    filteredConversations = filteredConversations.filter(
      (conv: any) => conv.listing?.author_id === userId
    );
  } else if (filter === "sent") {
    filteredConversations = filteredConversations.filter(
      (conv: any) => conv.listing?.author_id !== userId
    );
  }

  // Formater pour le frontend
  const formatted = await Promise.all(
    filteredConversations.map(async (conv: any) => {
      const otherParticipantId = conv.participant_ids.find((id: string) => id !== userId);

      const { data: otherUser } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", otherParticipantId)
        .single();

      const { data: currentUser } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      const sortedMessages = (conv.messages || []).sort(
        (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const lastMessage = sortedMessages[sortedMessages.length - 1];

      const unreadCount = (conv.messages || []).filter(
        (m: any) => m.sender_id !== userId && !(m.read_by || []).includes(userId)
      ).length;

      return {
        id: conv.id,
        listingId: conv.listing?.id,
        listingTitle: conv.listing?.title || "Annonce supprimée",
        listingAuthorId: conv.listing?.author_id,
        listingAuthorName: conv.listing?.author_id === userId ? currentUser?.display_name : otherUser?.display_name,
        contacterId: otherParticipantId,
        contacterName: otherUser?.display_name || "Utilisateur",
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.sender_id,
          createdAt: lastMessage.created_at,
        } : null,
        unreadCount,
        listingClosed: conv.listing?.status === "closed",
      };
    })
  );

  return { conversations: formatted };
});

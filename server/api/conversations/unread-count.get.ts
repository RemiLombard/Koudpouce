// GET /api/conversations/unread-count - Compteur de messages non-lus

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

  // Récupérer toutes les conversations de l'utilisateur
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      participant_ids,
      listing:listings!inner(author_id),
      messages(id, sender_id, read_by)
    `)
    .contains("participant_ids", [userId]);

  let total = 0;
  let receivedUnread = 0;
  let sentUnread = 0;

  for (const conv of conversations || []) {
    const unreadMessages = (conv.messages || []).filter((m: any) =>
      m.sender_id !== userId && !(m.read_by || []).includes(userId)
    );

    const count = unreadMessages.length;
    total += count;

    const listing = Array.isArray(conv.listing) ? conv.listing[0] : conv.listing;
    const isMyListing = listing?.author_id === userId;

    if (isMyListing) {
      receivedUnread += count;
    } else {
      sentUnread += count;
    }
  }

  return {
    total,
    unreadCount: total,
    receivedUnread,
    sentUnread,
  };
});

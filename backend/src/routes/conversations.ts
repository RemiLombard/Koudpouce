/**
 * Routes API pour la messagerie.
 * Gère les conversations et messages entre utilisateurs.
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { readDb, writeDb } from "../db/fileDb";
import { requireAuth } from "../middlewares/auth";
import type { DbConversation, DbMessage } from "../db/types";
import type { AppSession } from "../types";

const router = Router();

/** Type public d'une conversation (pour le frontend) */
interface ConversationPublic {
  id: string;
  listingId: string;
  listingTitle: string;
  listingAuthorId: string;
  listingAuthorName: string;
  contacterId: string;
  contacterName: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  listingClosed: boolean;
}

/** Type public d'un message */
interface MessagePublic {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * POST /api/conversations
 * Crée une nouvelle conversation ou retourne l'existante.
 * Body: { listingId: string, initialMessage?: string }
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;
  const { listingId, initialMessage } = req.body;

  if (!listingId || typeof listingId !== "string") {
    return res.status(400).json({ error: "listingId requis" });
  }

  const db = readDb();

  // Vérifier que l'annonce existe
  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) {
    return res.status(404).json({ error: "Annonce introuvable" });
  }

  // On ne peut pas contacter sa propre annonce
  if (listing.createdByUserId === userId) {
    return res
      .status(400)
      .json({ error: "Vous ne pouvez pas contacter votre propre annonce" });
  }

  // Vérifier si une conversation existe déjà
  let conversation = db.conversations.find(
    (c) => c.listingId === listingId && c.contacterId === userId,
  );

  const now = new Date().toISOString();

  if (!conversation) {
    // Créer la conversation
    conversation = {
      id: uuidv4(),
      listingId,
      listingTitle: listing.title,
      listingAuthorId: listing.createdByUserId,
      contacterId: userId,
      createdAt: now,
      updatedAt: now,
    };
    db.conversations.push(conversation);
  }

  // Si un message initial est fourni, l'ajouter
  if (
    initialMessage &&
    typeof initialMessage === "string" &&
    initialMessage.trim()
  ) {
    const message: DbMessage = {
      id: uuidv4(),
      conversationId: conversation.id,
      senderId: userId,
      content: initialMessage.trim(),
      createdAt: now,
      readBy: [userId], // L'expéditeur l'a "lu"
    };
    db.messages.push(message);
    conversation.updatedAt = now;
  }

  writeDb(db);

  return res.status(200).json({ conversation: { id: conversation.id } });
});

/**
 * GET /api/conversations/unread-count
 * Retourne le nombre total de messages non lus, avec détail par section.
 * IMPORTANT: Cette route doit être AVANT /:id pour éviter les conflits
 */
router.get(
  "/unread-count",
  requireAuth,
  async (req: Request, res: Response) => {
    const session = req.session as AppSession;
    const userId = session.userId!;

    const db = readDb();

    // Séparer les conversations par section
    const receivedConvIds = db.conversations
      .filter((c) => c.listingAuthorId === userId)
      .map((c) => c.id);

    const sentConvIds = db.conversations
      .filter((c) => c.contacterId === userId)
      .map((c) => c.id);

    // Compter les messages non lus par section
    const receivedUnread = db.messages.filter(
      (m) =>
        receivedConvIds.includes(m.conversationId) &&
        !m.readBy.includes(userId),
    ).length;

    const sentUnread = db.messages.filter(
      (m) =>
        sentConvIds.includes(m.conversationId) && !m.readBy.includes(userId),
    ).length;

    return res.json({
      unreadCount: receivedUnread + sentUnread,
      receivedUnread,
      sentUnread,
    });
  },
);

/**
 * GET /api/conversations
 * Liste toutes les conversations de l'utilisateur.
 * Query: ?filter=received|sent (optionnel)
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;
  const filter = req.query.filter as string | undefined;

  const db = readDb();

  let conversations = db.conversations.filter(
    (c) => c.listingAuthorId === userId || c.contacterId === userId,
  );

  // Filtrage optionnel
  if (filter === "received") {
    // Conversations sur mes annonces
    conversations = conversations.filter((c) => c.listingAuthorId === userId);
  } else if (filter === "sent") {
    // Conversations que j'ai initiées
    conversations = conversations.filter((c) => c.contacterId === userId);
  }

  // Mapper vers le format public avec infos supplémentaires
  const result: ConversationPublic[] = conversations.map((conv) => {
    // Récupérer les noms des participants
    const author = db.users.find((u) => u.id === conv.listingAuthorId);
    const contacter = db.users.find((u) => u.id === conv.contacterId);

    // Vérifier si l'annonce est clôturée
    const listing = db.listings.find((l) => l.id === conv.listingId);
    const listingClosed = listing?.closedAt != null;

    // Dernier message
    const messages = db.messages
      .filter((m) => m.conversationId === conv.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const lastMsg = messages[0] || null;

    // Compter les messages non lus pour cet utilisateur
    const unreadCount = db.messages.filter(
      (m) => m.conversationId === conv.id && !m.readBy.includes(userId),
    ).length;

    return {
      id: conv.id,
      listingId: conv.listingId,
      listingTitle: conv.listingTitle,
      listingAuthorId: conv.listingAuthorId,
      listingAuthorName: author?.displayName || "Utilisateur inconnu",
      contacterId: conv.contacterId,
      contacterName: contacter?.displayName || "Utilisateur inconnu",
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      lastMessage: lastMsg
        ? {
            content: lastMsg.content,
            senderId: lastMsg.senderId,
            createdAt: lastMsg.createdAt,
          }
        : null,
      unreadCount,
      listingClosed,
    };
  });

  // Trier par date de mise à jour (plus récent en premier)
  result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return res.json({ conversations: result });
});

/**
 * GET /api/conversations/:id
 * Récupère une conversation avec ses messages.
 */
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;
  const conversationId = req.params.id as string;

  const db = readDb();

  const conversation = db.conversations.find((c) => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation introuvable" });
  }

  // Vérifier que l'utilisateur fait partie de la conversation
  if (
    conversation.listingAuthorId !== userId &&
    conversation.contacterId !== userId
  ) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }

  // Récupérer les messages
  const messages = db.messages
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  // Mapper avec les noms
  const messagesPublic: MessagePublic[] = messages.map((msg) => {
    const sender = db.users.find((u) => u.id === msg.senderId);
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderName: sender?.displayName || "Utilisateur inconnu",
      content: msg.content,
      createdAt: msg.createdAt,
      isRead: msg.readBy.includes(userId),
    };
  });

  // Infos de la conversation
  const author = db.users.find((u) => u.id === conversation.listingAuthorId);
  const contacter = db.users.find((u) => u.id === conversation.contacterId);
  const listing = db.listings.find((l) => l.id === conversation.listingId);
  const listingClosed = listing?.closedAt != null;

  return res.json({
    conversation: {
      id: conversation.id,
      listingId: conversation.listingId,
      listingTitle: conversation.listingTitle,
      listingAuthorId: conversation.listingAuthorId,
      listingAuthorName: author?.displayName || "Utilisateur inconnu",
      contacterId: conversation.contacterId,
      contacterName: contacter?.displayName || "Utilisateur inconnu",
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      listingClosed,
    },
    messages: messagesPublic,
  });
});

/**
 * POST /api/conversations/:id/messages
 * Envoie un message dans une conversation.
 * Body: { content: string }
 */
router.post(
  "/:id/messages",
  requireAuth,
  async (req: Request, res: Response) => {
    const session = req.session as AppSession;
    const userId = session.userId!;
    const conversationId = req.params.id as string;
    const { content } = req.body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Contenu du message requis" });
    }

    const db = readDb();

    const conversation = db.conversations.find((c) => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation introuvable" });
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (
      conversation.listingAuthorId !== userId &&
      conversation.contacterId !== userId
    ) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    // Vérifier que l'annonce n'est pas clôturée
    const listing = db.listings.find((l) => l.id === conversation.listingId);
    if (listing?.closedAt) {
      return res
        .status(400)
        .json({
          error:
            "Cette annonce est clôturée, il n'est plus possible d'envoyer de message.",
        });
    }

    const now = new Date().toISOString();

    const message: DbMessage = {
      id: uuidv4(),
      conversationId,
      senderId: userId,
      content: content.trim(),
      createdAt: now,
      readBy: [userId],
    };

    db.messages.push(message);

    // Mettre à jour la date de la conversation
    conversation.updatedAt = now;

    writeDb(db);

    const sender = db.users.find((u) => u.id === userId);

    return res.status(201).json({
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: sender?.displayName || "Utilisateur inconnu",
        content: message.content,
        createdAt: message.createdAt,
        isRead: true,
      },
    });
  },
);

/**
 * POST /api/conversations/:id/read
 * Marque tous les messages d'une conversation comme lus.
 */
router.post("/:id/read", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;
  const conversationId = req.params.id as string;

  const db = readDb();

  const conversation = db.conversations.find((c) => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation introuvable" });
  }

  // Vérifier que l'utilisateur fait partie de la conversation
  if (
    conversation.listingAuthorId !== userId &&
    conversation.contacterId !== userId
  ) {
    return res.status(403).json({ error: "Accès non autorisé" });
  }

  // Marquer tous les messages comme lus
  let updated = false;
  for (const msg of db.messages) {
    if (msg.conversationId === conversationId && !msg.readBy.includes(userId)) {
      msg.readBy.push(userId);
      updated = true;
    }
  }

  if (updated) {
    writeDb(db);
  }

  return res.json({ success: true });
});

export default router;

// Composable pour la messagerie entre utilisateurs
// Gère les conversations et les messages

// Structure d'une conversation
export interface ConversationPublic {
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
  listingClosed?: boolean;
}

// Structure d'un message
export interface MessagePublic {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

const unreadCount = ref(0);
const receivedUnread = ref(0);
const sentUnread = ref(0);
const conversations = ref<ConversationPublic[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export function useMessaging() {
  const apiBase = useRuntimeConfig().public.apiBase as string;

  async function fetchUnreadCount(): Promise<void> {
    try {
      const response = await $fetch<{
        unreadCount: number;
        receivedUnread: number;
        sentUnread: number;
      }>("/api/conversations/unread-count", {
        credentials: "include",
        baseURL: apiBase,
      });
      unreadCount.value = response.unreadCount;
      receivedUnread.value = response.receivedUnread;
      sentUnread.value = response.sentUnread;
    } catch {
      unreadCount.value = 0;
      receivedUnread.value = 0;
      sentUnread.value = 0;
    }
  }

  async function fetchConversations(
    filter?: "received" | "sent",
  ): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const query = filter ? `?filter=${filter}` : "";
      const response = await $fetch<{ conversations: ConversationPublic[] }>(
        `/api/conversations${query}`,
        {
          credentials: "include",
          baseURL: apiBase,
        },
      );
      conversations.value = response.conversations;
    } catch (err: any) {
      error.value =
        err?.data?.error ?? "Impossible de charger les conversations.";
      conversations.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function startConversation(
    listingId: string,
    initialMessage?: string,
  ): Promise<string | null> {
    try {
      const response = await $fetch<{ conversation: { id: string } }>(
        "/api/conversations",
        {
          method: "POST",
          body: { listingId, initialMessage },
          credentials: "include",
          baseURL: apiBase,
        },
      );
      return response.conversation.id;
    } catch (err: any) {
      error.value =
        err?.data?.error ?? "Impossible de démarrer la conversation.";
      return null;
    }
  }

  async function fetchConversation(conversationId: string): Promise<{
    conversation: ConversationPublic;
    messages: MessagePublic[];
  } | null> {
    try {
      const response = await $fetch<{
        conversation: ConversationPublic;
        messages: MessagePublic[];
      }>(`/api/conversations/${conversationId}`, {
        credentials: "include",
        baseURL: apiBase,
      });
      return response;
    } catch (err: any) {
      error.value =
        err?.data?.error ?? "Impossible de charger la conversation.";
      return null;
    }
  }

  async function sendMessage(
    conversationId: string,
    content: string,
  ): Promise<MessagePublic | null> {
    try {
      const response = await $fetch<{ message: MessagePublic }>(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: { content },
          credentials: "include",
          baseURL: apiBase,
        },
      );
      return response.message;
    } catch (err: any) {
      error.value = err?.data?.error ?? "Impossible d'envoyer le message.";
      return null;
    }
  }

  async function markAsRead(conversationId: string): Promise<void> {
    try {
      await $fetch(`/api/conversations/${conversationId}/read`, {
        method: "POST",
        credentials: "include",
        baseURL: apiBase,
      });
      await fetchUnreadCount();
    } catch {}
  }

  return {
    unreadCount: readonly(unreadCount),
    receivedUnread: readonly(receivedUnread),
    sentUnread: readonly(sentUnread),
    conversations: readonly(conversations),
    loading: readonly(loading),
    error: readonly(error),
    fetchUnreadCount,
    fetchConversations,
    startConversation,
    fetchConversation,
    sendMessage,
    markAsRead,
  };
}

// Composable pour gérer la connexion Supabase Realtime côté client
// Permet de s'abonner aux nouveaux messages en temps réel

import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

let _realtimeClient: SupabaseClient | null = null;

export function useRealtimeClient() {
  const config = useRuntimeConfig();

  function getClient(): SupabaseClient {
    if (!_realtimeClient) {
      // Créer un client Supabase anon pour le realtime côté client
      // Note: On utilise la clé anon (publique) pour le client
      _realtimeClient = createClient(
        config.public.supabaseUrl as string,
        // Clé anon publique - à ajouter dans runtimeConfig.public
        config.public.supabaseAnonKey as string,
        {
          realtime: {
            params: {
              eventsPerSecond: 10,
            },
          },
        }
      );
    }
    return _realtimeClient;
  }

  return {
    getClient,
  };
}

// Type pour les callbacks de messages
export interface RealtimeMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// Hook pour s'abonner aux messages d'une conversation
export function useRealtimeMessages(
  conversationId: Ref<string>,
  onNewMessage: (message: RealtimeMessage) => void
) {
  const config = useRuntimeConfig();
  let channel: RealtimeChannel | null = null;
  let client: SupabaseClient | null = null;

  function subscribe() {
    if (!config.public.supabaseAnonKey) {
      console.warn("Supabase anon key not configured, realtime disabled");
      return;
    }

    if (!client) {
      client = createClient(
        config.public.supabaseUrl as string,
        config.public.supabaseAnonKey as string
      );
    }

    // Se désabonner du channel précédent si existant
    if (channel) {
      channel.unsubscribe();
    }

    // S'abonner aux nouveaux messages de cette conversation
    channel = client
      .channel(`messages:${conversationId.value}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId.value}`,
        },
        (payload) => {
          onNewMessage(payload.new as RealtimeMessage);
        }
      )
      .subscribe();
  }

  function unsubscribe() {
    if (channel) {
      channel.unsubscribe();
      channel = null;
    }
  }

  // Observer les changements de conversationId
  watch(conversationId, (newId, oldId) => {
    if (newId !== oldId && newId) {
      subscribe();
    }
  });

  onMounted(() => {
    if (conversationId.value) {
      subscribe();
    }
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return {
    subscribe,
    unsubscribe,
  };
}

// Hook pour s'abonner aux notifications globales (nouveaux messages dans toutes les conversations)
export function useRealtimeNotifications(
  userId: Ref<string | undefined>,
  onNewMessage: (message: RealtimeMessage) => void
) {
  const config = useRuntimeConfig();
  let channel: RealtimeChannel | null = null;
  let client: SupabaseClient | null = null;

  function subscribe() {
    if (!config.public.supabaseAnonKey || !userId.value) {
      return;
    }

    if (!client) {
      client = createClient(
        config.public.supabaseUrl as string,
        config.public.supabaseAnonKey as string
      );
    }

    if (channel) {
      channel.unsubscribe();
    }

    // S'abonner à tous les nouveaux messages
    // On filtrera côté client ceux qui nous concernent
    channel = client
      .channel("global-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as RealtimeMessage;
          // Ne pas notifier pour nos propres messages
          if (msg.sender_id !== userId.value) {
            onNewMessage(msg);
          }
        }
      )
      .subscribe();
  }

  function unsubscribe() {
    if (channel) {
      channel.unsubscribe();
      channel = null;
    }
  }

  watch(userId, (newId) => {
    if (newId) {
      subscribe();
    } else {
      unsubscribe();
    }
  });

  onMounted(() => {
    if (userId.value) {
      subscribe();
    }
  });

  onUnmounted(() => {
    unsubscribe();
  });

  return {
    subscribe,
    unsubscribe,
  };
}

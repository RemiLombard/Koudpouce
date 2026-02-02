<template>
  <div
    class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white"
  >
    <AppHeader />

    <main class="max-w-4xl mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Messagerie</h1>
        <p class="text-gray-600">Gérez vos conversations et échanges</p>
      </div>

      <!-- Onglets -->
      <div class="flex gap-2 mb-6">
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl font-medium transition-all"
          :class="
            activeTab === 'received'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
          "
          @click="switchTab('received')"
        >
          Sur mes annonces
          <span
            v-if="receivedUnread > 0"
            class="ml-1.5 px-2 py-0.5 text-xs rounded-full"
            :class="
              activeTab === 'received'
                ? 'bg-white/20 text-white'
                : 'bg-orange-500 text-white'
            "
          >
            {{ receivedUnread }}
          </span>
        </button>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl font-medium transition-all"
          :class="
            activeTab === 'sent'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
          "
          @click="switchTab('sent')"
        >
          Sur d'autres annonces
          <span
            v-if="sentUnread > 0"
            class="ml-1.5 px-2 py-0.5 text-xs rounded-full"
            :class="
              activeTab === 'sent'
                ? 'bg-white/20 text-white'
                : 'bg-orange-500 text-white'
            "
          >
            {{ sentUnread }}
          </span>
        </button>
      </div>

      <!-- Chargement -->
      <LoadingSpinner v-if="loading" text="Chargement des conversations..." />

      <!-- Erreur -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center"
      >
        <p>{{ error }}</p>
        <button
          type="button"
          class="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          @click="loadConversations"
        >
          Réessayer
        </button>
      </div>

      <!-- Liste vide -->
      <div
        v-else-if="conversations.length === 0"
        class="bg-white rounded-2xl border border-gray-200 p-12 text-center"
      >
        <div
          class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Icon name="envelope" class="w-8 h-8 text-orange-400" />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          {{
            activeTab === "received" ? "Aucun message reçu" : "Aucun contact"
          }}
        </h3>
        <p class="text-gray-500">
          {{
            activeTab === "received"
              ? "Personne n'a encore répondu à vos annonces."
              : "Vous n'avez pas encore contacté d'annonceurs."
          }}
        </p>
      </div>

      <!-- Liste des conversations -->
      <div v-else class="space-y-3">
        <NuxtLink
          v-for="conv in conversations"
          :key="conv.id"
          :to="`/messagerie/${conv.id}`"
          class="group block bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-orange-200 transition-all"
          :class="{ 'ring-2 ring-orange-400': conv.unreadCount > 0 }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <!-- Titre annonce -->
              <div class="flex items-center gap-2">
                <h3
                  class="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors truncate"
                  :class="{ 'text-gray-500': conv.listingClosed }"
                >
                  {{ conv.listingTitle }}
                </h3>
                <span
                  v-if="conv.listingClosed"
                  class="shrink-0 px-2 py-0.5 text-xs bg-stone-100 text-stone-500 rounded-full"
                >
                  Clôturée
                </span>
              </div>

              <!-- Interlocuteur -->
              <p class="text-sm text-gray-500 mt-1">
                <template v-if="activeTab === 'received'">
                  De :
                  <span class="font-medium text-gray-700">{{
                    conv.contacterName
                  }}</span>
                </template>
                <template v-else>
                  À :
                  <span class="font-medium text-gray-700">{{
                    conv.listingAuthorName
                  }}</span>
                </template>
              </p>

              <!-- Dernier message -->
              <p
                v-if="conv.lastMessage"
                class="text-sm text-gray-600 mt-2 line-clamp-2"
                :class="{ 'font-medium': conv.unreadCount > 0 }"
              >
                {{ conv.lastMessage.content }}
              </p>
            </div>

            <div class="flex flex-col items-end gap-2 shrink-0">
              <!-- Date -->
              <span class="text-xs text-gray-400">
                {{ formatDate(conv.updatedAt) }}
              </span>

              <!-- Badge non lu -->
              <span
                v-if="conv.unreadCount > 0"
                class="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full"
              >
                {{ conv.unreadCount }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const {
  conversations,
  loading,
  error,
  fetchConversations,
  fetchUnreadCount,
  receivedUnread,
  sentUnread,
} = useMessaging();
const { user } = useAuth();

const activeTab = ref<"received" | "sent">("received");

function switchTab(tab: "received" | "sent") {
  activeTab.value = tab;
  loadConversations();
}

async function loadConversations() {
  await fetchConversations(activeTab.value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Hier";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("fr-FR", { weekday: "long" });
  } else {
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }
}

onMounted(async () => {
  await fetchUnreadCount();
  await loadConversations();
});
</script>

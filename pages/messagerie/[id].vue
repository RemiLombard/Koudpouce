<script setup lang="ts">
import type {
  ConversationPublic,
  MessagePublic,
} from "~/composables/useMessaging";
import type { RealtimeMessage } from "~/composables/useRealtime";

const route = useRoute();
const { user } = useAuth();
const { fetchConversation, sendMessage, markAsRead, fetchUnreadCount } =
  useMessaging();

const conversationId = computed(() => route.params.id as string);

const conversation = ref<ConversationPublic | null>(null);
const messages = ref<MessagePublic[]>([]);
const pageLoading = ref(true);
const pageError = ref<string | null>(null);

const newMessage = ref("");
const sending = ref(false);

const messagesContainer = ref<HTMLElement | null>(null);

// temps réel : s'abonner aux nouveaux messages
const { useRealtimeMessages } = await import("~/composables/useRealtime");

function handleRealtimeMessage(realtimeMsg: RealtimeMessage) {
  // ne pas ajouter si c'est notre propre message (déjà ajouté localement)
  if (realtimeMsg.sender_id === user.value?.id) return;

  // vérifier si le message n'existe pas déjà
  if (messages.value.some((m) => m.id === realtimeMsg.id)) return;

  // récupérer le nom de l'expéditeur
  const senderName =
    realtimeMsg.sender_id === conversation.value?.contacterId
      ? conversation.value?.contacterName
      : conversation.value?.listingAuthorName;

  // ajouter le message
  messages.value.push({
    id: realtimeMsg.id,
    conversationId: realtimeMsg.conversation_id,
    senderId: realtimeMsg.sender_id,
    senderName: senderName || "Utilisateur",
    content: realtimeMsg.content,
    createdAt: realtimeMsg.created_at,
    isRead: false,
  });

  // ccroll en bas
  nextTick(() => scrollToBottom());

  // marquer comme lu si on est sur la page
  markAsRead(conversationId.value);
}

useRealtimeMessages(conversationId, handleRealtimeMessage);

const showReportModal = ref(false);
const reportReason = ref("");
const reportMessage = ref("");
const reportLoading = ref(false);
const reportSuccess = ref(false);
const reportError = ref<string | null>(null);
const hasAlreadyReported = ref(false);

const otherPartyName = computed(() => {
  if (!conversation.value || !user.value) return "";
  return conversation.value.contacterId === user.value.id
    ? conversation.value.listingAuthorName
    : conversation.value.contacterName;
});

// ID de l'autre utilisateur
const otherUserId = computed(() => {
  if (!conversation.value || !user.value) return null;
  return conversation.value.contacterId === user.value.id
    ? conversation.value.listingAuthorId
    : conversation.value.contacterId;
});

// peut-on signaler cet utilisateur ?
const canReportUser = computed(() => {
  return otherUserId.value && !hasAlreadyReported.value;
});

// raisons de signalement d'utilisateur
const userReportReasons = [
  { value: "harassment", label: "Harcèlement ou intimidation" },
  { value: "spam", label: "Spam / Messages indésirables" },
  { value: "scam", label: "Tentative d'arnaque" },
  { value: "inappropriate", label: "Comportement inapproprié" },
  { value: "other", label: "Autre raison" },
];

function closeReportModal() {
  showReportModal.value = false;
  // réinitialiser le formulaire après un délai
  setTimeout(() => {
    if (!showReportModal.value) {
      reportReason.value = "";
      reportMessage.value = "";
      reportError.value = null;
      if (reportSuccess.value) {
        hasAlreadyReported.value = true;
      }
      reportSuccess.value = false;
    }
  }, 300);
}

async function submitUserReport() {
  if (!reportReason.value || reportLoading.value) return;

  reportLoading.value = true;
  reportError.value = null;

  try {
    await $fetch("/api/user-reports", {
      method: "POST",
      body: {
        reportedUserId: otherUserId.value,
        conversationId: conversationId.value,
        reason: reportReason.value,
        message: reportMessage.value.trim() || null,
      },
    });
    reportSuccess.value = true;
  } catch (err: any) {
    reportError.value =
      err?.data?.message || "Une erreur est survenue lors du signalement.";
  } finally {
    reportLoading.value = false;
  }
}

async function loadConversation() {
  pageLoading.value = true;
  pageError.value = null;

  const result = await fetchConversation(conversationId.value);

  if (result) {
    conversation.value = result.conversation;
    messages.value = result.messages;

    // marquer comme lu
    await markAsRead(conversationId.value);
    await fetchUnreadCount();

    // scroll en bas
    await nextTick();
    scrollToBottom();
  } else {
    pageError.value = "Impossible de charger cette conversation.";
  }

  pageLoading.value = false;
}

async function handleSendMessage() {
  const content = newMessage.value.trim();
  if (!content || sending.value) return;

  sending.value = true;

  const result = await sendMessage(conversationId.value, content);

  if (result) {
    messages.value.push(result);
    newMessage.value = "";

    await nextTick();
    scrollToBottom();
  }

  sending.value = false;
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) {
    return time;
  } else if (diffDays === 1) {
    return `Hier ${time}`;
  } else {
    const day = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
    return `${day} ${time}`;
  }
}

// charger au montage
onMounted(() => {
  loadConversation();
});
</script>


<template>
  <div
    class="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex flex-col"
  >
    <AppHeader />

    <!-- barre de navigation conversation -->
    <div class="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-30">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex items-center gap-4">
          <NuxtLink
            to="/messagerie"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            title="Retour"
          >
            <Icon name="arrow-left" class="w-5 h-5" />
          </NuxtLink>

          <div v-if="conversation" class="flex-1 min-w-0">
            <NuxtLink
              :to="`/annonces/${conversation.listingId}`"
              class="font-semibold text-gray-800 hover:text-orange-600 transition-colors truncate block"
            >
              {{ conversation.listingTitle }}
            </NuxtLink>
            <p class="text-sm text-gray-500">
              Conversation avec
              <span class="font-medium">{{ otherPartyName }}</span>
            </p>
          </div>

          <div v-else class="flex-1">
            <div class="h-5 w-48 bg-gray-200 rounded animate-pulse" />
            <div class="h-4 w-32 bg-gray-100 rounded mt-1 animate-pulse" />
          </div>

          <!-- bouton signaler -->
          <button
            v-if="conversation && canReportUser"
            type="button"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Signaler cet utilisateur"
            @click="showReportModal = true"
          >
            <Icon name="flag" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- zone de chargement / erreur -->
    <template v-if="pageLoading">
      <div class="flex-1 flex items-center justify-center">
        <LoadingSpinner
          :centered="false"
          text="Chargement de la conversation..."
        />
      </div>
    </template>

    <template v-else-if="pageError">
      <div class="flex-1 flex items-center justify-center p-4">
        <div
          class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center max-w-md"
        >
          <p>{{ pageError }}</p>
          <NuxtLink
            to="/messagerie"
            class="inline-block mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Retour à la messagerie
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- contenu principal -->
    <template v-else>
      <!-- liste des messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto">
        <div class="max-w-4xl mx-auto px-4 py-6 space-y-4 pb-28">
          <!-- message vide -->
          <div
            v-if="messages.length === 0"
            class="text-center py-12 text-gray-500"
          >
            <Icon
              name="envelope"
              class="w-12 h-12 mx-auto text-gray-300 mb-3"
            />
            <p>Aucun message pour le moment.</p>
            <p class="text-sm">Envoyez le premier message !</p>
          </div>

          <!-- messages -->
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="msg.senderId === user?.id ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[75%] rounded-2xl px-4 py-3 shadow-sm"
              :class="
                msg.senderId === user?.id
                  ? 'bg-orange-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              "
            >
              <!-- nom expéditeur si ce n'est pas moi -->
              <p
                v-if="msg.senderId !== user?.id"
                class="text-xs font-medium text-orange-600 mb-1"
              >
                {{ msg.senderName }}
              </p>

              <!-- contenu -->
              <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>

              <!-- date -->
              <p
                class="text-xs mt-1.5"
                :class="
                  msg.senderId === user?.id ? 'text-white/70' : 'text-gray-400'
                "
              >
                {{ formatMessageDate(msg.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- zone de saisie -->
      <div
        class="bg-white border-t border-gray-200 shadow-lg sticky bottom-0 z-40"
      >
        <div class="max-w-4xl mx-auto px-4 py-4">
          <!-- annonce clôturée -->
          <div
            v-if="conversation?.listingClosed"
            class="flex items-center gap-3 p-4 bg-stone-100 rounded-xl text-stone-600"
          >
            <Icon name="check" class="w-5 h-5 shrink-0" />
            <p>
              Cette annonce est clôturée. Il n'est plus possible d'envoyer de
              messages.
            </p>
          </div>

          <!-- formulaire d'envoi -->
          <form v-else class="flex gap-3" @submit.prevent="handleSendMessage">
            <textarea
              v-model="newMessage"
              rows="1"
              class="flex-1 resize-none px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              placeholder="Écrivez votre message..."
              :disabled="sending"
              @keydown.enter.exact.prevent="handleSendMessage"
            />
            <button
              type="submit"
              class="px-5 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="!newMessage.trim() || sending"
            >
              <Icon name="paper-airplane" class="w-5 h-5" />
              <span class="hidden sm:inline">Envoyer</span>
            </button>
          </form>
        </div>
      </div>
    </template>

    <!-- modale de signalement d'utilisateur -->
    <Teleport to="body">
      <div
        v-if="showReportModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        @click.self="closeReportModal"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-100"
        >
          <!-- header -->
          <div
            class="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-5 border-b border-stone-100"
          >
            <div class="flex items-center justify-between">
              <h3
                class="text-lg font-bold text-stone-800 flex items-center gap-3"
              >
                <div
                  class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"
                >
                  <Icon name="flag" class="w-5 h-5 text-orange-600" />
                </div>
                Signaler {{ otherPartyName }}
              </h3>
              <button
                type="button"
                class="p-2 hover:bg-white/60 rounded-xl transition-colors text-stone-500 hover:text-stone-700"
                @click="closeReportModal"
              >
                <Icon name="x" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- contenu -->
          <div class="p-6">
            <!-- message de succès -->
            <div v-if="reportSuccess" class="text-center py-6">
              <div
                class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center"
              >
                <Icon name="check" class="w-8 h-8 text-green-600" />
              </div>
              <p class="text-stone-800 font-bold text-lg mb-2">
                Signalement envoyé
              </p>
              <p class="text-stone-600 text-sm mb-6 leading-relaxed">
                Merci de votre vigilance. Notre équipe va examiner ce
                signalement rapidement.
              </p>
              <BaseButton variant="primary" @click="closeReportModal">
                Fermer
              </BaseButton>
            </div>

            <!-- formulaire -->
            <form v-else @submit.prevent="submitUserReport" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-2">
                  Raison du signalement <span class="text-red-500">*</span>
                </label>
                <div class="space-y-2">
                  <label
                    v-for="reason in userReportReasons"
                    :key="reason.value"
                    class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                    :class="
                      reportReason === reason.value
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-stone-200 hover:bg-stone-50'
                    "
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      :value="reason.value"
                      v-model="reportReason"
                      class="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span class="text-stone-700">{{ reason.label }}</span>
                  </label>
                </div>
              </div>

              <div>
                <label
                  for="reportMessage"
                  class="block text-sm font-medium text-stone-700 mb-2"
                >
                  Message (optionnel)
                </label>
                <textarea
                  id="reportMessage"
                  v-model="reportMessage"
                  rows="3"
                  class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  placeholder="Précisez votre signalement si nécessaire..."
                ></textarea>
              </div>

              <!-- erreur -->
              <p v-if="reportError" class="text-sm text-red-600">
                {{ reportError }}
              </p>

              <!-- actions -->
              <div class="flex gap-3 pt-2">
                <BaseButton
                  type="button"
                  variant="ghost"
                  class="flex-1"
                  @click="closeReportModal"
                >
                  Annuler
                </BaseButton>
                <BaseButton
                  type="submit"
                  variant="primary"
                  class="flex-1"
                  :loading="reportLoading"
                  :disabled="!reportReason"
                >
                  Envoyer le signalement
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

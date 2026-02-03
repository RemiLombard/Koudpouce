<!-- page détail d'une annonce : affichage complet + actions (contacter, signaler) -->
<script setup lang="ts">
import type { ListingPublic, ServiceType } from "~/composables/useListings";
import { fetchServiceTypes } from "~/composables/useListings";

// composables Vue
const route = useRoute();
const router = useRouter();
const { user } = useAuth();
const { fetchListingById } = useListings();
const { startConversation } = useMessaging();

// données de l'annonce
const listing = ref<ListingPublic | null>(null);
const serviceTypes = ref<ServiceType[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const closing = ref(false);
const closeError = ref<string | null>(null);
const contacting = ref(false);
const contactError = ref<string | null>(null);

const showReportModal = ref(false);
const reportReason = ref<string>("");
const reportMessage = ref("");
const reporting = ref(false);
const reportError = ref<string | null>(null);
const reportSuccess = ref(false);

// SEO dynamique basé sur l'annonce
useHead(() => ({
  title: listing.value
    ? `${listing.value.title} - Koudpouce`
    : "Annonce - Koudpouce",
  meta: [
    {
      name: "description",
      content: listing.value
        ? `${listing.value.type === "demande" ? "Demande" : "Proposition"} d'aide à ${listing.value.cityName} : ${listing.value.description.slice(0, 150)}...`
        : "Consultez cette annonce d'entraide sur Koudpouce.",
    },
  ],
}));

useSeoMeta({
  ogType: "article",
});

const reportReasons = [
  { value: "spam", label: "Spam ou contenu dupliqué" },
  { value: "professional", label: "Activité professionnelle déguisée" },
  { value: "inappropriate", label: "Contenu inapproprié ou offensant" },
  { value: "scam", label: "Tentative d'arnaque" },
  { value: "other", label: "Autre raison" },
];

const isOwner = computed(() => {
  return (
    user.value && listing.value && user.value.id === listing.value.authorId
  );
});

const isClosed = computed(() => {
  return listing.value?.status === "closed";
});

const formattedDate = computed(() => {
  if (!listing.value) return "";
  const date = new Date(listing.value.createdAt);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const formattedClosedDate = computed(() => {
  if (!listing.value?.closedAt) return "";
  const date = new Date(listing.value.closedAt);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const serviceLabels = computed(() => {
  if (!listing.value) return [];
  const map: Record<string, string> = {};
  for (const st of serviceTypes.value) {
    map[st.id] = st.label;
  }
  return listing.value.serviceTypeIds.map((id) => map[id]).filter(Boolean);
});

onMounted(async () => {
  const id = route.params.id as string;

  const [listingResult, serviceTypesResult] = await Promise.all([
    fetchListingById(id),
    fetchServiceTypes(),
  ]);

  serviceTypes.value = serviceTypesResult;

  if (!listingResult) {
    error.value = "Annonce introuvable.";
  } else {
    listing.value = listingResult;
  }

  loading.value = false;
});

async function handleClose() {
  if (!listing.value || !isOwner.value || closing.value) return;

  closing.value = true;
  closeError.value = null;

  try {
    const response = await $fetch<{ listing: ListingPublic }>(
      `/api/listings/${listing.value.id}/close`,
      {
        method: "POST",
      },
    );
    listing.value = response.listing;
  } catch (err: any) {
    closeError.value =
      err?.data?.message ?? "Impossible de clôturer l'annonce.";
  } finally {
    closing.value = false;
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

async function handleContact() {
  if (!listing.value || contacting.value) return;

  contacting.value = true;
  contactError.value = null;

  const conversationId = await startConversation(listing.value.id);

  if (conversationId) {
    router.push(`/messagerie/${conversationId}`);
  } else {
    contactError.value = "Impossible de démarrer la conversation.";
  }

  contacting.value = false;
}

function openReportModal() {
  reportReason.value = "";
  reportMessage.value = "";
  reportError.value = null;
  reportSuccess.value = false;
  showReportModal.value = true;
}

function closeReportModal() {
  showReportModal.value = false;
}

async function handleReport() {
  if (!listing.value || !reportReason.value || reporting.value) return;

  reporting.value = true;
  reportError.value = null;

  try {
    await $fetch("/api/reports", {
      method: "POST",
      body: {
        listingId: listing.value.id,
        reason: reportReason.value,
        message: reportMessage.value.trim() || null,
      },
    });
    reportSuccess.value = true;
  } catch (err: any) {
    reportError.value =
      err?.data?.message ?? "Impossible d'envoyer le signalement.";
  } finally {
    reporting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm">
    <AppHeader />

    <main class="max-w-3xl mx-auto px-4 py-8">
      <!-- bouton retour -->
      <BackLink to="/cherche" label="Retour aux annonces" />

      <!-- chargement -->
      <LoadingSpinner v-if="loading" text="Chargement..." />

      <!-- erreur -->
      <BaseCard
        v-else-if="error"
        variant="default"
        padding="lg"
        class="text-center"
      >
        <div
          class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
        >
          <Icon name="x" class="w-8 h-8 text-red-500" />
        </div>
        <p class="text-red-600 font-medium mb-4">{{ error }}</p>
        <BaseButton variant="primary" @click="goBack">
          Retour aux annonces
        </BaseButton>
      </BaseCard>

      <!-- contenu de l'annonce -->
      <article v-else-if="listing">
        <!-- bandeau si clôturée -->
        <div
          v-if="isClosed"
          class="mb-4 flex items-center gap-3 p-4 bg-stone-100 rounded-xl text-stone-600"
        >
          <Icon name="check" class="w-5 h-5" />
          <span>
            Cette annonce n'est plus disponible.
            <span v-if="formattedClosedDate"
              >(clôturée le {{ formattedClosedDate }})</span
            >
          </span>
        </div>

        <BaseCard variant="elevated" padding="none" class="overflow-hidden">
          <!-- barre colorée en haut -->
          <div class="h-2 bg-gradient-to-r from-primary-400 to-secondary-400" />

          <div class="p-8">
            <!-- badges -->
            <div class="flex flex-wrap items-center gap-2 mb-6">
              <ListingTypeBadge :type="listing.type" />
              <ServiceTypeBadge
                v-for="label in serviceLabels"
                :key="label"
                :label="label"
              />
            </div>

            <!-- titre -->
            <h1 class="text-3xl font-bold text-stone-800 mb-6">
              {{ listing.title }}
            </h1>

            <!-- description -->
            <div class="prose prose-stone max-w-none mb-8">
              <p
                class="whitespace-pre-wrap text-stone-700 leading-relaxed text-lg"
              >
                {{ listing.description }}
              </p>
            </div>

            <!-- infos secondaires -->
            <div
              class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-100"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"
                >
                  <Icon name="location" class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div class="text-sm text-stone-500">Localisation</div>
                  <div class="font-medium text-stone-800">
                    {{ listing.cityName }} ({{ listing.departmentCode }})
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"
                >
                  <Icon name="user" class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div class="text-sm text-stone-500">Publiée par</div>
                  <div class="font-medium text-stone-800">
                    {{ listing.authorDisplayName }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"
                >
                  <Icon name="calendar" class="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div class="text-sm text-stone-500">Date</div>
                  <div class="font-medium text-stone-800">
                    {{ formattedDate }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- actions -->
          <div
            v-if="!isClosed"
            class="bg-stone-50 px-8 py-6 border-t border-stone-100"
          >
            <!-- propriétaire -->
            <div v-if="isOwner">
              <p class="text-stone-600 mb-4">
                Vous êtes l'auteur de cette annonce.
              </p>
              <BaseButton
                variant="danger"
                :loading="closing"
                @click="handleClose"
              >
                Clôturer cette annonce
              </BaseButton>
              <p v-if="closeError" class="mt-3 text-sm text-red-600">
                {{ closeError }}
              </p>
            </div>

            <!-- connecté mais pas propriétaire -->
            <div v-else-if="user">
              <p class="text-stone-600 mb-4">
                Vous souhaitez répondre à cette annonce ?
              </p>
              <div class="flex flex-wrap items-center gap-3">
                <BaseButton
                  variant="primary"
                  :loading="contacting"
                  @click="handleContact"
                >
                  <Icon name="envelope" class="w-5 h-5" />
                  Contacter
                </BaseButton>
                <button
                  type="button"
                  class="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Signaler cette annonce"
                  @click="openReportModal"
                >
                  <Icon name="flag" class="w-5 h-5" />
                </button>
              </div>
              <p v-if="contactError" class="mt-3 text-sm text-red-600">
                {{ contactError }}
              </p>
            </div>

            <!-- non connecté -->
            <div v-else>
              <p class="text-stone-600 mb-4">
                Connectez-vous pour répondre à cette annonce.
              </p>
              <NuxtLink to="/auth/login">
                <BaseButton variant="primary">
                  <Icon name="login" class="w-5 h-5" />
                  Se connecter
                </BaseButton>
              </NuxtLink>
            </div>
          </div>
        </BaseCard>
      </article>

      <!-- modale de signalement -->
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
              class="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-5 border-b border-stone-100"
            >
              <div class="flex items-center justify-between">
                <h3
                  class="text-lg font-bold text-stone-800 flex items-center gap-3"
                >
                  <div
                    class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"
                  >
                    <Icon name="flag" class="w-5 h-5 text-primary-600" />
                  </div>
                  Signaler cette annonce
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
              <form v-else @submit.prevent="handleReport" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-2">
                    Raison du signalement <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-2">
                    <label
                      v-for="reason in reportReasons"
                      :key="reason.value"
                      class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                      :class="
                        reportReason === reason.value
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-stone-200 hover:bg-stone-50'
                      "
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        :value="reason.value"
                        v-model="reportReason"
                        class="w-4 h-4 text-primary-600 focus:ring-primary-500"
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
                    class="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
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
                    :loading="reporting"
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
    </main>
  </div>
</template>

<template>
  <div class="min-h-screen bg-gradient-warm flex flex-col">
    <!-- Header Admin -->
    <header
      class="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-lg"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <Icon name="shield" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 class="text-lg font-bold text-white">Administration</h1>
              <p class="text-xs text-white/70">Koudpouce</p>
            </div>
          </div>
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-xl border border-white/40 hover:bg-white/10 transition-colors"
            @click="handleLogout"
          >
            <Icon name="logout" class="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- Bouton retour -->
      <BackLink to="/admin" label="Retour aux signalements" />
      <!-- État de chargement -->
      <LoadingSpinner v-if="loading" text="Chargement du signalement..." />

      <!-- Erreur -->
      <BaseCard
        v-else-if="error"
        variant="elevated"
        padding="lg"
        class="text-center"
      >
        <div
          class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center"
        >
          <Icon name="alert-triangle" class="w-8 h-8 text-red-600" />
        </div>
        <p class="text-stone-600 text-lg font-medium mb-4">{{ error }}</p>
        <NuxtLink to="/admin">
          <BaseButton variant="primary">Retour à la liste</BaseButton>
        </NuxtLink>
      </BaseCard>

      <!-- Contenu -->
      <div v-else-if="report" class="space-y-6">
        <!-- En-tête du signalement -->
        <BaseCard variant="elevated" padding="lg">
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <span
              :class="[
                'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold',
                reasonBadgeClass(report.reason),
              ]"
            >
              {{ reasonLabel(report.reason) }}
            </span>
            <span
              :class="[
                'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold',
                statusBadgeClass(report.status),
              ]"
            >
              {{ statusLabel(report.status) }}
            </span>
          </div>

          <h1 class="text-2xl font-bold text-stone-800 mb-2">
            Signalement #{{ report.id.slice(0, 8) }}
          </h1>
          <p class="text-stone-500 flex items-center gap-2">
            <Icon name="calendar" class="w-4 h-4" />
            Créé le {{ formatDate(report.createdAt) }}
          </p>
        </BaseCard>

        <!-- Message du signaleur -->
        <BaseCard v-if="report.message" variant="default" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <div
              class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="message-square" class="w-4 h-4 text-orange-600" />
            </div>
            Message du signaleur
          </h2>
          <blockquote
            class="bg-stone-50 rounded-xl p-5 border-l-4 border-orange-400 italic text-stone-700 leading-relaxed"
          >
            {{ report.message }}
          </blockquote>
        </BaseCard>

        <!-- Informations sur le signaleur -->
        <BaseCard variant="default" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <div
              class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="user" class="w-4 h-4 text-orange-600" />
            </div>
            Signalé par
          </h2>
          <div v-if="report.reporter" class="grid gap-2">
            <div class="flex items-center gap-3">
              <span class="text-stone-500 text-sm w-20">Nom</span>
              <span class="font-medium text-stone-800">{{
                report.reporter.firstName
              }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-stone-500 text-sm w-20">Email</span>
              <span class="font-medium text-stone-800">{{
                report.reporter.email
              }}</span>
            </div>
          </div>
          <p v-else class="text-stone-400 italic">Utilisateur inconnu</p>
        </BaseCard>

        <!-- Annonce signalée -->
        <BaseCard variant="highlighted" color="primary" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <div
              class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="file-text" class="w-4 h-4 text-orange-600" />
            </div>
            Annonce signalée
          </h2>

          <div v-if="report.listing" class="space-y-4">
            <div>
              <h3 class="text-xl font-bold text-stone-800 mb-1">
                {{ report.listing.title }}
              </h3>
              <p class="text-stone-500 flex items-center gap-1">
                <Icon name="location" class="w-4 h-4" />
                {{ report.listing.cityName }} ({{
                  report.listing.departmentCode
                }})
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                  report.listing.type === 'proposition'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-orange-100 text-orange-700 border-orange-200',
                ]"
              >
                {{
                  report.listing.type === "proposition"
                    ? "Proposition"
                    : "Demande"
                }}
              </span>
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                  report.listing.status === 'active'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200',
                ]"
              >
                {{ report.listing.status === "active" ? "Active" : "Clôturée" }}
              </span>
            </div>

            <div class="bg-white rounded-xl p-5 border border-stone-100">
              <p class="text-stone-700 whitespace-pre-wrap leading-relaxed">
                {{ report.listing.description }}
              </p>
            </div>

            <!-- Propriétaire de l'annonce -->
            <div
              v-if="report.listingOwner"
              class="border-t border-stone-200 pt-4"
            >
              <h4 class="font-semibold text-stone-700 mb-3">
                Auteur de l'annonce
              </h4>
              <div class="grid gap-2">
                <div class="flex items-center gap-3">
                  <span class="text-stone-500 text-sm w-20">Nom</span>
                  <span class="font-medium text-stone-800">{{
                    report.listingOwner.firstName
                  }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-stone-500 text-sm w-20">Email</span>
                  <span class="font-medium text-stone-800">{{
                    report.listingOwner.email
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center gap-3 text-stone-400">
            <Icon name="alert-triangle" class="w-5 h-5" />
            <span class="italic">Cette annonce a été supprimée.</span>
          </div>
        </BaseCard>

        <!-- Actions -->
        <BaseCard
          v-if="report.status === 'pending'"
          variant="elevated"
          padding="lg"
        >
          <h2 class="text-lg font-bold text-stone-800 mb-4">Actions</h2>
          <div class="flex flex-col sm:flex-row gap-3">
            <BaseButton
              variant="outline"
              class="flex-1"
              :loading="actionLoading"
              @click="dismissReport"
            >
              <Icon name="x" class="w-5 h-5" />
              Rejeter le signalement
            </BaseButton>
            <BaseButton
              variant="danger"
              class="flex-1"
              :loading="actionLoading"
              @click="actionReport"
            >
              <Icon name="trash" class="w-5 h-5" />
              Supprimer l'annonce
            </BaseButton>
          </div>
          <p class="text-xs text-stone-500 mt-4 text-center">
            La suppression d'une annonce supprime également toutes les
            conversations associées.
          </p>
        </BaseCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: false,
});

interface ReportListing {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  cityName: string;
  departmentCode: string;
}

interface ReportUser {
  id: string;
  firstName: string;
  email: string;
}

interface ReportDetail {
  id: string;
  listingId: string;
  reason: string;
  message: string | null;
  status: "pending" | "dismissed" | "actioned";
  createdAt: string;
  listing: ReportListing | null;
  reporter: ReportUser | null;
  listingOwner: ReportUser | null;
}

const route = useRoute();
const router = useRouter();
const apiBase = useRuntimeConfig().public.apiBase as string;
const { logout } = useAuth();

const report = ref<ReportDetail | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const actionLoading = ref(false);

async function handleLogout() {
  await logout();
  navigateTo("/");
}

async function loadReport() {
  loading.value = true;
  error.value = null;

  try {
    const response = await $fetch<{ report: ReportDetail }>(
      `/api/reports/${route.params.id}`,
      {
        credentials: "include",
        baseURL: apiBase,
      },
    );
    report.value = response.report;
  } catch (err: any) {
    error.value = err?.data?.error || "Signalement non trouvé.";
  } finally {
    loading.value = false;
  }
}

async function dismissReport() {
  if (!confirm("Êtes-vous sûr de vouloir rejeter ce signalement ?")) return;

  actionLoading.value = true;
  try {
    await $fetch(`/api/reports/${route.params.id}/dismiss`, {
      method: "POST",
      credentials: "include",
      baseURL: apiBase,
    });
    router.push("/admin");
  } catch (err) {
    console.error("Erreur lors du rejet du signalement:", err);
    alert("Erreur lors du rejet du signalement.");
  } finally {
    actionLoading.value = false;
  }
}

async function actionReport() {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.",
    )
  )
    return;

  actionLoading.value = true;
  try {
    await $fetch(`/api/reports/${route.params.id}/action`, {
      method: "POST",
      credentials: "include",
      baseURL: apiBase,
    });
    router.push("/admin");
  } catch (err) {
    console.error("Erreur lors du traitement du signalement:", err);
    alert("Erreur lors du traitement du signalement.");
  } finally {
    actionLoading.value = false;
  }
}

function reasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    spam: "Spam",
    professional: "Professionnel",
    inappropriate: "Inapproprié",
    scam: "Arnaque",
    other: "Autre",
  };
  return labels[reason] || reason;
}

function reasonBadgeClass(reason: string): string {
  const classes: Record<string, string> = {
    spam: "bg-amber-100 text-amber-700 border border-amber-200",
    professional: "bg-stone-100 text-stone-700 border border-stone-200",
    inappropriate: "bg-red-100 text-red-700 border border-red-200",
    scam: "bg-red-100 text-red-700 border border-red-200",
    other: "bg-stone-100 text-stone-600 border border-stone-200",
  };
  return (
    classes[reason] || "bg-stone-100 text-stone-600 border border-stone-200"
  );
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "En attente",
    dismissed: "Rejeté",
    actioned: "Traité",
  };
  return labels[status] || status;
}

function statusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700 border border-orange-200",
    dismissed: "bg-stone-100 text-stone-600 border border-stone-200",
    actioned: "bg-green-100 text-green-700 border border-green-200",
  };
  return (
    classes[status] || "bg-stone-100 text-stone-600 border border-stone-200"
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

onMounted(() => {
  loadReport();
});
</script>

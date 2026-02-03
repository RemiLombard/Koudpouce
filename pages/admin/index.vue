<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: false,
});

interface ReportListing {
  id: string;
  title: string;
  cityName: string;
  departmentCode: string;
}

interface ReportReporter {
  id: string;
  firstName: string;
}

interface ReportedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ListingReport {
  id: string;
  listingId: string;
  reason: string;
  message: string | null;
  status: "pending" | "dismissed" | "actioned";
  createdAt: string;
  listing: ReportListing | null;
  reporter: ReportReporter | null;
}

interface UserReport {
  id: string;
  reportedUserId: string;
  conversationId: string;
  reason: string;
  message: string | null;
  status: "pending" | "dismissed" | "actioned";
  createdAt: string;
  reportedUser: ReportedUser | null;
  reporter: ReportReporter | null;
}

const { logout } = useAuth();
const router = useRouter();

const activeTab = ref<"listings" | "users">("listings");

// compteurs
const listingReportsCount = ref(0);
const userReportsCount = ref(0);

// signalements d'annonces
const listingReports = ref<ListingReport[]>([]);
const listingLoading = ref(true);
const listingActionLoading = ref<string | null>(null);

// signalements d'utilisateurs
const userReports = ref<UserReport[]>([]);
const userLoading = ref(true);
const userActionLoading = ref<string | null>(null);

async function loadCounts() {
  try {
    const [listingRes, userRes] = await Promise.all([
      $fetch<{ count: number }>("/api/reports/count"),
      $fetch<{ count: number }>("/api/user-reports/count"),
    ]);
    listingReportsCount.value = listingRes.count;
    userReportsCount.value = userRes.count;
  } catch (err) {
    console.error("Erreur lors du chargement des compteurs:", err);
  }
}

async function loadListingReports() {
  listingLoading.value = true;
  try {
    const response = await $fetch<{ reports: ListingReport[] }>(
      "/api/reports",
      { query: { status: "pending" } },
    );
    listingReports.value = response.reports;
  } catch (err) {
    console.error("Erreur lors du chargement des signalements:", err);
  } finally {
    listingLoading.value = false;
  }
}

async function loadUserReports() {
  userLoading.value = true;
  try {
    const response = await $fetch<{ reports: UserReport[] }>(
      "/api/user-reports",
      { query: { status: "pending" } },
    );
    userReports.value = response.reports;
  } catch (err) {
    console.error("Erreur lors du chargement des signalements:", err);
  } finally {
    userLoading.value = false;
  }
}

async function dismissListingReport(id: string) {
  if (!confirm("Êtes-vous sûr de vouloir rejeter ce signalement ?")) return;

  listingActionLoading.value = id;
  try {
    await $fetch(`/api/reports/${id}/dismiss`, { method: "POST" });
    await Promise.all([loadListingReports(), loadCounts()]);
  } catch (err) {
    console.error("Erreur lors du rejet du signalement:", err);
    alert("Erreur lors du rejet du signalement.");
  } finally {
    listingActionLoading.value = null;
  }
}

async function actionListingReport(id: string) {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.",
    )
  )
    return;

  listingActionLoading.value = id;
  try {
    await $fetch(`/api/reports/${id}/action`, { method: "POST" });
    await Promise.all([loadListingReports(), loadCounts()]);
  } catch (err) {
    console.error("Erreur lors du traitement du signalement:", err);
    alert("Erreur lors du traitement du signalement.");
  } finally {
    listingActionLoading.value = null;
  }
}

async function dismissUserReport(id: string) {
  if (!confirm("Êtes-vous sûr de vouloir rejeter ce signalement ?")) return;

  userActionLoading.value = id;
  try {
    await $fetch(`/api/user-reports/${id}/dismiss`, { method: "POST" });
    await Promise.all([loadUserReports(), loadCounts()]);
  } catch (err) {
    console.error("Erreur lors du rejet du signalement:", err);
    alert("Erreur lors du rejet du signalement.");
  } finally {
    userActionLoading.value = null;
  }
}

async function actionUserReport(id: string) {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir sanctionner cet utilisateur ? Cette action sera enregistrée.",
    )
  )
    return;

  userActionLoading.value = id;
  try {
    await $fetch(`/api/user-reports/${id}/action`, { method: "POST" });
    await Promise.all([loadUserReports(), loadCounts()]);
  } catch (err) {
    console.error("Erreur lors du traitement du signalement:", err);
    alert("Erreur lors du traitement du signalement.");
  } finally {
    userActionLoading.value = null;
  }
}

async function handleLogout() {
  await logout();
  router.push("/auth/login");
}

function listingReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    spam: "Spam",
    professional: "Professionnel",
    inappropriate: "Inapproprié",
    scam: "Arnaque",
    other: "Autre",
  };
  return labels[reason] || reason;
}

function listingReasonBadgeClass(reason: string): string {
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

function userReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    harassment: "Harcèlement",
    spam: "Spam",
    scam: "Arnaque",
    inappropriate: "Comportement inapproprié",
    other: "Autre",
  };
  return labels[reason] || reason;
}

function userReasonBadgeClass(reason: string): string {
  const classes: Record<string, string> = {
    harassment: "bg-red-100 text-red-700 border border-red-200",
    spam: "bg-amber-100 text-amber-700 border border-amber-200",
    scam: "bg-red-100 text-red-700 border border-red-200",
    inappropriate: "bg-orange-100 text-orange-700 border border-orange-200",
    other: "bg-stone-100 text-stone-600 border border-stone-200",
  };
  return (
    classes[reason] || "bg-stone-100 text-stone-600 border border-stone-200"
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// charger les données quand on change d'onglet
watch(
  activeTab,
  (newTab) => {
    if (newTab === "listings" && listingReports.value.length === 0) {
      loadListingReports();
    } else if (newTab === "users" && userReports.value.length === 0) {
      loadUserReports();
    }
  },
  { immediate: false },
);

onMounted(() => {
  loadCounts();
  loadListingReports();
  loadUserReports();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-warm flex flex-col">
    <AdminHeader />

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- onglets -->
      <div class="flex gap-2 mb-6">
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl font-medium transition-all"
          :class="
            activeTab === 'listings'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
          "
          @click="activeTab = 'listings'"
        >
          Annonces
          <span
            v-if="listingReportsCount > 0"
            class="ml-1.5 px-2 py-0.5 text-xs rounded-full"
            :class="
              activeTab === 'listings'
                ? 'bg-white/20 text-white'
                : 'bg-orange-500 text-white'
            "
          >
            {{ listingReportsCount }}
          </span>
        </button>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl font-medium transition-all"
          :class="
            activeTab === 'users'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
          "
          @click="activeTab = 'users'"
        >
          Utilisateurs
          <span
            v-if="userReportsCount > 0"
            class="ml-1.5 px-2 py-0.5 text-xs rounded-full"
            :class="
              activeTab === 'users'
                ? 'bg-white/20 text-white'
                : 'bg-orange-500 text-white'
            "
          >
            {{ userReportsCount }}
          </span>
        </button>
      </div>

      <!-- titre dynamique -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-stone-800 mb-1">
          {{
            activeTab === "listings"
              ? "Signalements d'annonces"
              : "Signalements d'utilisateurs"
          }}
        </h2>
        <p class="text-stone-600 text-sm">
          {{
            activeTab === "listings"
              ? "Examinez et traitez les signalements d'annonces"
              : "Examinez et traitez les signalements d'utilisateurs"
          }}
        </p>
      </div>

      <template v-if="activeTab === 'listings'">
        <!-- état de chargement -->
        <LoadingSpinner
          v-if="listingLoading"
          text="Chargement des signalements..."
        />

        <!-- message si aucun signalement -->
        <BaseCard
          v-else-if="listingReports.length === 0"
          variant="elevated"
          padding="lg"
          class="text-center"
        >
          <div
            class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center"
          >
            <Icon name="check-circle" class="w-8 h-8 text-green-600" />
          </div>
          <p class="text-stone-600 text-lg font-medium">
            Aucun signalement à traiter
          </p>
          <p class="text-stone-500 text-sm mt-1">
            Tous les signalements ont été traités. Bravo !
          </p>
        </BaseCard>

        <!-- liste des signalements d'annonces -->
        <div v-else class="space-y-4">
          <BaseCard
            v-for="report in listingReports"
            :key="report.id"
            variant="interactive"
            padding="none"
            class="overflow-hidden"
          >
            <!-- barre de statut -->
            <div
              :class="[
                'h-1',
                report.status === 'pending'
                  ? 'bg-gradient-to-r from-orange-400 to-amber-400'
                  : report.status === 'actioned'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                    : 'bg-stone-300',
              ]"
            />

            <div class="p-6">
              <div class="flex flex-col lg:flex-row lg:items-start gap-4">
                <!-- infos du signalement -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      :class="[
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                        listingReasonBadgeClass(report.reason),
                      ]"
                    >
                      {{ listingReasonLabel(report.reason) }}
                    </span>
                  </div>

                  <!-- annonce signalée -->
                  <div v-if="report.listing" class="mb-3">
                    <h3 class="font-bold text-stone-800 text-lg mb-1">
                      {{ report.listing.title }}
                    </h3>
                    <p class="text-sm text-stone-500 flex items-center gap-1">
                      <Icon name="location" class="w-4 h-4" />
                      {{ report.listing.cityName }} ({{
                        report.listing.departmentCode
                      }})
                    </p>
                  </div>
                  <div v-else class="mb-3">
                    <p class="text-stone-400 italic flex items-center gap-2">
                      <Icon name="alert-triangle" class="w-4 h-4" />
                      Annonce supprimée
                    </p>
                  </div>

                  <!-- message optionnel -->
                  <div
                    v-if="report.message"
                    class="bg-stone-50 rounded-xl p-4 mb-3 border border-stone-100"
                  >
                    <p class="text-sm text-stone-700 italic leading-relaxed">
                      « {{ report.message }} »
                    </p>
                  </div>

                  <!-- meta infos -->
                  <div
                    class="flex flex-wrap items-center gap-4 text-xs text-stone-500"
                  >
                    <span class="flex items-center gap-1">
                      <Icon name="user" class="w-3.5 h-3.5" />
                      {{ report.reporter?.firstName || "Utilisateur inconnu" }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="calendar" class="w-3.5 h-3.5" />
                      {{ formatDate(report.createdAt) }}
                    </span>
                  </div>
                </div>

                <!-- actions -->
                <div
                  class="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-auto"
                >
                  <NuxtLink :to="`/admin/reports/${report.id}`">
                    <BaseButton variant="primary" size="sm" class="w-full">
                      <Icon name="eye" class="w-4 h-4" />
                      Voir détails
                    </BaseButton>
                  </NuxtLink>
                  <BaseButton
                    variant="outline"
                    size="sm"
                    :loading="listingActionLoading === report.id"
                    @click="dismissListingReport(report.id)"
                  >
                    <Icon name="x" class="w-4 h-4" />
                    Rejeter
                  </BaseButton>
                  <BaseButton
                    variant="danger"
                    size="sm"
                    :loading="listingActionLoading === report.id"
                    @click="actionListingReport(report.id)"
                  >
                    <Icon name="trash" class="w-4 h-4" />
                    Supprimer
                  </BaseButton>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </template>

      <template v-else-if="activeTab === 'users'">
        <!-- état de chargement -->
        <LoadingSpinner
          v-if="userLoading"
          text="Chargement des signalements..."
        />

        <!-- message si aucun signalement -->
        <BaseCard
          v-else-if="userReports.length === 0"
          variant="elevated"
          padding="lg"
          class="text-center"
        >
          <div
            class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center"
          >
            <Icon name="check-circle" class="w-8 h-8 text-green-600" />
          </div>
          <p class="text-stone-600 text-lg font-medium">
            Aucun signalement à traiter
          </p>
          <p class="text-stone-500 text-sm mt-1">
            Tous les signalements ont été traités. Bravo !
          </p>
        </BaseCard>

        <!-- liste des signalements d'utilisateurs -->
        <div v-else class="space-y-4">
          <BaseCard
            v-for="report in userReports"
            :key="report.id"
            variant="interactive"
            padding="none"
            class="overflow-hidden"
          >
            <!-- barre de statut -->
            <div
              :class="[
                'h-1',
                report.status === 'pending'
                  ? 'bg-gradient-to-r from-orange-400 to-amber-400'
                  : report.status === 'actioned'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                    : 'bg-stone-300',
              ]"
            />

            <div class="p-6">
              <div class="flex flex-col lg:flex-row lg:items-start gap-4">
                <!-- infos du signalement -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      :class="[
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                        userReasonBadgeClass(report.reason),
                      ]"
                    >
                      {{ userReasonLabel(report.reason) }}
                    </span>
                  </div>

                  <!-- utilisateur signalé -->
                  <div v-if="report.reportedUser" class="mb-3">
                    <h3 class="font-bold text-stone-800 text-lg mb-1">
                      {{ report.reportedUser.firstName }}
                      {{ report.reportedUser.lastName }}
                    </h3>
                    <p class="text-sm text-stone-500 flex items-center gap-1">
                      <Icon name="envelope" class="w-4 h-4" />
                      {{ report.reportedUser.email }}
                    </p>
                  </div>
                  <div v-else class="mb-3">
                    <p class="text-stone-400 italic flex items-center gap-2">
                      <Icon name="alert-triangle" class="w-4 h-4" />
                      Utilisateur supprimé
                    </p>
                  </div>

                  <!-- message optionnel -->
                  <div
                    v-if="report.message"
                    class="bg-stone-50 rounded-xl p-4 mb-3 border border-stone-100"
                  >
                    <p class="text-sm text-stone-700 italic leading-relaxed">
                      « {{ report.message }} »
                    </p>
                  </div>

                  <!-- meta infos -->
                  <div
                    class="flex flex-wrap items-center gap-4 text-xs text-stone-500"
                  >
                    <span class="flex items-center gap-1">
                      <Icon name="user" class="w-3.5 h-3.5" />
                      Signalé par :
                      {{ report.reporter?.firstName || "Utilisateur inconnu" }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="calendar" class="w-3.5 h-3.5" />
                      {{ formatDate(report.createdAt) }}
                    </span>
                  </div>
                </div>

                <!-- actions -->
                <div
                  class="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-auto"
                >
                  <NuxtLink :to="`/admin/user-reports/${report.id}`">
                    <BaseButton variant="primary" size="sm" class="w-full">
                      <Icon name="eye" class="w-4 h-4" />
                      Voir détails
                    </BaseButton>
                  </NuxtLink>
                  <BaseButton
                    variant="outline"
                    size="sm"
                    :loading="userActionLoading === report.id"
                    @click="dismissUserReport(report.id)"
                  >
                    <Icon name="x" class="w-4 h-4" />
                    Rejeter
                  </BaseButton>
                  <BaseButton
                    variant="danger"
                    size="sm"
                    :loading="userActionLoading === report.id"
                    @click="actionUserReport(report.id)"
                  >
                    <Icon name="ban" class="w-4 h-4" />
                    Sanctionner
                  </BaseButton>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </template>
    </main>
  </div>
</template>

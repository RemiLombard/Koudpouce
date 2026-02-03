<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  layout: false,
});

interface ReportUser {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  sanctionCount?: number;
}

interface ReportConversation {
  id: string;
  listingTitle: string;
  contacterName: string;
  listingAuthorName: string;
}

interface UserReportDetail {
  id: string;
  reportedUserId: string;
  conversationId: string;
  reason: string;
  message: string | null;
  status: "pending" | "dismissed" | "actioned";
  createdAt: string;
  reportedUser: ReportUser | null;
  reporter: ReportUser | null;
  conversation: ReportConversation | null;
}

const route = useRoute();
const router = useRouter();
const { logout } = useAuth();

const report = ref<UserReportDetail | null>(null);
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
    const response = await $fetch<{ report: UserReportDetail }>(
      `/api/user-reports/${route.params.id}`,
    );
    report.value = response.report;
  } catch (err: any) {
    error.value = err?.data?.message || "Signalement non trouvé.";
  } finally {
    loading.value = false;
  }
}

async function dismissReport() {
  if (!confirm("Êtes-vous sûr de vouloir rejeter ce signalement ?")) return;

  actionLoading.value = true;
  try {
    await $fetch(`/api/user-reports/${route.params.id}/dismiss`, {
      method: "POST",
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
  const hasSanction = (report.value?.reportedUser?.sanctionCount ?? 0) >= 1;
  const confirmMessage = hasSanction
    ? "⚠️ ATTENTION : Cet utilisateur a déjà été sanctionné. Cette action entraînera la suppression définitive de son compte. Continuer ?"
    : "Êtes-vous sûr de vouloir sanctionner cet utilisateur ? Un prochain signalement entraînera son bannissement.";

  if (!confirm(confirmMessage)) return;

  actionLoading.value = true;
  try {
    const response = await $fetch<{ message: string; banned?: boolean }>(
      `/api/user-reports/${route.params.id}/action`,
      { method: "POST" },
    );

    // Afficher le message de résultat
    alert(response.message);
    router.push("/admin");
  } catch (err: any) {
    console.error("Erreur lors du traitement du signalement:", err);
    alert(err?.data?.message || "Erreur lors du traitement du signalement.");
  } finally {
    actionLoading.value = false;
  }
}

function reasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    harassment: "Harcèlement",
    spam: "Spam",
    scam: "Arnaque",
    inappropriate: "Comportement inapproprié",
    other: "Autre",
  };
  return labels[reason] || reason;
}

function reasonBadgeClass(reason: string): string {
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

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "En attente",
    dismissed: "Rejeté",
    actioned: "Sanctionné",
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

<template>
  <div class="min-h-screen bg-gradient-warm flex flex-col">
    <AdminHeader />

    <main class="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <!-- bouton retour -->
      <BackLink to="/admin" label="Retour aux signalements" />

      <!-- état de chargement -->
      <LoadingSpinner v-if="loading" text="Chargement du signalement..." />

      <!-- erreur -->
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

      <!-- contenu -->
      <div v-else-if="report" class="space-y-6">
        <!-- en-tête du signalement -->
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
            Signalement d'utilisateur #{{ report.id.slice(0, 8) }}
          </h1>
          <p class="text-stone-500 flex items-center gap-2">
            <Icon name="calendar" class="w-4 h-4" />
            Créé le {{ formatDate(report.createdAt) }}
          </p>
        </BaseCard>

        <!-- message du signaleur -->
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

        <!-- informations sur le signaleur -->
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

        <!-- utilisateur signalé -->
        <BaseCard variant="highlighted" color="primary" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <div
              class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="alert-triangle" class="w-4 h-4 text-red-600" />
            </div>
            Utilisateur signalé
          </h2>

          <div v-if="report.reportedUser" class="space-y-4">
            <div class="grid gap-2">
              <div class="flex items-center gap-3">
                <span class="text-stone-500 text-sm w-20">Nom</span>
                <span class="font-medium text-stone-800"
                  >{{ report.reportedUser.firstName }}
                  {{ report.reportedUser.lastName }}</span
                >
              </div>
              <div class="flex items-center gap-3">
                <span class="text-stone-500 text-sm w-20">Email</span>
                <span class="font-medium text-stone-800">{{
                  report.reportedUser.email
                }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-stone-500 text-sm w-20">Sanctions</span>
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                    (report.reportedUser.sanctionCount ?? 0) > 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700',
                  ]"
                >
                  {{
                    (report.reportedUser.sanctionCount ?? 0) > 0
                      ? `${report.reportedUser.sanctionCount} sanction(s)`
                      : "Aucune sanction"
                  }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center gap-3 text-stone-400">
            <Icon name="alert-triangle" class="w-5 h-5" />
            <span class="italic">Cet utilisateur a été supprimé.</span>
          </div>
        </BaseCard>

        <!-- contexte de la conversation -->
        <BaseCard v-if="report.conversation" variant="default" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <div
              class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="envelope" class="w-4 h-4 text-orange-600" />
            </div>
            Conversation liée
          </h2>
          <div class="bg-white rounded-xl p-5 border border-stone-100">
            <p class="font-medium text-stone-800 mb-2">
              {{ report.conversation.listingTitle }}
            </p>
            <p class="text-sm text-stone-500">
              Conversation entre {{ report.conversation.contacterName }} et
              {{ report.conversation.listingAuthorName }}
            </p>
          </div>
        </BaseCard>

        <!-- actions -->
        <BaseCard
          v-if="report.status === 'pending'"
          variant="elevated"
          padding="lg"
        >
          <h2 class="text-lg font-bold text-stone-800 mb-4">Actions</h2>

          <!-- avertissement si l'utilisateur va être banni -->
          <div
            v-if="
              report.reportedUser &&
              (report.reportedUser.sanctionCount ?? 0) >= 1
            "
            class="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
          >
            <div class="flex items-start gap-3">
              <Icon
                name="alert-triangle"
                class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <p class="font-semibold text-red-700">
                  Attention : Bannissement imminent
                </p>
                <p class="text-sm text-red-600 mt-1">
                  Cet utilisateur a déjà
                  {{ report.reportedUser.sanctionCount }} sanction(s).
                  Sanctionner entraînera la
                  <strong>suppression définitive</strong> de son compte.
                </p>
              </div>
            </div>
          </div>

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
              <Icon name="ban" class="w-5 h-5" />
              {{
                (report.reportedUser?.sanctionCount ?? 0) >= 1
                  ? "Bannir l'utilisateur"
                  : "Sanctionner l'utilisateur"
              }}
            </BaseButton>
          </div>
          <p class="text-xs text-stone-500 mt-4 text-center">
            {{
              (report.reportedUser?.sanctionCount ?? 0) >= 1
                ? "L'utilisateur sera définitivement banni et son compte supprimé."
                : "L'utilisateur recevra un avertissement. Un prochain signalement entraînera son bannissement."
            }}
          </p>
        </BaseCard>
      </div>
    </main>
  </div>
</template>

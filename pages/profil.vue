<!-- page profil utilisateur : infos perso, mes annonces, modification compte -->
<script setup lang="ts">
import type { ListingPublic, ServiceType } from "~/composables/useListings";
import { fetchServiceTypes } from "~/composables/useListings";

useHead({
  title: "Mon profil - Koudpouce",
  meta: [
    {
      name: "description",
      content:
        "Gérez votre profil Koudpouce, consultez vos annonces et modifiez vos informations personnelles.",
    },
    { name: "robots", content: "noindex" }, // page privée
  ],
});

// fonctions d'authentification
const {
  user,
  isAuthenticated,
  fetchUser,
  logout,
  updateProfile,
  deleteAccount,
} = useAuth();
const router = useRouter();

// états de la page
const loading = ref(false);
const error = ref<string | null>(null);
const myListings = ref<ListingPublic[]>([]);
const serviceTypes = ref<ServiceType[]>([]);
const loggingOut = ref(false);

const showEditForm = ref(false);
const editLoading = ref(false);
const editError = ref<string | null>(null);
const editSuccess = ref(false);
const editForm = reactive({
  displayName: "",
  email: "",
  password: "",
  passwordConfirm: "",
});

const showDeleteConfirm = ref(false);
const deleteLoading = ref(false);

function openEditForm() {
  if (user.value) {
    editForm.displayName = user.value.displayName;
    editForm.email = user.value.email;
    editForm.password = "";
    editForm.passwordConfirm = "";
  }
  editError.value = null;
  editSuccess.value = false;
  showEditForm.value = true;
}

async function handleUpdateProfile() {
  editError.value = null;
  editSuccess.value = false;

  if (editForm.password && editForm.password !== editForm.passwordConfirm) {
    editError.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  if (editForm.password && editForm.password.length < 6) {
    editError.value = "Le mot de passe doit contenir au moins 6 caractères.";
    return;
  }

  editLoading.value = true;

  const updates: { displayName?: string; email?: string; password?: string } =
    {};

  if (editForm.displayName !== user.value?.displayName) {
    updates.displayName = editForm.displayName;
  }
  if (editForm.email !== user.value?.email) {
    updates.email = editForm.email;
  }
  if (editForm.password) {
    updates.password = editForm.password;
  }

  if (Object.keys(updates).length === 0) {
    showEditForm.value = false;
    editLoading.value = false;
    return;
  }

  const success = await updateProfile(updates);
  editLoading.value = false;

  if (success) {
    editSuccess.value = true;
    editForm.password = "";
    editForm.passwordConfirm = "";
    setTimeout(() => {
      showEditForm.value = false;
      editSuccess.value = false;
    }, 1500);
  } else {
    editError.value =
      "Erreur lors de la mise à jour. L'email est peut-être déjà utilisé.";
  }
}

async function handleDeleteAccount() {
  deleteLoading.value = true;
  const success = await deleteAccount();
  deleteLoading.value = false;

  if (success) {
    router.push("/?account_deleted=true");
  } else {
    alert("Erreur lors de la suppression du compte.");
    showDeleteConfirm.value = false;
  }
}

async function handleLogout() {
  loggingOut.value = true;
  try {
    await logout();
    router.push("/");
  } catch (err) {
    console.error("Erreur lors de la déconnexion", err);
  } finally {
    loggingOut.value = false;
  }
}

const serviceTypesMap = computed<Record<string, ServiceType>>(() => {
  const map: Record<string, ServiceType> = {};
  for (const st of serviceTypes.value) {
    map[st.id] = st;
  }
  return map;
});

onMounted(async () => {
  await fetchUser();
  if (!isAuthenticated.value) {
    router.push("/auth/login?redirect=/profil");
    return;
  }

  serviceTypes.value = await fetchServiceTypes();
  await loadMyListings();
});

async function loadMyListings() {
  if (!user.value) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await $fetch<{
      listings: ListingPublic[];
      total: number;
    }>("/api/listings", {
      method: "GET",
      query: { authorId: user.value.id },
    });

    myListings.value = response.listings;
  } catch (err: any) {
    error.value =
      err?.data?.message ?? "Erreur lors du chargement de vos annonces.";
  } finally {
    loading.value = false;
  }
}

async function closeListing(id: string) {
  if (!confirm("Voulez-vous vraiment clôturer cette annonce ?")) return;

  try {
    await $fetch(`/api/listings/${id}/close`, {
      method: "POST",
    });

    await loadMyListings();
  } catch (err: any) {
    alert(err?.data?.message ?? "Erreur lors de la clôture de l'annonce.");
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const activeListings = computed(() =>
  myListings.value.filter((l) => l.status === "active"),
);

const closedListings = computed(() =>
  myListings.value.filter((l) => l.status === "closed"),
);

const activeDemandes = computed(() =>
  activeListings.value.filter((l) => l.type === "demande"),
);

const activePropositions = computed(() =>
  activeListings.value.filter((l) => l.type === "proposition"),
);
</script>

<template>
  <div class="min-h-screen bg-gradient-warm">
    <AppHeader />

    <main class="max-w-5xl mx-auto px-4 py-8">
      <!-- en-tête profil -->
      <BaseCard
        variant="highlighted"
        color="primary"
        padding="lg"
        class="mb-10"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div class="flex items-center gap-4 sm:gap-6">
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 bg-primary-200 rounded-2xl flex items-center justify-center shrink-0"
            >
              <Icon
                name="user"
                class="w-8 h-8 sm:w-10 sm:h-10 text-primary-600"
              />
            </div>
            <div class="min-w-0">
              <h1 class="text-2xl sm:text-3xl font-bold text-stone-800 mb-1">
                Mon profil
              </h1>
              <p class="text-lg sm:text-xl text-stone-700">
                Bonjour
                <span class="font-semibold">{{ user?.displayName }}</span> !
              </p>
              <p class="text-sm text-stone-500 mt-1 truncate">
                {{ user?.email }}
              </p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 self-start sm:self-auto">
            <BaseButton variant="outline" size="md" @click="openEditForm">
              <Icon name="user" class="w-5 h-5" />
              Modifier
            </BaseButton>
            <BaseButton
              variant="danger"
              size="md"
              :loading="loggingOut"
              :disabled="loggingOut"
              @click="handleLogout"
            >
              <Icon name="logout" class="w-5 h-5" />
              Déconnexion
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- modal de modification du profil -->
      <div
        v-if="showEditForm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showEditForm = false"
      >
        <BaseCard variant="elevated" padding="lg" class="w-full max-w-md">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-stone-800">
              Modifier mon profil
            </h2>
            <button
              type="button"
              class="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              @click="showEditForm = false"
            >
              <Icon name="x" class="w-5 h-5 text-stone-500" />
            </button>
          </div>

          <form class="space-y-4" @submit.prevent="handleUpdateProfile">
            <div>
              <label for="editDisplayName" class="label">Nom affiché</label>
              <BaseInput
                id="editDisplayName"
                v-model="editForm.displayName"
                type="text"
                placeholder="Votre nom"
                :disabled="editLoading"
              />
            </div>

            <div>
              <label for="editEmail" class="label">Adresse email</label>
              <BaseInput
                id="editEmail"
                v-model="editForm.email"
                type="email"
                placeholder="exemple@email.com"
                :disabled="editLoading"
              />
            </div>

            <div class="border-t border-stone-200 pt-4">
              <p class="text-sm text-stone-500 mb-3">
                Laissez vide pour conserver votre mot de passe actuel
              </p>
              <div class="space-y-3">
                <div>
                  <label for="editPassword" class="label"
                    >Nouveau mot de passe</label
                  >
                  <BaseInput
                    id="editPassword"
                    v-model="editForm.password"
                    type="password"
                    placeholder="Au moins 6 caractères"
                    :disabled="editLoading"
                  />
                </div>
                <div>
                  <label for="editPasswordConfirm" class="label"
                    >Confirmer le mot de passe</label
                  >
                  <BaseInput
                    id="editPasswordConfirm"
                    v-model="editForm.passwordConfirm"
                    type="password"
                    placeholder="Retapez le mot de passe"
                    :disabled="editLoading"
                  />
                </div>
              </div>
            </div>

            <!-- message d'erreur -->
            <div
              v-if="editError"
              class="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
            >
              <Icon name="x" class="w-5 h-5 flex-shrink-0" />
              <span>{{ editError }}</span>
            </div>

            <!-- message de succès -->
            <div
              v-if="editSuccess"
              class="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm"
            >
              <Icon name="check" class="w-5 h-5 flex-shrink-0" />
              <span>Profil mis à jour avec succès !</span>
            </div>

            <div class="flex gap-3 pt-2">
              <BaseButton
                type="button"
                variant="outline"
                class="flex-1"
                @click="showEditForm = false"
              >
                Annuler
              </BaseButton>
              <BaseButton
                type="submit"
                variant="primary"
                class="flex-1"
                :loading="editLoading"
              >
                Enregistrer
              </BaseButton>
            </div>
          </form>

          <!-- section suppression de compte -->
          <div class="mt-6 pt-6 border-t border-stone-200">
            <BaseButton
              variant="danger"
              size="md"
              full-width
              @click="showDeleteConfirm = true"
            >
              <Icon name="trash" class="w-4 h-4" />
              Supprimer mon compte
            </BaseButton>
          </div>
        </BaseCard>
      </div>

      <!-- modal de confirmation de suppression -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showDeleteConfirm = false"
      >
        <BaseCard variant="elevated" padding="lg" class="w-full max-w-md">
          <div class="text-center">
            <div
              class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-2xl flex items-center justify-center"
            >
              <Icon name="alert-triangle" class="w-8 h-8 text-red-600" />
            </div>
            <h2 class="text-xl font-bold text-stone-800 mb-2">
              Supprimer votre compte ?
            </h2>
            <p class="text-stone-600 mb-6">
              Cette action est irréversible. Toutes vos annonces et
              conversations seront supprimées définitivement.
            </p>

            <div class="flex gap-3">
              <BaseButton
                type="button"
                variant="outline"
                class="flex-1"
                @click="showDeleteConfirm = false"
              >
                Annuler
              </BaseButton>
              <BaseButton
                type="button"
                variant="danger"
                class="flex-1"
                :loading="deleteLoading"
                @click="handleDeleteAccount"
              >
                Supprimer définitivement
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- état de chargement -->
      <LoadingSpinner v-if="loading" text="Chargement de vos annonces..." />

      <!-- erreur -->
      <BaseCard
        v-else-if="error"
        variant="default"
        padding="lg"
        class="text-center mb-8"
      >
        <div class="text-red-600">{{ error }}</div>
      </BaseCard>

      <!-- mes annonces -->
      <div v-else class="space-y-12">
        <!-- mes demandes actives -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"
            >
              <Icon name="search" class="w-5 h-5 text-primary-600" />
            </div>
            <h2 class="text-xl font-bold text-stone-800">
              Mes demandes d'aide
              <span class="text-stone-400 font-normal"
                >({{ activeDemandes.length }})</span
              >
            </h2>
          </div>

          <BaseCard
            v-if="activeDemandes.length === 0"
            variant="default"
            padding="lg"
            class="text-center"
          >
            <p class="text-stone-500 mb-4">
              Vous n'avez aucune demande d'aide active.
            </p>
            <NuxtLink to="/annonces/nouveau?type=demande">
              <BaseButton variant="primary" size="md">
                <Icon name="plus" class="w-5 h-5" />
                Publier une demande
              </BaseButton>
            </NuxtLink>
          </BaseCard>

          <div v-else class="space-y-4">
            <BaseCard
              v-for="listing in activeDemandes"
              :key="listing.id"
              variant="default"
              padding="md"
              class="border-l-4 border-l-primary-400"
            >
              <div
                class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <ListingTypeBadge :type="listing.type" />
                    <h3
                      class="text-base sm:text-lg font-bold text-stone-800 break-words"
                    >
                      {{ listing.title }}
                    </h3>
                  </div>

                  <p class="text-stone-600 text-sm mb-3 line-clamp-2">
                    {{ listing.description }}
                  </p>

                  <div class="flex flex-wrap gap-2 mb-3">
                    <ServiceTypeBadge
                      v-for="stId in listing.serviceTypeIds"
                      :key="stId"
                      :label="serviceTypesMap[stId]?.label ?? stId"
                    />
                  </div>

                  <div
                    class="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-stone-500"
                  >
                    <span
                      v-if="listing.cityName"
                      class="flex items-center gap-1"
                    >
                      <Icon name="location" class="w-4 h-4" />
                      {{ listing.cityName }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="calendar" class="w-4 h-4" />
                      {{ formatDate(listing.createdAt) }}
                    </span>
                  </div>
                </div>

                <BaseButton
                  variant="danger"
                  size="sm"
                  class="self-start shrink-0"
                  @click="closeListing(listing.id)"
                >
                  Clôturer
                </BaseButton>
              </div>
            </BaseCard>
          </div>
        </section>

        <!-- mes propositions actives -->
        <section>
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"
            >
              <Icon name="sparkles" class="w-5 h-5 text-primary-600" />
            </div>
            <h2 class="text-xl font-bold text-stone-800">
              Mes propositions de service
              <span class="text-stone-400 font-normal"
                >({{ activePropositions.length }})</span
              >
            </h2>
          </div>

          <BaseCard
            v-if="activePropositions.length === 0"
            variant="default"
            padding="lg"
            class="text-center"
          >
            <p class="text-stone-500 mb-4">
              Vous n'avez aucune proposition de service active.
            </p>
            <NuxtLink to="/annonces/nouveau?type=proposition">
              <BaseButton variant="primary" size="md">
                <Icon name="plus" class="w-5 h-5" />
                Publier une proposition
              </BaseButton>
            </NuxtLink>
          </BaseCard>

          <div v-else class="space-y-4">
            <BaseCard
              v-for="listing in activePropositions"
              :key="listing.id"
              variant="default"
              padding="md"
              class="border-l-4 border-l-primary-400"
            >
              <div
                class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <ListingTypeBadge :type="listing.type" />
                    <h3
                      class="text-base sm:text-lg font-bold text-stone-800 break-words"
                    >
                      {{ listing.title }}
                    </h3>
                  </div>

                  <p class="text-stone-600 text-sm mb-3 line-clamp-2">
                    {{ listing.description }}
                  </p>

                  <div class="flex flex-wrap gap-2 mb-3">
                    <ServiceTypeBadge
                      v-for="stId in listing.serviceTypeIds"
                      :key="stId"
                      :label="serviceTypesMap[stId]?.label ?? stId"
                    />
                  </div>

                  <div
                    class="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-stone-500"
                  >
                    <span
                      v-if="listing.cityName"
                      class="flex items-center gap-1"
                    >
                      <Icon name="location" class="w-4 h-4" />
                      {{ listing.cityName }}
                    </span>
                    <span class="flex items-center gap-1">
                      <Icon name="calendar" class="w-4 h-4" />
                      {{ formatDate(listing.createdAt) }}
                    </span>
                  </div>
                </div>

                <BaseButton
                  variant="danger"
                  size="sm"
                  class="self-start shrink-0"
                  @click="closeListing(listing.id)"
                >
                  Clôturer
                </BaseButton>
              </div>
            </BaseCard>
          </div>
        </section>

        <!-- annonces clôturées -->
        <section v-if="closedListings.length > 0">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center"
            >
              <Icon name="check" class="w-5 h-5 text-stone-500" />
            </div>
            <h2 class="text-xl font-bold text-stone-600">
              Annonces clôturées
              <span class="text-stone-400 font-normal"
                >({{ closedListings.length }})</span
              >
            </h2>
          </div>

          <div class="space-y-4 opacity-70">
            <BaseCard
              v-for="listing in closedListings"
              :key="listing.id"
              variant="default"
              padding="md"
            >
              <div class="flex items-start gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <ListingTypeBadge :type="listing.type" />
                    <h3 class="text-lg font-semibold text-stone-600 truncate">
                      {{ listing.title }}
                    </h3>
                  </div>

                  <div class="flex items-center gap-4 text-sm text-stone-400">
                    <span
                      v-if="listing.cityName"
                      class="flex items-center gap-1"
                    >
                      <Icon name="location" class="w-4 h-4" />
                      {{ listing.cityName }}
                    </span>
                    <span>
                      Clôturée le
                      {{
                        listing.closedAt ? formatDate(listing.closedAt) : "?"
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

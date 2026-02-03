<!-- page de création d'une nouvelle annonce -->
<script setup lang="ts">
import type { ListingType, ServiceType } from "~/composables/useListings";
import { fetchServiceTypes } from "~/composables/useListings";

// composables Vue et de l'app
const router = useRouter();
const route = useRoute();
const { isAuthenticated, fetchUser } = useAuth();
const { createListing } = useListings();

// états du formulaire
const loading = ref(false);
const error = ref<string | null>(null);

// on récupère le type depuis l'URL (demande par défaut)
const typeFromUrl = (route.query.type as string) || "demande";
const type = ref<ListingType>(
  typeFromUrl === "proposition" ? "proposition" : "demande",
);

const placeholders = computed(() => {
  if (type.value === "demande") {
    return {
      title: "Ex: Besoin d'aide pour porter un meuble",
      description:
        "Décrivez votre besoin en détail : durée estimée, matériel nécessaire, contraintes horaires...",
    };
  }
  return {
    title: "Ex: Je propose des cours de guitare",
    description:
      "Décrivez votre service : vos compétences, votre expérience, votre disponibilité...",
  };
});

const title = ref("");
const description = ref("");

const locationData = ref<{
  addressRaw: string;
  cityName: string;
  departmentCode: string;
  postalCode?: string;
} | null>(null);

const serviceTypes = ref<ServiceType[]>([]);
const selectedServiceTypeIds = ref<string[]>([]);

onMounted(async () => {
  await fetchUser();
  if (!isAuthenticated.value) {
    router.push("/auth/login");
    return;
  }
  serviceTypes.value = await fetchServiceTypes();
});

function toggleServiceType(id: string) {
  if (selectedServiceTypeIds.value.includes(id)) {
    selectedServiceTypeIds.value = selectedServiceTypeIds.value.filter(
      (x) => x !== id,
    );
  } else {
    selectedServiceTypeIds.value = [...selectedServiceTypeIds.value, id];
  }
}

function handleLocationUpdate(data: typeof locationData.value) {
  locationData.value = data;
}

async function handleSubmit() {
  if (loading.value) return;

  loading.value = true;
  error.value = null;

  try {
    if (!locationData.value) {
      error.value = "Veuillez sélectionner une localisation.";
      loading.value = false;
      return;
    }

    const listing = await createListing({
      type: type.value,
      title: title.value,
      description: description.value,
      serviceTypeIds: selectedServiceTypeIds.value,
      addressRaw: locationData.value.addressRaw,
      manualLocationFallback: {
        cityName: locationData.value.cityName,
        departmentCode: locationData.value.departmentCode,
        postalCode: locationData.value.postalCode,
      },
    });

    router.push(`/annonces/${listing.id}`);
  } catch (err: any) {
    error.value =
      err?.data?.message ?? "Impossible de publier l'annonce pour le moment.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm">
    <AppHeader />

    <main class="max-w-3xl mx-auto px-4 py-12">
      <!-- en-tête -->
      <div class="text-center mb-10">
        <div
          class="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full shadow-lg mb-6"
        >
          <Icon name="sparkles" class="w-5 h-5 text-orange-600" />
          <span class="text-sm font-semibold text-stone-700"
            >Nouvelle annonce</span
          >
        </div>
        <h1 class="text-4xl font-bold text-gradient-primary mb-2">
          Publier une annonce
        </h1>
        <p class="text-stone-600">
          Choisissez si vous publiez une demande ou une proposition
        </p>
      </div>

      <!-- erreur -->
      <BaseCard
        v-if="error"
        variant="default"
        padding="md"
        class="mb-6 border-red-200 bg-red-50"
      >
        <div class="flex items-center gap-3 text-red-700">
          <Icon name="x" class="w-5 h-5" />
          <span class="font-medium">{{ error }}</span>
        </div>
      </BaseCard>

      <form class="space-y-8" @submit.prevent="handleSubmit">
        <!-- type d'annonce -->
        <BaseCard variant="elevated" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <Icon name="target" class="w-5 h-5 text-orange-600" />
            Type d'annonce
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              class="relative flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all"
              :class="
                type === 'demande'
                  ? 'border-orange-300 bg-orange-50 shadow-md'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              "
            >
              <input
                v-model="type"
                type="radio"
                value="demande"
                class="sr-only"
              />
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="type === 'demande' ? 'bg-orange-100' : 'bg-stone-100'"
              >
                <Icon
                  name="search"
                  class="w-6 h-6"
                  :class="
                    type === 'demande' ? 'text-orange-600' : 'text-stone-400'
                  "
                />
              </div>
              <div>
                <div class="font-bold text-stone-800">Demande</div>
                <div class="text-sm text-stone-500">
                  Je cherche un coup de main
                </div>
              </div>
              <div
                v-if="type === 'demande'"
                class="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
              >
                <Icon name="check" class="w-4 h-4 text-white" />
              </div>
            </label>

            <label
              class="relative flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all"
              :class="
                type === 'proposition'
                  ? 'border-orange-300 bg-orange-50 shadow-md'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              "
            >
              <input
                v-model="type"
                type="radio"
                value="proposition"
                class="sr-only"
              />
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="
                  type === 'proposition' ? 'bg-orange-100' : 'bg-stone-100'
                "
              >
                <Icon
                  name="sparkles"
                  class="w-6 h-6"
                  :class="
                    type === 'proposition'
                      ? 'text-orange-600'
                      : 'text-stone-400'
                  "
                />
              </div>
              <div>
                <div class="font-bold text-stone-800">Proposition</div>
                <div class="text-sm text-stone-500">Je propose mon aide</div>
              </div>
              <div
                v-if="type === 'proposition'"
                class="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
              >
                <Icon name="check" class="w-4 h-4 text-white" />
              </div>
            </label>
          </div>
        </BaseCard>

        <!-- titre et description -->
        <BaseCard variant="elevated" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <Icon name="megaphone" class="w-5 h-5 text-orange-600" />
            Votre annonce
          </h2>

          <div class="space-y-5">
            <div>
              <label class="label">Titre</label>
              <BaseInput
                v-model="title"
                type="text"
                :placeholder="placeholders.title"
                size="lg"
              />
            </div>

            <div>
              <label class="label">Description</label>
              <textarea
                v-model="description"
                :placeholder="placeholders.description"
                rows="5"
                class="w-full px-4 py-3 text-base border-2 border-stone-200 rounded-xl transition-all placeholder:text-stone-400 hover:border-stone-300 focus:border-orange-400 focus:outline-none focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]"
              />
            </div>
          </div>
        </BaseCard>

        <!-- types de service -->
        <BaseCard variant="elevated" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <Icon name="lightbulb" class="w-5 h-5 text-orange-600" />
            Catégories
          </h2>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="st in serviceTypes"
              :key="st.id"
              type="button"
              class="px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all"
              :class="
                selectedServiceTypeIds.includes(st.id)
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-orange-300'
              "
              @click="toggleServiceType(st.id)"
            >
              {{ st.label }}
            </button>
          </div>
        </BaseCard>

        <!-- localisation -->
        <BaseCard variant="elevated" padding="lg">
          <h2
            class="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"
          >
            <Icon name="location" class="w-5 h-5 text-orange-600" />
            Localisation
          </h2>

          <LocationInput @update="handleLocationUpdate" />
        </BaseCard>

        <!-- Boutons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            full-width
            :loading="loading"
          >
            <Icon name="check" class="w-5 h-5" />
            Publier mon annonce
          </BaseButton>

          <NuxtLink to="/" class="sm:w-auto">
            <BaseButton type="button" variant="ghost" size="lg" class="w-full">
              Annuler
            </BaseButton>
          </NuxtLink>
        </div>
      </form>
    </main>
  </div>
</template>

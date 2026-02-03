<!-- page de recherche : affiche les propositions d'aide des autres utilisateurs -->
<script setup lang="ts">
import type { ListingFilters, ServiceType } from "~/composables/useListings";
import { fetchServiceTypes, ITEMS_PER_PAGE } from "~/composables/useListings";

// récupération des annonces et pagination
const {
  listings,
  loading,
  error,
  total,
  fetchListings,
  currentPage,
  totalPages,
  paginatedListings,
  goToPage,
} = useListings();
const { user } = useAuth();

// types de services pour les filtres
const serviceTypes = ref<ServiceType[]>([]);
const serviceTypesMap = computed<Record<string, ServiceType>>(() => {
  const map: Record<string, ServiceType> = {};
  for (const st of serviceTypes.value) {
    map[st.id] = st;
  }
  return map;
});

const filters = ref<ListingFilters>({
  type: "proposition",
});

onMounted(async () => {
  serviceTypes.value = await fetchServiceTypes();
  await loadListings();
});

async function loadListings() {
  const filtersWithExclude = {
    ...filters.value,
    excludeAuthorId: user.value?.id,
  };
  await fetchListings(filtersWithExclude);
}

function onFiltersChange(newFilters: ListingFilters) {
  filters.value = { ...newFilters, type: "proposition" };
  loadListings();
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm">
    <AppHeader />

    <main class="max-w-5xl mx-auto px-4 py-8">
      <!-- header -->
      <BaseCard variant="highlighted" color="primary" padding="lg" class="mb-8">
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div>
            <h1
              class="text-2xl lg:text-3xl font-bold text-stone-800 mb-2 flex items-center gap-3"
            >
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100"
              >
                <Icon name="search" class="w-6 h-6 text-orange-600" />
              </div>
              Vous cherchez de l'aide
            </h1>
            <p class="text-stone-600 text-lg">
              Voici les propositions de service disponibles
            </p>
            <p class="text-sm text-stone-500 mt-2 font-medium">
              {{ total }} annonce{{ total > 1 ? "s" : "" }} trouvée{{
                total > 1 ? "s" : ""
              }}
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink to="/annonces/nouveau?type=demande">
              <BaseButton
                variant="primary"
                size="md"
                class="w-full sm:w-auto min-w-[180px]"
              >
                <Icon name="plus" class="w-5 h-5" />
                Publier une demande
              </BaseButton>
            </NuxtLink>
            <NuxtLink to="/propose">
              <BaseButton
                variant="outline"
                size="md"
                class="w-full sm:w-auto min-w-[180px]"
              >
                <Icon name="hand-raised" class="w-5 h-5" />
                Proposer un service
              </BaseButton>
            </NuxtLink>
          </div>
        </div>
      </BaseCard>

      <!-- filtres -->
      <ListingFilters
        v-model="filters"
        :service-types="serviceTypes"
        hide-type-filter
        @update:model-value="onFiltersChange"
      />

      <!-- chargement -->
      <LoadingSpinner
        v-if="loading && listings.length === 0"
        text="Chargement des annonces..."
      />

      <!-- erreur -->
      <BaseCard
        v-else-if="error"
        variant="default"
        padding="lg"
        class="text-center"
      >
        <p class="text-red-600">{{ error }}</p>
        <BaseButton
          variant="primary"
          size="md"
          class="mt-4"
          @click="loadListings"
        >
          Réessayer
        </BaseButton>
      </BaseCard>

      <!-- liste des annonces -->
      <template v-else>
        <EmptyState
          v-if="listings.length === 0"
          icon="search"
          title="Aucune proposition de service trouvée."
          subtitle="Essayez d'élargir vos critères de recherche."
        />

        <div v-else class="grid gap-4 md:grid-cols-2">
          <ListingCard
            v-for="listing in paginatedListings"
            :key="listing.id"
            :listing="listing"
            :service-types="serviceTypesMap"
          />
        </div>

        <!-- pagination -->
        <nav
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-2 pt-8"
          aria-label="Pagination"
        >
          <!-- bouton précédent -->
          <button
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              currentPage === 1
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-white text-stone-700 hover:bg-orange-50 hover:text-orange-600 border border-stone-200'
            "
            @click="goToPage(currentPage - 1)"
          >
            <Icon name="arrow-left" class="w-5 h-5" />
          </button>

          <!-- numéros de page -->
          <button
            v-for="page in totalPages"
            :key="page"
            class="w-10 h-10 rounded-lg text-sm font-semibold transition-colors"
            :class="
              page === currentPage
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-orange-50 hover:text-orange-600 border border-stone-200'
            "
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <!-- bouton suivant -->
          <button
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="
              currentPage === totalPages
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-white text-stone-700 hover:bg-orange-50 hover:text-orange-600 border border-stone-200'
            "
            @click="goToPage(currentPage + 1)"
          >
            <Icon name="arrow-right" class="w-5 h-5" />
          </button>
        </nav>

        <!-- indicateur de page -->
        <p
          v-if="totalPages > 1"
          class="text-center text-sm text-stone-500 mt-4"
        >
          Page {{ currentPage }} sur {{ totalPages }}
        </p>
      </template>
    </main>
  </div>
</template>

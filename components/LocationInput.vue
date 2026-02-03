<script setup lang="ts">
interface AddressResult {
  properties: {
    label: string;
    name: string;
    postcode: string;
    city: string;
    citycode: string;
    context: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface LocationData {
  addressRaw: string;
  cityName: string;
  departmentCode: string;
  postalCode?: string;
}

const emit = defineEmits<{
  update: [location: LocationData | null];
}>();

const { requestPosition } = useGeolocation();

const searchQuery = ref("");
const addressResults = ref<AddressResult[]>([]);
const selectedAddress = ref<AddressResult | null>(null);
const isSearching = ref(false);
const showDropdown = ref(false);
const useGeoloc = ref(false);

// Flag pour éviter les recherches lors de la sélection d'une adresse
const skipNextSearch = ref(false);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

async function performSearch() {
  const query = searchQuery.value.trim();

  if (query.length < 3) {
    addressResults.value = [];
    showDropdown.value = false;
    return;
  }

  isSearching.value = true;
  try {
    const response = await $fetch<{ features: AddressResult[] }>(
      "https://api-adresse.data.gouv.fr/search/",
      {
        query: {
          q: query,
          limit: 10,
        },
      },
    );
    addressResults.value = response.features || [];
    showDropdown.value = addressResults.value.length > 0;
  } catch (error) {
    console.error("Erreur recherche adresse:", error);
    addressResults.value = [];
    showDropdown.value = false;
  } finally {
    isSearching.value = false;
  }
}

function debouncedSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
  searchTimeout = setTimeout(performSearch, 300);
}

// Watch uniquement côté client pour éviter les problèmes SSR
if (import.meta.client) {
  watch(searchQuery, () => {
    // Ignorer la recherche si on vient de sélectionner une adresse
    if (skipNextSearch.value) {
      skipNextSearch.value = false;
      return;
    }
    // Ne pas rechercher si une adresse est déjà sélectionnée
    if (selectedAddress.value) {
      return;
    }
    debouncedSearch();
  });
}

function selectAddress(address: AddressResult) {
  skipNextSearch.value = true;
  selectedAddress.value = address;
  searchQuery.value = address.properties.label;
  showDropdown.value = false;
  useGeoloc.value = false;

  const departmentCode = address.properties.citycode.substring(0, 2);

  emit("update", {
    addressRaw: address.properties.label,
    cityName: address.properties.city,
    departmentCode: departmentCode,
    postalCode: address.properties.postcode,
  });
}

async function handleUseGeolocation() {
  const position = await requestPosition();

  if (position) {
    useGeoloc.value = true;
    skipNextSearch.value = true;
    selectedAddress.value = null;
    searchQuery.value = "";

    try {
      const response = await $fetch<{ features: AddressResult[] }>(
        "https://api-adresse.data.gouv.fr/reverse/",
        {
          query: {
            lat: position.lat,
            lon: position.lng,
            limit: 1,
          },
        },
      );

      if (response.features && response.features.length > 0) {
        const address = response.features[0];
        skipNextSearch.value = true;
        selectedAddress.value = address;
        searchQuery.value = address.properties.label;

        const departmentCode = address.properties.citycode.substring(0, 2);

        emit("update", {
          addressRaw: address.properties.label,
          cityName: address.properties.city,
          departmentCode: departmentCode,
          postalCode: address.properties.postcode,
        });
      }
    } catch (error) {
      console.error("Erreur reverse geocoding:", error);
    }
  }
}

function reset() {
  skipNextSearch.value = true;
  searchQuery.value = "";
  selectedAddress.value = null;
  addressResults.value = [];
  showDropdown.value = false;
  useGeoloc.value = false;
  emit("update", null);
}

function handleSearchFocus() {
  if (addressResults.value.length > 0 && searchQuery.value.length >= 3) {
    showDropdown.value = true;
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".location-input-container")) {
    showDropdown.value = false;
  }
}

if (import.meta.client) {
  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
}
</script>

<template>
  <div class="space-y-4">
    <!-- Info confidentialité -->
    <div
      class="flex items-start gap-2 bg-orange-50 rounded-xl p-4 border border-orange-200"
    >
      <Icon
        name="location"
        class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"
      />
      <div class="text-sm text-stone-700">
        <p class="font-semibold text-orange-800 mb-1">
          Seule la ville sera affichée publiquement
        </p>
        <p class="text-stone-600">
          Votre adresse complète est utilisée uniquement pour calculer les
          distances précises. Elle reste confidentielle et n'est jamais
          partagée.
        </p>
      </div>
    </div>

    <!-- Sélection d'adresse OU géolocalisation -->
    <div v-if="!selectedAddress" class="space-y-4">
      <!-- Recherche d'adresse -->
      <div class="location-input-container relative">
        <label class="block text-sm font-medium text-stone-700 mb-2">
          Saisir votre adresse
        </label>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Ex: 10 rue de Rivoli, Paris..."
            class="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
            @focus="handleSearchFocus"
          />
          <div
            v-if="isSearching"
            class="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <div
              class="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"
            />
          </div>
        </div>

        <!-- Dropdown résultats -->
        <div
          v-if="showDropdown && addressResults.length > 0"
          class="absolute z-50 w-full mt-1 bg-white border-2 border-orange-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
        >
          <button
            v-for="(address, idx) in addressResults"
            :key="idx"
            type="button"
            class="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-stone-100 last:border-b-0 flex items-start gap-3"
            @click="selectAddress(address)"
          >
            <Icon name="location" class="w-4 h-4 text-orange-600 mt-1" />
            <div class="flex-1">
              <div class="font-medium text-stone-800">
                {{ address.properties.label }}
              </div>
              <div class="text-xs text-stone-500">
                {{ address.properties.context }}
              </div>
            </div>
          </button>
        </div>

        <!-- Message si aucun résultat -->
        <div
          v-if="
            !isSearching &&
            searchQuery.length >= 3 &&
            addressResults.length === 0
          "
          class="mt-2 text-sm text-stone-500"
        >
          Aucune adresse trouvée
        </div>
      </div>

      <!-- Séparateur -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-stone-200"></div>
        <span class="text-sm text-stone-500 font-medium">ou</span>
        <div class="flex-1 h-px bg-stone-200"></div>
      </div>

      <!-- Bouton géolocalisation -->
      <BaseButton
        type="button"
        variant="outline"
        size="md"
        full-width
        @click="handleUseGeolocation"
      >
        <Icon name="target" class="w-5 h-5" />
        Utiliser ma position actuelle
      </BaseButton>
    </div>

    <!-- Adresse sélectionnée -->
    <div
      v-else
      class="flex items-start justify-between gap-3 bg-green-50 rounded-xl p-4 border-2 border-green-200"
    >
      <div class="flex-1">
        <div
          class="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1"
        >
          <Icon name="check" class="w-4 h-4 text-green-600" />
          Adresse enregistrée
        </div>
        <div class="text-base font-semibold text-stone-800 mb-1">
          {{ selectedAddress.properties.label }}
        </div>
        <div class="text-xs text-stone-600">
          Seule la ville "{{ selectedAddress.properties.city }}" sera visible
          publiquement
        </div>
      </div>
      <BaseButton type="button" variant="ghost" size="sm" @click="reset">
        <Icon name="x" class="w-4 h-4" />
        Modifier
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface LocationSelection {
  type: "geoloc" | "city" | null;
  lat?: number;
  lng?: number;
  cityName?: string;
  departmentCode?: string;
  radius: number;
}

interface CityResult {
  nom: string;
  code: string;
  codeDepartement: string;
  centre: {
    coordinates: [number, number];
  };
}

interface Props {
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number;
  initialCityName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialLat: undefined,
  initialLng: undefined,
  initialRadius: 10,
  initialCityName: undefined,
});

const emit = defineEmits<{
  change: [selection: LocationSelection];
}>();

const { requestPosition } = useGeolocation();

const mode = ref<"idle" | "geoloc" | "city">("idle");
const searchQuery = ref("");
const cityResults = ref<CityResult[]>([]);
const selectedCity = ref<CityResult | null>(null);
const selectedRadius = ref<number>(props.initialRadius);
const isSearching = ref(false);
const showDropdown = ref(false);

onMounted(() => {
  if (props.initialLat !== undefined && props.initialLng !== undefined) {
    if (props.initialCityName) {
      mode.value = "city";
      searchQuery.value = props.initialCityName;
      selectedCity.value = {
        nom: props.initialCityName,
        code: "",
        codeDepartement: "",
        centre: {
          coordinates: [props.initialLng, props.initialLat],
        },
      };
    } else {
      mode.value = "geoloc";
    }
    selectedRadius.value = props.initialRadius;
  }
});

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

async function debouncedSearch() {
  if (searchQuery.value.length < 2) {
    cityResults.value = [];
    showDropdown.value = false;
    return;
  }

  isSearching.value = true;
  try {
    const response = await $fetch<CityResult[]>(
      `https://geo.api.gouv.fr/communes`,
      {
        query: {
          nom: searchQuery.value,
          fields: "nom,code,codeDepartement,centre",
          boost: "population",
          limit: 10,
        },
      },
    );
    cityResults.value = response;
    showDropdown.value = true;
  } catch (error) {
    cityResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(debouncedSearch, 300);
});

async function handleAroundMe() {
  mode.value = "geoloc";
  const position = await requestPosition();

  if (position) {
    emitSelection({
      type: "geoloc",
      lat: position.lat,
      lng: position.lng,
      radius: selectedRadius.value,
    });
  } else {
    mode.value = "idle";
  }
}

function selectCity(city: CityResult) {
  selectedCity.value = city;
  searchQuery.value = `${city.nom} (${city.codeDepartement})`;
  showDropdown.value = false;
  mode.value = "city";

  emitSelection({
    type: "city",
    lat: city.centre.coordinates[1],
    lng: city.centre.coordinates[0],
    cityName: city.nom,
    departmentCode: city.codeDepartement,
    radius: selectedRadius.value,
  });
}

function updateRadius(radius: number) {
  selectedRadius.value = radius;

  if (mode.value === "geoloc" && selectedCity.value === null) {
    handleAroundMe();
  } else if (mode.value === "city" && selectedCity.value) {
    emitSelection({
      type: "city",
      lat: selectedCity.value.centre.coordinates[1],
      lng: selectedCity.value.centre.coordinates[0],
      cityName: selectedCity.value.nom,
      departmentCode: selectedCity.value.codeDepartement,
      radius: selectedRadius.value,
    });
  }
}

function reset() {
  mode.value = "idle";
  searchQuery.value = "";
  selectedCity.value = null;
  cityResults.value = [];
  showDropdown.value = false;

  emitSelection({
    type: null,
    radius: selectedRadius.value,
  });
}

function emitSelection(selection: LocationSelection) {
  emit("change", selection);
}

function handleSearchFocus() {
  if (cityResults.value.length > 0 && searchQuery.value.length >= 2) {
    showDropdown.value = true;
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".location-search-container")) {
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
    <label class="label">Ville</label>

    <!-- mode idle : choix initial -->
    <div v-if="mode === 'idle'" class="space-y-3">
      <!-- recherche de ville -->
      <div class="location-search-container relative">
        <div class="relative">
          <BaseInput
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une ville..."
            icon="location"
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

        <!-- dropdown résultats -->
        <div
          v-if="showDropdown && cityResults.length > 0"
          class="absolute z-50 w-full mt-1 bg-white border-2 border-orange-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
        >
          <button
            v-for="city in cityResults"
            :key="city.code"
            type="button"
            class="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-stone-100 last:border-b-0"
            @click="selectCity(city)"
          >
            <div class="font-medium text-stone-800">{{ city.nom }}</div>
            <div class="text-xs text-stone-500">
              Département {{ city.codeDepartement }}
            </div>
          </button>
        </div>

        <div
          v-if="
            !isSearching && searchQuery.length >= 2 && cityResults.length === 0
          "
          class="mt-2 text-sm text-stone-500"
        >
          Aucune ville trouvée
        </div>
      </div>

      <!-- séparateur -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-stone-200" />
        <span class="text-sm text-stone-500">ou</span>
        <div class="flex-1 h-px bg-stone-200" />
      </div>

      <!-- bouton géoloc -->
      <BaseButton
        type="button"
        variant="primary"
        size="md"
        full-width
        @click="handleAroundMe"
      >
        <Icon name="target" class="w-5 h-5" />
        Autour de moi
      </BaseButton>
    </div>

    <!-- mode actif -->
    <div v-else class="space-y-4">
      <div
        class="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"
          >
            <Icon name="location" class="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div class="font-medium text-stone-800">
              {{ mode === "geoloc" ? "Autour de vous" : selectedCity?.nom }}
            </div>
            <div class="text-sm text-stone-500">
              Rayon : {{ selectedRadius }} km
            </div>
          </div>
        </div>
        <button
          type="button"
          class="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          @click="reset"
        >
          <Icon name="x" class="w-5 h-5" />
        </button>
      </div>

      <!-- slider rayon -->
      <div>
        <div class="flex justify-between text-sm text-stone-600 mb-2">
          <span>Rayon de recherche</span>
          <span class="font-semibold text-orange-600"
            >{{ selectedRadius }} km</span
          >
        </div>
        <input
          v-model.number="selectedRadius"
          type="range"
          min="1"
          max="100"
          step="1"
          class="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          @input="updateRadius(selectedRadius)"
        />
        <div class="flex justify-between text-xs text-stone-400 mt-1">
          <span>1 km</span>
          <span>50 km</span>
          <span>100 km</span>
        </div>
      </div>
    </div>
  </div>
</template>

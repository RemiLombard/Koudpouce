<!-- composant pour filtrer les annonces (type, catégorie, localisation) -->
<script setup lang="ts">
import type {
  ListingFilters,
  ListingType,
  ServiceType,
} from "~/composables/useListings";

// props et events du composant
interface Props {
  serviceTypes: ServiceType[];
  modelValue: ListingFilters;
  hideTypeFilter?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [filters: ListingFilters];
}>();

// états locaux des filtres
const isExpanded = ref(false);

const localType = ref<ListingType | "">("");
const localServiceTypeIds = ref<string[]>([]);
const localQ = ref("");

const localAroundLat = ref<number | undefined>(undefined);
const localAroundLng = ref<number | undefined>(undefined);
const localRadiusKm = ref<number | undefined>(undefined);
const localCityName = ref<string | undefined>(undefined);

const activeFiltersCount = computed(() => {
  let count = 0;
  if (localType.value && !props.hideTypeFilter) count++;
  if (localServiceTypeIds.value.length > 0) count++;
  if (localQ.value.trim()) count++;
  if (localAroundLat.value !== undefined) count++;
  return count;
});

watch(
  () => props.modelValue,
  (newVal) => {
    localType.value = newVal.type ?? "";
    localServiceTypeIds.value = newVal.serviceTypeIds ?? [];
    localQ.value = newVal.q ?? "";
    localAroundLat.value = newVal.aroundLat;
    localAroundLng.value = newVal.aroundLng;
    localRadiusKm.value = newVal.radiusKm;
  },
  { immediate: true },
);

function applyFilters() {
  const filters: ListingFilters = {};

  if (localType.value) filters.type = localType.value;
  if (localServiceTypeIds.value.length > 0) {
    filters.serviceTypeIds = localServiceTypeIds.value;
  }
  if (localQ.value.trim()) filters.q = localQ.value.trim();

  if (
    localAroundLat.value !== undefined &&
    localAroundLng.value !== undefined &&
    localRadiusKm.value !== undefined
  ) {
    filters.aroundLat = localAroundLat.value;
    filters.aroundLng = localAroundLng.value;
    filters.radiusKm = localRadiusKm.value;
  }

  emit("update:modelValue", filters);
  isExpanded.value = false;
}

function resetFilters() {
  localType.value = "";
  localServiceTypeIds.value = [];
  localQ.value = "";
  localAroundLat.value = undefined;
  localAroundLng.value = undefined;
  localRadiusKm.value = undefined;
  localCityName.value = undefined;
  emit("update:modelValue", {});
}

function toggleServiceType(id: string) {
  const idx = localServiceTypeIds.value.indexOf(id);
  if (idx === -1) {
    localServiceTypeIds.value.push(id);
  } else {
    localServiceTypeIds.value.splice(idx, 1);
  }
}

function handleLocationChange(selection: any) {
  if (selection.type === null) {
    localAroundLat.value = undefined;
    localAroundLng.value = undefined;
    localRadiusKm.value = undefined;
    localCityName.value = undefined;
  } else {
    localAroundLat.value = selection.lat;
    localAroundLng.value = selection.lng;
    localRadiusKm.value = selection.radius;
    localCityName.value =
      selection.type === "city" ? selection.cityName : undefined;
  }
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}
</script>

<template>
  <div class="mb-6">
    <!-- barre de recherche toujours visible -->
    <BaseCard variant="default" padding="md">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- recherche texte -->
        <div class="flex-1">
          <BaseInput
            v-model="localQ"
            type="search"
            placeholder="Rechercher une annonce..."
            icon="search"
            size="md"
            @keyup.enter="applyFilters"
          />
        </div>

        <!-- boutons -->
        <div class="flex gap-2">
          <BaseButton
            type="button"
            variant="primary"
            size="md"
            @click="applyFilters"
          >
            Rechercher
          </BaseButton>

          <BaseButton
            type="button"
            variant="ghost"
            size="md"
            @click="toggleExpand"
          >
            <Icon name="filter" class="w-5 h-5" />
            <span class="hidden sm:inline">Filtres</span>
            <span
              v-if="activeFiltersCount > 0"
              class="ml-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {{ activeFiltersCount }}
            </span>
            <Icon
              name="chevron-down"
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': isExpanded }"
            />
          </BaseButton>
        </div>
      </div>

      <!-- panneau filtres -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-[1000px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[1000px]"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="isExpanded" class="overflow-hidden">
          <div class="pt-5 mt-5 border-t border-stone-100 space-y-5">
            <!-- type d'annonce -->
            <div v-if="!hideTypeFilter">
              <label class="label">Type d'annonce</label>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all"
                  :class="
                    localType === ''
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  "
                  @click="localType = ''"
                >
                  Tous
                </button>
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all"
                  :class="
                    localType === 'demande'
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  "
                  @click="localType = 'demande'"
                >
                  Demandes
                </button>
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all"
                  :class="
                    localType === 'proposition'
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  "
                  @click="localType = 'proposition'"
                >
                  Propositions
                </button>
              </div>
            </div>

            <!-- types de service -->
            <div>
              <label class="label">Types de service</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="st in serviceTypes"
                  :key="st.id"
                  type="button"
                  class="px-3 py-1.5 text-xs font-semibold rounded-full border transition-all"
                  :class="
                    localServiceTypeIds.includes(st.id)
                      ? 'bg-stone-700 border-stone-700 text-white'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                  "
                  @click="toggleServiceType(st.id)"
                >
                  {{ st.label }}
                </button>
              </div>
            </div>

            <!-- filtre de localisation -->
            <div>
              <LocationFilter
                :initial-lat="localAroundLat"
                :initial-lng="localAroundLng"
                :initial-radius="localRadiusKm ?? 10"
                :initial-city-name="localCityName"
                @change="handleLocationChange"
              />
            </div>

            <!-- boutons d'action -->
            <div class="flex gap-3 pt-2">
              <BaseButton
                type="button"
                variant="primary"
                size="md"
                @click="applyFilters"
              >
                <Icon name="check" class="w-4 h-4" />
                Appliquer les filtres
              </BaseButton>
              <BaseButton
                type="button"
                variant="ghost"
                size="md"
                @click="resetFilters"
              >
                Réinitialiser
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </BaseCard>
  </div>
</template>

<!-- Carte d'affichage d'une annonce (utilisée dans les listes) -->
<script setup lang="ts">
import type { ListingPublic, ServiceType } from "~/composables/useListings";

interface Props {
  listing: ListingPublic;
  serviceTypes: Record<string, ServiceType>; // Pour afficher les labels des services
}

const props = defineProps<Props>();

// Formater la date en français (ex: "15 janvier")
const formattedDate = computed(() => {
  const date = new Date(props.listing.createdAt);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
});

const excerpt = computed(() => {
  const desc = props.listing.description;
  if (desc.length <= 100) return desc;
  return desc.substring(0, 97) + "...";
});

const serviceLabels = computed(() => {
  return props.listing.serviceTypeIds
    .map((id) => props.serviceTypes[id]?.label)
    .filter(Boolean)
    .slice(0, 3);
});

const remainingServices = computed(() => {
  const total = props.listing.serviceTypeIds.length;
  return total > 3 ? total - 3 : 0;
});
</script>

<template>
  <NuxtLink :to="`/annonces/${listing.id}`" class="group block">
    <BaseCard variant="interactive" padding="none" class="overflow-hidden">
      <!-- Barre colorée en haut -->
      <div class="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400" />

      <div class="p-5">
        <!-- En-tête : badges -->
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <ListingTypeBadge :type="listing.type" />
          <ServiceTypeBadge
            v-for="label in serviceLabels"
            :key="label"
            :label="label"
          />
          <span
            v-if="remainingServices > 0"
            class="text-xs text-stone-500 font-medium"
          >
            +{{ remainingServices }}
          </span>
        </div>

        <!-- Titre -->
        <h3
          class="text-lg font-bold text-stone-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2"
        >
          {{ listing.title }}
        </h3>

        <!-- Extrait description -->
        <p class="text-sm text-stone-600 mb-4 line-clamp-2 leading-relaxed">
          {{ excerpt }}
        </p>

        <!-- Pied de carte : localisation, auteur et date -->
        <div
          class="flex items-center justify-between pt-3 border-t border-stone-100"
        >
          <div class="flex items-center gap-1.5 text-orange-600">
            <Icon name="location" class="w-4 h-4" />
            <span class="text-sm font-medium">
              {{ listing.cityName }}
              <span v-if="listing.departmentCode" class="text-stone-400"
                >({{ listing.departmentCode }})</span
              >
            </span>
            <span
              v-if="listing.distanceKm !== undefined"
              class="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full"
            >
              {{ listing.distanceKm }} km
            </span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Auteur -->
            <div class="flex items-center gap-1.5 text-stone-500">
              <Icon name="user" class="w-4 h-4" />
              <span class="text-xs font-medium">{{
                listing.authorDisplayName
              }}</span>
            </div>

            <!-- Date -->
            <div class="flex items-center gap-1.5 text-stone-400">
              <Icon name="calendar" class="w-4 h-4" />
              <span class="text-xs">{{ formattedDate }}</span>
            </div>
          </div>
        </div>

        <!-- Badge fermé si applicable -->
        <div v-if="listing.status === 'closed'" class="mt-3">
          <BaseBadge variant="soft" color="neutral"> Clôturée </BaseBadge>
        </div>
      </div>
    </BaseCard>
  </NuxtLink>
</template>

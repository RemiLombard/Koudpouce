<!-- badge pour afficher le type d'annonce (demande ou proposition) -->
<script setup lang="ts">
import type { ListingType } from "~/composables/useListings";

interface Props {
  type: ListingType;
}

const props = defineProps<Props>();

// config selon le type (couleur, icône, label)
const config = computed(() => {
  if (props.type === "demande") {
    return {
      label: "Demande",
      icon: "search",
      color: "primary" as const,
    };
  }
  return {
    label: "Proposition",
    icon: "sparkles",
    color: "primary" as const,
  };
});
</script>

<template>
  <BaseBadge
    variant="solid"
    :color="config.color"
    :icon="config.icon"
    size="md"
  >
    {{ config.label }}
  </BaseBadge>
</template>

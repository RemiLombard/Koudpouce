<!-- badge pour afficher une catégorie de service -->
<script setup lang="ts">
interface Props {
  label: string;
}

defineProps<Props>();
</script>

<template>
  <BaseBadge variant="soft" color="neutral" size="sm">
    {{ label }}
  </BaseBadge>
</template>

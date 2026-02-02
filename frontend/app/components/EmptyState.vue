<script setup lang="ts">
interface Props {
  icon: string;
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center py-16">
    <div
      class="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center"
    >
      <Icon :name="icon" class="w-8 h-8 text-stone-400" />
    </div>
    <p class="text-stone-500 text-lg">{{ title }}</p>
    <p v-if="subtitle" class="text-stone-400 text-sm mt-2">{{ subtitle }}</p>
    <slot />
  </div>
</template>

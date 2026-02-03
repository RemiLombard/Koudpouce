<script setup lang="ts">
interface Props {
  size?: "sm" | "md" | "lg";
  text?: string;
  centered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  text: undefined,
  centered: true,
});

const sizeClasses = {
  sm: "w-6 h-6 border-2",
  md: "w-12 h-12 border-4",
  lg: "w-16 h-16 border-4",
};
</script>

<template>
  <div :class="centered ? 'text-center py-16' : 'text-center'">
    <div
      class="mx-auto border-primary-200 border-t-primary-500 rounded-full animate-spin"
      :class="[sizeClasses[size], text ? 'mb-4' : '']"
    />
    <p v-if="text" class="text-stone-500 mt-4">{{ text }}</p>
  </div>
</template>

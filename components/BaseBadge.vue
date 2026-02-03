<script setup lang="ts">
interface Props {
  variant?: "solid" | "soft" | "outline";
  color?: "primary" | "secondary" | "accent" | "neutral" | "success";
  size?: "sm" | "md";
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "soft",
  color: "primary",
  size: "md",
});

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-3 py-1 text-sm gap-1.5",
};

const colorClasses = computed(() => {
  const colors = {
    primary: {
      solid:
        "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-sm",
      soft: "bg-primary-100 text-primary-700 border border-primary-200",
      outline: "border-2 border-primary-300 text-primary-600 bg-transparent",
    },
    secondary: {
      solid:
        "bg-gradient-to-r from-secondary-500 to-yellow-500 text-white shadow-sm",
      soft: "bg-secondary-100 text-secondary-700 border border-secondary-200",
      outline: "border-2 border-secondary-300 text-secondary-600 bg-transparent",
    },
    accent: {
      solid: "bg-gradient-to-r from-red-500 to-primary-500 text-white shadow-sm",
      soft: "bg-red-100 text-red-700 border border-red-200",
      outline: "border-2 border-red-300 text-red-600 bg-transparent",
    },
    neutral: {
      solid: "bg-stone-700 text-white shadow-sm",
      soft: "bg-stone-100 text-stone-700 border border-stone-200",
      outline: "border-2 border-stone-300 text-stone-600 bg-transparent",
    },
    success: {
      solid: "bg-green-500 text-white shadow-sm",
      soft: "bg-green-100 text-green-700 border border-green-200",
      outline: "border-2 border-green-300 text-green-600 bg-transparent",
    },
  };

  return colors[props.color][props.variant];
});

const classes = computed(() => {
  return [
    "inline-flex items-center font-semibold rounded-full transition-all",
    sizeClasses[props.size],
    colorClasses.value,
  ].join(" ");
});
</script>

<template>
  <span :class="classes">
    <Icon v-if="icon" :name="icon as any" class="w-3.5 h-3.5" />
    <slot />
  </span>
</template>

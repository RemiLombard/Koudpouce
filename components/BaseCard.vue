<script setup lang="ts">
interface Props {
  variant?: "default" | "elevated" | "interactive" | "highlighted";
  color?: "primary" | "accent" | "success";
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "article" | "section";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  color: "primary",
  padding: "md",
  as: "div",
});

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const variantClasses = computed(() => {
  const base = "rounded-2xl transition-all duration-200";

  switch (props.variant) {
    case "elevated":
      return `${base} bg-white border border-stone-100 shadow-md`;
    case "interactive":
      return `${base} bg-white border border-stone-100 shadow-sm hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5 cursor-pointer`;
    case "highlighted":
      const borderColors = {
        primary:
          "border-primary-200 bg-gradient-to-br from-white to-primary-50/30",
        accent: "border-red-200 bg-gradient-to-br from-white to-red-50/30",
        success: "border-green-200 bg-gradient-to-br from-white to-green-50/30",
      };
      return `${base} border-2 ${borderColors[props.color]} shadow-sm`;
    default:
      return `${base} bg-white border border-stone-100 shadow-sm`;
  }
});

const classes = computed(() => {
  return [variantClasses.value, paddingClasses[props.padding]].join(" ");
});
</script>

<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<!-- composant bouton réutilisable avec plusieurs variantes de style -->
<script setup lang="ts">
// props du bouton avec valeurs par défaut
interface Props {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline" | "ghost" | "danger" | "soft";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "button",
  variant: "primary",
  size: "md",
  disabled: false,
  fullWidth: false,
  loading: false,
});

const baseClasses = `
  inline-flex items-center justify-center gap-2
  font-semibold rounded-xl
  transition-all duration-200 ease-out
  focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
`;

const variantClasses = {
  primary: `
    bg-gradient-to-r from-primary-500 to-secondary-500
    text-white
    border-2 border-transparent
    hover:from-primary-600 hover:to-secondary-600
    active:scale-[0.98]
    focus-visible:ring-primary-500
  `,
  ghost: `
    bg-transparent
    text-stone-600
    border-2 border-transparent
    hover:bg-stone-100 hover:text-stone-800
    focus-visible:ring-stone-400
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600
    text-white
    border-2 border-transparent
    hover:from-red-600 hover:to-red-700
    active:scale-[0.98]
    focus-visible:ring-red-500
  `,
  soft: `
    bg-primary-100
    text-primary-700
    border-2 border-transparent
    hover:bg-primary-200
    focus-visible:ring-primary-400
  `,
  outline: `
    bg-transparent
    text-primary-600
    border-2 border-primary-400
    hover:bg-primary-100 hover:border-primary-500 hover:text-primary-700
    active:scale-[0.98]
    focus-visible:ring-primary-500
  `,
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

const classes = computed(() => {
  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.fullWidth ? "w-full" : "",
  ].join(" ");
});
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="classes">
    <!-- spinner de chargement -->
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <slot v-if="!loading" />
    <span v-else>Chargement...</span>
  </button>
</template>

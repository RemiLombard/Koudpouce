<script setup lang="ts">
interface Props {
  type?: "text" | "email" | "password" | "search" | "tel" | "url" | "number";
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  autocomplete?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
  icon?: string;
  error?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  readonly: false,
  size: "md",
  error: false,
});

const model = defineModel<string | number>();

const sizeClasses = {
  sm: "py-2 px-3 text-sm",
  md: "py-3 px-4 text-base",
  lg: "py-4 px-5 text-lg",
};

const baseClasses = computed(() => {
  const base = [
    "w-full rounded-xl border-2 transition-all duration-200",
    "placeholder:text-stone-400",
    "focus:outline-none focus:ring-0",
    sizeClasses[props.size],
  ];

  if (props.error) {
    base.push(
      "border-red-300 bg-red-50/50 focus:border-red-400 focus:bg-white",
    );
  } else {
    base.push(
      "border-stone-200 bg-white hover:border-stone-300",
      "focus:border-orange-400 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]",
    );
  }

  if (props.disabled) {
    base.push("opacity-50 cursor-not-allowed bg-stone-50");
  }

  if (props.icon) {
    base.push("pl-11");
  }

  return base.join(" ");
});
</script>

<template>
  <div class="relative">
    <!-- Icône à gauche -->
    <div
      v-if="icon"
      class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
    >
      <Icon :name="icon as any" class="w-5 h-5" />
    </div>

    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :class="baseClasses"
    />
  </div>
</template>

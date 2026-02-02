<script setup lang="ts">
interface Props {
  to?: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  to: undefined,
  label: "Retour",
});

const router = useRouter();

function handleClick() {
  if (props.to) {
    router.push(props.to);
  } else if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-orange-600 mb-6 font-medium transition-colors"
  >
    <Icon name="arrow-right" class="w-4 h-4 rotate-180" />
    {{ label }}
  </NuxtLink>
  <button
    v-else
    type="button"
    class="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-orange-600 mb-6 font-medium transition-colors"
    @click="handleClick"
  >
    <Icon name="arrow-right" class="w-4 h-4 rotate-180" />
    {{ label }}
  </button>
</template>

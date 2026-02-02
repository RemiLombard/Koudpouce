<!-- Composant racine de l'application Nuxt -->
<template>
  <NuxtPage />
</template>

<script setup lang="ts">
const { fetchUser } = useAuth();

// Vérifie si l'utilisateur est connecté au démarrage
onMounted(() => {
  fetchUser();
});
</script>

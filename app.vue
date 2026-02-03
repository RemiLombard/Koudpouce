<!-- Composant racine de l'application Nuxt -->
<template>
  <!-- Animation de lancement -->
  <SplashScreen />
  
  <!-- Contenu de l'application -->
  <NuxtPage />
</template>

<script setup lang="ts">
const { fetchUser } = useAuth();

// Vérifie si l'utilisateur est connecté au démarrage
onMounted(() => {
  fetchUser();
});
</script>

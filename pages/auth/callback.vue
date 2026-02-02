<!-- Page de callback OAuth (Google, etc.) -->
<script setup lang="ts">
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  // Récupérer les paramètres de l'URL (access_token dans le hash fragment)
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const error = params.get("error");
  const errorDescription = params.get("error_description");

  if (error) {
    console.error("Erreur OAuth:", error, errorDescription);
    router.push("/auth/login?error=oauth");
    return;
  }

  if (accessToken) {
    try {
      // Envoyer le token au serveur pour créer la session
      await $fetch("/api/auth/oauth-callback", {
        method: "POST",
        body: {
          accessToken,
          refreshToken,
        },
      });

      // Rediriger vers la page d'accueil
      router.push("/");
    } catch (err) {
      console.error("Erreur lors de la connexion OAuth:", err);
      router.push("/auth/login?error=oauth");
    }
  } else {
    // Pas de token, rediriger vers login
    router.push("/auth/login");
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-warm flex items-center justify-center">
    <div class="text-center">
      <LoadingSpinner text="Connexion en cours..." />
    </div>
  </div>
</template>

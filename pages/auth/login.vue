<!-- page de connexion -->
<script setup lang="ts">
// SEO
useHead({
  title: "Connexion - Koudpouce",
  meta: [
    {
      name: "description",
      content:
        "Connectez-vous à votre compte Koudpouce pour proposer ou demander de l'aide près de chez vous.",
    },
  ],
});

// composable auth et navigation
const { login, loading, error, isAdmin } = useAuth();
const router = useRouter();
const route = useRoute();

// gestion erreur OAuth Google
const googleError = computed(() => route.query.error === "google_failed");

// connexion puis redirection
async function handleLogin(data: { email: string; password: string }) {
  const success = await login(data.email, data.password);
  if (success) {
    if (isAdmin.value) {
      router.push("/admin");
    } else {
      const redirectTo = (route.query.redirect as string) || "/";
      router.push(redirectTo);
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm flex flex-col">
    <AppHeader />

    <main class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <BaseCard variant="elevated" padding="lg">
          <!-- icône et titre -->
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-2xl flex items-center justify-center"
            >
              <Icon name="login" class="w-8 h-8 text-primary-600" />
            </div>
            <h1 class="text-2xl font-bold text-stone-800 mb-2">Connexion</h1>
            <p class="text-stone-600">Retrouvez votre compte Koudpouce</p>
          </div>

          <!-- formulaire -->
          <AuthForm
            mode="login"
            :loading="loading"
            :error="error"
            @submit="handleLogin"
          />

          <!-- séparateur -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-stone-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-stone-500">ou</span>
            </div>
          </div>

          <!-- bouton Google -->
          <GoogleAuthButton />

          <!-- message d'erreur Google -->
          <p v-if="googleError" class="mt-4 text-center text-sm text-red-600">
            La connexion avec Google a échoué. Veuillez réessayer.
          </p>

          <!-- lien inscription -->
          <div class="mt-8 pt-6 border-t border-stone-100 text-center">
            <p class="text-stone-600 text-sm">
              Pas encore de compte ?
              <NuxtLink
                to="/auth/register"
                class="text-primary-600 hover:text-primary-700 font-semibold ml-1"
              >
                Inscrivez-vous
              </NuxtLink>
            </p>
          </div>
        </BaseCard>
      </div>
    </main>
  </div>
</template>

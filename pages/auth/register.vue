<!-- Page d'inscription -->
<script setup lang="ts">
// SEO
useHead({
  title: "Créer un compte - Koudpouce",
  meta: [
    {
      name: "description",
      content:
        "Inscrivez-vous gratuitement sur Koudpouce et rejoignez une communauté d'entraide locale entre voisins.",
    },
  ],
});

// Composable auth et navigation
const { register, loading, error } = useAuth();
const router = useRouter();

// Inscription puis redirection vers l'accueil
async function handleRegister(data: {
  email: string;
  password: string;
  displayName?: string;
}) {
  const success = await register(
    data.email,
    data.password,
    data.displayName ?? "",
  );
  if (success) {
    router.push("/");
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm flex flex-col">
    <AppHeader />

    <main class="flex-1 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <BaseCard variant="elevated" padding="lg">
          <!-- Icône et titre -->
          <div class="text-center mb-8">
            <div
              class="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center"
            >
              <Icon name="sparkles" class="w-8 h-8 text-orange-600" />
            </div>
            <h1 class="text-2xl font-bold text-stone-800 mb-2">
              Créer un compte
            </h1>
            <p class="text-stone-600">
              Rejoignez Koudpouce pour donner ou recevoir un coup de pouce
            </p>
          </div>

          <!-- Formulaire -->
          <AuthForm
            mode="register"
            :loading="loading"
            :error="error"
            @submit="handleRegister"
          />

          <!-- Séparateur -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-stone-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-stone-500">ou</span>
            </div>
          </div>

          <!-- Bouton Google -->
          <GoogleAuthButton />

          <!-- Lien connexion -->
          <div class="mt-8 pt-6 border-t border-stone-100 text-center">
            <p class="text-stone-600 text-sm">
              Déjà inscrit ?
              <NuxtLink
                to="/auth/login"
                class="text-orange-600 hover:text-orange-700 font-semibold ml-1"
              >
                Connectez-vous
              </NuxtLink>
            </p>
          </div>
        </BaseCard>
      </div>
    </main>
  </div>
</template>

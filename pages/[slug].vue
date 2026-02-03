<script setup lang="ts">
useHead({ title: "Page non trouvée - Koudpouce" });

const router = useRouter();
function goBack() {
  if (import.meta.client) router.back();
}
</script>

<template>
  <div class="min-h-screen bg-gradient-warm flex flex-col">
    <AppHeader />

    <main class="flex-1 flex items-center justify-center px-4 py-24">
      <div class="text-center max-w-2xl w-full">
        <div
          class="inline-flex items-center gap-3 glass px-4 py-2 rounded-full mb-6 mx-auto"
          style="max-width: 260px"
        >
          <span
            class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"
          >
            <Icon name="lightbulb" class="w-4 h-4 text-orange-600" />
          </span>
          <span class="text-sm font-semibold text-stone-700"
            >Entraide locale</span
          >
        </div>

        <h1 class="text-5xl font-extrabold mb-4 text-stone-800">
          Page introuvable
        </h1>

        <p class="text-stone-600 mb-8 leading-relaxed">
          Désolé — la page que vous cherchez n'existe pas ou a été déplacée.
          Vérifiez l'URL ou revenez à l'accueil pour continuer votre recherche.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink to="/" class="w-full sm:w-auto">
            <BaseButton variant="primary" size="lg">
              <Icon name="home" class="w-5 h-5" />
              Retour à l'accueil
            </BaseButton>
          </NuxtLink>

          <button type="button" class="w-full sm:w-auto" @click="goBack">
            <BaseButton variant="outline" size="lg">
              <Icon name="arrow-left" class="w-5 h-5" />
              Revenir en arrière
            </BaseButton>
          </button>
        </div>

        <div class="mt-8 text-sm text-stone-500">
          <p>
            Si le problème persiste, contactez-nous via
            <NuxtLink to="/contact" class="text-orange-600 hover:underline"
              >la page de contact</NuxtLink
            >.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

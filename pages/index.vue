<!-- Page d'accueil de Koudpouce -->
<script setup lang="ts">
// SEO
useHead({
  title: "Koudpouce - Entraide locale entre voisins",
  meta: [
    {
      name: "description",
      content:
        "Koudpouce est une plateforme gratuite d'entraide entre voisins. Proposez ou demandez de l'aide près de chez vous : bricolage, jardinage, courses, garde d'animaux.",
    },
  ],
});

useSeoMeta({
  ogTitle: "Koudpouce - Entraide locale entre voisins",
  ogDescription:
    "Plateforme gratuite d'entraide entre voisins. Proposez ou demandez de l'aide près de chez vous.",
  ogUrl: "https://koudpouce.fr",
});

// On récupère l'utilisateur pour adapter l'affichage (boutons différents si connecté)
const { user } = useAuth();
</script>

<template>
  <!-- Fond dégradé chaleureux -->
  <div class="min-h-screen bg-gradient-warm flex flex-col">
    <AppHeader />

    <main
      class="flex-1 flex items-center justify-center px-4 py-16 relative overflow-hidden"
    >
      <!-- Décorations de fond -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          class="absolute top-20 -left-20 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-pulse-soft"
        />
        <div
          class="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-pulse-soft"
          style="animation-delay: 1.5s"
        />
        <div
          class="absolute top-1/2 left-1/4 w-40 h-40 bg-orange-200/30 rounded-full blur-2xl animate-float"
        />
      </div>

      <div class="text-center max-w-3xl relative z-10">
        <!-- Badge intro -->
        <div
          class="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full shadow-lg mb-8"
        >
          <span
            class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"
          >
            <Icon name="hand-raised" class="w-4 h-4 text-orange-600" />
          </span>
          <span class="text-sm font-semibold text-stone-700"
            >Entraide locale</span
          >
        </div>

        <!-- Titre principal -->
        <h1
          class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1]"
        >
          <span class="text-gradient-primary">Un coup de pouce,</span>
          <br />
          <span class="text-stone-800">près de chez vous</span>
        </h1>

        <!-- Sous-texte -->
        <p
          class="text-xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Koudpouce met en relation des voisins pour s'entraider, simplement.
          <br class="hidden sm:block" />
          <span class="text-orange-600 font-medium"
            >Publier une annonce est gratuit et rapide !</span
          >
        </p>

        <!-- Boutons d'entrée -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <NuxtLink :to="user ? '/cherche' : '/auth/login?redirect=/cherche'">
            <BaseButton
              variant="primary"
              size="lg"
              class="w-full sm:w-auto min-w-[220px]"
            >
              <Icon name="search" class="w-5 h-5" />
              Je cherche de l'aide
            </BaseButton>
          </NuxtLink>

          <NuxtLink :to="user ? '/propose' : '/auth/login?redirect=/propose'">
            <BaseButton
              variant="outline"
              size="lg"
              class="w-full sm:w-auto min-w-[220px]"
            >
              <Icon name="hand-raised" class="w-5 h-5" />
              Je propose un service
            </BaseButton>
          </NuxtLink>
        </div>

        <!-- Points forts -->
        <div class="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div class="glass rounded-2xl p-4 text-center">
            <div class="text-2xl font-bold text-orange-600 mb-1">100%</div>
            <div class="text-xs text-stone-600 font-medium">Gratuit</div>
          </div>
          <div class="glass rounded-2xl p-4 text-center">
            <div
              class="w-8 h-8 mx-auto mb-1 bg-orange-100 rounded-full flex items-center justify-center"
            >
              <Icon name="check" class="w-5 h-5 text-orange-600" />
            </div>
            <div class="text-xs text-stone-600 font-medium">Sécurisé</div>
          </div>
          <div class="glass rounded-2xl p-4 text-center">
            <div
              class="w-8 h-8 mx-auto mb-1 bg-orange-100 rounded-full flex items-center justify-center"
            >
              <Icon name="location" class="w-5 h-5 text-orange-600" />
            </div>
            <div class="text-xs text-stone-600 font-medium">Local</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

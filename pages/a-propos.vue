<!--
  page À propos - Pourquoi Koudpouce existe.
-->
<script setup lang="ts">
useHead({
  title: "À propos - Koudpouce",
  meta: [
    {
      name: "description",
      content:
        "Découvrez l'histoire de Koudpouce, une plateforme d'entraide locale gratuite créée pour renforcer les liens entre voisins.",
    },
  ],
});

useSeoMeta({
  ogTitle: "À propos de Koudpouce",
  ogDescription:
    "L'entraide de proximité, simple et humaine. Découvrez pourquoi Koudpouce existe.",
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-white"
  >
    <AppHeader />

    <main class="max-w-4xl mx-auto px-4 py-12">
      <!-- hero -->
      <div class="text-center mb-12">
        <div
          class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl shadow-lg mb-6"
        >
          <svg
            class="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
            />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-stone-800 mb-4">
          Pourquoi Koudpouce ?
        </h1>
        <p class="text-xl text-stone-600 max-w-2xl mx-auto">
          L'entraide de proximité, simple et humaine.
        </p>
      </div>

      <!-- l'idée -->
      <section
        class="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm mb-8"
      >
        <div class="flex items-start gap-4">
          <div
            class="shrink-0 w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-stone-800 mb-3">L'idée</h2>
            <p class="text-stone-700 leading-relaxed mb-4">
              On a tous eu besoin un jour d'un coup de main : faire garder son
              chat, trouver quelqu'un pour arroser ses plantes, ou avoir de
              l'aide pour monter un meuble. Et on a tous eu du temps ou des
              compétences à offrir.
            </p>
            <p class="text-stone-700 leading-relaxed">
              <strong class="text-primary-600">Koudpouce</strong> connecte ces
              deux mondes. Une plateforme simple pour s'entraider entre voisins,
              sans prise de tête.
            </p>
          </div>
        </div>
      </section>

      <!-- à qui ça s'adresse -->
      <section
        class="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm mb-8"
      >
        <div class="flex items-start gap-4">
          <div
            class="shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-stone-800 mb-4">
              À qui ça s'adresse
            </h2>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full" />
                <span class="text-stone-700"
                  >Ceux qui cherchent un service ponctuel près de chez eux</span
                >
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full" />
                <span class="text-stone-700"
                  >Ceux qui ont du temps libre et veulent se rendre utiles</span
                >
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full" />
                <span class="text-stone-700"
                  >Ceux qui croient en l'entraide de proximité</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ce que ce n'est pas -->
      <section
        class="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm mb-8"
      >
        <div class="flex items-start gap-4">
          <div
            class="shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center"
          >
            <svg
              class="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-stone-800 mb-4">
              Ce que Koudpouce n'est pas
            </h2>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-red-400 rounded-full" />
                <span class="text-stone-700"
                  >Pas une plateforme pour les professionnels</span
                >
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-red-400 rounded-full" />
                <span class="text-stone-700"
                  >Pas une marketplace avec commissions</span
                >
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-red-400 rounded-full" />
                <span class="text-stone-700">Pas un réseau social</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- comment ça marche -->
      <section
        class="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8 border border-primary-200"
      >
        <h2 class="text-xl font-semibold text-stone-800 mb-6 text-center">
          Comment ça marche ?
        </h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center">
            <div
              class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"
            >
              <span class="text-xl font-bold text-primary-500">1</span>
            </div>
            <h3 class="font-medium text-stone-800 mb-2">Publie ton annonce</h3>
            <p class="text-sm text-stone-600">
              Décris ce que tu cherches ou ce que tu proposes
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"
            >
              <span class="text-xl font-bold text-primary-500">2</span>
            </div>
            <h3 class="font-medium text-stone-800 mb-2">Échange</h3>
            <p class="text-sm text-stone-600">
              Les voisins intéressés te contactent via la messagerie
            </p>
          </div>
          <div class="text-center">
            <div
              class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm"
            >
              <span class="text-xl font-bold text-primary-500">3</span>
            </div>
            <h3 class="font-medium text-stone-800 mb-2">Coup de pouce !</h3>
            <p class="text-sm text-stone-600">
              Organisez-vous et profitez de l'entraide
            </p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row justify-center gap-4 mt-12">
        <NuxtLink to="/cherche">
          <BaseButton
            variant="primary"
            size="lg"
            class="w-full sm:w-auto min-w-[220px]"
          >
            <Icon name="search" class="w-5 h-5" />
            Je cherche de l'aide
          </BaseButton>
        </NuxtLink>

        <NuxtLink to="/propose">
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
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Charte & bonnes pratiques - Koudpouce",
  meta: [
    {
      name: "description",
      content:
        "Consultez la charte de Koudpouce et nos bonnes pratiques pour une entraide respectueuse et bienveillante entre voisins.",
    },
  ],
});

useSeoMeta({
  ogTitle: "Charte & bonnes pratiques - Koudpouce",
  ogDescription:
    "Les règles de bonne conduite pour une entraide locale réussie.",
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
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-stone-800 mb-4">
          Charte & bonnes pratiques
        </h1>
        <p class="text-xl text-stone-600 max-w-2xl mx-auto">
          Quelques règles simples pour que l'entraide reste un plaisir.
        </p>
      </div>

      <!-- règles -->
      <div class="space-y-6">
        <!-- pas de spam -->
        <section
          class="bg-white rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm"
        >
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center"
            >
              <svg
                class="w-7 h-7 text-red-500"
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
              <h2 class="text-xl font-semibold text-stone-800 mb-2">
                Pas de spam
              </h2>
              <p class="text-stone-600 leading-relaxed">
                Une annonce = un besoin ou une offre réelle. Pas de messages
                copiés-collés ni de sollicitations répétées. Si ton annonce n'a
                plus lieu d'être, pense à la clôturer.
              </p>
            </div>
          </div>
        </section>

        <!-- pas de services pros déguisés -->
        <section
          class="bg-white rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm"
        >
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center"
            >
              <svg
                class="w-7 h-7 text-secondary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-stone-800 mb-2">
                Pas de services pros déguisés
              </h2>
              <p class="text-stone-600 leading-relaxed">
                C'est de l'entraide entre particuliers, pas du travail
                dissimulé. Si tu es un professionnel, cette plateforme n'est pas
                faite pour trouver des clients. Koudpouce est fait pour les
                coups de main occasionnels et bénévoles.
              </p>
            </div>
          </div>
        </section>

        <!-- respect et bienveillance -->
        <section
          class="bg-white rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm"
        >
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center"
            >
              <svg
                class="w-7 h-7 text-green-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-stone-800 mb-2">
                Respect et bienveillance
              </h2>
              <p class="text-stone-600 leading-relaxed mb-4">
                On est tous là pour s'entraider. Un peu de courtoisie fait toute
                la différence :
              </p>
              <div class="grid sm:grid-cols-2 gap-3">
                <div class="flex items-center gap-2 text-stone-700">
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>Réponds aux messages</span>
                </div>
                <div class="flex items-center gap-2 text-stone-700">
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>Dis merci</span>
                </div>
                <div class="flex items-center gap-2 text-stone-700">
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>Préviens si tu annules</span>
                </div>
                <div class="flex items-center gap-2 text-stone-700">
                  <svg
                    class="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>Pas de jugement</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- sécurité -->
        <section
          class="bg-white rounded-2xl p-6 md:p-8 border border-stone-200 shadow-sm"
        >
          <div class="flex items-start gap-4">
            <div
              class="shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center"
            >
              <svg
                class="w-7 h-7 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-stone-800 mb-2">Sécurité</h2>
              <p class="text-stone-600 leading-relaxed mb-4">
                Ta sécurité passe avant tout. Quelques conseils de bon sens :
              </p>
              <ul class="space-y-2 text-stone-700">
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-1">•</span>
                  <span
                    >Fais connaissance via la messagerie avant de te
                    déplacer</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-1">•</span>
                  <span
                    >Pour un premier rendez-vous, privilégie un lieu
                    public</span
                  >
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-1">•</span>
                  <span>Préviens un proche de tes déplacements</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-1">•</span>
                  <span
                    >Fais confiance à ton instinct : si quelque chose te semble
                    louche, passe ton chemin</span
                  >
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <!-- note finale -->
      <div
        class="mt-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8 border border-primary-200 text-center"
      >
        <p class="text-stone-700 text-lg">
          En utilisant Koudpouce, tu acceptes de respecter ces principes.<br />
          <span class="font-medium text-primary-700"
            >Ensemble, créons une communauté d'entraide saine et
            bienveillante.</span
          >
        </p>
      </div>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row justify-center gap-4 mt-10">
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

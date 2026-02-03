<script setup lang="ts">
/**
 * Animation de lancement Koudpouce
 * S'affiche une seule fois par session lors de l'arrivée sur le site
 */

const isVisible = ref(true);
const isAnimating = ref(true);

// Durée totale de l'animation (en ms)
const ANIMATION_DURATION = 2200;

onMounted(() => {
  // Vérifier si l'animation a déjà été vue dans cette session
  const hasSeenSplash = sessionStorage.getItem("koudpouce-splash-seen");

  if (hasSeenSplash) {
    // Déjà vu, on masque immédiatement
    isVisible.value = false;
    isAnimating.value = false;
  } else {
    // Marquer comme vu
    sessionStorage.setItem("koudpouce-splash-seen", "true");

    // Lancer l'animation de disparition après le délai
    setTimeout(() => {
      isAnimating.value = false;
    }, ANIMATION_DURATION);

    // Retirer complètement du DOM après la transition de sortie
    setTimeout(() => {
      isVisible.value = false;
    }, ANIMATION_DURATION + 500);
  }
});
</script>

<template>
  <Transition name="splash-fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary-500 via-secondary-500 to-primary-400"
    >
      <!-- Cercles décoratifs animés en arrière-plan -->
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse-soft"
        />
        <div
          class="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft"
          style="animation-delay: 0.5s"
        />
        <div
          class="absolute top-1/2 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-float"
        />
      </div>

      <!-- Contenu central -->
      <div
        class="relative flex flex-col items-center"
        :class="{ 'splash-content-enter': isAnimating }"
      >
        <!-- Logo avec animation -->
        <div class="relative mb-6" :class="{ 'logo-bounce': isAnimating }">
          <!-- Glow effect derrière le logo -->
          <div
            class="absolute inset-0 bg-white/30 rounded-full blur-2xl scale-150 animate-pulse"
          />

          <!-- Logo blanc sans fond -->
          <img
            src="/logo_koudpouce_white.svg"
            alt="Koudpouce"
            class="relative w-32 h-32 sm:w-44 sm:h-44 drop-shadow-2xl"
          />
        </div>

        <!-- Texte -->
        <h1
          class="text-3xl sm:text-4xl font-display font-bold text-white mb-3 tracking-tight"
          :class="{ 'text-fade-in': isAnimating }"
        >
          Koudpouce
        </h1>

        <p
          class="text-white/80 text-lg sm:text-xl font-medium"
          :class="{ 'text-fade-in-delay': isAnimating }"
        >
          L'entraide entre voisins
        </p>

        <!-- Indicateur de chargement -->
        <div class="mt-8 flex gap-1.5" :class="{ 'dots-fade-in': isAnimating }">
          <span
            class="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce"
            style="animation-delay: 0s"
          />
          <span
            class="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce"
            style="animation-delay: 0.15s"
          />
          <span
            class="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce"
            style="animation-delay: 0.3s"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Transition de sortie du splash screen */
.splash-fade-leave-active {
  transition: opacity 0.5s ease-out;
}

.splash-fade-leave-to {
  opacity: 0;
}

/* Animation d'entrée du contenu */
.splash-content-enter {
  animation: content-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes content-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Animation de rebond du logo */
.logo-bounce {
  animation: logo-bounce 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes logo-bounce {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-10deg);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

/* Animation du texte */
.text-fade-in {
  animation: text-appear 0.6s ease-out 0.3s forwards;
  opacity: 0;
}

.text-fade-in-delay {
  animation: text-appear 0.6s ease-out 0.5s forwards;
  opacity: 0;
}

@keyframes text-appear {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation des dots */
.dots-fade-in {
  animation: dots-appear 0.4s ease-out 0.7s forwards;
  opacity: 0;
}

@keyframes dots-appear {
  to {
    opacity: 1;
  }
}
</style>

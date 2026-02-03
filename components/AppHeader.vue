<script setup lang="ts">
const { user } = useAuth();
const { unreadCount, fetchUnreadCount } = useMessaging();

const menuOpen = ref(false);

// mettre à jour le compteur quand un nouveau message arrive
const userId = computed(() => user.value?.id);

// état de scroll lock
const _menuScrollY = ref(0);

function lockBodyScroll() {
  if (!import.meta.client) return;
  _menuScrollY.value =
    window.scrollY || document.documentElement.scrollTop || 0;
  document.body.style.position = "fixed";
  document.body.style.top = `-${_menuScrollY.value}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.classList.add("no-scroll");
}

function unlockBodyScroll() {
  if (!import.meta.client) return;
  document.body.classList.remove("no-scroll");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  const scrollTo = _menuScrollY.value || 0;
  window.scrollTo(0, scrollTo);
  _menuScrollY.value = 0;
}

onMounted(async () => {
  fetchUnreadCount();

  if (userId.value) {
    try {
      const { useRealtimeNotifications } =
        await import("~/composables/useRealtime");
      useRealtimeNotifications(userId, () => {
        fetchUnreadCount();
      });
    } catch (e) {
    }
  }
});

watch(userId, (newId) => {
  if (newId) {
    fetchUnreadCount();
  }
});

watch(menuOpen, (val) => {
  if (!import.meta.client) return;
  if (val) lockBodyScroll();
  else unlockBodyScroll();
});

onUnmounted(() => {
  if (import.meta.client) unlockBodyScroll();
});

const route = useRoute();
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);
</script>

<!-- en-tête de l'application avec navigation et menu mobile -->
<template>
  <!-- header fixé en haut -->
  <header
    class="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-lg"
  >
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- logo -->
      <NuxtLink to="/" class="flex items-center gap-3 text-white">
        <img
          src="/logo_koudpouce.svg"
          alt="Koudpouce"
          class="h-10 w-auto brightness-0 invert"
        />
        <span class="text-xl font-bold hidden sm:inline">Koudpouce</span>
      </NuxtLink>

      <!-- desktop -->
      <div class="hidden md:flex items-center gap-4">
        <!-- liens de navigation -->
        <NuxtLink
          to="/a-propos"
          class="text-white/90 hover:text-white font-medium transition-colors"
        >
          À propos
        </NuxtLink>
        <NuxtLink
          to="/charte"
          class="text-white/90 hover:text-white font-medium transition-colors"
        >
          Charte
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="text-white/90 hover:text-white font-medium transition-colors"
        >
          Contact
        </NuxtLink>

        <!-- séparateur (visible seulement si connecté) -->
        <div v-if="user" class="w-px h-6 bg-white/30 mx-2" />

        <!-- messagerie (connecté uniquement) -->
        <NuxtLink
          v-if="user"
          to="/messagerie"
          class="relative flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors border border-white/20"
          title="Messagerie"
        >
          <Icon name="envelope" class="w-5 h-5" />
          <span class="hidden lg:inline">Messages</span>
          <span
            v-if="unreadCount > 0"
            class="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow"
          >
            {{ unreadCount > 99 ? "99+" : unreadCount }}
          </span>
        </NuxtLink>

        <!-- profil (connecté uniquement) -->
        <NuxtLink
          v-if="user"
          to="/profil"
          class="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors border border-white/20"
        >
          <Icon name="user" class="w-5 h-5" />
          <span class="hidden lg:inline">{{ user?.displayName }}</span>
        </NuxtLink>

        <!-- connexion / inscription (non connecté) -->
        <template v-if="!user">
          <div class="w-px h-6 bg-white/30 mx-2" />
          <NuxtLink
            to="/auth/login"
            class="px-4 py-2 text-white font-medium rounded-xl border border-white/40 hover:bg-white/10 transition-colors"
          >
            Connexion
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="px-4 py-2 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
          >
            Inscription
          </NuxtLink>
        </template>
      </div>

      <!-- mobile -->
      <button
        type="button"
        class="md:hidden w-10 h-10 flex items-center justify-center text-white"
        aria-label="Menu"
        @click="menuOpen = true"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  </header>

  <!-- menu mobile -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-[100] bg-gradient-to-br from-orange-500 via-amber-500 to-orange-400 flex flex-col"
      >
        <!-- header du menu -->
        <div class="h-16 px-4 flex items-center justify-between">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 text-white"
            @click="menuOpen = false"
          >
            <div
              class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                />
              </svg>
            </div>
            <span class="text-xl font-bold">Koudpouce</span>
          </NuxtLink>

          <button
            type="button"
            class="w-10 h-10 flex items-center justify-center text-white"
            @click="menuOpen = false"
          >
            <Icon name="x" class="w-6 h-6" />
          </button>
        </div>

        <!-- liens de navigation -->
        <nav
          class="flex-1 flex flex-col justify-center items-center px-8 gap-6"
        >
          <NuxtLink
            to="/a-propos"
            class="text-2xl text-white/90 hover:text-white font-medium transition-colors"
            @click="menuOpen = false"
          >
            À propos
          </NuxtLink>
          <NuxtLink
            to="/charte"
            class="text-2xl text-white/90 hover:text-white font-medium transition-colors"
            @click="menuOpen = false"
          >
            Charte
          </NuxtLink>
          <NuxtLink
            to="/contact"
            class="text-2xl text-white/90 hover:text-white font-medium transition-colors"
            @click="menuOpen = false"
          >
            Contact
          </NuxtLink>

          <!-- séparateur -->
          <div class="w-20 h-px bg-white/30 my-2" />

          <!-- boutons connectés -->
          <template v-if="user">
            <NuxtLink
              to="/messagerie"
              class="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 bg-white/20 hover:bg-white/30 text-white text-xl font-medium rounded-2xl border border-white/30 transition-colors"
              @click="menuOpen = false"
            >
              <Icon name="envelope" class="w-6 h-6" />
              <span>Messagerie</span>
              <span
                v-if="unreadCount > 0"
                class="px-2.5 py-0.5 bg-red-500 text-sm rounded-full"
              >
                {{ unreadCount }}
              </span>
            </NuxtLink>
            <NuxtLink
              to="/profil"
              class="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 bg-white/20 hover:bg-white/30 text-white text-xl font-medium rounded-2xl border border-white/30 transition-colors"
              @click="menuOpen = false"
            >
              <Icon name="user" class="w-6 h-6" />
              <span>{{ user?.displayName }}</span>
            </NuxtLink>
          </template>

          <!-- boutons non connectés -->
          <template v-if="!user">
            <NuxtLink
              to="/auth/login"
              class="w-full max-w-xs flex items-center justify-center px-6 py-4 text-white text-xl font-medium rounded-2xl border border-white/40 hover:bg-white/10 transition-colors"
              @click="menuOpen = false"
            >
              Connexion
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="w-full max-w-xs flex items-center justify-center px-6 py-4 bg-white text-orange-600 text-xl font-semibold rounded-2xl shadow-lg hover:bg-orange-50 transition-colors"
              @click="menuOpen = false"
            >
              Inscription
            </NuxtLink>
          </template>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

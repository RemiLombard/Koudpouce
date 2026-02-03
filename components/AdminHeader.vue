<script setup lang="ts">
const { logout } = useAuth();
const router = useRouter();

async function handleLogout() {
  await logout();
  router.push('/auth/login');
}
</script>

<template>
  <header
    class="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-lg"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <Icon name="shield" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-white">Administration</h1>
            <p class="text-xs text-white/70">Koudpouce</p>
          </div>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-xl border border-white/40 hover:bg-white/10 transition-colors"
          @click="handleLogout"
        >
          <Icon name="logout" class="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  </header>
</template>

// Composable pour gérer l'authentification des utilisateurs
// Gère la connexion, l'inscription, la déconnexion et la session

export type UserRole = "user" | "admin";

// Interface qui représente un utilisateur connecté
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  role: UserRole;
}

// État global réactif (partagé entre tous les composants)
const user = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const initialized = ref(false);

export function useAuth() {
  const apiBase = useRuntimeConfig().public.apiBase as string;

  async function register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ user: User }>("/api/auth/register", {
        method: "POST",
        body: { email, password, displayName },
        credentials: "include",
        baseURL: apiBase,
      });
      user.value = response.user;
      return true;
    } catch (err: any) {
      error.value =
        err?.data?.error ?? "Une erreur est survenue lors de l'inscription.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
        credentials: "include",
        baseURL: apiBase,
      });
      user.value = response.user;
      return true;
    } catch (err: any) {
      error.value = err?.data?.error ?? "Email ou mot de passe invalide.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        baseURL: apiBase,
      });
      user.value = null;
    } catch (err: any) {
      error.value = err?.data?.error ?? "Erreur lors de la déconnexion.";
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser(): Promise<void> {
    try {
      const response = await $fetch<{ user: User }>("/api/auth/me", {
        credentials: "include",
        baseURL: apiBase,
      });
      user.value = response.user;
    } catch {
      user.value = null;
    } finally {
      initialized.value = true;
    }
  }

  async function updateProfile(updates: {
    displayName?: string;
    email?: string;
    password?: string;
  }): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ user: User }>("/api/auth/me", {
        method: "PATCH",
        body: updates,
        credentials: "include",
        baseURL: apiBase,
      });
      user.value = response.user;
      return true;
    } catch (err: any) {
      error.value =
        err?.data?.error ?? "Erreur lors de la mise à jour du profil.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteAccount(): Promise<boolean> {
    loading.value = true;
    error.value = null;

    try {
      await $fetch("/api/auth/me", {
        method: "DELETE",
        credentials: "include",
        baseURL: apiBase,
      });
      user.value = null;
      return true;
    } catch (err: any) {
      error.value =
        err?.data?.error ?? "Erreur lors de la suppression du compte.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  const isAuthenticated = computed(() => user.value !== null);

  const isAdmin = computed(() => user.value?.role === "admin");

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    isAdmin,
    initialized: readonly(initialized),
    register,
    login,
    logout,
    fetchUser,
    updateProfile,
    deleteAccount,
  };
}

// composable pour gérer l'authentification des utilisateurs
// gère la connexion, l'inscription, la déconnexion et la session

export type UserRole = "user" | "admin";

// interface qui représente un utilisateur connecté
export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  role: UserRole;
}

// état global réactif (partagé entre tous les composants)
const user = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const initialized = ref(false);

export function useAuth() {
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
      });
      user.value = response.user;
      return true;
    } catch (err: any) {
      error.value =
        err?.data?.message ?? "Une erreur est survenue lors de l'inscription.";
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
      });
      user.value = response.user;
      return true;
    } catch (err: any) {
      error.value = err?.data?.message ?? "Email ou mot de passe invalide.";
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
      });
      user.value = null;
    } catch (err: any) {
      error.value = err?.data?.message ?? "Erreur lors de la déconnexion.";
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser(cookieHeader?: string): Promise<void> {
    try {
      const opts: any = {};
      if (cookieHeader) opts.headers = { cookie: cookieHeader };
      const response = await $fetch<{ user: User }>("/api/auth/me", opts);
      user.value = response.user;
    } catch {
      user.value = null;
    } finally {
      initialized.value = true;
    }
  }

  // défini directement l'utilisateur côté serveur (évite appel réseau)
  function setServerUser(serverUser: Partial<User> | null) {
    if (serverUser) {
      user.value = {
        id: serverUser.id as string,
        email: serverUser.email as string,
        displayName:
          (serverUser.displayName as string) ||
          (serverUser as any).display_name ||
          "Utilisateur",
        createdAt:
          (serverUser.createdAt as string) ||
          (serverUser as any).created_at ||
          new Date().toISOString(),
        role:
          (serverUser.role as UserRole) ||
          ((serverUser as any).role as UserRole) ||
          "user",
      };
    } else {
      user.value = null;
    }
    initialized.value = true;
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
      });
      user.value = response.user;
      return true;
    } catch (err: any) {
      error.value =
        err?.data?.message ?? "Erreur lors de la mise à jour du profil.";
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
      });
      user.value = null;
      return true;
    } catch (err: any) {
      error.value =
        err?.data?.message ?? "Erreur lors de la suppression du compte.";
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
    setServerUser,
    register,
    login,
    logout,
    fetchUser,
    updateProfile,
    deleteAccount,
  };
}

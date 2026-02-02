/**
 * Middleware d'authentification GLOBAL.
 * - Redirige vers la page de connexion si l'utilisateur n'est pas connecté.
 * - Redirige les admins vers /admin s'ils essaient d'accéder à l'app normale.
 * - Exclut les pages publiques.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Pages publiques (pas besoin d'être connecté)
  const publicPaths = ["/", "/auth", "/a-propos", "/charte"];
  const isPublic = publicPaths.some(
    (path) => to.path === path || to.path.startsWith(path + "/"),
  );

  // Pages admin (gérées par leur propre middleware)
  const isAdminPath = to.path.startsWith("/admin");

  // Si c'est une page admin, laisser le middleware admin gérer
  if (isAdminPath) {
    return;
  }

  const { isAuthenticated, isAdmin, fetchUser, initialized } = useAuth();

  // S'assurer que l'état d'authentification est initialisé
  if (!initialized.value) {
    await fetchUser();
  }

  // Rediriger les admins vers /admin (ils ne peuvent pas utiliser l'app normale)
  if (isAuthenticated.value && isAdmin.value) {
    return navigateTo("/admin");
  }

  // Les pages publiques sont accessibles sans authentification
  if (isPublic) {
    return;
  }

  if (!isAuthenticated.value) {
    return navigateTo({
      path: "/auth/login",
      query: { redirect: to.fullPath },
    });
  }
});

/**
 * Middleware d'authentification GLOBAL.
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté.
 * Exclut les pages d'authentification (/auth/*).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Exclure les pages d'auth
  if (to.path.startsWith("/auth")) {
    return;
  }

  const { isAuthenticated, checkAuth, initialized } = useAuth();

  // S'assurer que l'état d'authentification est initialisé
  if (!initialized.value) {
    if (process.server) {
      const event = useRequestEvent();
      await fetchUser(event.node.req.headers.cookie || "");
    } else {
      await fetchUser();
    }
  }

  if (!isAuthenticated.value) {
    return navigateTo({
      path: "/auth/login",
      query: { redirect: to.fullPath },
    });
  }
});

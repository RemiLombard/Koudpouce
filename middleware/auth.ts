/**
 * middleware d'authentification GLOBAL.
 * redirige vers la page de connexion si l'utilisateur n'est pas connecté.
 * exclut les pages d'authentification (/auth/*).
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // si la route n'est pas appariée (404), laisser Nuxt afficher la page d'erreur
  if (!to.matched || to.matched.length === 0) {
    return;
  }
  // exclure les pages d'auth
  if (to.path.startsWith("/auth")) {
    return;
  }

  const { isAuthenticated, fetchUser, initialized } = useAuth();

  // s'assurer que l'état d'authentification est initialisé
  if (!initialized.value) {
    if (process.server) {
      const event = useRequestEvent();
      const cookieHeader = event?.node?.req?.headers?.cookie ?? "";
      try {
        const { getTokenFromEvent, getUserFromToken } =
          await import("~/server/utils/supabase");
        const token = getTokenFromEvent(event);
        if (token) {
          const serverUser = await getUserFromToken(token);
          if (serverUser) {
            const { setServerUser } = useAuth();
            setServerUser(serverUser as any);
          } else {
            await fetchUser(cookieHeader);
          }
        } else {
          await fetchUser(cookieHeader);
        }
      } catch (e) {
        await fetchUser(cookieHeader);
      }
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

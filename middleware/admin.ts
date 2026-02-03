/**
 * middleware de protection des routes admin.
 * redirige vers la page d'accueil si l'utilisateur n'est pas admin.
 */

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, isAdmin, initialized, fetchUser } = useAuth();

  // attendre l'initialisation de l'auth si nécessaire
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

  // rediriger si non connecté
  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }

  // rediriger si non admin
  if (!isAdmin.value) {
    return navigateTo("/");
  }
});

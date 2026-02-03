/**
 * middleware d'authentification GLOBAL.
 * - redirige vers la page de connexion si l'utilisateur n'est pas connecté.
 * - redirige les admins vers /admin s'ils essaient d'accéder à l'app normale.
 * - exclut les pages publiques.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // pages publiques (pas besoin d'être connecté)
  const publicPaths = ["/", "/auth", "/a-propos", "/charte", "/contact"];
  const isPublic = publicPaths.some(
    (path) => to.path === path || to.path.startsWith(path + "/"),
  );

  // pages admin (gérées par leur propre middleware)
  const isAdminPath = to.path.startsWith("/admin");

  // si c'est une page admin, laisser le middleware admin gérer
  if (isAdminPath) {
    return;
  }

  const { isAuthenticated, isAdmin, fetchUser, initialized } = useAuth();

  // s'assurer que l'état d'authentification est initialisé
  if (!initialized.value) {
    if (process.server) {
      const event = useRequestEvent();
      const cookieHeader = event?.node?.req?.headers?.cookie ?? "";
      try {
        // vérifier rapidement le token côté serveur pour éviter les appels réseau internes
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
        // fallback: essayer d'appeler l'API normalement
        await fetchUser(cookieHeader);
      }
    } else {
      await fetchUser();
    }
  }

  // rediriger les admins vers /admin (ils ne peuvent pas utiliser l'app normale)
  if (isAuthenticated.value && isAdmin.value) {
    return navigateTo("/admin");
  }

  // les pages publiques sont accessibles sans authentification
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

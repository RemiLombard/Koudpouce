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
    if (process.server) {
      const event = useRequestEvent();
      const cookieHeader = event.node.req.headers.cookie || "";
      try {
        // Vérifier rapidement le token côté serveur pour éviter les appels réseau internes
        const { getTokenFromEvent, getUserFromToken } = await import("~/server/utils/supabase");
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
        // Fallback: essayer d'appeler l'API normalement
        await fetchUser(cookieHeader);
      }
    } else {
      await fetchUser();
    }
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

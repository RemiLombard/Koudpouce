/**
 * Middleware de protection des routes admin.
 * Redirige vers la page d'accueil si l'utilisateur n'est pas admin.
 */

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, isAdmin, initialized, fetchUser } = useAuth();

  // Attendre l'initialisation de l'auth si nécessaire
  if (!initialized.value) {
    await fetchUser();
  }

  // Rediriger si non connecté
  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }

  // Rediriger si non admin
  if (!isAdmin.value) {
    return navigateTo("/");
  }
});

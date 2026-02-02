// POST /api/auth/logout - Déconnexion

export default defineEventHandler(async (event) => {
  // Supprimer le cookie
  deleteCookie(event, "koudpouce.token", { path: "/" });
  
  return { success: true };
});

// GET /api/auth/me - Récupérer l'utilisateur connecté

import { supabase, getUserById } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies["koudpouce.token"];

  if (!token) {
    throw createError({ statusCode: 401, message: "Non connecté." });
  }

  // Vérifier le token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    deleteCookie(event, "koudpouce.token", { path: "/" });
    throw createError({ statusCode: 401, message: "Session invalide ou expirée." });
  }

  const userPublic = await getUserById(user.id);

  if (!userPublic) {
    throw createError({ statusCode: 404, message: "Profil introuvable." });
  }

  return { user: userPublic };
});

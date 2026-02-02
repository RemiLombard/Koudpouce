// DELETE /api/auth/me - Supprimer son compte

import { supabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies["koudpouce.token"];

  if (!token) {
    throw createError({ statusCode: 401, message: "Non connecté." });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw createError({ statusCode: 401, message: "Session invalide." });
  }

  // Supprimer l'utilisateur (cascade sur le profil)
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error("Erreur suppression utilisateur:", deleteError);
    throw createError({ statusCode: 500, message: "Erreur lors de la suppression." });
  }

  // Supprimer le cookie
  deleteCookie(event, "koudpouce.token", { path: "/" });

  return { success: true };
});

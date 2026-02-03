// GET /api/auth/me - Récupérer l'utilisateur connecté

import { supabase, getUserById } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies["koudpouce.token"];

  if (!token) {
    // Pas d'utilisateur côté client : renvoyer user=null au lieu d'une erreur 401
    return { user: null };
  }

  // Vérifier le token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    // Token invalide : supprimer le cookie mais renvoyer user=null
    deleteCookie(event, "koudpouce.token", { path: "/" });
    return { user: null };
  }

  const userPublic = await getUserById(user.id);

  if (!userPublic) {
    // Profil manquant -> renvoyer user=null
    return { user: null };
  }

  return { user: userPublic };
});

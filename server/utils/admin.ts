import { H3Event } from "h3";
import { getUserFromToken, getTokenFromEvent } from "./supabase";

// Vérifie si l'utilisateur est admin (retourne l'user ou throw une erreur 403)
export async function requireAdmin(event: H3Event) {
  const token = getTokenFromEvent(event);
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Non authentifié",
    });
  }

  const user = await getUserFromToken(token);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "Session invalide",
    });
  }

  if (user.role !== "admin") {
    throw createError({
      statusCode: 403,
      message: "Accès refusé - administrateur requis",
    });
  }

  return user;
}

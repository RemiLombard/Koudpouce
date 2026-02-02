// POST /api/user-reports - Signaler un utilisateur

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

  const body = await readBody(event);
  const { reportedUserId, reason, message } = body;

  if (!reportedUserId || !reason) {
    throw createError({ statusCode: 400, message: "reportedUserId et reason requis." });
  }

  // On ne peut pas se signaler soi-même
  if (reportedUserId === user.id) {
    throw createError({ statusCode: 400, message: "Vous ne pouvez pas vous signaler vous-même." });
  }

  // Vérifier que l'utilisateur signalé existe
  const { data: reportedUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", reportedUserId)
    .single();

  if (!reportedUser) {
    throw createError({ statusCode: 404, message: "Utilisateur introuvable." });
  }

  // Créer le signalement
  const { data: report, error: reportError } = await supabase
    .from("user_reports")
    .insert({
      reported_user_id: reportedUserId,
      reporter_id: user.id,
      reason,
      message: message || null,
    })
    .select()
    .single();

  if (reportError) {
    console.error("Erreur création signalement utilisateur:", reportError);
    throw createError({ statusCode: 500, message: "Erreur lors du signalement." });
  }

  return { report: { id: report.id } };
});

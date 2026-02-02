import { requireAdmin } from "../../../utils/admin";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID du signalement requis",
    });
  }

  // Créer un client admin avec service_role pour bypasser RLS
  const config = useRuntimeConfig();
  const supabaseAdmin = createClient(
    config.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

  // Récupérer le signalement
  const { data: report, error: fetchError } = await supabaseAdmin
    .from("user_reports")
    .select("reported_user_id")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Erreur récupération signalement utilisateur:", fetchError);
    throw createError({
      statusCode: 404,
      message: "Signalement non trouvé",
    });
  }

  if (!report) {
    throw createError({
      statusCode: 404,
      message: "Signalement non trouvé",
    });
  }

  console.log(
    "Signalement trouvé, utilisateur signalé:",
    report.reported_user_id,
  );

  // Récupérer le profil avec le compteur de sanctions
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, sanction_count")
    .eq("id", report.reported_user_id)
    .single();

  if (profileError) {
    console.error("Erreur récupération profil:", profileError);
  }

  // Si la colonne sanction_count n'existe pas, on la traite comme 0
  const currentSanctionCount = profileData?.sanction_count ?? 0;
  console.log("Sanctions actuelles:", currentSanctionCount);

  // Si l'utilisateur a déjà été sanctionné, on le bannit (supprime son compte)
  if (currentSanctionCount >= 1) {
    console.log("Bannissement de l'utilisateur...");

    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(report.reported_user_id);

    if (deleteAuthError) {
      console.error(
        "Erreur lors de la suppression du compte auth:",
        deleteAuthError,
      );
      throw createError({
        statusCode: 500,
        message: `Erreur lors du bannissement: ${deleteAuthError.message}`,
      });
    }

    // Supprimer le profil utilisateur
    const { data: deletedProfile, error: deleteProfileError } =
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", report.reported_user_id)
        .select();

    if (deleteProfileError) {
      console.error("Erreur suppression profil:", deleteProfileError);
    } else {
      console.log("Profil supprimé:", deletedProfile);
    }

    // Marquer le signalement comme traité
    const { error: updateReportError } = await supabaseAdmin
      .from("user_reports")
      .update({ status: "actioned" })
      .eq("id", id);

    if (updateReportError) {
      console.error("Erreur mise à jour signalement:", updateReportError);
    }

    console.log("Utilisateur banni:", report.reported_user_id);
    return {
      message: "Utilisateur banni et compte supprimé définitivement",
      banned: true,
    };
  }

  // Sinon, on incrémente le compteur de sanctions
  console.log(
    "Incrémentation du compteur de sanctions de",
    currentSanctionCount,
    "à",
    currentSanctionCount + 1,
  );

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ sanction_count: currentSanctionCount + 1 })
    .eq("id", report.reported_user_id)
    .select();

  if (updateError) {
    console.error("Erreur mise à jour sanctions:", updateError);
    throw createError({
      statusCode: 500,
      message: `Erreur lors de la sanction: ${updateError.message}`,
    });
  }

  if (!updatedProfile || updatedProfile.length === 0) {
    console.error(
      "Aucun profil mis à jour - vérifiez que sanction_count existe dans la table profiles",
    );
    throw createError({
      statusCode: 500,
      message:
        "Erreur: impossible de mettre à jour le compteur de sanctions. La colonne sanction_count existe-t-elle dans profiles?",
    });
  }

  console.log("Profil mis à jour:", updatedProfile);

  // Marquer le signalement comme traité
  const { error: updateReportError } = await supabaseAdmin
    .from("user_reports")
    .update({ status: "actioned" })
    .eq("id", id);

  if (updateReportError) {
    console.error("Erreur mise à jour signalement:", updateReportError);
    throw createError({
      statusCode: 500,
      message: `Erreur mise à jour signalement: ${updateReportError.message}`,
    });
  }

  console.log("Utilisateur sanctionné:", report.reported_user_id);
  return {
    message:
      "Utilisateur sanctionné. Une prochaine sanction entraînera le bannissement.",
    banned: false,
  };
});

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
    .from("reports")
    .select("listing_id, status")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Erreur récupération signalement:", fetchError);
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

  // Supprimer l'annonce
  if (report.listing_id) {
    const { data: deletedData, error: deleteError } = await supabaseAdmin
      .from("listings")
      .delete()
      .eq("id", report.listing_id)
      .select();

    if (deleteError) {
      console.error("Erreur lors de la suppression de l'annonce:", deleteError);
      throw createError({
        statusCode: 500,
        message: `Erreur lors de la suppression de l'annonce: ${deleteError.message}`,
      });
    }

    if (!deletedData || deletedData.length === 0) {
      console.error(
        "Aucune annonce supprimée - peut-être déjà supprimée ou RLS",
      );
      // On continue quand même car l'annonce n'existe peut-être plus
    } else {
      console.log("Annonce supprimée:", report.listing_id);
    }
  }

  // Marquer le signalement comme traité
  const { error: updateError } = await supabaseAdmin
    .from("reports")
    .update({ status: "actioned" })
    .eq("id", id);

  if (updateError) {
    console.error("Erreur mise à jour signalement:", updateError);
    throw createError({
      statusCode: 500,
      message: `Erreur lors de la mise à jour du signalement: ${updateError.message}`,
    });
  }

  console.log("Signalement traité:", id);
  return { message: "Annonce supprimée et signalement traité" };
});

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

  const { error } = await supabaseAdmin
    .from("reports")
    .update({ status: "dismissed" })
    .eq("id", id);

  if (error) {
    console.error("Erreur rejet signalement:", error);
    throw createError({
      statusCode: 500,
      message: `Erreur lors du rejet du signalement: ${error.message}`,
    });
  }

  return { message: "Signalement rejeté" };
});

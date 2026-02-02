import { supabase } from "../../utils/supabase";
import { requireAdmin } from "../../utils/admin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const { count, error } = await supabase
    .from("user_reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors du comptage des signalements",
    });
  }

  return { count: count || 0 };
});

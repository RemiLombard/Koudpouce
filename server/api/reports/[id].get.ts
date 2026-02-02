import { supabase, getUserById } from "../../utils/supabase";
import { requireAdmin } from "../../utils/admin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ID du signalement requis",
    });
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !report) {
    throw createError({
      statusCode: 404,
      message: "Signalement non trouvé",
    });
  }

  // Récupérer l'annonce
  let listing = null;
  let listingOwner = null;
  if (report.listing_id) {
    const { data: listingData } = await supabase
      .from("listings")
      .select("id, title, type, description, city_name, department_code, status, author_id")
      .eq("id", report.listing_id)
      .single();
    
    if (listingData) {
      listing = {
        id: listingData.id,
        title: listingData.title,
        type: listingData.type,
        description: listingData.description,
        cityName: listingData.city_name,
        departmentCode: listingData.department_code,
        status: listingData.status,
      };

      // Récupérer le propriétaire de l'annonce
      const owner = await getUserById(listingData.author_id);
      if (owner) {
        listingOwner = {
          id: owner.id,
          firstName: owner.displayName,
          email: owner.email,
        };
      }
    }
  }

  // Récupérer le reporter
  const reporter = await getUserById(report.reporter_id);

  return {
    report: {
      id: report.id,
      listingId: report.listing_id,
      reason: report.reason,
      message: report.message,
      status: report.status,
      createdAt: report.created_at,
      listing,
      reporter: reporter
        ? {
            id: reporter.id,
            firstName: reporter.displayName,
            email: reporter.email,
          }
        : null,
      listingOwner,
    },
  };
});

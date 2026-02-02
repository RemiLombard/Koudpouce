import { supabase, getUserById } from "../../utils/supabase";
import { requireAdmin } from "../../utils/admin";

export default defineEventHandler(async (event) => {
  // Vérifier que l'utilisateur est admin
  await requireAdmin(event);

  const query = getQuery(event);
  const status = query.status as string | undefined;

  // Construire la requête
  let dbQuery = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    dbQuery = dbQuery.eq("status", status);
  }

  const { data: reports, error } = await dbQuery;

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Erreur lors du chargement des signalements",
    });
  }

  // Enrichir les rapports avec les infos listing et reporter
  const enrichedReports = await Promise.all(
    (reports || []).map(async (report) => {
      // Récupérer l'annonce
      let listing = null;
      if (report.listing_id) {
        const { data: listingData } = await supabase
          .from("listings")
          .select("id, title, type, city_name, department_code")
          .eq("id", report.listing_id)
          .single();

        if (listingData) {
          listing = {
            id: listingData.id,
            title: listingData.title,
            type: listingData.type,
            cityName: listingData.city_name,
            departmentCode: listingData.department_code,
          };
        }
      }

      // Récupérer le reporter
      const reporter = await getUserById(report.reporter_id);

      return {
        id: report.id,
        listingId: report.listing_id,
        reason: report.reason,
        message: report.message,
        status: report.status,
        createdAt: report.created_at,
        listing,
        reporter: reporter
          ? { id: reporter.id, firstName: reporter.displayName }
          : null,
      };
    }),
  );

  return { reports: enrichedReports };
});

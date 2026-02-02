import { supabase, getUserById } from "../../utils/supabase";
import { requireAdmin } from "../../utils/admin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);
  const status = query.status as string | undefined;

  let dbQuery = supabase
    .from("user_reports")
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

  // Enrichir les rapports
  const enrichedReports = await Promise.all(
    (reports || []).map(async (report) => {
      const reportedUser = await getUserById(report.reported_user_id);
      const reporter = await getUserById(report.reporter_id);

      return {
        id: report.id,
        reportedUserId: report.reported_user_id,
        conversationId: report.conversation_id,
        reason: report.reason,
        message: report.message,
        status: report.status,
        createdAt: report.created_at,
        reportedUser: reportedUser
          ? {
              id: reportedUser.id,
              firstName: reportedUser.displayName,
              lastName: "",
              email: reportedUser.email,
            }
          : null,
        reporter: reporter ? { id: reporter.id, firstName: reporter.displayName } : null,
      };
    })
  );

  return { reports: enrichedReports };
});

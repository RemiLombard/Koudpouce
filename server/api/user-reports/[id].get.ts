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
    .from("user_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !report) {
    throw createError({
      statusCode: 404,
      message: "Signalement non trouvé",
    });
  }

  // Récupérer l'utilisateur signalé
  const reportedUser = await getUserById(report.reported_user_id);

  // Récupérer le nombre de sanctions
  const { data: sanctionData } = await supabase
    .from("profiles")
    .select("sanction_count")
    .eq("id", report.reported_user_id)
    .single();

  // Récupérer le reporter
  const reporter = await getUserById(report.reporter_id);

  // Récupérer la conversation
  let conversation = null;
  if (report.conversation_id) {
    const { data: convData } = await supabase
      .from("conversations")
      .select("id, listing_id")
      .eq("id", report.conversation_id)
      .single();

    if (convData) {
      // Récupérer le titre de l'annonce
      const { data: listing } = await supabase
        .from("listings")
        .select("title, author_id")
        .eq("id", convData.listing_id)
        .single();

      // Récupérer les noms
      const { data: convFull } = await supabase
        .from("conversations")
        .select("contacter_id")
        .eq("id", report.conversation_id)
        .single();

      const contacter = convFull
        ? await getUserById(convFull.contacter_id)
        : null;
      const author = listing ? await getUserById(listing.author_id) : null;

      conversation = {
        id: convData.id,
        listingTitle: listing?.title ?? "",
        contacterName: contacter?.displayName ?? "",
        listingAuthorName: author?.displayName ?? "",
      };
    }
  }

  return {
    report: {
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
            sanctionCount: sanctionData?.sanction_count ?? 0,
          }
        : null,
      reporter: reporter
        ? {
            id: reporter.id,
            firstName: reporter.displayName,
            email: reporter.email,
          }
        : null,
      conversation,
    },
  };
});

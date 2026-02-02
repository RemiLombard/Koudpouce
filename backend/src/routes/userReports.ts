/**
 * Routes pour la gestion des signalements d'utilisateurs.
 * - POST /api/user-reports : Créer un signalement (utilisateur connecté)
 * - GET /api/user-reports : Liste des signalements (admin)
 * - GET /api/user-reports/count : Compte des signalements en attente (admin)
 * - GET /api/user-reports/:id : Détail d'un signalement (admin)
 * - POST /api/user-reports/:id/dismiss : Rejeter un signalement (admin)
 * - POST /api/user-reports/:id/action : Traiter un signalement (admin)
 */

import { Router, type Request, type Response } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import type { AppSession } from "../types";
import {
  createUserReport,
  getUserReportById,
  findUserReports,
  updateUserReportStatus,
  hasUserReportedUserInConversation,
  toUserReportPublic,
  countPendingUserReports,
  type UserReportReason,
} from "../models/UserReport";
import {
  getUserById,
  incrementUserSanctionCount,
  getUserSanctionCount,
  deleteUser,
} from "../models/User";
import { readDb } from "../db/fileDb";

const router = Router();

/** Raisons de signalement valides */
const VALID_REASONS: UserReportReason[] = [
  "harassment",
  "spam",
  "scam",
  "inappropriate",
  "other",
];

/**
 * POST /api/user-reports
 * Crée un signalement pour un utilisateur depuis une conversation.
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;

  const { reportedUserId, conversationId, reason, message } = req.body;

  // Validation
  if (!reportedUserId || typeof reportedUserId !== "string") {
    return res
      .status(400)
      .json({ error: "L'identifiant de l'utilisateur est requis." });
  }

  if (!conversationId || typeof conversationId !== "string") {
    return res
      .status(400)
      .json({ error: "L'identifiant de la conversation est requis." });
  }

  if (!reason || !VALID_REASONS.includes(reason)) {
    return res.status(400).json({
      error: `Raison invalide. Valeurs acceptées : ${VALID_REASONS.join(", ")}`,
    });
  }

  // Vérifier que l'utilisateur signalé existe
  const reportedUser = getUserById(reportedUserId);
  if (!reportedUser) {
    return res.status(404).json({ error: "Utilisateur non trouvé." });
  }

  // Vérifier que l'utilisateur ne se signale pas lui-même
  if (reportedUserId === userId) {
    return res
      .status(400)
      .json({ error: "Vous ne pouvez pas vous signaler vous-même." });
  }

  // Vérifier que la conversation existe et que l'utilisateur en fait partie
  const db = readDb();
  const conversation = db.conversations.find((c) => c.id === conversationId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation non trouvée." });
  }

  const isParticipant =
    conversation.listingAuthorId === userId ||
    conversation.contacterId === userId;
  if (!isParticipant) {
    return res
      .status(403)
      .json({ error: "Vous ne faites pas partie de cette conversation." });
  }

  // Vérifier que l'utilisateur signalé fait partie de la conversation
  const isReportedUserInConversation =
    conversation.listingAuthorId === reportedUserId ||
    conversation.contacterId === reportedUserId;
  if (!isReportedUserInConversation) {
    return res.status(400).json({
      error: "L'utilisateur signalé ne fait pas partie de cette conversation.",
    });
  }

  // Vérifier que l'utilisateur n'a pas déjà signalé cet utilisateur dans cette conversation
  if (
    hasUserReportedUserInConversation(userId, reportedUserId, conversationId)
  ) {
    return res
      .status(400)
      .json({
        error:
          "Vous avez déjà signalé cet utilisateur dans cette conversation.",
      });
  }

  // Créer le signalement
  const report = createUserReport({
    reportedUserId,
    reportedByUserId: userId,
    conversationId,
    reason: reason as UserReportReason,
    message: message && typeof message === "string" ? message.trim() : null,
  });

  return res.status(201).json({
    message: "Signalement enregistré. Merci de votre vigilance.",
    reportId: report.id,
  });
});

/**
 * GET /api/user-reports/count
 * Compte des signalements en attente (admin uniquement).
 */
router.get("/count", requireAdmin, (_req: Request, res: Response) => {
  const count = countPendingUserReports();
  return res.json({ count });
});

/**
 * GET /api/user-reports
 * Liste des signalements d'utilisateurs (admin uniquement).
 * Query params: status (pending, dismissed, actioned, all)
 */
router.get("/", requireAdmin, (_req: Request, res: Response) => {
  const status = _req.query.status as string | undefined;

  let filterStatus: "pending" | "dismissed" | "actioned" | "all" = "pending";
  if (
    status === "pending" ||
    status === "dismissed" ||
    status === "actioned" ||
    status === "all"
  ) {
    filterStatus = status;
  }

  const reports = findUserReports(filterStatus);

  // Enrichir avec les infos des utilisateurs
  const db = readDb();
  const enrichedReports = reports.map((report) => {
    const reportedUser = getUserById(report.reportedUserId);
    const reporter = getUserById(report.reportedByUserId);
    const conversation = db.conversations.find(
      (c) => c.id === report.conversationId,
    );

    return {
      ...toUserReportPublic(report),
      reportedUser: reportedUser
        ? {
            id: reportedUser.id,
            firstName: reportedUser.displayName,
            lastName: "",
            email: reportedUser.email,
          }
        : null,
      reporter: reporter
        ? {
            id: reporter.id,
            firstName: reporter.displayName,
          }
        : null,
      conversation: conversation
        ? {
            id: conversation.id,
            listingTitle: conversation.listingTitle,
          }
        : null,
    };
  });

  return res.json({ reports: enrichedReports });
});

/**
 * GET /api/user-reports/:id
 * Détail d'un signalement (admin uniquement).
 */
router.get("/:id", requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id as string;

  const report = getUserReportById(id);
  if (!report) {
    return res.status(404).json({ error: "Signalement non trouvé." });
  }

  const reportedUser = getUserById(report.reportedUserId);
  const reportedUserSanctionCount = getUserSanctionCount(report.reportedUserId);
  const reporter = getUserById(report.reportedByUserId);
  const db = readDb();
  const conversation = db.conversations.find(
    (c) => c.id === report.conversationId,
  );
  const contacter = conversation ? getUserById(conversation.contacterId) : null;
  const listingAuthor = conversation
    ? getUserById(conversation.listingAuthorId)
    : null;

  return res.json({
    report: {
      ...toUserReportPublic(report),
      reportedUser: reportedUser
        ? {
            id: reportedUser.id,
            firstName: reportedUser.displayName,
            lastName: "",
            email: reportedUser.email,
            sanctionCount: reportedUserSanctionCount,
          }
        : null,
      reporter: reporter
        ? {
            id: reporter.id,
            firstName: reporter.displayName,
            email: reporter.email,
          }
        : null,
      conversation: conversation
        ? {
            id: conversation.id,
            listingTitle: conversation.listingTitle,
            listingId: conversation.listingId,
            contacterName: contacter?.displayName || "Inconnu",
            listingAuthorName: listingAuthor?.displayName || "Inconnu",
          }
        : null,
    },
  });
});

/**
 * POST /api/user-reports/:id/dismiss
 * Rejeter un signalement (admin uniquement).
 */
router.post("/:id/dismiss", requireAdmin, (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const adminId = session.userId!;
  const id = req.params.id as string;

  const report = getUserReportById(id);
  if (!report) {
    return res.status(404).json({ error: "Signalement non trouvé." });
  }

  if (report.status !== "pending") {
    return res.status(400).json({ error: "Ce signalement a déjà été traité." });
  }

  updateUserReportStatus(id, "dismissed", adminId);

  return res.json({ message: "Signalement rejeté." });
});

/**
 * POST /api/user-reports/:id/action
 * Traiter un signalement et sanctionner l'utilisateur (admin uniquement).
 * - Si l'utilisateur n'a pas de sanction : il reçoit un avertissement (1ère sanction)
 * - Si l'utilisateur a déjà une sanction : il est banni (compte supprimé)
 */
router.post("/:id/action", requireAdmin, (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const adminId = session.userId!;
  const id = req.params.id as string;

  const report = getUserReportById(id);
  if (!report) {
    return res.status(404).json({ error: "Signalement non trouvé." });
  }

  if (report.status !== "pending") {
    return res.status(400).json({ error: "Ce signalement a déjà été traité." });
  }

  // Vérifier le nombre actuel de sanctions
  const currentSanctionCount = getUserSanctionCount(report.reportedUserId);

  if (currentSanctionCount >= 1) {
    // L'utilisateur a déjà une sanction : bannissement (suppression du compte)
    const deleted = deleteUser(report.reportedUserId);
    if (!deleted) {
      return res
        .status(500)
        .json({ error: "Erreur lors du bannissement de l'utilisateur." });
    }

    // Marquer le signalement comme traité
    updateUserReportStatus(id, "actioned", adminId);

    return res.json({
      message:
        "L'utilisateur a été banni. Son compte a été définitivement supprimé.",
      banned: true,
    });
  } else {
    // Première sanction : avertissement
    const newSanctionCount = incrementUserSanctionCount(report.reportedUserId);

    // Marquer le signalement comme traité
    updateUserReportStatus(id, "actioned", adminId);

    return res.json({
      message:
        "L'utilisateur a reçu un avertissement (1ère sanction). Un prochain signalement entraînera son bannissement.",
      sanctionCount: newSanctionCount,
      banned: false,
    });
  }
});

export default router;

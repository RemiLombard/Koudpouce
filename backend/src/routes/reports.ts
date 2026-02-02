/**
 * Routes pour la gestion des signalements.
 * - POST /api/reports : Créer un signalement (utilisateur connecté)
 * - GET /api/reports : Liste des signalements (admin)
 * - GET /api/reports/:id : Détail d'un signalement (admin)
 * - POST /api/reports/:id/dismiss : Rejeter un signalement (admin)
 * - POST /api/reports/:id/action : Traiter un signalement et supprimer l'annonce (admin)
 */

import { Router, type Request, type Response } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import type { AppSession } from "../types";
import {
  createReport,
  getReportById,
  findReports,
  updateReportStatus,
  hasUserReportedListing,
  toReportPublic,
  countPendingReports,
  type ReportReason,
} from "../models/Report";
import { getListingById, deleteListing } from "../models/Listing";
import { getUserById } from "../models/User";
import { toListingPublic } from "../utils/publicMappers";

const router = Router();

/** Raisons de signalement valides */
const VALID_REASONS: ReportReason[] = [
  "spam",
  "professional",
  "inappropriate",
  "scam",
  "other",
];

/**
 * POST /api/reports
 * Crée un signalement pour une annonce.
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;

  const { listingId, reason, message } = req.body;

  // Validation
  if (!listingId || typeof listingId !== "string") {
    return res
      .status(400)
      .json({ error: "L'identifiant de l'annonce est requis." });
  }

  if (!reason || !VALID_REASONS.includes(reason)) {
    return res.status(400).json({
      error: `Raison invalide. Valeurs acceptées : ${VALID_REASONS.join(", ")}`,
    });
  }

  // Vérifier que l'annonce existe
  const listing = getListingById(listingId);
  if (!listing) {
    return res.status(404).json({ error: "Annonce non trouvée." });
  }

  // Vérifier que l'utilisateur ne signale pas sa propre annonce
  if (listing.createdByUserId === userId) {
    return res
      .status(400)
      .json({ error: "Vous ne pouvez pas signaler votre propre annonce." });
  }

  // Vérifier que l'utilisateur n'a pas déjà signalé cette annonce
  if (hasUserReportedListing(userId, listingId)) {
    return res
      .status(400)
      .json({ error: "Vous avez déjà signalé cette annonce." });
  }

  // Créer le signalement
  const report = createReport({
    listingId,
    reportedByUserId: userId,
    reason: reason as ReportReason,
    message: message && typeof message === "string" ? message.trim() : null,
  });

  return res.status(201).json({
    message: "Signalement enregistré. Merci de votre vigilance.",
    reportId: report.id,
  });
});

/**
 * GET /api/reports/count
 * Compte les signalements en attente (admin uniquement).
 */
router.get("/count", requireAdmin, (_req: Request, res: Response) => {
  const count = countPendingReports();
  return res.json({ count });
});

/**
 * GET /api/reports
 * Liste des signalements (admin uniquement).
 * Query params: status (pending, dismissed, actioned, all)
 */
router.get("/", requireAdmin, (_req: Request, res: Response) => {
  const status = _req.query.status as string | undefined;

  let reports;
  if (status === "all") {
    reports = findReports();
  } else if (
    status === "pending" ||
    status === "dismissed" ||
    status === "actioned"
  ) {
    reports = findReports(status);
  } else {
    // Par défaut, afficher les signalements en attente
    reports = findReports("pending");
  }

  // Enrichir avec les infos de l'annonce et du signaleur
  const enrichedReports = reports.map((report) => {
    const listing = getListingById(report.listingId);
    const reporter = getUserById(report.reportedByUserId);

    return {
      ...toReportPublic(report),
      listing: listing ? toListingPublic(listing) : null,
      reporter: reporter
        ? { id: reporter.id, firstName: reporter.displayName }
        : null,
    };
  });

  return res.json({ reports: enrichedReports });
});

/**
 * GET /api/reports/:id
 * Détail d'un signalement (admin uniquement).
 */
router.get("/:id", requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id as string;
  const session = req.session as AppSession;
  const adminUserId = session.userId!;

  const report = getReportById(id);
  if (!report) {
    return res.status(404).json({ error: "Signalement non trouvé." });
  }

  const listing = getListingById(report.listingId);
  const reporter = getUserById(report.reportedByUserId);
  const listingOwner = listing ? getUserById(listing.createdByUserId) : null;

  return res.json({
    report: {
      ...toReportPublic(report),
      listing: listing ? toListingPublic(listing) : null,
      reporter: reporter
        ? {
            id: reporter.id,
            firstName: reporter.displayName,
            email: reporter.email,
          }
        : null,
      listingOwner: listingOwner
        ? {
            id: listingOwner.id,
            firstName: listingOwner.displayName,
            email: listingOwner.email,
          }
        : null,
    },
  });
});

/**
 * POST /api/reports/:id/dismiss
 * Rejette un signalement (infondé).
 */
router.post("/:id/dismiss", requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id as string;
  const session = req.session as AppSession;
  const adminUserId = session.userId!;

  const report = getReportById(id);
  if (!report) {
    return res.status(404).json({ error: "Signalement non trouvé." });
  }

  if (report.status !== "pending") {
    return res.status(400).json({ error: "Ce signalement a déjà été traité." });
  }

  updateReportStatus(id, "dismissed", adminUserId);

  return res.json({ message: "Signalement rejeté." });
});

/**
 * POST /api/reports/:id/action
 * Traite un signalement et supprime l'annonce associée.
 */
router.post("/:id/action", requireAdmin, (req: Request, res: Response) => {
  const id = req.params.id as string;
  const session = req.session as AppSession;
  const adminUserId = session.userId!;

  const report = getReportById(id);
  if (!report) {
    return res.status(404).json({ error: "Signalement non trouvé." });
  }

  if (report.status !== "pending") {
    return res.status(400).json({ error: "Ce signalement a déjà été traité." });
  }

  // Supprimer l'annonce (et ses conversations/messages/signalements associés)
  const deleted = deleteListing(report.listingId);
  if (!deleted) {
    // L'annonce a peut-être déjà été supprimée
    updateReportStatus(id, "actioned", adminUserId);
    return res.json({
      message: "Signalement traité. L'annonce avait déjà été supprimée.",
    });
  }

  // Note: deleteListing supprime aussi les signalements liés,
  // mais au cas où il y aurait d'autres signalements pour la même annonce,
  // on marque explicitement ce signalement comme traité
  // (en pratique, il sera supprimé avec l'annonce)

  return res.json({
    message:
      "Signalement traité. L'annonce et ses conversations ont été supprimées.",
  });
});

export default router;

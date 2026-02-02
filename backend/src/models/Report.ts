/**
 * Modèle Report (Signalement).
 * Gestion des signalements d'annonces par les utilisateurs.
 */

import { v4 as uuidv4 } from "uuid";
import { readDb, writeDb } from "../db/fileDb";
import type { DbReport } from "../db/types";

/** Raisons de signalement possibles. */
export type ReportReason =
  | "spam"
  | "professional"
  | "inappropriate"
  | "scam"
  | "other";

/** Statut d'un signalement. */
export type ReportStatus = "pending" | "dismissed" | "actioned";

/** Représentation interne d'un signalement. */
export interface ReportInternal {
  id: string;
  listingId: string;
  reportedByUserId: string;
  reason: ReportReason;
  message: string | null;
  status: ReportStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedByUserId: string | null;
}

/** Représentation publique d'un signalement (pour l'admin). */
export interface ReportPublic {
  id: string;
  listingId: string;
  reportedByUserId: string;
  reportedByDisplayName?: string;
  reason: ReportReason;
  message: string | null;
  status: ReportStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
}

function fromDb(report: DbReport): ReportInternal {
  return {
    id: String(report.id),
    listingId: String(report.listingId),
    reportedByUserId: String(report.reportedByUserId),
    reason: report.reason,
    message: report.message,
    status: report.status,
    createdAt: new Date(report.createdAt),
    reviewedAt: report.reviewedAt ? new Date(report.reviewedAt) : null,
    reviewedByUserId: report.reviewedByUserId,
  };
}

function toDb(report: ReportInternal): DbReport {
  return {
    id: report.id,
    listingId: report.listingId,
    reportedByUserId: report.reportedByUserId,
    reason: report.reason,
    message: report.message,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    reviewedAt: report.reviewedAt ? report.reviewedAt.toISOString() : null,
    reviewedByUserId: report.reviewedByUserId,
  };
}

function toPublic(report: ReportInternal): ReportPublic {
  return {
    id: report.id,
    listingId: report.listingId,
    reportedByUserId: report.reportedByUserId,
    reason: report.reason,
    message: report.message,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    reviewedAt: report.reviewedAt ? report.reviewedAt.toISOString() : null,
    reviewedByUserId: report.reviewedByUserId,
  };
}

/** Données pour créer un signalement. */
export interface CreateReportData {
  listingId: string;
  reportedByUserId: string;
  reason: ReportReason;
  message: string | null;
}

/**
 * Vérifie si un utilisateur a déjà signalé une annonce.
 */
export function hasUserReportedListing(
  userId: string,
  listingId: string,
): boolean {
  const db = readDb();
  return db.reports.some(
    (r) => r.reportedByUserId === userId && r.listingId === listingId,
  );
}

/**
 * Crée un nouveau signalement.
 */
export function createReport(data: CreateReportData): ReportInternal {
  const id = uuidv4();
  const now = new Date();

  const report: ReportInternal = {
    id,
    listingId: data.listingId,
    reportedByUserId: data.reportedByUserId,
    reason: data.reason,
    message: data.message,
    status: "pending",
    createdAt: now,
    reviewedAt: null,
    reviewedByUserId: null,
  };

  const db = readDb();
  db.reports.push(toDb(report));
  writeDb(db);

  return report;
}

/**
 * Récupère un signalement par son ID.
 */
export function getReportById(id: string): ReportInternal | null {
  const db = readDb();
  const raw = db.reports.find((r) => r.id === id);
  if (!raw) return null;
  return fromDb(raw);
}

/**
 * Liste les signalements avec filtre optionnel par statut.
 */
export function findReports(status?: ReportStatus): ReportInternal[] {
  const db = readDb();
  let results = db.reports.map(fromDb);

  if (status) {
    results = results.filter((r) => r.status === status);
  }

  // Tri par date décroissante
  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return results;
}

/**
 * Compte les signalements d'annonces en attente.
 */
export function countPendingReports(): number {
  const db = readDb();
  return db.reports.filter((r) => r.status === "pending").length;
}

/**
 * Met à jour le statut d'un signalement (dismiss ou action).
 */
export function updateReportStatus(
  id: string,
  status: ReportStatus,
  reviewedByUserId: string,
): ReportInternal | null {
  const db = readDb();
  const index = db.reports.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const report = fromDb(db.reports[index]);
  report.status = status;
  report.reviewedAt = new Date();
  report.reviewedByUserId = reviewedByUserId;

  db.reports[index] = toDb(report);
  writeDb(db);

  return report;
}

/**
 * Supprime tous les signalements liés à une annonce.
 */
export function deleteReportsByListingId(listingId: string): number {
  const db = readDb();
  const initialCount = db.reports.length;
  db.reports = db.reports.filter((r) => r.listingId !== listingId);
  writeDb(db);
  return initialCount - db.reports.length;
}

export { toPublic as toReportPublic };

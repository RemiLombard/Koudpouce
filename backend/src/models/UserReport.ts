/**
 * Modèle UserReport (Signalement d'utilisateur).
 * Gestion des signalements d'utilisateurs par d'autres utilisateurs.
 */

import { v4 as uuidv4 } from "uuid";
import { readDb, writeDb } from "../db/fileDb";
import type { DbUserReport } from "../db/types";

/** Raisons de signalement possibles pour un utilisateur. */
export type UserReportReason =
  | "harassment"
  | "spam"
  | "scam"
  | "inappropriate"
  | "other";

/** Statut d'un signalement. */
export type UserReportStatus = "pending" | "dismissed" | "actioned";

/** Représentation interne d'un signalement d'utilisateur. */
export interface UserReportInternal {
  id: string;
  reportedUserId: string;
  reportedByUserId: string;
  conversationId: string;
  reason: UserReportReason;
  message: string | null;
  status: UserReportStatus;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewedByUserId: string | null;
}

/** Représentation publique d'un signalement d'utilisateur (pour l'admin). */
export interface UserReportPublic {
  id: string;
  reportedUserId: string;
  reportedByUserId: string;
  conversationId: string;
  reason: UserReportReason;
  message: string | null;
  status: UserReportStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
}

function fromDb(report: DbUserReport): UserReportInternal {
  return {
    id: String(report.id),
    reportedUserId: String(report.reportedUserId),
    reportedByUserId: String(report.reportedByUserId),
    conversationId: String(report.conversationId),
    reason: report.reason,
    message: report.message,
    status: report.status,
    createdAt: new Date(report.createdAt),
    reviewedAt: report.reviewedAt ? new Date(report.reviewedAt) : null,
    reviewedByUserId: report.reviewedByUserId,
  };
}

function toDb(report: UserReportInternal): DbUserReport {
  return {
    id: report.id,
    reportedUserId: report.reportedUserId,
    reportedByUserId: report.reportedByUserId,
    conversationId: report.conversationId,
    reason: report.reason,
    message: report.message,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    reviewedAt: report.reviewedAt ? report.reviewedAt.toISOString() : null,
    reviewedByUserId: report.reviewedByUserId,
  };
}

export function toUserReportPublic(
  report: UserReportInternal,
): UserReportPublic {
  return {
    id: report.id,
    reportedUserId: report.reportedUserId,
    reportedByUserId: report.reportedByUserId,
    conversationId: report.conversationId,
    reason: report.reason,
    message: report.message,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    reviewedAt: report.reviewedAt ? report.reviewedAt.toISOString() : null,
    reviewedByUserId: report.reviewedByUserId,
  };
}

/** Crée un nouveau signalement d'utilisateur. */
export function createUserReport(data: {
  reportedUserId: string;
  reportedByUserId: string;
  conversationId: string;
  reason: UserReportReason;
  message: string | null;
}): UserReportInternal {
  const db = readDb();

  const report: UserReportInternal = {
    id: uuidv4(),
    reportedUserId: data.reportedUserId,
    reportedByUserId: data.reportedByUserId,
    conversationId: data.conversationId,
    reason: data.reason,
    message: data.message,
    status: "pending",
    createdAt: new Date(),
    reviewedAt: null,
    reviewedByUserId: null,
  };

  db.userReports.push(toDb(report));
  writeDb(db);

  return report;
}

/** Récupère un signalement par son ID. */
export function getUserReportById(id: string): UserReportInternal | null {
  const db = readDb();
  const found = db.userReports.find((r) => r.id === id);
  return found ? fromDb(found) : null;
}

/** Récupère tous les signalements d'utilisateurs (filtrage optionnel par statut). */
export function findUserReports(
  status?: UserReportStatus | "all",
): UserReportInternal[] {
  const db = readDb();
  let reports = db.userReports.map(fromDb);

  if (status && status !== "all") {
    reports = reports.filter((r) => r.status === status);
  }

  // Tri par date de création (plus récent en premier)
  reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return reports;
}

/** Compte les signalements d'utilisateurs en attente. */
export function countPendingUserReports(): number {
  const db = readDb();
  return db.userReports.filter((r) => r.status === "pending").length;
}

/** Vérifie si un utilisateur a déjà signalé un autre utilisateur dans une conversation. */
export function hasUserReportedUserInConversation(
  reporterId: string,
  reportedUserId: string,
  conversationId: string,
): boolean {
  const db = readDb();
  return db.userReports.some(
    (r) =>
      r.reportedByUserId === reporterId &&
      r.reportedUserId === reportedUserId &&
      r.conversationId === conversationId,
  );
}

/** Met à jour le statut d'un signalement. */
export function updateUserReportStatus(
  id: string,
  status: UserReportStatus,
  reviewedByUserId: string,
): UserReportInternal | null {
  const db = readDb();
  const index = db.userReports.findIndex((r) => r.id === id);

  if (index === -1) return null;

  db.userReports[index].status = status;
  db.userReports[index].reviewedAt = new Date().toISOString();
  db.userReports[index].reviewedByUserId = reviewedByUserId;

  writeDb(db);

  return fromDb(db.userReports[index]);
}

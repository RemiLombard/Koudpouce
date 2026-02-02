/**
 * Modèle User (stockage en mémoire pour le MVP).
 * À remplacer par une vraie base de données ultérieurement.
 *
 * Règles contractuelles :
 * - passwordHash n'est JAMAIS exposé via l'API.
 * - email doit être unique.
 */

import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import type { UserPublic } from "../types";
import { readDb, writeDb } from "../db/fileDb";

/** Rôle utilisateur. */
export type UserRole = "user" | "admin";

/** Représentation interne d'un utilisateur (avec mot de passe hashé). */
export interface UserInternal {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

function fromDb(user: any): UserInternal {
  return {
    id: String(user.id),
    email: String(user.email),
    passwordHash: String(user.passwordHash),
    displayName: String(user.displayName),
    role: user.role === "admin" ? "admin" : "user",
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

function toDb(user: UserInternal) {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Crée un nouvel utilisateur.
 * @returns l'utilisateur créé (sans passwordHash) ou null si email déjà utilisé.
 */
export async function createUser(
  email: string,
  password: string,
  displayName: string,
): Promise<UserPublic | null> {
  const normalizedEmail = email.toLowerCase().trim();

  const passwordHash = await bcrypt.hash(password, 10);

  const id = uuidv4();
  const now = new Date();

  const user: UserInternal = {
    id,
    email: normalizedEmail,
    passwordHash,
    displayName: displayName.trim(),
    role: "user",
    createdAt: now,
    updatedAt: now,
  };

  const db = readDb();

  // Vérifier unicité email (persistée)
  const exists = db.users.some((u) => String(u.email) === normalizedEmail);
  if (exists) {
    return null;
  }

  db.users.push(toDb(user));
  writeDb(db);

  return toPublic(user);
}

/**
 * Recherche un utilisateur par email et vérifie le mot de passe.
 * @returns l'utilisateur (public) si credentials valides, sinon null.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<UserPublic | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = readDb();
  const raw = db.users.find((u) => String(u.email) === normalizedEmail);
  if (!raw) return null;

  const user = fromDb(raw);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return toPublic(user);
}

/**
 * Récupère un utilisateur par son ID.
 */
export function getUserById(id: string): UserPublic | null {
  const db = readDb();
  const raw = db.users.find((u) => String(u.id) === id);
  if (!raw) return null;
  return toPublic(fromDb(raw));
}

/**
 * Met à jour les informations d'un utilisateur.
 * @returns l'utilisateur mis à jour ou null si non trouvé.
 */
export async function updateUser(
  userId: string,
  updates: {
    displayName?: string;
    email?: string;
    password?: string;
  },
): Promise<UserPublic | null> {
  const db = readDb();
  const userIndex = db.users.findIndex((u) => String(u.id) === userId);
  if (userIndex === -1) return null;

  const user = db.users[userIndex];

  // Mettre à jour le nom
  if (updates.displayName !== undefined) {
    user.displayName = updates.displayName.trim();
  }

  // Mettre à jour l'email (vérifier unicité)
  if (updates.email !== undefined) {
    const normalizedEmail = updates.email.toLowerCase().trim();
    const emailExists = db.users.some(
      (u, idx) => idx !== userIndex && String(u.email) === normalizedEmail,
    );
    if (emailExists) {
      return null; // Email déjà utilisé
    }
    user.email = normalizedEmail;
  }

  // Mettre à jour le mot de passe
  if (updates.password !== undefined) {
    user.passwordHash = await bcrypt.hash(updates.password, 10);
  }

  user.updatedAt = new Date().toISOString();
  writeDb(db);

  return toPublic(fromDb(user));
}

/**
 * Convertit un utilisateur interne en représentation publique.
 */
function toPublic(user: UserInternal): UserPublic {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Incrémente le compteur de sanctions d'un utilisateur.
 * @returns Le nouveau nombre de sanctions, ou null si l'utilisateur n'existe pas.
 */
export function incrementUserSanctionCount(userId: string): number | null {
  const db = readDb();
  const userIndex = db.users.findIndex((u) => String(u.id) === userId);
  if (userIndex === -1) return null;

  const currentCount = db.users[userIndex].sanctionCount || 0;
  db.users[userIndex].sanctionCount = currentCount + 1;
  db.users[userIndex].updatedAt = new Date().toISOString();
  writeDb(db);

  return db.users[userIndex].sanctionCount!;
}

/**
 * Récupère le nombre de sanctions d'un utilisateur.
 */
export function getUserSanctionCount(userId: string): number {
  const db = readDb();
  const user = db.users.find((u) => String(u.id) === userId);
  return user?.sanctionCount || 0;
}

/**
 * Supprime un utilisateur et toutes ses données associées.
 * - Ses annonces
 * - Les signalements sur ses annonces
 * - Ses conversations (en tant qu'auteur ou contacteur)
 * - Ses messages
 * - Ses signalements créés (reports et userReports)
 * - Les signalements le concernant (userReports)
 * @returns true si l'utilisateur a été supprimé, false sinon.
 */
export function deleteUser(userId: string): boolean {
  const db = readDb();
  const userIndex = db.users.findIndex((u) => String(u.id) === userId);
  if (userIndex === -1) return false;

  // 1. Récupérer les IDs des annonces de l'utilisateur
  const userListingIds = db.listings
    .filter((listing) => listing.createdByUserId === userId)
    .map((listing) => listing.id);

  // 2. Supprimer les signalements sur les annonces de l'utilisateur
  db.reports = db.reports.filter(
    (report) =>
      !userListingIds.includes(report.listingId) &&
      report.reportedByUserId !== userId,
  );

  // 3. Supprimer les annonces de l'utilisateur
  db.listings = db.listings.filter(
    (listing) => listing.createdByUserId !== userId,
  );

  // 4. Récupérer les IDs des conversations à supprimer
  const conversationsToDelete = db.conversations.filter(
    (conv) => conv.listingAuthorId === userId || conv.contacterId === userId,
  );
  const conversationIds = conversationsToDelete.map((conv) => conv.id);

  // 5. Supprimer les messages de ces conversations
  db.messages = db.messages.filter(
    (msg) => !conversationIds.includes(msg.conversationId),
  );

  // 6. Supprimer les conversations
  db.conversations = db.conversations.filter(
    (conv) => conv.listingAuthorId !== userId && conv.contacterId !== userId,
  );

  // 7. Supprimer les signalements d'utilisateurs créés par ou concernant l'utilisateur
  db.userReports = db.userReports.filter(
    (report) =>
      report.reportedByUserId !== userId && report.reportedUserId !== userId,
  );

  // 8. Supprimer l'utilisateur
  db.users.splice(userIndex, 1);

  writeDb(db);

  return true;
}

/**
 * Trouve ou crée un utilisateur à partir de son compte Google.
 * Si l'email existe déjà, retourne l'utilisateur existant.
 * Sinon, crée un nouvel utilisateur sans mot de passe (googleId stocké).
 */
export function findOrCreateGoogleUser(
  googleId: string,
  email: string,
  displayName: string,
): UserPublic {
  const normalizedEmail = email.toLowerCase().trim();
  const db = readDb();

  // Chercher par googleId d'abord
  let existingUser = db.users.find((u) => u.googleId === googleId);

  // Sinon chercher par email
  if (!existingUser) {
    existingUser = db.users.find((u) => String(u.email) === normalizedEmail);
  }

  if (existingUser) {
    // Mettre à jour le googleId si pas encore défini
    if (!existingUser.googleId) {
      existingUser.googleId = googleId;
      existingUser.updatedAt = new Date().toISOString();
      writeDb(db);
    }
    return toPublic(fromDb(existingUser));
  }

  // Créer un nouvel utilisateur
  const id = uuidv4();
  const now = new Date();

  const newUser = {
    id,
    email: normalizedEmail,
    passwordHash: "", // Pas de mot de passe pour les comptes Google
    displayName: displayName.trim() || email.split("@")[0],
    role: "user" as const,
    googleId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);

  return toPublic(fromDb(newUser));
}

/**
 * Trouve un utilisateur par son googleId.
 */
export function getUserByGoogleId(googleId: string): UserPublic | null {
  const db = readDb();
  const raw = db.users.find((u) => u.googleId === googleId);
  if (!raw) return null;
  return toPublic(fromDb(raw));
}

/**
 * Types partagés du backend (extensions Express, etc.).
 */

import type { Session } from "express-session";

/**
 * Extension de la session Express pour stocker l'ID utilisateur connecté.
 */
export interface AppSession extends Session {
  userId?: string;
}

/** Rôle utilisateur. */
export type UserRole = "user" | "admin";

/**
 * Représentation publique d'un utilisateur (exposée via API).
 * Ne contient JAMAIS le mot de passe.
 */
export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

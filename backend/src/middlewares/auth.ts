/**
 * Middleware d'authentification.
 * Vérifie que l'utilisateur est connecté (session valide).
 */

import type { Request, Response, NextFunction } from "express";
import type { AppSession } from "../types";
import { getUserById } from "../models/User";

/**
 * Middleware qui bloque les requêtes non authentifiées.
 * Retourne 401 Unauthorized si pas de session utilisateur.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const session = req.session as AppSession;

  if (!session.userId) {
    res
      .status(401)
      .json({ error: "Vous devez être connecté pour effectuer cette action." });
    return;
  }

  next();
}

/**
 * Middleware qui vérifie que l'utilisateur est un administrateur.
 * Doit être utilisé après requireAuth.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const session = req.session as AppSession;

  if (!session.userId) {
    res.status(401).json({ error: "Vous devez être connecté." });
    return;
  }

  const user = getUserById(session.userId);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Accès réservé aux administrateurs." });
    return;
  }

  next();
}

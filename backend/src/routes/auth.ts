/**
 * Routes d'authentification (auth).
 * Endpoints : POST /register, POST /login, POST /logout, GET /me
 *             GET /google, GET /google/callback (OAuth Google)
 * Auth par cookie HttpOnly (express-session).
 *
 * Conforme au contrat API validé en phase 3.
 */

import { Router } from "express";
import type { Request, Response } from "express";
import type { AppSession } from "../types";
import {
  createUser,
  verifyCredentials,
  getUserById,
  findOrCreateGoogleUser,
  updateUser,
  deleteUser,
} from "../models/User";
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
} from "../utils/validation";
import { requireAuth } from "../middlewares/auth";
import { config } from "../config";

const router = Router();

/**
 * POST /api/auth/register
 * Crée un nouveau compte utilisateur.
 * Body : { email, password, displayName }
 * Réponses : 201 Created, 400 Bad Request, 409 Conflict
 */
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  // Validation
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    res.status(400).json({ error: emailCheck.message });
    return;
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    res.status(400).json({ error: passwordCheck.message });
    return;
  }

  const displayNameCheck = validateDisplayName(displayName);
  if (!displayNameCheck.valid) {
    res.status(400).json({ error: displayNameCheck.message });
    return;
  }

  // Création
  const user = await createUser(email, password, displayName);

  if (!user) {
    res.status(409).json({ error: "Cette adresse email est déjà utilisée." });
    return;
  }

  // Ouvrir session
  const session = req.session as AppSession;
  session.userId = user.id;

  res.status(201).json({ user });
});

/**
 * POST /api/auth/login
 * Connecte un utilisateur existant.
 * Body : { email, password }
 * Réponses : 200 OK, 401 Unauthorized
 */
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validation basique (évite crash)
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(401).json({ error: "Email ou mot de passe invalide." });
    return;
  }

  const user = await verifyCredentials(email, password);

  if (!user) {
    res.status(401).json({ error: "Email ou mot de passe invalide." });
    return;
  }

  // Ouvrir session
  const session = req.session as AppSession;
  session.userId = user.id;

  res.status(200).json({ user });
});

/**
 * POST /api/auth/logout
 * Ferme la session de l'utilisateur connecté.
 * Réponses : 204 No Content
 */
router.post("/logout", requireAuth, (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Erreur lors de la déconnexion." });
      return;
    }
    res.clearCookie("koudpouce.sid");
    res.status(204).send();
  });
});

/**
 * GET /api/auth/me
 * Retourne les informations de l'utilisateur connecté.
 * Réponses : 200 OK, 401 Unauthorized
 */
router.get("/me", requireAuth, (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const user = getUserById(session.userId!);

  if (!user) {
    res.status(401).json({ error: "Session invalide." });
    return;
  }

  res.status(200).json({ user });
});

/**
 * PATCH /api/auth/me
 * Met à jour les informations de l'utilisateur connecté.
 * Body : { displayName?, email?, password? }
 * Réponses : 200 OK, 400 Bad Request, 401 Unauthorized
 */
router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;

  const { displayName, email, password } = req.body;

  // Validation des champs fournis
  if (displayName !== undefined) {
    const check = validateDisplayName(displayName);
    if (!check.valid) {
      res.status(400).json({ error: check.message });
      return;
    }
  }

  if (email !== undefined) {
    const check = validateEmail(email);
    if (!check.valid) {
      res.status(400).json({ error: check.message });
      return;
    }
  }

  if (password !== undefined) {
    const check = validatePassword(password);
    if (!check.valid) {
      res.status(400).json({ error: check.message });
      return;
    }
  }

  const updatedUser = await updateUser(userId, {
    displayName,
    email,
    password,
  });

  if (!updatedUser) {
    res.status(400).json({ error: "Cette adresse email est déjà utilisée." });
    return;
  }

  res.status(200).json({ user: updatedUser });
});

/**
 * DELETE /api/auth/me
 * Supprime le compte de l'utilisateur connecté.
 * Réponses : 204 No Content, 401 Unauthorized
 */
router.delete("/me", requireAuth, (req: Request, res: Response) => {
  const session = req.session as AppSession;
  const userId = session.userId!;

  const deleted = deleteUser(userId);

  if (!deleted) {
    res.status(500).json({ error: "Erreur lors de la suppression du compte." });
    return;
  }

  // Détruire la session
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la destruction de la session:", err);
    }
    res.clearCookie("koudpouce.sid");
    res.status(204).send();
  });
});

/**
 * GET /api/auth/google
 * Redirige vers la page d'authentification Google.
 */
router.get("/google", (_req: Request, res: Response) => {
  const { clientId, redirectUri } = config.google;

  if (!clientId) {
    res.status(500).json({ error: "Configuration Google OAuth manquante." });
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Callback OAuth Google. Échange le code contre un token et crée/connecte l'utilisateur.
 */
router.get("/google/callback", async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    res.redirect(`${config.frontendOrigin}/auth/login?error=google_failed`);
    return;
  }

  try {
    const { clientId, clientSecret, redirectUri } = config.google;

    // Échanger le code contre un access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Erreur token Google:", await tokenResponse.text());
      res.redirect(`${config.frontendOrigin}/auth/login?error=google_failed`);
      return;
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };
    const accessToken = tokenData.access_token;

    // Récupérer les infos de l'utilisateur
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!userInfoResponse.ok) {
      console.error("Erreur userinfo Google:", await userInfoResponse.text());
      res.redirect(`${config.frontendOrigin}/auth/login?error=google_failed`);
      return;
    }

    const googleUser = (await userInfoResponse.json()) as {
      id: string;
      email: string;
      name: string;
      picture?: string;
    };

    // Trouver ou créer l'utilisateur
    const user = findOrCreateGoogleUser(
      googleUser.id,
      googleUser.email,
      googleUser.name,
    );

    // Ouvrir la session
    const session = req.session as AppSession;
    session.userId = user.id;

    // Rediriger vers le frontend
    res.redirect(`${config.frontendOrigin}/?google_auth=success`);
  } catch (err) {
    console.error("Erreur OAuth Google:", err);
    res.redirect(`${config.frontendOrigin}/auth/login?error=google_failed`);
  }
});

export default router;

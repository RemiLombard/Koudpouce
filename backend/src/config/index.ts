/**
 * Configuration centrale du backend.
 * Les valeurs sensibles doivent être définies via variables d'environnement.
 */

export const config = {
  /** Port d'écoute du serveur Express */
  port: Number(process.env.PORT ?? 3001),

  /** Origin autorisée pour le frontend (CORS) */
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",

  /** Clé secrète pour signer les sessions (cookie HttpOnly) */
  sessionSecret: process.env.SESSION_SECRET ?? "koudpouce-dev-secret-change-me",

  /** Durée de vie du cookie de session (en ms) — 7 jours par défaut */
  sessionMaxAge: 7 * 24 * 60 * 60 * 1000,

  /** Nom du cookie de session */
  sessionCookieName: "koudpouce.sid",

  /** Google OAuth */
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ??
      "http://localhost:3001/api/auth/google/callback",
  },
};

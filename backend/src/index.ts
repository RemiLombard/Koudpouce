// Point d'entrée du serveur backend Express
// Gère l'authentification par cookie HttpOnly pour la sécurité

import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth";
import serviceTypesRoutes from "./routes/serviceTypes";
import listingsRoutes from "./routes/listings";
import conversationsRoutes from "./routes/conversations";
import reportsRoutes from "./routes/reports";
import userReportsRoutes from "./routes/userReports";

const app = express();

// Middleware pour parser le JSON et les cookies
app.use(express.json());
app.use(cookieParser());

// Configuration CORS pour autoriser les requêtes du frontend
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin === config.frontendOrigin) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

// Configuration de la session (cookie HttpOnly)
app.use(
  session({
    name: config.sessionCookieName,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: config.sessionMaxAge,
      sameSite: "lax",
    },
  }),
);

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/service-types", serviceTypesRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/user-reports", userReportsRoutes);

// Démarrage du serveur
app.listen(config.port, () => {
  console.log(`[backend] listening on http://localhost:${config.port}`);
});

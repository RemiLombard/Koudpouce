// Point d'entrée du serveur backend Express
// Utilise Supabase pour la base de données et l'authentification

import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config";

// Routes Supabase
import authRoutes from "./routes/authSupabase";
import serviceTypesRoutes from "./routes/serviceTypes";
import listingsRoutes from "./routes/listingsSupabase";
import conversationsRoutes from "./routes/conversationsSupabase";
import reportsRoutes from "./routes/reportsSupabase";
import userReportsRoutes from "./routes/userReportsSupabase";

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

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/service-types", serviceTypesRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/user-reports", userReportsRoutes);

// Gestion des erreurs globales
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Démarrage du serveur
app.listen(config.port, () => {
  console.log(`[backend] listening on http://localhost:${config.port}`);
  console.log(`[backend] using Supabase for database`);
});

/**
 * Routes des types de service.
 * Endpoint : GET /api/service-types
 */

import { Router } from "express";
import { SERVICE_TYPES } from "../models/ServiceType";

const router = Router();

/**
 * GET /api/service-types
 * Retourne la liste des types de service disponibles.
 * Accès : public
 */
router.get("/", (_req, res) => {
  res.status(200).json({ serviceTypes: SERVICE_TYPES });
});

export default router;

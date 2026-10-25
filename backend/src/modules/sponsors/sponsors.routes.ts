import { Router } from "express";

import {
  createSponsorController,
  deleteSponsorController,
  getSponsorByIdController,
  getSponsorBySlugController,
  listSponsorsController,
  listSponsorsForAdminController,
  updateSponsorController,
  updateSponsorStatusController,
} from "./sponsors.controller.js";

import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";

export const sponsorsRouter = Router();

// Public routes
sponsorsRouter.get("/", listSponsorsController);
sponsorsRouter.get("/slug/:slug", getSponsorBySlugController);

// Administrative routes
sponsorsRouter.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  listSponsorsForAdminController,
);

sponsorsRouter.get(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  getSponsorByIdController,
);

sponsorsRouter.post(
  "/",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  createSponsorController,
);

sponsorsRouter.patch(
  "/:id",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateSponsorController,
);

sponsorsRouter.patch(
  "/:id/status",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateSponsorStatusController,
);

sponsorsRouter.delete(
  "/:id",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  deleteSponsorController,
);
import { Router } from "express";

import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";

import {
  assignFactionController,
  createFactionController,
  factionMembersController,
  getFactionController,
  listFactionsController,
  myFactionController,
  updateFactionController,
  updateFactionStatusController,
} from "./factions.controller.js";

export const factionsRouter = Router();

// Public routes
factionsRouter.get("/", listFactionsController);
factionsRouter.get("/:factionId", getFactionController);
factionsRouter.get("/:factionId/members", factionMembersController);

// Authenticated user routes
factionsRouter.get("/me", requireAuth, myFactionController);

// Administrative routes
factionsRouter.post(
  "/",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  createFactionController,
);

factionsRouter.patch(
  "/:factionId",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateFactionController,
);

factionsRouter.patch(
  "/:factionId/status",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateFactionStatusController,
);
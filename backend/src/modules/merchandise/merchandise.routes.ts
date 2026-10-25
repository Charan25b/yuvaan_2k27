import { Router } from "express";

import {
  listPublicMerchandiseController,
  getPublicMerchandiseController,
  listMerchandiseForAdminController,
  getMerchandiseForAdminController,
  createMerchandiseController,
  updateMerchandiseController,
  updateMerchandiseVisibilityController,
  deleteMerchandiseController,
} from "./merchandise.controller.js";

// Match these imports to your existing auth module if the paths differ.
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";

export const merchandiseRouter = Router();

// Public routes
merchandiseRouter.get("/", listPublicMerchandiseController);

// Admin routes must be registered before the public "/:slug" route.
merchandiseRouter.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  listMerchandiseForAdminController,
);

merchandiseRouter.get(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  getMerchandiseForAdminController,
);

merchandiseRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  createMerchandiseController,
);

merchandiseRouter.patch(
  "/:id/visibility",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  updateMerchandiseVisibilityController,
);

merchandiseRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  updateMerchandiseController,
);

merchandiseRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  deleteMerchandiseController,
);

// Public detail route
merchandiseRouter.get("/:slug", getPublicMerchandiseController);
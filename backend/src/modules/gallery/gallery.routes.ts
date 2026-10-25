import { Router } from "express";

import {
  listPublicGalleryController,
  getPublicGalleryImageController,
  listGalleryForAdminController,
  createGalleryImageController,
  updateGalleryImageController,
  updateGalleryVisibilityController,
  deleteGalleryImageController,
} from "./gallery.controller.js";

// Keep these consistent with your existing authentication module.
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";

export const galleryRouter = Router();

// Public routes
galleryRouter.get("/", listPublicGalleryController);

// Admin routes must precede the "/:id" route.
galleryRouter.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  listGalleryForAdminController,
);

galleryRouter.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  createGalleryImageController,
);

galleryRouter.patch(
  "/:id/visibility",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  updateGalleryVisibilityController,
);

galleryRouter.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  updateGalleryImageController,
);

galleryRouter.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  deleteGalleryImageController,
);

// Public detail route
galleryRouter.get("/:id", getPublicGalleryImageController);
import { Router } from "express";

import {
  createAnnouncementController,
  deleteAnnouncementController,
  getAnnouncementForAdminController,
  getPublicAnnouncementController,
  listAnnouncementsForAdminController,
  listPublicAnnouncementsController,
  updateAnnouncementController,
  updateAnnouncementPublicationController,
} from "./announcements.controller.js";

import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";

export const announcementsRouter = Router();

// Public routes
announcementsRouter.get("/", listPublicAnnouncementsController);

// Admin routes
announcementsRouter.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  listAnnouncementsForAdminController,
);

announcementsRouter.get(
  "/admin/:id",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  getAnnouncementForAdminController,
);

announcementsRouter.post(
  "/",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  createAnnouncementController,
);

announcementsRouter.patch(
  "/:id/publication",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateAnnouncementPublicationController,
);

announcementsRouter.patch(
  "/:id",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateAnnouncementController,
);

announcementsRouter.delete(
  "/:id",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  deleteAnnouncementController,
);

// Public detail route
announcementsRouter.get(
  "/slug/:slug",
  getPublicAnnouncementController,
);
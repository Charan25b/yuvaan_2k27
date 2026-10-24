import { Router } from "express";

import {
  createCategoryController,
  getCategoryController,
  listCategoriesController,
  updateCategoryController,
  updateCategoryStatusController,
} from "./event-categories.controller.js";

import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";

export const eventCategoriesRouter = Router();

// Public routes
eventCategoriesRouter.get("/", listCategoriesController);
eventCategoriesRouter.get("/:id", getCategoryController);

// Administrative routes
eventCategoriesRouter.post(
  "/",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  createCategoryController,
);

eventCategoriesRouter.patch(
  "/:id",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateCategoryController,
);

eventCategoriesRouter.patch(
  "/:id/status",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateCategoryStatusController,
);
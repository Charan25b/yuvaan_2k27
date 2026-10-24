import { Router } from "express";

import {
  createEventController,
  getEventController,
  listEventsController,
  updateEventController,
  updateEventStatusController,
} from "./events.controller.js";

import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";

export const eventsRouter = Router();

// Public routes
eventsRouter.get("/", listEventsController);
eventsRouter.get("/:slug", getEventController);

// Administrative routes
eventsRouter.post(
  "/",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  createEventController,
);

eventsRouter.patch(
  "/:eventId",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateEventController,
);

eventsRouter.patch(
  "/:eventId/status",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateEventStatusController,
);
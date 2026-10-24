import { Router } from "express";

import {
  listEventRegistrationsController,
  listMyRegistrationsController,
  registerForEventController,
  updateRegistrationAttendanceController,
} from "./event-registrations.controller.js";

import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";

export const eventRegistrationsRouter = Router();

// A user registers for an event.
// Authentication and CSRF protection are required.
eventRegistrationsRouter.post(
  "/events/:eventId/registrations",
  requireAuth,
  csrfProtection,
  registerForEventController,
);

// A user views their own registrations.
eventRegistrationsRouter.get(
  "/event-registrations/me",
  requireAuth,
  listMyRegistrationsController,
);

// Administrators view participants for an event.
eventRegistrationsRouter.get(
  "/events/:eventId/registrations",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN"),
  listEventRegistrationsController,
);

// Administrators manage attendance.
eventRegistrationsRouter.patch(
  "/event-registrations/:registrationId/attendance",
  requireAuth,
  csrfProtection,
  requireRole("ADMIN", "SUPERADMIN"),
  updateRegistrationAttendanceController,
);
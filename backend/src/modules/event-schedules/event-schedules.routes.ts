import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../auth/authorization.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";
import { createEventScheduleController, deleteEventScheduleController, listAdminEventSchedulesController, listEventSchedulesController, reorderEventSchedulesController, updateEventScheduleController } from "./event-schedules.controller.js";

export const eventSchedulesRouter = Router();
const admin = [requireAuth, csrfProtection, requireRole("ADMIN", "SUPERADMIN")];

// Public schedule is visible only for published events in active categories.
eventSchedulesRouter.get("/events/:eventId/schedule", listEventSchedulesController);
// Admin schedule listing also supports draft/unpublished events.
eventSchedulesRouter.get("/admin/events/:eventId/schedule", requireAuth, requireRole("ADMIN", "SUPERADMIN"), listAdminEventSchedulesController);
eventSchedulesRouter.post("/events/:eventId/schedule", ...admin, createEventScheduleController);
eventSchedulesRouter.patch("/event-schedules/:scheduleId", ...admin, updateEventScheduleController);
eventSchedulesRouter.delete("/event-schedules/:scheduleId", ...admin, deleteEventScheduleController);
eventSchedulesRouter.patch("/events/:eventId/schedule/order", ...admin, reorderEventSchedulesController);

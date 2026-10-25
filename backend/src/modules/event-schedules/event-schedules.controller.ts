import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { createScheduleSchema, eventIdParamSchema, reorderSchedulesSchema, scheduleIdParamSchema, updateScheduleSchema } from "./event-schedules.schemas.js";
import { createEventSchedule, deleteEventSchedule, EventScheduleServiceError, listEventSchedules, reorderEventSchedules, updateEventSchedule } from "./event-schedules.service.js";

function handleError(error: unknown, res: Response, next: NextFunction): void {
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "The request contains invalid data.", details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) } });
    return;
  }
  if (error instanceof EventScheduleServiceError) {
    const status = error.code === "EVENT_NOT_FOUND" || error.code === "SCHEDULE_NOT_FOUND" ? 404 : 400;
    res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
    return;
  }
  next(error);
}

export async function listEventSchedulesController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const schedules = await listEventSchedules(eventId, true);
    res.status(200).json({ success: true, data: schedules });
  } catch (error) { handleError(error, res, next); }
}

export async function listAdminEventSchedulesController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const schedules = await listEventSchedules(eventId, false);
    res.status(200).json({ success: true, data: schedules });
  } catch (error) { handleError(error, res, next); }
}

export async function createEventScheduleController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const input = createScheduleSchema.parse(req.body);
    const schedule = await createEventSchedule(eventId, input);
    res.status(201).json({ success: true, data: schedule });
  } catch (error) { handleError(error, res, next); }
}

export async function updateEventScheduleController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { scheduleId } = scheduleIdParamSchema.parse(req.params);
    const input = updateScheduleSchema.parse(req.body);
    if (Object.keys(input).length === 0) {
      res.status(400).json({ success: false, error: { code: "EMPTY_UPDATE", message: "Provide at least one field to update." } });
      return;
    }
    const schedule = await updateEventSchedule(scheduleId, input);
    res.status(200).json({ success: true, data: schedule });
  } catch (error) { handleError(error, res, next); }
}

export async function deleteEventScheduleController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { scheduleId } = scheduleIdParamSchema.parse(req.params);
    const result = await deleteEventSchedule(scheduleId);
    res.status(200).json({ success: true, data: result });
  } catch (error) { handleError(error, res, next); }
}

export async function reorderEventSchedulesController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const input = reorderSchedulesSchema.parse(req.body);
    const schedules = await reorderEventSchedules(eventId, input);
    res.status(200).json({ success: true, data: schedules });
  } catch (error) { handleError(error, res, next); }
}

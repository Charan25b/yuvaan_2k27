import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import {
  eventIdParamSchema,
  listRegistrationsQuerySchema,
  registrationIdParamSchema,
  updateAttendanceSchema,
} from "./event-registrations.schemas.js";

import {
  EventRegistrationServiceError,
  listEventRegistrations,
  listMyRegistrations,
  registerForEvent,
  updateRegistrationAttendance,
} from "./event-registrations.service.js";

function handleError(
  error: unknown,
  res: Response,
  next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "The request contains invalid data.",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof EventRegistrationServiceError) {
    const status =
      error.code === "EVENT_NOT_FOUND" ||
      error.code === "REGISTRATION_NOT_FOUND"
        ? 404
        : error.code === "ALREADY_REGISTERED" ||
            error.code === "EVENT_FULL"
          ? 409
          : error.code === "EVENT_NOT_AVAILABLE"
            ? 404
            : 400;

    res.status(status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  next(error);
}

export async function registerForEventController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);

    // requireAuth must run before this controller.
    const userId = req.authUser!.id;

    const registration = await registerForEvent(userId, eventId);

    res.status(201).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function listMyRegistrationsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listRegistrationsQuerySchema.parse(req.query);
    const userId = req.authUser!.id;

    const result = await listMyRegistrations(userId, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function listEventRegistrationsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const query = listRegistrationsQuerySchema.parse(req.query);

    const result = await listEventRegistrations(eventId, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateRegistrationAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { registrationId } = registrationIdParamSchema.parse(req.params);
    const input = updateAttendanceSchema.parse(req.body);

    const registration = await updateRegistrationAttendance(
      registrationId,
      input,
    );

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}
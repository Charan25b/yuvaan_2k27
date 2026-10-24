import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
  createEventSchema,
  eventIdParamSchema,
  eventSlugParamSchema,
  listEventsQuerySchema,
  updateEventSchema,
  updateEventStatusSchema,
} from "./events.schemas.js";

import {
  createEvent,
  EventServiceError,
  getEventBySlug,
  listEvents,
  updateEvent,
  updateEventStatus,
} from "./events.services.js";

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

  if (error instanceof EventServiceError) {
    const serviceError = error as EventServiceError;
    const status =
      serviceError.code === "EVENT_NOT_FOUND"
        ? 404
        : serviceError.code === "EVENT_SLUG_CONFLICT"
          ? 409
          : 400;

    res.status(status).json({
      success: false,
      error: {
        code: serviceError.code,
        message: serviceError.message,
      },
    });
    return;
  }

  next(error);
}

export async function listEventsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listEventsQuerySchema.parse(req.query);
    const result = await listEvents(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function getEventController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { slug } = eventSlugParamSchema.parse(req.params);
    const event = await getEventBySlug(slug);

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function createEventController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createEventSchema.parse(req.body);
    const event = await createEvent(input);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateEventController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const input = updateEventSchema.parse(req.body);

    const event = await updateEvent(eventId, input);

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateEventStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { eventId } = eventIdParamSchema.parse(req.params);
    const { status } = updateEventStatusSchema.parse(req.body);

    const event = await updateEventStatus(eventId, status);

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}
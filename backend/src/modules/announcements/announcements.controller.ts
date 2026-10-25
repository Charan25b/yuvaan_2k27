import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import {
  announcementIdParamSchema,
  announcementSlugParamSchema,
  createAnnouncementSchema,
  listAnnouncementsQuerySchema,
  updateAnnouncementPublicationSchema,
  updateAnnouncementSchema,
} from "./announcements.schemas.js";

import {
  AnnouncementServiceError,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getPublicAnnouncementBySlug,
  listAnnouncementsForAdmin,
  listPublicAnnouncements,
  updateAnnouncement,
  updateAnnouncementPublication,
} from "./announcements.service.js";

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

  if (error instanceof AnnouncementServiceError) {
    const status =
      error.code === "ANNOUNCEMENT_NOT_FOUND"
        ? 404
        : error.code === "ANNOUNCEMENT_CONFLICT"
          ? 409
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

export async function listPublicAnnouncementsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listAnnouncementsQuerySchema.parse(req.query);
    const data = await listPublicAnnouncements(query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function getPublicAnnouncementController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { slug } = announcementSlugParamSchema.parse(req.params);
    const data = await getPublicAnnouncementBySlug(slug);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function listAnnouncementsForAdminController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const query = listAnnouncementsQuerySchema.parse(req.query);
    const data = await listAnnouncementsForAdmin(query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function getAnnouncementForAdminController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = announcementIdParamSchema.parse(req.params);
    const data = await getAnnouncementById(id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function createAnnouncementController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createAnnouncementSchema.parse(req.body);
    const user = req.authUser;

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Please log in to continue.",
        },
      });
      return;
    }

    const data = await createAnnouncement(input, user.id);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateAnnouncementController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = announcementIdParamSchema.parse(req.params);
    const input = updateAnnouncementSchema.parse(req.body);
    const data = await updateAnnouncement(id, input);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateAnnouncementPublicationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = announcementIdParamSchema.parse(req.params);
    const input = updateAnnouncementPublicationSchema.parse(req.body);
    const data = await updateAnnouncementPublication(id, input);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function deleteAnnouncementController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = announcementIdParamSchema.parse(req.params);

    await deleteAnnouncement(id);

    res.status(200).json({
      success: true,
      data: {
        message: "Announcement deleted successfully.",
      },
    });
  } catch (error) {
    handleError(error, res, next);
  }
}
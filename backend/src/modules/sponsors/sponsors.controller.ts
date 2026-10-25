import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import {
  createSponsorSchema,
  sponsorIdParamSchema,
  sponsorSlugParamSchema,
  updateSponsorSchema,
  updateSponsorStatusSchema,
} from "./sponsors.schemas.js";

import {
  createSponsor,
  deleteSponsor,
  getSponsorById,
  getSponsorBySlug,
  listSponsors,
  listSponsorsForAdmin,
  SponsorServiceError,
  updateSponsor,
  updateSponsorStatus,
} from "./sponsors.service.js";

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

  if (error instanceof SponsorServiceError) {
    const status =
      error.code === "SPONSOR_NOT_FOUND"
        ? 404
        : error.code === "SPONSOR_CONFLICT"
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

export async function listSponsorsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sponsors = await listSponsors();

    res.status(200).json({
      success: true,
      data: sponsors,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function getSponsorBySlugController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { slug } = sponsorSlugParamSchema.parse(req.params);
    const sponsor = await getSponsorBySlug(slug);

    res.status(200).json({
      success: true,
      data: sponsor,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function listSponsorsForAdminController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sponsors = await listSponsorsForAdmin();

    res.status(200).json({
      success: true,
      data: sponsors,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function getSponsorByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = sponsorIdParamSchema.parse(req.params);
    const sponsor = await getSponsorById(id);

    res.status(200).json({
      success: true,
      data: sponsor,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function createSponsorController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createSponsorSchema.parse(req.body);
    const sponsor = await createSponsor(input);

    res.status(201).json({
      success: true,
      data: sponsor,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateSponsorController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = sponsorIdParamSchema.parse(req.params);
    const input = updateSponsorSchema.parse(req.body);

    const sponsor = await updateSponsor(id, input);

    res.status(200).json({
      success: true,
      data: sponsor,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateSponsorStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = sponsorIdParamSchema.parse(req.params);
    const input = updateSponsorStatusSchema.parse(req.body);

    const sponsor = await updateSponsorStatus(id, input);

    res.status(200).json({
      success: true,
      data: sponsor,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function deleteSponsorController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = sponsorIdParamSchema.parse(req.params);

    await deleteSponsor(id);

    res.status(200).json({
      success: true,
      data: {
        message: "Sponsor deleted successfully.",
      },
    });
  } catch (error) {
    handleError(error, res, next);
  }
}
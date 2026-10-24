import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
} from "./event-categories.schemas.js";

import {
  createCategory,
  EventCategoryServiceError,
  getCategoryById,
  listCategories,
  updateCategory,
  updateCategoryStatus,
} from "./event-categories.service.js";

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

  if (error instanceof EventCategoryServiceError) {
    const status =
      error.code === "CATEGORY_NOT_FOUND"
        ? 404
        : error.code === "CATEGORY_CONFLICT"
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

export async function listCategoriesController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await listCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function getCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const category = await getCategoryById(id);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function createCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = createCategorySchema.parse(req.body);
    const category = await createCategory(input);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const input = updateCategorySchema.parse(req.body);

    const category = await updateCategory(id, input);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}

export async function updateCategoryStatusController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = categoryIdParamSchema.parse(req.params);
    const input = updateCategoryStatusSchema.parse(req.body);

    const category = await updateCategoryStatus(id, input);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    handleError(error, res, next);
  }
}
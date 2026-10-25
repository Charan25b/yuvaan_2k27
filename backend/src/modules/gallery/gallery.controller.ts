import type { Request, Response, NextFunction } from "express";

import {
  createGalleryImageSchema,
  updateGalleryImageSchema,
  updateGalleryVisibilitySchema,
  galleryImageIdParamSchema,
  listGalleryQuerySchema,
} from "./gallery.schemas.js";

import {
  GalleryServiceError,
  listPublicGallery,
  getPublicGalleryImage,
  listGalleryForAdmin,
  createGalleryImage,
  updateGalleryImage,
  updateGalleryVisibility,
  deleteGalleryImage,
} from "./gallery.service.js";

function forwardError(error: unknown, next: NextFunction): void {
  if (error instanceof GalleryServiceError) {
    const statusCode =
      error.code === "GALLERY_IMAGE_NOT_FOUND" ? 404 : 400;

    next(Object.assign(error, { statusCode }));
    return;
  }

  next(error);
}

function getImageId(req: Request): string {
  const parsed = galleryImageIdParamSchema.parse({
    id: req.params.id,
  });

  return parsed.id;
}

export async function listPublicGalleryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = listGalleryQuerySchema.parse(req.query);
    const data = await listPublicGallery(query);

    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function getPublicGalleryImageController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getImageId(req);
    const data = await getPublicGalleryImage(id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function listGalleryForAdminController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = listGalleryQuerySchema.parse(req.query);
    const data = await listGalleryForAdmin(query);

    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function createGalleryImageController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = createGalleryImageSchema.parse(req.body);
    const data = await createGalleryImage(input);

    res.status(201).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function updateGalleryImageController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getImageId(req);
    const input = updateGalleryImageSchema.parse(req.body);
    const data = await updateGalleryImage(id, input);

    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function updateGalleryVisibilityController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getImageId(req);
    const { isPublished } = updateGalleryVisibilitySchema.parse(req.body);

    const data = await updateGalleryVisibility(id, isPublished);

    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function deleteGalleryImageController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getImageId(req);
    await deleteGalleryImage(id);

    res.status(204).send();
  } catch (error) {
    forwardError(error, next);
  }
}
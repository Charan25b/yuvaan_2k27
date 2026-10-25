import type { Request, Response, NextFunction } from "express";

import {
  createMerchandiseSchema,
  updateMerchandiseSchema,
  updateMerchandiseVisibilitySchema,
  merchandiseIdParamSchema,
  merchandiseSlugParamSchema,
} from "./merchandise.schemas.js";

import {
  MerchandiseServiceError,
  listPublicMerchandise,
  getPublicMerchandise,
  listMerchandiseForAdmin,
  getMerchandiseForAdmin,
  createMerchandise,
  updateMerchandise,
  updateMerchandiseVisibility,
  deleteMerchandise,
} from "./merchandise.service.js";

function forwardError(error: unknown, next: NextFunction): void {
  if (error instanceof MerchandiseServiceError) {
    const statusCode =
      error.code === "MERCHANDISE_NOT_FOUND"
        ? 404
        : error.code === "MERCHANDISE_SLUG_CONFLICT"
          ? 409
          : 400;

    next(Object.assign(error, { statusCode }));
    return;
  }

  next(error);
}

function getId(req: Request): string {
  return merchandiseIdParamSchema.parse({
    id: req.params.id,
  }).id;
}

export async function listPublicMerchandiseController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await listPublicMerchandise();
    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function getPublicMerchandiseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const slug = merchandiseSlugParamSchema.parse({
      slug: req.params.slug,
    }).slug;

    const data = await getPublicMerchandise(slug);
    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function listMerchandiseForAdminController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await listMerchandiseForAdmin();
    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function getMerchandiseForAdminController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getId(req);
    const data = await getMerchandiseForAdmin(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function createMerchandiseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = createMerchandiseSchema.parse(req.body);
    const data = await createMerchandise(input);
    res.status(201).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function updateMerchandiseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getId(req);
    const input = updateMerchandiseSchema.parse(req.body);

    const data = await updateMerchandise(id, input);
    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function updateMerchandiseVisibilityController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getId(req);
    const { isPublished } =
      updateMerchandiseVisibilitySchema.parse(req.body);

    const data = await updateMerchandiseVisibility(id, isPublished);
    res.status(200).json({ success: true, data });
  } catch (error) {
    forwardError(error, next);
  }
}

export async function deleteMerchandiseController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getId(req);
    await deleteMerchandise(id);

    res.status(204).send();
  } catch (error) {
    forwardError(error, next);
  }
}
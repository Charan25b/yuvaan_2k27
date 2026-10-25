import type { Request, Response } from "express";
import { ZodError } from "zod";

import {
  assignFactionSchema,
  createFactionSchema,
  factionIdParamSchema,
  factionMembersQuerySchema,
  listFactionsQuerySchema,
  updateFactionSchema,
  updateFactionStatusSchema,
} from "./factions.schemas.js";

import * as service from "./factions.service.js";
import { FactionServiceError } from "./factions.service.js";

function handleError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "The request is invalid.",
        details: error.issues,
      },
    });
  }

  if (error instanceof FactionServiceError) {
    const status =
      error.code === "FACTION_NOT_FOUND" ||
      error.code === "USER_NOT_FOUND"
        ? 404
        : error.code === "FACTION_CONFLICT" ||
            error.code === "FACTION_LIMIT_REACHED" ||
            error.code === "ALREADY_IN_FACTION"
          ? 409
          : 400;

    return res.status(status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  console.error(
    "Faction request failed:",
    error instanceof Error ? error.message : "Unknown error",
  );

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
}

export async function listFactionsController(
  req: Request,
  res: Response,
) {
  try {
    const query = listFactionsQuerySchema.parse(req.query);

    const factions = await service.listFactions(
      query.includeInactive === "true",
    );

    return res.json({
      success: true,
      data: factions,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function getFactionController(
  req: Request,
  res: Response,
) {
  try {
    const { factionId } = factionIdParamSchema.parse(req.params);

    return res.json({
      success: true,
      data: await service.getFactionById(factionId),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function createFactionController(
  req: Request,
  res: Response,
) {
  try {
    const input = createFactionSchema.parse(req.body);

    return res.status(201).json({
      success: true,
      data: await service.createFaction({
        name: input.name,
        slug: input.slug,
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
        ...(input.emblemUrl !== undefined
          ? { emblemUrl: input.emblemUrl }
          : {}),
      }),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function updateFactionController(
  req: Request,
  res: Response,
) {
  try {
    const { factionId } = factionIdParamSchema.parse(req.params);
    const input = updateFactionSchema.parse(req.body);

    return res.json({
      success: true,
      data: await service.updateFaction(factionId, {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.emblemUrl !== undefined && { emblemUrl: input.emblemUrl }),
      }),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function updateFactionStatusController(
  req: Request,
  res: Response,
) {
  try {
    const { factionId } = factionIdParamSchema.parse(req.params);
    const body = updateFactionStatusSchema.parse(req.body);

    return res.json({
      success: true,
      data: await service.setFactionStatus(
        factionId,
        body.isActive,
      ),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function assignFactionController(
  req: Request,
  res: Response,
) {
  try {
    const input = assignFactionSchema.parse(req.body);

    return res.status(201).json({
      success: true,
      data: await service.assignUserToFaction(
        input.userId,
        input.factionId,
      ),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function myFactionController(
  req: Request,
  res: Response,
) {
  try {
    return res.json({
      success: true,
      data: await service.getMyFaction(req.authUser!.id),
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function factionMembersController(
  req: Request,
  res: Response,
) {
  try {
    const { factionId } = factionIdParamSchema.parse(req.params);
    const query = factionMembersQuerySchema.parse(req.query);

    return res.json({
      success: true,
      data: await service.listFactionMembers(
        factionId,
        query.page,
        query.limit,
      ),
    });
  } catch (error) {
    return handleError(error, res);
  }
}
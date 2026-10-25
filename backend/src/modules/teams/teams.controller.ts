import type { Request, Response, NextFunction } from "express";

import {
  createTeamSchema,
  updateTeamSchema,
  createTeamMemberSchema,
  updateTeamMemberSchema,
  teamIdParamSchema,
  teamSlugParamSchema,
  teamMemberIdParamSchema,
} from "./teams.schemas.js";

import {
  TeamServiceError,
  listPublicTeams,
  getPublicTeam,
  listTeamsForAdmin,
  getTeamForAdmin,
  createTeam,
  updateTeam,
  deleteTeam,
  listTeamMembersForAdmin,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "./teams.service.js";

function sendError(
  error: unknown,
  next: NextFunction,
): void {
  if (error instanceof TeamServiceError) {
    const status =
      error.code === "TEAM_NOT_FOUND" ||
      error.code === "TEAM_MEMBER_NOT_FOUND"
        ? 404
        : error.code === "TEAM_SLUG_CONFLICT"
          ? 409
          : 400;

    next(Object.assign(error, { statusCode: status }));
    return;
  }

  next(error);
}

function getParam(
  value: string | string[] | undefined,
  name: string,
): string {
  if (typeof value !== "string" || value.length === 0) {
    throw Object.assign(new Error(`Invalid ${name} parameter.`), {
      statusCode: 400,
    });
  }

  return value;
}

export async function getPublicTeamsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await listPublicTeams();
    res.status(200).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function getPublicTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const slug = getParam(req.params.slug, "slug");
    teamSlugParamSchema.parse({ slug });

    const data = await getPublicTeam(slug);
    res.status(200).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function getAdminTeamsController(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await listTeamsForAdmin();
    res.status(200).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function getAdminTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getParam(req.params.id, "id");
    teamIdParamSchema.parse({ id });

    const data = await getTeamForAdmin(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function createTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = createTeamSchema.parse(req.body);
    const data = await createTeam(input);
    res.status(201).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function updateTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getParam(req.params.id, "id");
    teamIdParamSchema.parse({ id });

    const input = updateTeamSchema.parse(req.body);
    const data = await updateTeam(id, input);
    res.status(200).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function deleteTeamController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = getParam(req.params.id, "id");
    teamIdParamSchema.parse({ id });

    await deleteTeam(id);
    res.status(204).send();
  } catch (error) {
    sendError(error, next);
  }
}

export async function getAdminTeamMembersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const teamId = getParam(req.params.teamId, "teamId");
    const data = await listTeamMembersForAdmin(teamId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function createTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const teamId = getParam(req.params.teamId, "teamId");
    const input = createTeamMemberSchema.parse(req.body);
    const data = await createTeamMember(teamId, input);
    res.status(201).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function updateTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const memberId = getParam(req.params.memberId, "memberId");
    teamMemberIdParamSchema.parse({ memberId });

    const input = updateTeamMemberSchema.parse(req.body);
    const data = await updateTeamMember(memberId, input);
    res.status(200).json({ success: true, data });
  } catch (error) {
    sendError(error, next);
  }
}

export async function deleteTeamMemberController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const memberId = getParam(req.params.memberId, "memberId");
    teamMemberIdParamSchema.parse({ memberId });

    await deleteTeamMember(memberId);
    res.status(204).send();
  } catch (error) {
    sendError(error, next);
  }
}
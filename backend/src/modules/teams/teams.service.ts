import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";

import type {
  CreateTeamInput,
  UpdateTeamInput,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from "./teams.schemas.js";

export class TeamServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "TeamServiceError";
  }
}

const teamSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const memberSelect = {
  id: true,
  teamId: true,
  name: true,
  designation: true,
  bio: true,
  photoUrl: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

function handlePrismaError(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new TeamServiceError(
      "TEAM_SLUG_CONFLICT",
      "A team with this slug already exists.",
    );
  }

  throw error;
}

function handleNotFound(error: unknown, code: string, message: string): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    throw new TeamServiceError(code, message);
  }

  handlePrismaError(error);
}

// PUBLIC: List active teams and their active members.
export async function listPublicTeams() {
  return prisma.team.findMany({
    where: { isActive: true },
    select: {
      ...teamSelect,
      members: {
        where: { isActive: true },
        select: memberSelect,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

// PUBLIC: Get an active team by slug.
export async function getPublicTeam(slug: string) {
  const team = await prisma.team.findFirst({
    where: { slug, isActive: true },
    select: {
      ...teamSelect,
      members: {
        where: { isActive: true },
        select: memberSelect,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!team) {
    throw new TeamServiceError(
      "TEAM_NOT_FOUND",
      "The requested team was not found.",
    );
  }

  return team;
}

// ADMIN: List all teams.
export async function listTeamsForAdmin() {
  return prisma.team.findMany({
    select: {
      ...teamSelect,
      _count: { select: { members: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

// ADMIN: Get a team by ID, including inactive members.
export async function getTeamForAdmin(id: string) {
  const team = await prisma.team.findUnique({
    where: { id },
    select: {
      ...teamSelect,
      members: {
        select: memberSelect,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!team) {
    throw new TeamServiceError(
      "TEAM_NOT_FOUND",
      "The requested team was not found.",
    );
  }

  return team;
}

export async function createTeam(input: CreateTeamInput) {
  try {
    return await prisma.team.create({
      data: {
        name: input.name,
        slug: input.slug,
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      select: teamSelect,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateTeam(id: string, input: UpdateTeamInput) {
  try {
    return await prisma.team.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      select: teamSelect,
    });
  } catch (error) {
    handleNotFound(
      error,
      "TEAM_NOT_FOUND",
      "The requested team was not found.",
    );
  }
}

export async function deleteTeam(id: string) {
  try {
    await prisma.team.delete({ where: { id } });
  } catch (error) {
    handleNotFound(
      error,
      "TEAM_NOT_FOUND",
      "The requested team was not found.",
    );
  }
}

// ADMIN: List all members for a team.
export async function listTeamMembersForAdmin(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!team) {
    throw new TeamServiceError(
      "TEAM_NOT_FOUND",
      "The requested team was not found.",
    );
  }

  return prisma.teamMember.findMany({
    where: { teamId },
    select: memberSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createTeamMember(
  teamId: string,
  input: CreateTeamMemberInput,
) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true },
  });

  if (!team) {
    throw new TeamServiceError(
      "TEAM_NOT_FOUND",
      "The requested team was not found.",
    );
  }

  return prisma.teamMember.create({
    data: {
      teamId,
      name: input.name,
      designation: input.designation,
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    select: memberSelect,
  });
}

export async function updateTeamMember(
  memberId: string,
  input: UpdateTeamMemberInput,
) {
  const existing = await prisma.teamMember.findUnique({
    where: { id: memberId },
    select: { id: true },
  });

  if (!existing) {
    throw new TeamServiceError(
      "TEAM_MEMBER_NOT_FOUND",
      "The requested team member was not found.",
    );
  }

  if (input.teamId !== undefined) {
    const team = await prisma.team.findUnique({
      where: { id: input.teamId },
      select: { id: true },
    });

    if (!team) {
      throw new TeamServiceError(
        "TEAM_NOT_FOUND",
        "The destination team was not found.",
      );
    }
  }

  try {
    return await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        ...(input.teamId !== undefined ? { teamId: input.teamId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.designation !== undefined
          ? { designation: input.designation }
          : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.photoUrl !== undefined
          ? { photoUrl: input.photoUrl }
          : {}),
        ...(input.sortOrder !== undefined
          ? { sortOrder: input.sortOrder }
          : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      select: memberSelect,
    });
  } catch (error) {
    handleNotFound(
      error,
      "TEAM_MEMBER_NOT_FOUND",
      "The requested team member was not found.",
    );
  }
}

export async function deleteTeamMember(memberId: string) {
  try {
    await prisma.teamMember.delete({ where: { id: memberId } });
  } catch (error) {
    handleNotFound(
      error,
      "TEAM_MEMBER_NOT_FOUND",
      "The requested team member was not found.",
    );
  }
}
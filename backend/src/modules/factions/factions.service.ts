import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";

export class FactionServiceError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "FactionServiceError";
  }
}

const factionSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  color: true,
  emblemUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FactionSelect;

export async function listFactions(includeInactive = false) {
  return prisma.faction.findMany({
    ...(includeInactive ? {} : { where: { isActive: true } }),
    select: {
      ...factionSelect,
      _count: {
        select: {
          memberships: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getFactionById(factionId: string) {
  const faction = await prisma.faction.findFirst({
    where: {
      id: factionId,
      isActive: true,
    },
    select: {
      ...factionSelect,
      _count: {
        select: {
          memberships: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  if (!faction) {
    throw new FactionServiceError(
      "FACTION_NOT_FOUND",
      "Faction not found.",
    );
  }

  return faction;
}

export async function createFaction(input: {
  name: string;
  slug: string;
  description?: string | null;
  color?: string;
  emblemUrl?: string | null;
}) {
  // Basic limit check. A transaction-safe limit requires additional
  // database-level coordination if concurrent creation is possible.
  const count = await prisma.faction.count();

  if (count >= 16) {
    throw new FactionServiceError(
      "FACTION_LIMIT_REACHED",
      "Yuvaan supports a maximum of 16 factions.",
    );
  }

  try {
    return await prisma.faction.create({
      data: input,
      select: factionSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new FactionServiceError(
        "FACTION_CONFLICT",
        "A faction with this name or slug already exists.",
      );
    }

    throw error;
  }
}

export async function updateFaction(
  factionId: string,
  input: {
    name?: string;
    slug?: string;
    description?: string | null;
    color?: string;
    emblemUrl?: string | null;
  },
) {
  const exists = await prisma.faction.findUnique({
    where: { id: factionId },
    select: { id: true },
  });

  if (!exists) {
    throw new FactionServiceError(
      "FACTION_NOT_FOUND",
      "Faction not found.",
    );
  }

  try {
    return await prisma.faction.update({
      where: { id: factionId },
      data: input,
      select: factionSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new FactionServiceError(
        "FACTION_CONFLICT",
        "A faction with this name or slug already exists.",
      );
    }

    throw error;
  }
}

export async function setFactionStatus(
  factionId: string,
  isActive: boolean,
) {
  const exists = await prisma.faction.findUnique({
    where: { id: factionId },
    select: { id: true },
  });

  if (!exists) {
    throw new FactionServiceError(
      "FACTION_NOT_FOUND",
      "Faction not found.",
    );
  }

  return prisma.faction.update({
    where: { id: factionId },
    data: { isActive },
    select: factionSelect,
  });
}

export async function assignUserToFaction(
  userId: string,
  factionId: string,
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new FactionServiceError(
        "USER_NOT_FOUND",
        "User not found.",
      );
    }

    const faction = await tx.faction.findFirst({
      where: {
        id: factionId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!faction) {
      throw new FactionServiceError(
        "FACTION_NOT_FOUND",
        "Active faction not found.",
      );
    }

    const existing = await tx.factionMembership.findFirst({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        factionId: true,
      },
    });

    if (existing?.factionId === factionId) {
      throw new FactionServiceError(
        "ALREADY_IN_FACTION",
        "User is already assigned to this faction.",
      );
    }

    if (existing) {
      await tx.factionMembership.update({
        where: { id: existing.id },
        data: {
          isActive: false,
          leftAt: new Date(),
        },
      });
    }

    return tx.factionMembership.create({
      data: {
        userId,
        factionId,
      },
      select: {
        id: true,
        userId: true,
        factionId: true,
        joinedAt: true,
        isActive: true,
        faction: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            emblemUrl: true,
          },
        },
      },
    });
  });
}

export async function getMyFaction(userId: string) {
  return prisma.factionMembership.findFirst({
    where: {
      userId,
      isActive: true,
      faction: { isActive: true },
    },
    select: {
      id: true,
      joinedAt: true,
      faction: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          emblemUrl: true,
        },
      },
    },
  });
}

export async function listFactionMembers(
  factionId: string,
  page: number,
  limit: number,
) {
  const faction = await prisma.faction.findUnique({
    where: { id: factionId },
    select: { id: true, name: true },
  });

  if (!faction) {
    throw new FactionServiceError(
      "FACTION_NOT_FOUND",
      "Faction not found.",
    );
  }

  const where = {
    factionId,
    isActive: true,
  };

  const [members, total] = await prisma.$transaction([
    prisma.factionMembership.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { joinedAt: "asc" },
      select: {
        id: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.factionMembership.count({ where }),
  ]);

  return {
    faction,
    members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
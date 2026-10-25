import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class LeaderboardError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "LeaderboardError";
  }
}

interface PaginationInput {
  page?: number;
  limit?: number;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  points: bigint;
  rank: bigint;
}

interface LeaderboardPage {
  entries: Array<{
    id: string;
    name: string;
    points: number;
    rank: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function getPagination(input: PaginationInput) {
  const page = input.page ?? 1;
  const limit = input.limit ?? DEFAULT_LIMIT;

  if (!Number.isSafeInteger(page) || page < 1) {
    throw new LeaderboardError(
      "Page must be a positive integer.",
      400,
    );
  }

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    throw new LeaderboardError(
      `Limit must be between 1 and ${MAX_LIMIT}.`,
      400,
    );
  }

  const offset = (page - 1) * limit;

  if (!Number.isSafeInteger(offset)) {
    throw new LeaderboardError(
      "Requested page is too large.",
      400,
    );
  }

  return { page, limit, offset };
}

/**
 * Point totals are calculated from the transaction ledger.
 *
 * AWARD:
 *   Count the award only if it has not been reversed.
 *
 * ADJUSTMENT:
 *   Include its signed amount.
 *
 * REVERSAL:
 *   Not counted separately because the original award is excluded.
 *
 * Assumption: a reversal invalidates the entire original award.
 */
const individualTotals = Prisma.sql`
  SELECT
    pt."userId" AS id,
    SUM(
      CASE
        WHEN pt."transactionType" = 'AWARD'
          AND NOT EXISTS (
            SELECT 1
            FROM point_transactions reversal
            WHERE reversal."reversesId" = pt.id
          )
          THEN pt.amount

        WHEN pt."transactionType" = 'ADJUSTMENT'
          THEN pt.amount

        ELSE 0
      END
    )::bigint AS points
  FROM point_transactions pt
  WHERE pt."ledgerType" = 'INDIVIDUAL'
    AND pt."userId" IS NOT NULL
  GROUP BY pt."userId"
`;

const factionTotals = Prisma.sql`
  SELECT
    pt."factionId" AS id,
    SUM(
      CASE
        WHEN pt."transactionType" = 'AWARD'
          AND NOT EXISTS (
            SELECT 1
            FROM point_transactions reversal
            WHERE reversal."reversesId" = pt.id
          )
          THEN pt.amount

        WHEN pt."transactionType" = 'ADJUSTMENT'
          THEN pt.amount

        ELSE 0
      END
    )::bigint AS points
  FROM point_transactions pt
  WHERE pt."ledgerType" = 'FACTION'
    AND pt."factionId" IS NOT NULL
  GROUP BY pt."factionId"
`;

export async function getIndividualLeaderboard(
  input: PaginationInput = {},
): Promise<LeaderboardPage> {
  const { page, limit, offset } = getPagination(input);

  const [entries, total] = await Promise.all([
    prisma.$queryRaw<LeaderboardEntry[]>(Prisma.sql`
      WITH totals AS (${individualTotals}),
      ranked AS (
        SELECT
          u.id,
          u.name,
          COALESCE(t.points, 0)::bigint AS points,
          RANK() OVER (
            ORDER BY COALESCE(t.points, 0) DESC
          ) AS rank
        FROM users u
        LEFT JOIN totals t ON t.id = u.id
      )
      SELECT id, name, points, rank
      FROM ranked
      ORDER BY points DESC, id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `),

    prisma.user.count(),
  ]);

  return {
    entries: entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      points: Number(entry.points),
      rank: Number(entry.rank),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFactionLeaderboard(
  input: PaginationInput = {},
): Promise<LeaderboardPage> {
  const { page, limit, offset } = getPagination(input);

  const [entries, total] = await Promise.all([
    prisma.$queryRaw<LeaderboardEntry[]>(Prisma.sql`
      WITH totals AS (${factionTotals}),
      ranked AS (
        SELECT
          f.id,
          f.name,
          COALESCE(t.points, 0)::bigint AS points,
          RANK() OVER (
            ORDER BY COALESCE(t.points, 0) DESC
          ) AS rank
        FROM factions f
        LEFT JOIN totals t ON t.id = f.id
        WHERE f."isActive" = TRUE
      )
      SELECT id, name, points, rank
      FROM ranked
      ORDER BY points DESC, id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `),

    prisma.faction.count({
      where: { isActive: true },
    }),
  ]);

  return {
    entries: entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      points: Number(entry.points),
      rank: Number(entry.rank),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getIndividualLeaderboardEntry(
  userId: string,
) {
  const [entries, totalPlayers] = await Promise.all([
    prisma.$queryRaw<LeaderboardEntry[]>(Prisma.sql`
      WITH totals AS (${individualTotals}),
      ranked AS (
        SELECT
          u.id,
          u.name,
          COALESCE(t.points, 0)::bigint AS points,
          RANK() OVER (
            ORDER BY COALESCE(t.points, 0) DESC
          ) AS rank
        FROM users u
        LEFT JOIN totals t ON t.id = u.id
      )
      SELECT id, name, points, rank
      FROM ranked
      WHERE id = ${userId}
    `),

    prisma.user.count(),
  ]);

  const entry = entries[0];

  if (!entry) {
    throw new LeaderboardError("Player not found.", 404);
  }

  return {
    id: entry.id,
    name: entry.name,
    points: Number(entry.points),
    rank: Number(entry.rank),
    totalPlayers,
  };
}

export async function getFactionLeaderboardEntry(
  factionId: string,
) {
  const [entries, totalFactions] = await Promise.all([
    prisma.$queryRaw<LeaderboardEntry[]>(Prisma.sql`
      WITH totals AS (${factionTotals}),
      ranked AS (
        SELECT
          f.id,
          f.name,
          COALESCE(t.points, 0)::bigint AS points,
          RANK() OVER (
            ORDER BY COALESCE(t.points, 0) DESC
          ) AS rank
        FROM factions f
        LEFT JOIN totals t ON t.id = f.id
        WHERE f."isActive" = TRUE
      )
      SELECT id, name, points, rank
      FROM ranked
      WHERE id = ${factionId}
    `),

    prisma.faction.count({
      where: { isActive: true },
    }),
  ]);

  const entry = entries[0];

  if (!entry) {
    throw new LeaderboardError("Faction not found.", 404);
  }

  return {
    id: entry.id,
    name: entry.name,
    points: Number(entry.points),
    rank: Number(entry.rank),
    totalFactions,
  };
}
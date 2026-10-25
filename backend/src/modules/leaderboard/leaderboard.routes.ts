import { Router } from "express";
import {
  getFactionLeaderboard,
  getFactionLeaderboardEntry,
  getIndividualLeaderboard,
  getIndividualLeaderboardEntry,
  LeaderboardError,
} from "./leaderboard.service.js";

export const leaderboardRouter = Router();

function parsePagination(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new LeaderboardError(
      "Pagination parameters must be positive integers.",
      400,
    );
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new LeaderboardError(
      "Pagination parameters must be positive integers.",
      400,
    );
  }

  return parsed;
}

function handleError(
  error: unknown,
  res: Parameters<Parameters<typeof leaderboardRouter.get>[1]>[1],
  next: Parameters<Parameters<typeof leaderboardRouter.get>[1]>[2],
) {
  if (error instanceof LeaderboardError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: "LEADERBOARD_ERROR",
        message: error.message,
      },
    });
  }

  return next(error);
}

leaderboardRouter.get("/individual", async (req, res, next) => {
  try {
    const page = parsePagination(req.query.page);
    const limit = parsePagination(req.query.limit);

    const data = await getIndividualLeaderboard({
      ...(page !== undefined && { page }),
      ...(limit !== undefined && { limit }),
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(error, res, next);
  }
});

leaderboardRouter.get("/factions", async (req, res, next) => {
  try {
    const page = parsePagination(req.query.page);
    const limit = parsePagination(req.query.limit);

    const data = await getFactionLeaderboard({
      ...(page !== undefined && { page }),
      ...(limit !== undefined && { limit }),
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(error, res, next);
  }
});

leaderboardRouter.get(
  "/individual/:userId",
  async (req, res, next) => {
    try {
      const userId = req.params.userId;

      if (typeof userId !== "string") {
        throw new LeaderboardError("Invalid player ID.", 400);
      }

      const data = await getIndividualLeaderboardEntry(userId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },
);

leaderboardRouter.get(
  "/factions/:factionId",
  async (req, res, next) => {
    try {
      const factionId = req.params.factionId;

      if (typeof factionId !== "string") {
        throw new LeaderboardError("Invalid faction ID.", 400);
      }

      const data = await getFactionLeaderboardEntry(factionId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return handleError(error, res, next);
    }
  },
);
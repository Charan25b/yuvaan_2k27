import { prisma } from "../../lib/prisma.js";
import { GameServiceError } from "./games.service.js";
import { resolveGameChallenge } from "./game-challenges.service.js";

interface SubmitGameScoreInput {
  userId: string;
  gameSlug: string;
  sessionId: string;
  score: number;
}

export async function submitGameScore(input: SubmitGameScoreInput) {
  if (!Number.isSafeInteger(input.score) || input.score < 0) {
    throw new GameServiceError("INVALID_SCORE", "Invalid score.", 400);
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.gameSession.findFirst({
      where: {
        id: input.sessionId,
        userId: input.userId,
        game: {
          slug: input.gameSlug,
        },
      },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        challengeId: true,
        game: {
          select: {
            individualPoints: true,
            factionPoints: true,
          },
        },
        user: {
          select: {
            factionMemberships: {
              where: {
                isActive: true,
              },
              select: {
                factionId: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!session) {
      throw new GameServiceError(
        "SESSION_NOT_FOUND",
        "Game session not found.",
        404,
      );
    }

    if (session.status !== "IN_PROGRESS") {
      throw new GameServiceError(
        "SESSION_ALREADY_FINISHED",
        "This session has already been submitted or finished.",
        409,
      );
    }

    if (session.expiresAt <= now) {
      await tx.gameSession.updateMany({
        where: {
          id: session.id,
          status: "IN_PROGRESS",
        },
        data: {
          status: "EXPIRED",
        },
      });

      return {
        expired: true as const,
      };
    }

    // Atomically claim the session to prevent duplicate submissions.
    const claimed = await tx.gameSession.updateMany({
      where: {
        id: session.id,
        userId: input.userId,
        status: "IN_PROGRESS",
        expiresAt: {
          gt: now,
        },
      },
      data: {
        score: input.score,
        status: "VALIDATED",
        submittedAt: now,
        validatedAt: now,
      },
    });

    if (claimed.count !== 1) {
      throw new GameServiceError(
        "SESSION_ALREADY_FINISHED",
        "This session has already been submitted or finished.",
        409,
      );
    }

    // Challenge sessions must not receive solo-game points.
    if (session.challengeId) {
      return {
        expired: false as const,
        challengeSession: true as const,
        challengeId: session.challengeId,
        score: input.score,
      };
    }

    const activeMembership = session.user.factionMemberships[0];
    const factionId = activeMembership?.factionId;

    // Award individual points through the existing ledger.
    if (session.game.individualPoints > 0) {
      await tx.pointTransaction.createMany({
        data: [
          {
            ledgerType: "INDIVIDUAL",
            transactionType: "AWARD",
            userId: input.userId,
            amount: session.game.individualPoints,
            sourceType: "GAME_SESSION",
            sourceId: session.id,
            idempotencyKey: `game-session:${session.id}:individual`,
          },
        ],
        skipDuplicates: true,
      });
    }

    // Award faction points only if the player has an active membership.
    if (session.game.factionPoints > 0 && factionId) {
      await tx.pointTransaction.createMany({
        data: [
          {
            ledgerType: "FACTION",
            transactionType: "AWARD",
            factionId,
            amount: session.game.factionPoints,
            sourceType: "GAME_SESSION",
            sourceId: session.id,
            idempotencyKey: `game-session:${session.id}:faction`,
          },
        ],
        skipDuplicates: true,
      });
    }

    return {
      expired: false as const,
      challengeSession: false as const,
      score: input.score,
      individualPoints: session.game.individualPoints,
      factionPoints: factionId ? session.game.factionPoints : 0,
    };
  });

  if (result.expired) {
    throw new GameServiceError(
      "SESSION_EXPIRED",
      "This game session has expired.",
      410,
    );
  }

  // Resolve challenge results after the submission transaction commits.
  if (result.challengeSession) {
    const resolution = await resolveGameChallenge(result.challengeId);

    return {
      status: "SUBMITTED",
      score: result.score,
      pointsAwarded: {
        individual: 0,
        faction: 0,
      },
      challengePending: !resolution.resolved,
      challengeResult: resolution.resolved ? resolution.result : null,
    };
  }

  return {
    status: "VALIDATED",
    score: result.score,
    pointsAwarded: {
      individual: result.individualPoints,
      faction: result.factionPoints,
    },
  };
}

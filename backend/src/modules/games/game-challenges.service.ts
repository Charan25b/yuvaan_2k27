import { prisma } from "../../lib/prisma.js";
import { GameServiceError } from "./games.service.js";

const DEFAULT_CHALLENGE_TTL_MINUTES = 10;
const DAILY_PLAY_LIMIT = 5;
const DEFAULT_SESSION_TTL_SECONDS = 15 * 60;
const EVENT_TIME_ZONE = process.env.EVENT_TIME_ZONE ?? "Asia/Kolkata";

interface CreateChallengeInput {
  challengerId: string;
  gameSlug: string;
  opponentQrPublicId: string;
}

export async function createGameChallenge(input: CreateChallengeInput) {
  const now = new Date();

  const ttlMinutes = Number(
    process.env.GAME_CHALLENGE_TTL_MINUTES ??
      DEFAULT_CHALLENGE_TTL_MINUTES,
  );

  if (!Number.isInteger(ttlMinutes) || ttlMinutes <= 0) {
    throw new Error("INVALID_GAME_CHALLENGE_TTL");
  }

  const expiresAt = new Date(now.getTime() + ttlMinutes * 60_000);

  return prisma.$transaction(async (tx) => {
    const game = await tx.game.findUnique({
      where: { slug: input.gameSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
    });

    if (!game || game.status !== "ACTIVE") {
      throw new GameServiceError(
        "GAME_UNAVAILABLE",
        "This game is unavailable.",
        404,
      );
    }

    const opponentQR = await tx.playerQR.findUnique({
      where: { publicId: input.opponentQrPublicId },
      select: {
        userId: true,
        isActive: true,
      },
    });

    if (!opponentQR || !opponentQR.isActive) {
      throw new GameServiceError(
        "INVALID_PLAYER_QR",
        "This player QR code is invalid or inactive.",
        400,
      );
    }

    if (opponentQR.userId === input.challengerId) {
      throw new GameServiceError(
        "SELF_CHALLENGE",
        "You cannot challenge yourself.",
        400,
      );
    }

    const [challengerMembership, opponentMembership] = await Promise.all([
      tx.factionMembership.findFirst({
        where: {
          userId: input.challengerId,
          isActive: true,
        },
        select: { factionId: true },
      }),

      tx.factionMembership.findFirst({
        where: {
          userId: opponentQR.userId,
          isActive: true,
        },
        select: { factionId: true },
      }),
    ]);

    if (!challengerMembership || !opponentMembership) {
      throw new GameServiceError(
        "FACTION_MEMBERSHIP_REQUIRED",
        "Both players must have an active faction membership.",
        400,
      );
    }

    if (
      challengerMembership.factionId === opponentMembership.factionId
    ) {
      throw new GameServiceError(
        "SAME_FACTION",
        "You can only challenge players from other factions.",
        400,
      );
    }

    return tx.gameChallenge.create({
      data: {
        gameId: game.id,
        challengerId: input.challengerId,
        opponentId: opponentQR.userId,
        status: "PENDING",
        expiresAt,
      },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        game: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  });
}

interface RespondToChallengeInput {
  challengeId: string;
  userId: string;
  action: "ACCEPT" | "DECLINE";
}

export async function respondToGameChallenge(
  input: RespondToChallengeInput,
) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const challenge = await tx.gameChallenge.findFirst({
      where: {
        id: input.challengeId,
        opponentId: input.userId,
      },
      select: {
        id: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!challenge) {
      throw new GameServiceError(
        "CHALLENGE_NOT_FOUND",
        "Challenge not found.",
        404,
      );
    }

    if (challenge.status !== "PENDING") {
      throw new GameServiceError(
        "CHALLENGE_ALREADY_RESOLVED",
        "This challenge is no longer pending.",
        409,
      );
    }

    if (challenge.expiresAt <= now) {
      await tx.gameChallenge.updateMany({
        where: {
          id: challenge.id,
          status: "PENDING",
        },
        data: {
          status: "EXPIRED",
        },
      });

      return { expired: true as const };
    }

    const updated = await tx.gameChallenge.updateMany({
      where: {
        id: challenge.id,
        opponentId: input.userId,
        status: "PENDING",
        expiresAt: { gt: now },
      },
      data:
        input.action === "ACCEPT"
          ? {
              status: "ACCEPTED",
              acceptedAt: now,
            }
          : {
              status: "DECLINED",
            },
    });

    if (updated.count !== 1) {
      throw new GameServiceError(
        "CHALLENGE_ALREADY_RESOLVED",
        "This challenge is no longer pending.",
        409,
      );
    }

    return {
      expired: false as const,
      id: challenge.id,
      status: input.action === "ACCEPT" ? "ACCEPTED" : "DECLINED",
    };
  }).then((result) => {
    if (result.expired) {
      throw new GameServiceError(
        "CHALLENGE_EXPIRED",
        "This challenge has expired.",
        410,
      );
    }

    return result;
  });
}

function getPlayDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function getSessionExpiry(now: Date): Date {
  const ttl = Number(
    process.env.GAME_SESSION_TTL_SECONDS ??
      DEFAULT_SESSION_TTL_SECONDS,
  );

  if (!Number.isInteger(ttl) || ttl <= 0) {
    throw new Error("INVALID_GAME_SESSION_TTL");
  }

  return new Date(now.getTime() + ttl * 1000);
}

interface StartChallengeSessionInput {
  challengeId: string;
  userId: string;
}

export async function startChallengeGameSession(
  input: StartChallengeSessionInput,
) {
  const now = new Date();
  const playDate = getPlayDate(now);
  const expiresAt = getSessionExpiry(now);

  return prisma.$transaction(async (tx) => {
    // Serialize game starts for this player to prevent quota races.
    await tx.$queryRaw`
      SELECT pg_advisory_xact_lock(hashtext(${input.userId}))
    `;

    const challenge = await tx.gameChallenge.findFirst({
      where: {
        id: input.challengeId,
        status: "ACCEPTED",
        challengerId: input.userId,
      },
      select: {
        id: true,
        gameId: true,
        challengerId: true,
        opponentId: true,
        expiresAt: true,
        game: {
          select: {
            status: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    const participantChallenge =
      challenge ??
      (await tx.gameChallenge.findFirst({
        where: {
          id: input.challengeId,
          status: "ACCEPTED",
          opponentId: input.userId,
        },
        select: {
          id: true,
          gameId: true,
          challengerId: true,
          opponentId: true,
          expiresAt: true,
          game: {
            select: {
              status: true,
              slug: true,
              name: true,
            },
          },
        },
      }));

    if (!participantChallenge) {
      throw new GameServiceError(
        "CHALLENGE_UNAVAILABLE",
        "This accepted challenge could not be found.",
        404,
      );
    }

    if (participantChallenge.game.status !== "ACTIVE") {
      throw new GameServiceError(
        "GAME_UNAVAILABLE",
        "This game is unavailable.",
        404,
      );
    }

    if (participantChallenge.expiresAt <= now) {
      await tx.gameChallenge.updateMany({
        where: {
          id: participantChallenge.id,
          status: "ACCEPTED",
        },
        data: {
          status: "EXPIRED",
        },
      });

      throw new GameServiceError(
        "CHALLENGE_EXPIRED",
        "This challenge has expired.",
        410,
      );
    }

    // Each participant can have only one session for this challenge.
    const existingSession = await tx.gameSession.findUnique({
      where: {
        challengeId_userId: {
          challengeId: participantChallenge.id,
          userId: input.userId,
        },
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        score: true,
      },
    });

    if (existingSession) {
      throw new GameServiceError(
        "CHALLENGE_SESSION_ALREADY_STARTED",
        "You have already started your session for this challenge.",
        409,
      );
    }

    const playsUsed = await tx.gameSession.count({
      where: {
        userId: input.userId,
        playDate,
      },
    });

    if (playsUsed >= DAILY_PLAY_LIMIT) {
      throw new GameServiceError(
        "DAILY_PLAY_LIMIT_REACHED",
        "You've used all five game starts for today.",
        429,
      );
    }

    const session = await tx.gameSession.create({
      data: {
        userId: input.userId,
        gameId: participantChallenge.gameId,
        challengeId: participantChallenge.id,
        playDate,
        startedAt: now,
        expiresAt,
      },
      select: {
        id: true,
        status: true,
        startedAt: true,
        expiresAt: true,
        game: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return {
      session,
      playsUsed: playsUsed + 1,
      playsRemaining: DAILY_PLAY_LIMIT - playsUsed - 1,
    };
  });
}

export async function resolveGameChallenge(challengeId: string) {
  return prisma.$transaction(async (tx) => {
    const challenge = await tx.gameChallenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        status: true,
        challengerId: true,
        opponentId: true,
        game: {
          select: {
            individualPoints: true,
            factionPoints: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new GameServiceError(
        "CHALLENGE_NOT_FOUND",
        "Challenge not found.",
        404,
      );
    }

    if (challenge.status !== "ACCEPTED") {
      if (challenge.status === "COMPLETED") {
        return {
          resolved: false as const,
          reason: "ALREADY_RESOLVED" as const,
        };
      }

      throw new GameServiceError(
        "CHALLENGE_NOT_ACTIVE",
        "This challenge is not awaiting resolution.",
        409,
      );
    }

    const now = new Date();

    const sessions = await tx.gameSession.findMany({
      where: {
        challengeId: challenge.id,
        userId: {
          in: [challenge.challengerId, challenge.opponentId],
        },
      },
      select: {
        userId: true,
        score: true,
        status: true,
        expiresAt: true,
      },
    });

    const challengerSession = sessions.find(
      (session) => session.userId === challenge.challengerId,
    );

    const opponentSession = sessions.find(
      (session) => session.userId === challenge.opponentId,
    );

    const expiredSession = sessions.some(
      (session) =>
        session.status === "EXPIRED" ||
        (session.status === "IN_PROGRESS" && session.expiresAt <= now),
    );

    if (expiredSession) {
      await tx.gameSession.updateMany({
        where: {
          challengeId: challenge.id,
          status: "IN_PROGRESS",
          expiresAt: { lte: now },
        },
        data: {
          status: "EXPIRED",
        },
      });

      await tx.gameChallenge.updateMany({
        where: {
          id: challenge.id,
          status: "ACCEPTED",
          result: null,
        },
        data: {
          status: "EXPIRED",
        },
      });

      return {
        resolved: false as const,
        reason: "SESSION_EXPIRED" as const,
      };
    }

    if (
      !challengerSession ||
      !opponentSession ||
      challengerSession.status !== "VALIDATED" ||
      opponentSession.status !== "VALIDATED" ||
      challengerSession.score === null ||
      opponentSession.score === null
    ) {
      return {
        resolved: false as const,
        reason: "WAITING_FOR_BOTH_PLAYERS" as const,
      };
    }

    let result: "CHALLENGER_WON" | "OPPONENT_WON" | "DRAW";
    let winnerId: string | null;

    if (challengerSession.score > opponentSession.score) {
      result = "CHALLENGER_WON";
      winnerId = challenge.challengerId;
    } else if (opponentSession.score > challengerSession.score) {
      result = "OPPONENT_WON";
      winnerId = challenge.opponentId;
    } else {
      result = "DRAW";
      winnerId = null;
    }

    // Atomically claim resolution so concurrent requests cannot award
    // points for the same challenge twice.
    const claimed = await tx.gameChallenge.updateMany({
      where: {
        id: challenge.id,
        status: "ACCEPTED",
        result: null,
      },
      data: {
        status: "COMPLETED",
        result,
        completedAt: now,
      },
    });

    if (claimed.count !== 1) {
      return {
        resolved: false as const,
        reason: "ALREADY_RESOLVED" as const,
      };
    }

    let individualPointsAwarded = 0;
    let factionPointsAwarded = 0;

    if (winnerId) {
      const membership = await tx.factionMembership.findFirst({
        where: {
          userId: winnerId,
          isActive: true,
        },
        select: {
          factionId: true,
        },
      });

      const awards = [];

      if (challenge.game.individualPoints > 0) {
        awards.push({
          ledgerType: "INDIVIDUAL" as const,
          transactionType: "AWARD" as const,
          userId: winnerId,
          amount: challenge.game.individualPoints,
          sourceType: "GAME_CHALLENGE",
          sourceId: challenge.id,
          idempotencyKey: `game-challenge:${challenge.id}:individual`,
        });

        individualPointsAwarded = challenge.game.individualPoints;
      }

      if (challenge.game.factionPoints > 0 && membership) {
        awards.push({
          ledgerType: "FACTION" as const,
          transactionType: "AWARD" as const,
          factionId: membership.factionId,
          amount: challenge.game.factionPoints,
          sourceType: "GAME_CHALLENGE",
          sourceId: challenge.id,
          idempotencyKey: `game-challenge:${challenge.id}:faction`,
        });

        factionPointsAwarded = challenge.game.factionPoints;
      }

      if (awards.length > 0) {
        await tx.pointTransaction.createMany({
          data: awards,
          skipDuplicates: true,
        });
      }
    }

    return {
      resolved: true as const,
      result,
      winnerId,
      scores: {
        challenger: challengerSession.score,
        opponent: opponentSession.score,
      },
      pointsAwarded: {
        individual: individualPointsAwarded,
        faction: factionPointsAwarded,
      },
    };
  });
}

export async function getGameChallenge(
  challengeId: string,
  userId: string,
) {
  // Reconcile any expired sessions before returning the challenge state.
  const access = await prisma.gameChallenge.findFirst({
    where: {
      id: challengeId,
      OR: [{ challengerId: userId }, { opponentId: userId }],
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!access) {
    throw new GameServiceError(
      "CHALLENGE_NOT_FOUND",
      "Challenge not found.",
      404,
    );
  }

  if (access.status === "ACCEPTED") {
    await resolveGameChallenge(access.id);
  }

  const challenge = await prisma.gameChallenge.findFirst({
    where: {
      id: challengeId,
      OR: [{ challengerId: userId }, { opponentId: userId }],
    },
    select: {
      id: true,
      status: true,
      result: true,
      expiresAt: true,
      completedAt: true,
      game: {
        select: {
          name: true,
          slug: true,
        },
      },
      challenger: {
        select: {
          id: true,
          name: true,
        },
      },
      opponent: {
        select: {
          id: true,
          name: true,
        },
      },
      sessions: {
        select: {
          userId: true,
          status: true,
          score: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!challenge) {
    throw new GameServiceError(
      "CHALLENGE_NOT_FOUND",
      "Challenge not found.",
      404,
    );
  }

  return {
    ...challenge,
    sessions: challenge.sessions.map((session) => ({
      ...session,
      score: session.status === "VALIDATED" ? session.score : null,
    })),
  };
}
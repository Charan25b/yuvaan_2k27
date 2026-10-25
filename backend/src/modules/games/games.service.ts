import { prisma } from "../../lib/prisma.js";

const DAILY_PLAY_LIMIT = 5;
const DEFAULT_SESSION_TTL_SECONDS = 15 * 60;
const EVENT_TIME_ZONE = process.env.EVENT_TIME_ZONE ?? "Asia/Kolkata";

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
  const configuredTtl = Number(
    process.env.GAME_SESSION_TTL_SECONDS ??
      DEFAULT_SESSION_TTL_SECONDS,
  );

  if (!Number.isInteger(configuredTtl) || configuredTtl <= 0) {
    throw new Error("INVALID_GAME_SESSION_TTL");
  }

  return new Date(now.getTime() + configuredTtl * 1000);
}

export class GameServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "GameServiceError";
  }
}

interface StartGameInput {
  userId: string;
  gameSlug: string;
  qrPublicId: string;
}

export async function startGameSession(input: StartGameInput) {
  const now = new Date();
  const playDate = getPlayDate(now);
  const expiresAt = getSessionExpiry(now);

  return prisma.$transaction(
    async (tx) => {
      // Serialize game starts for this user across concurrent requests.
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(
          hashtext(${input.userId})
        )
      `;

      const game = await tx.game.findUnique({
        where: { slug: input.gameSlug },
        select: {
          id: true,
          slug: true,
          name: true,
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

      const qr = await tx.gameAccessQR.findUnique({
        where: { publicId: input.qrPublicId },
        select: {
          id: true,
          gameId: true,
          isActive: true,
          expiresAt: true,
        },
      });

      if (
        !qr ||
        !qr.isActive ||
        qr.gameId !== game.id ||
        (qr.expiresAt !== null && qr.expiresAt <= now)
      ) {
        throw new GameServiceError(
          "INVALID_GAME_QR",
          "This game QR code is invalid or expired.",
          400,
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
          gameId: game.id,
          accessQrId: qr.id,
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
    },
    {
      maxWait: 5000,
      timeout: 10000,
    },
  );
}
import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../auth/auth.middleware.js";
import { csrfProtection } from "../../middleware/csrf.middleware.js";
import { submitGameScore } from "./game-sessions.service.js";
import { createGameChallenge } from "./game-challenges.service.js";
import { respondToGameChallenge } from "./game-challenges.service.js";
import { startChallengeGameSession } from "./game-challenges.service.js";
import { getGameChallenge } from "./game-challenges.service.js";

import {
  GameServiceError,
  startGameSession,
} from "./games.service.js";

export const gamesRouter = Router();

const startGameSchema = z.object({
  qrPublicId: z.string().min(1).max(100),
});

const submitScoreSchema = z.object({
  sessionId: z.string().min(1).max(100),
  score: z.number().int().nonnegative().safe(),
});

gamesRouter.post(
  "/:slug/sessions",
  requireAuth,
  csrfProtection,
  async (req, res, next) => {
    try {
      const user = req.authUser;

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Please log in to play.",
          },
        });
        return;
      }

      const gameSlug = req.params.slug;

      if (typeof gameSlug !== "string") {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "A valid game slug is required.",
          },
        });
        return;
      }

      const parsed = startGameSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "A valid game QR identifier is required.",
          },
        });
        return;
      }

      const result = await startGameSession({
        userId: user.id,
        gameSlug,
        qrPublicId: parsed.data.qrPublicId,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof GameServiceError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      next(error);
    }
  },
);

gamesRouter.post(
  "/:slug/sessions/:sessionId/submit",
  requireAuth,
  csrfProtection,
  async (req, res, next) => {
    try {
      const user = req.authUser;

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Please log in to continue.",
          },
        });
        return;
      }

      const gameSlug = req.params.slug;

      if (typeof gameSlug !== "string") {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "A valid game slug is required.",
          },
        });
        return;
      }

      const parsed = submitScoreSchema.safeParse({
        sessionId: req.params.sessionId,
        score: req.body?.score,
      });

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide a valid session ID and score.",
          },
        });
        return;
      }

      const result = await submitGameScore({
        userId: user.id,
        gameSlug,
        sessionId: parsed.data.sessionId,
        score: parsed.data.score,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof GameServiceError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      next(error);
    }
  },
);

gamesRouter.post(
  "/challenges",
  requireAuth,
  csrfProtection,
  async (req, res, next) => {
    try {
      const user = req.authUser;

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
          },
        });
        return;
      }

      const schema = z.object({
        gameSlug: z.string().trim().min(1).max(100),
        opponentQrPublicId: z.string().trim().min(1).max(100),
      });

      const parsed = schema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid challenge request.",
          },
        });
        return;
      }

      const challenge = await createGameChallenge({
        challengerId: user.id,
        gameSlug: parsed.data.gameSlug,
        opponentQrPublicId: parsed.data.opponentQrPublicId,
      });

      res.status(201).json({
        success: true,
        data: challenge,
      });
    } catch (error) {
      if (error instanceof GameServiceError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      next(error);
    }
  },
);

gamesRouter.post(
  "/challenges/:challengeId/respond",
  requireAuth,
  csrfProtection,
  async (req, res, next) => {
    try {
      const user = req.authUser;

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
          },
        });
        return;
      }

      const schema = z.object({
        action: z.enum(["ACCEPT", "DECLINE"]),
      });

      const parsed = schema.safeParse(req.body);

      const challengeId = req.params.challengeId;

      if (!parsed.success || typeof challengeId !== "string") {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Provide a valid ACCEPT or DECLINE action.",
          },
        });
        return;
      }

      const result = await respondToGameChallenge({
        challengeId,
        userId: user.id,
        action: parsed.data.action,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof GameServiceError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      next(error);
    }
  },
);

gamesRouter.post(
  "/challenges/:challengeId/sessions",
  requireAuth,
  csrfProtection,
  async (req, res, next) => {
    try {
      const challengeId = req.params.challengeId;

      if (typeof challengeId !== "string") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_CHALLENGE_ID",
            message: "Invalid challenge ID.",
          },
        });
      }

      const result = await startChallengeGameSession({
        challengeId,
        userId: req.authUser!.id,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof GameServiceError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      return next(error);
    }
  },
);

gamesRouter.get(
  "/challenges/:challengeId",
  requireAuth,
  async (req, res, next) => {
    try {
      const challengeId = req.params.challengeId;

      if (typeof challengeId !== "string") {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_CHALLENGE_ID",
            message: "Invalid challenge ID.",
          },
        });
      }

      const data = await getGameChallenge(
        challengeId,
        req.authUser!.id,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      if (error instanceof GameServiceError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      return next(error);
    }
  },
);
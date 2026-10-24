import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../../lib/redis.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function createRedisRateLimitStore(prefix: string) {
  return new RedisStore({
    prefix,
    sendCommand: (...args: string[]) => redis.sendCommand(args),
  });
}

const rateLimitResponse = {
  success: false,
  error: {
    code: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
  },
};

export const resendVerificationRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createRedisRateLimitStore("yuvaan:rl:resend-verification:"),
  message: rateLimitResponse,
});

export const loginRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createRedisRateLimitStore("yuvaan:rl:login:"),
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many login attempts. Please try again later.",
    },
  },
});

export const forgotPasswordRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createRedisRateLimitStore("yuvaan:rl:forgot-password:"),
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many password reset requests. Please try again later.",
    },
  },
});

export const resetPasswordRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: createRedisRateLimitStore("yuvaan:rl:reset-password:"),
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many password reset attempts. Please try again later.",
    },
  },
});
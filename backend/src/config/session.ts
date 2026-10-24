import "dotenv/config";

import session from "express-session";
import { RedisStore } from "connect-redis";

import { redis } from "../lib/redis.js";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET must be configured with a strong secret of at least 32 characters.",
  );
}

const isProduction = process.env.NODE_ENV === "production";

export const sessionMiddleware = session({
  name: "yuvaan.sid",
  secret: sessionSecret,
  store: new RedisStore({
    client: redis,
    prefix: "yuvaan:sess:",
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});
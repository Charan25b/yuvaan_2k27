import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { prisma } from "./lib/prisma.js";
import { sessionMiddleware } from "./config/session.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { eventsRouter } from "./modules/events/events.routes.js";
import { eventCategoriesRouter } from "./modules/event-categories/event-categories.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  }),
);

const allowedOrigin = new URL(
  process.env.FRONTEND_URL ?? "http://localhost:3000",
).origin;

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

app.use((req, res, next) => {
  const origin = req.get("Origin");

  if (
    unsafeMethods.has(req.method) &&
    origin &&
    origin !== allowedOrigin
  ) {
    res.status(403).json({
      success: false,
      error: {
        code: "ORIGIN_NOT_ALLOWED",
        message: "This request origin is not allowed.",
      },
    });
    return;
  }

  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(pinoHttp());
app.use(sessionMiddleware);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/event-categories", eventCategoriesRouter);

app.get("/api/v1/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: "healthy",
        database: "connected",
        service: "yuvaan-backend",
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "The service is temporarily unavailable.",
      },
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
    },
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(
      "Unhandled request error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    });
  },
);



export default app;
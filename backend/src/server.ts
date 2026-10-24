import "dotenv/config";

import app from "./app.js";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/redis.js";

const PORT = Number(process.env.PORT ?? 8080);

let shuttingDown = false;

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    console.info("PostgreSQL connection ready.");

    await redis.connect();
    console.info("Redis connection ready.");

    const server = app.listen(PORT, () => {
      console.info(`Yuvaan API listening on port ${PORT}`);
    });

    async function shutdown(signal: string): Promise<void> {
      if (shuttingDown) return;
      shuttingDown = true;

      console.info(`${signal} received. Shutting down gracefully...`);

      server.close(async (error) => {
        try {
          if (error) {
            console.error("Error closing HTTP server:", error);
            process.exitCode = 1;
          }

          if (redis.isOpen) {
            await redis.quit();
          }

          await prisma.$disconnect();
        } catch (shutdownError) {
          console.error("Error during shutdown:", shutdownError);
          process.exitCode = 1;
        }
      });
    }

    process.once("SIGINT", () => void shutdown("SIGINT"));
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start Yuvaan API:", error);

    if (redis.isOpen) {
      await redis.quit().catch(() => undefined);
    }

    await prisma.$disconnect().catch(() => undefined);

    process.exitCode = 1;
  }
}

void startServer();
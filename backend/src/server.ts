import "dotenv/config";
import { createServer } from "node:http";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/redis.js";

async function startServer(): Promise<void> {
  try {
    // 1. Connect to PostgreSQL.
    await prisma.$connect();
    console.info("PostgreSQL connection ready.");

    // 2. Connect to Redis.
    if (!redis.isOpen) {
      await redis.connect();
    }

    if (!redis.isReady) {
      throw new Error("Redis is not ready.");
    }

    // 3. Import the application AFTER Redis is ready.
    const { default: app } = await import("./app.js");

    // 4. Start accepting HTTP requests.
    const server = createServer(app);

    server.listen(Number(process.env.PORT ?? 8080), () => {
      console.info(
        `Yuvaan API listening on port ${process.env.PORT ?? 8080}`,
      );
    });

    // Keep your existing graceful-shutdown implementation here.
    // It should close the HTTP server, Redis, and Prisma.
  } catch (error) {
    console.error("Failed to start Yuvaan API:", error);

    await Promise.allSettled([
      redis.isOpen ? redis.quit() : Promise.resolve(),
      prisma.$disconnect(),
    ]);

    process.exitCode = 1;
  }
}

void startServer();
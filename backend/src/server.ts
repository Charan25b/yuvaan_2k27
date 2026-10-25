import "dotenv/config";
import { createServer, type Server } from "node:http";
import { prisma } from "./lib/prisma.js";
import { redis } from "./lib/redis.js";

async function startServer(): Promise<void> {
  let server: Server | undefined;
  let shuttingDown = false;

  try {
    await prisma.$connect();
    console.info("PostgreSQL connection ready.");

    if (!redis.isOpen) await redis.connect();
    if (!redis.isReady) throw new Error("Redis is not ready.");

    // Import the app only after Redis is ready: rate-limit stores initialize at import time.
    const { default: app } = await import("./app.js");
    server = createServer(app);

    server.listen(Number(process.env.PORT ?? 8080), () => {
      console.info(`Yuvaan API listening on port ${process.env.PORT ?? 8080}`);
    });

    const shutdown = (signal: string) => {
      if (shuttingDown) return;
      shuttingDown = true;
      console.info(`${signal} received; shutting down Yuvaan API.`);

      const forceExit = setTimeout(() => {
        console.error("Graceful shutdown timed out; forcing exit.");
        process.exit(1);
      }, 10_000);
      forceExit.unref();

      const closeHttp = new Promise<void>((resolve, reject) => {
        if (!server?.listening) return resolve();
        server.close((error) => error ? reject(error) : resolve());
      });

      void Promise.allSettled([
        closeHttp,
        redis.isOpen ? redis.quit() : Promise.resolve(),
        prisma.$disconnect(),
      ]).then((results) => {
        clearTimeout(forceExit);
        const failed = results.filter((result) => result.status === "rejected");
        if (failed.length) {
          console.error("One or more services failed to close cleanly.", failed);
          process.exitCode = 1;
        }
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
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

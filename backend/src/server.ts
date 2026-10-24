import "dotenv/config";

import app from "./app.js";

const PORT = Number(process.env.PORT ?? 8080);

const server = app.listen(PORT, () => {
  console.log(`Yuvaan API listening on port ${PORT}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close((error) => {
    if (error) {
      console.error("Error while closing server:", error);
      process.exitCode = 1;
      return;
    }

    process.exitCode = 0;
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
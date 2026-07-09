import { app } from "./app.js";
import { prisma } from "./config/prisma.js";
import { env } from "./config/env.js";

let server;

async function startServer() {
  try {
    // Attempt to connect to the database to ensure it's available
    await prisma.$connect();
    console.log("✅ Database connected successfully.");

    server = app.listen(env.PORT, () => {
      console.log(`🚀 Server started on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

// Graceful shutdown handling
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      await prisma.$disconnect();
      console.log("Prisma disconnected.");
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

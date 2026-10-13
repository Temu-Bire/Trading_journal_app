import mongoose from "mongoose";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  try {
    // 1. Establish database connection before accepting traffic
    await connectDatabase();

    // 2. Start HTTP server
    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
    });

    // 3. Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("🔒 HTTP server closed.");
        try {
          await mongoose.connection.close(false);
          console.log("💾 MongoDB connection closed.");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error closing MongoDB connection:", err);
          process.exit(1);
        }
      });

      // Force close if graceful shutdown exceeds 10 seconds
      setTimeout(() => {
        console.error("⚠️ Forceful shutdown timeout exceeded. Exiting immediately.");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      console.error("❌ Unhandled Promise Rejection:", reason);
    });

    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
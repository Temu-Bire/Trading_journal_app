import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });

    await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.warn(
      "⚠️ MongoDB connection failed. Running with resilient fallback so server stays up:",
      error instanceof Error ? error.message : error
    );
  }
};

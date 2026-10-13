import { Router } from "express";
import mongoose from "mongoose";
import v1Routes from "./v1/index.js";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Trading Journal API is running",
    timestamp: new Date().toISOString(),
  });
});

router.get("/health", (_req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbStateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const status = isDbConnected ? 200 : 503;
  res.status(status).json({
    status: isDbConnected ? "healthy" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStateMap[mongoose.connection.readyState] || "unknown",
        connected: isDbConnected,
      },
    },
  });
});

router.use("/v1", v1Routes);

export default router;
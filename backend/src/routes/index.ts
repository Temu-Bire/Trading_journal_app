import { Router } from "express";

import v1Routes from "./v1/index.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Trading Journal API is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/v1", v1Routes);

export default router;
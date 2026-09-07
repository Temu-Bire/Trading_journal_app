import { Router } from "express";

import userRoutes from "../../modules/users/user.route.js";
import authRoutes from "../../modules/auth/auth.route.js";
import tradeRoutes from "../../modules/trade/trade.routes.js"
const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/trades", tradeRoutes);

export default router;
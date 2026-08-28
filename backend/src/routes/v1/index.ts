import { Router } from "express";

import userRoutes from "../../modules/users/user.route.js";
import authRoutes from "../../modules/auth/auth.route.js";
const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);

export default router;
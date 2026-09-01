import { Router } from "express";
import { getUserByIdController } from "./user.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/:id", authenticate, getUserByIdController);

export default router;
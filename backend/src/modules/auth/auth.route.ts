import { Router } from "express";
import {
  loginController,
  registerController,
  refreshController,
  logoutController,
  getMeController,
} from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { loginSchema } from "./auth.validation.js";
import { createUserSchema } from "../users/user.validation.js";

const router = Router();

// Public Routes
router.post("/register", validate(createUserSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);

// Protected Route (Requires Access Token)
router.get("/me", authenticate, getMeController);

export default router;
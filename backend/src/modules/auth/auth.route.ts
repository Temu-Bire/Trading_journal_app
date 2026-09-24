import { Router } from "express";
import {
  loginController,
  registerController,
  refreshController,
  logoutController,
  getMeController,
  forgotPasswordController,
  resetPasswordController,
} from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import { createUserSchema } from "../users/user.validation.js";
import { authLimiter } from "../../middleware/rateLimit.middleware.js";

const router = Router();

// Public Routes
router.post("/register", authLimiter, validate(createUserSchema), registerController);
router.post("/login", authLimiter, validate(loginSchema), loginController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPasswordController);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPasswordController);

// Protected Route (Requires Access Token)
router.get("/me", authenticate, getMeController);

export default router;
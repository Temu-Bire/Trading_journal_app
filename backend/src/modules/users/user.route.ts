import { Router } from "express";
import { createUserController, getCurrentUserController } from "./user.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createUserSchema } from "./user.validation.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  validate(createUserSchema),
  createUserController,
);
router.get(
  "/me",
  authenticate,
  getCurrentUserController,
);

export default router;
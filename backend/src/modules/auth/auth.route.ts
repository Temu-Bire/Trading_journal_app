import { Router } from "express";

import { loginController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { loginSchema } from "./auth.validation.js";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  loginController,
);

export default router;
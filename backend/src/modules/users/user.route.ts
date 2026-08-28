import { Router } from "express";
import { createUserController } from "./user.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createUserSchema } from "./user.validation.js";

const router = Router();

router.post(
  "/",
  validate(createUserSchema),
  createUserController,
);

export default router;
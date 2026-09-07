import { Router } from "express";
import { TradeController } from "./trade.controller.js";
import { createTradeSchema, updateTradeSchema } from "./trade.validation.js";
import { authenticate } from "../../middleware/auth.middleware.js"; // Your JWT/Session auth middleware
import {validate} from "../../middleware/validate.middleware.js"
const router = Router();

// All trade endpoints are protected behind authentication
router.use(authenticate);

router
  .route("/")
  .post(validate(createTradeSchema), TradeController.create)
  .get(TradeController.getAll);

router
  .route("/:id")
  .get(TradeController.getOne)
  .patch(validate(updateTradeSchema), TradeController.update)
  .delete(TradeController.remove);

export default router;
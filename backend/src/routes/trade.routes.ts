import { Router } from "express";
import { TradeController } from "../controllers/trade.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTradeSchema,
  updateTradeSchema,
  closeTradeSchema,
  tradeQuerySchema,
  analyticsQuerySchema,
} from "../validators/trade.validator.js";

const router = Router();

// All trade endpoints require authentication
router.use(authenticate);

router.post("/", validate(createTradeSchema), TradeController.create);
router.get("/", validate(tradeQuerySchema, "query"), TradeController.getAll);
router.get("/analytics", validate(analyticsQuerySchema, "query"), TradeController.getAnalytics);
router.get("/:id", TradeController.getOne);
router.put("/:id", validate(updateTradeSchema), TradeController.update);
router.patch("/:id", validate(updateTradeSchema), TradeController.update);
router.post("/:id/close", validate(closeTradeSchema), TradeController.close);
router.delete("/:id", TradeController.remove);

export default router;

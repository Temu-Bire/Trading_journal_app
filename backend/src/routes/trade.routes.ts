import { Router } from "express";
import { TradeController } from "../controllers/trade.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createTradeSchema, updateTradeSchema } from "../validators/trade.validator.js";

const router = Router();

// All trade endpoints require authentication
router.use(authenticate);

router.post("/", validate(createTradeSchema), TradeController.create);
router.get("/", TradeController.getAll);
router.get("/:id", TradeController.getOne);
router.put("/:id", validate(updateTradeSchema), TradeController.update);
router.patch("/:id", validate(updateTradeSchema), TradeController.update);
router.delete("/:id", TradeController.remove);

export default router;

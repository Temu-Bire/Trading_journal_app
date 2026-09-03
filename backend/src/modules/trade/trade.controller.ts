import type { Request, Response, NextFunction } from "express";
import { TradeService } from "./trade.service.js";
import type { TradeDirection, TradeStatus } from "./trade.types.js";

export class TradeController {
  private static getUserId(req: Request): string {
    // Access token payload uses userId
    const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?.sub;
    if (!userId) {
      throw new Error("Unauthorized: User payload missing on request");
    }
    return String(userId);
  }

  private static getParamId(param: string | string[] | undefined): string {
    if (!param || Array.isArray(param)) {
      throw new Error("Invalid or missing ID parameter");
    }
    return param;
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const trade = await TradeService.createTrade(userId, req.body);
      return res.status(201).json({ success: true, data: trade });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const { page, limit, symbol, status, direction } = req.query;

      const filters = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        symbol: typeof symbol === "string" ? symbol : undefined,
        status: typeof status === "string" ? (status as TradeStatus) : undefined,
        direction: typeof direction === "string" ? (direction as TradeDirection) : undefined,
      };

      const result = await TradeService.getUserTrades(userId, filters);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const tradeId = TradeController.getParamId(req.params.id);

      const trade = await TradeService.getTradeById(userId, tradeId);
      if (!trade) {
        return res.status(404).json({ success: false, error: "Trade not found" });
      }

      return res.status(200).json({ success: true, data: trade });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const tradeId = TradeController.getParamId(req.params.id);

      const updatedTrade = await TradeService.updateTrade(userId, tradeId, req.body);
      if (!updatedTrade) {
        return res.status(404).json({ success: false, error: "Trade not found or unauthorized" });
      }

      return res.status(200).json({ success: true, data: updatedTrade });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const tradeId = TradeController.getParamId(req.params.id);

      const deleted = await TradeService.deleteTrade(userId, tradeId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: "Trade not found or unauthorized" });
      }

      return res.status(200).json({ success: true, message: "Trade deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
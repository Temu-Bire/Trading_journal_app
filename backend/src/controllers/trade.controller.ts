import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { TradeService } from "../services/trade.service.js";
import { tradeQuerySchema, analyticsQuerySchema } from "../validators/trade.validator.js";
import { ApiError } from "../utils/apiError.js";

export class TradeController {
  private static getUserId(req: Request): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError(401, "Authentication required");
    }
    return String(userId);
  }

  private static validateTradeId(tradeId: string): void {
    if (!tradeId || !Types.ObjectId.isValid(tradeId)) {
      throw new ApiError(400, "Invalid trade ID format");
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const trade = await TradeService.createTrade(userId, req.body);
      return res.status(201).json({
        success: true,
        message: "Trade created successfully",
        data: trade,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const filters = tradeQuerySchema.parse(req.query);

      const result = await TradeService.getUserTrades(userId, filters);
      return res.status(200).json({
        success: true,
        data: result.trades,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const filters = analyticsQuerySchema.parse(req.query);

      const analytics = await TradeService.getAnalytics(userId, filters);
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const tradeId = req.params.id as string;
      TradeController.validateTradeId(tradeId);

      const trade = await TradeService.getTradeById(userId, tradeId);
      if (!trade) {
        throw new ApiError(404, "Trade not found");
      }

      return res.status(200).json({
        success: true,
        data: trade,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const tradeId = req.params.id as string;
      TradeController.validateTradeId(tradeId);

      const updatedTrade = await TradeService.updateTrade(userId, tradeId, req.body);
      if (!updatedTrade) {
        throw new ApiError(404, "Trade not found");
      }

      return res.status(200).json({
        success: true,
        message: "Trade updated successfully",
        data: updatedTrade,
      });
    } catch (error) {
      next(error);
    }
  }

  static async close(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const tradeId = req.params.id as string;
      TradeController.validateTradeId(tradeId);

      const closedTrade = await TradeService.closeTrade(userId, tradeId, req.body);

      return res.status(200).json({
        success: true,
        message: "Trade closed successfully",
        data: closedTrade,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TradeController.getUserId(req);
      const tradeId = req.params.id as string;
      TradeController.validateTradeId(tradeId);

      const deleted = await TradeService.deleteTrade(userId, tradeId);
      if (!deleted) {
        throw new ApiError(404, "Trade not found");
      }

      return res.status(200).json({
        success: true,
        message: "Trade deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

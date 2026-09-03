import { TradeRepository } from "./trade.repository.js";
import type { CreateTradeDTO, UpdateTradeDTO, TradeQueryFilters, ITrade } from "./trade.types.js";

export class TradeService {
  /**
   * Helper to compute real trade results upon closing
   */
  private static calculateProfitLoss(
    direction: "long" | "short",
    entryPrice: number,
    exitPrice: number,
    lotSize: number
  ): number {
    if (direction === "long") {
      return (exitPrice - entryPrice) * lotSize;
    } else {
      return (entryPrice - exitPrice) * lotSize;
    }
  }

  static async createTrade(userId: string, data: CreateTradeDTO): Promise<ITrade> {
    return await TradeRepository.create(userId, data);
  }

  static async getUserTrades(userId: string, filters: TradeQueryFilters) {
    return await TradeRepository.findManyByUser(userId, filters);
  }

  static async getTradeById(userId: string, tradeId: string): Promise<ITrade | null> {
    return await TradeRepository.findByIdAndUser(tradeId, userId);
  }

  static async updateTrade(
    userId: string,
    tradeId: string,
    updates: UpdateTradeDTO
  ): Promise<ITrade | null> {
    const existingTrade = await TradeRepository.findDocumentByIdAndUser(tradeId, userId);
    if (!existingTrade) return null;

    const payload: Partial<ITrade> = { ...updates };

    // Handle trade auto-closing and PnL calculation
    if (updates.exitPrice !== undefined || updates.status === "closed") {
      const direction = updates.direction || existingTrade.direction;
      const entryPrice = updates.entryPrice || existingTrade.entryPrice;
      const quantity = updates.lotSize || existingTrade.lotSize;
      const exitPrice =
        updates.exitPrice !== undefined ? updates.exitPrice : existingTrade.exitPrice;

      if (exitPrice !== undefined) {
        payload.profitLoss = this.calculateProfitLoss(direction, entryPrice, exitPrice, quantity);
        payload.status = "closed";
        if (!updates.exitTime && !existingTrade.exitTime) {
          payload.exitTime = new Date();
        }
      }
    }

    return await TradeRepository.updateByIdAndUser(tradeId, userId, payload);
  }

  static async deleteTrade(userId: string, tradeId: string): Promise<boolean> {
    return await TradeRepository.deleteByIdAndUser(tradeId, userId);
  }
}
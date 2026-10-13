import { TradeRepository } from "../repository/trade.repository.js";
import type { CreateTradeDTO, UpdateTradeDTO, TradeQueryFilters, ITrade } from "../types/trade.types.js";

export class TradeService {
  /**
   * Helper to compute profit/loss net of fees
   */
  public static calculateProfitLoss(
    direction: "long" | "short",
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    fees = 0
  ): number {
    const grossPnl =
      direction === "long"
        ? (exitPrice - entryPrice) * quantity
        : (entryPrice - exitPrice) * quantity;

    return Number((grossPnl - fees).toFixed(2));
  }

  /**
   * Helper to compute Risk:Reward ratio based on SL/TP
   */
  public static calculateRiskReward(
    direction: "long" | "short",
    entryPrice: number,
    stopLoss?: number,
    takeProfit?: number
  ): number | undefined {
    if (!stopLoss || !takeProfit) return undefined;

    const risk =
      direction === "long" ? entryPrice - stopLoss : stopLoss - entryPrice;
    const reward =
      direction === "long" ? takeProfit - entryPrice : entryPrice - takeProfit;

    if (risk > 0 && reward > 0) {
      return Number((reward / risk).toFixed(2));
    }
    return undefined;
  }

  static async createTrade(userId: string, data: CreateTradeDTO): Promise<ITrade> {
    const quantity = data.quantity ?? data.lotSize ?? 1;
    const riskReward =
      data.riskReward ??
      this.calculateRiskReward(data.direction, data.entryPrice, data.stopLoss, data.takeProfit);

    const tradeData: CreateTradeDTO = {
      ...data,
      quantity,
      lotSize: quantity,
      fees: data.fees ?? 0,
      entryDate: data.entryDate ?? data.entryTime ?? new Date(),
    };

    if (riskReward !== undefined) {
      tradeData.riskReward = riskReward;
    }

    return await TradeRepository.create(userId, tradeData);
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

    const payload: Record<string, any> = { ...updates };

    const direction = updates.direction || existingTrade.direction;
    const entryPrice = updates.entryPrice ?? existingTrade.entryPrice;
    const quantity = updates.quantity ?? updates.lotSize ?? existingTrade.quantity ?? existingTrade.lotSize ?? 1;
    const fees = updates.fees ?? existingTrade.fees ?? 0;
    const stopLoss = updates.stopLoss ?? existingTrade.stopLoss;
    const takeProfit = updates.takeProfit ?? existingTrade.takeProfit;

    payload.quantity = quantity;
    payload.lotSize = quantity;

    // Recalculate Risk/Reward if prices updated
    const computedRR = this.calculateRiskReward(direction, entryPrice, stopLoss, takeProfit);
    if (computedRR !== undefined) {
      payload.riskReward = computedRR;
    }

    // Handle closing and P&L calculation
    const exitPrice = updates.exitPrice ?? existingTrade.exitPrice;
    if (exitPrice !== undefined && (updates.status === "closed" || updates.exitPrice !== undefined)) {
      payload.profitLoss = this.calculateProfitLoss(direction, entryPrice, exitPrice, quantity, fees);
      payload.status = "closed";
      payload.exitPrice = exitPrice;
      payload.exitDate = updates.exitDate ?? updates.exitTime ?? existingTrade.exitDate ?? new Date();
    }

    return await TradeRepository.updateByIdAndUser(tradeId, userId, payload as Partial<ITrade>);
  }

  static async deleteTrade(userId: string, tradeId: string): Promise<boolean> {
    return await TradeRepository.deleteByIdAndUser(tradeId, userId);
  }
}

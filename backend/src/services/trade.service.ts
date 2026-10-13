import { TradeRepository } from "../repository/trade.repository.js";
import type {
  CreateTradeDTO,
  UpdateTradeDTO,
  CloseTradeDTO,
  TradeQueryFilters,
  AnalyticsQueryFilters,
  TradeAnalytics,
  ITrade,
} from "../types/trade.types.js";
import { ApiError } from "../utils/apiError.js";

/**
 * P&L Calculation Formula Documentation & Assumptions:
 *
 * 1. Direction:
 *    - Long trade:  Gross PnL = (Exit Price - Entry Price) * Quantity * Contract Size
 *    - Short trade: Gross PnL = (Entry Price - Exit Price) * Quantity * Contract Size
 *
 * 2. Net P&L:
 *    - Net PnL = Gross PnL - Fees
 *
 * 3. Planned Risk Amount:
 *    - Long:  (Entry Price - Stop Loss) * Quantity * Contract Size (when Stop Loss < Entry Price)
 *    - Short: (Stop Loss - Entry Price) * Quantity * Contract Size (when Stop Loss > Entry Price)
 *
 * 4. Planned Risk:Reward Ratio:
 *    - Long:  (Take Profit - Entry Price) / (Entry Price - Stop Loss)
 *    - Short: (Entry Price - Take Profit) / (Stop Loss - Entry Price)
 *
 * 5. Realized R-Multiple:
 *    - rMultiple = Net PnL / Planned Risk Amount (if Planned Risk > 0)
 *
 * Assumptions & Known Limitations:
 * - Currency Conversion: PnL is computed in the quote currency of the instrument traded.
 *   Multi-currency conversion to account base currency is not performed in MVP.
 * - Contract Size: Defaults to 1 (standard for single shares or spot crypto).
 *   For Forex standard lots, specify contractSize = 100,000.
 */
export class TradeService {
  /**
   * Helper to compute Gross PnL before deducting fees
   */
  public static calculateGrossPnl(
    direction: "long" | "short",
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    contractSize = 1
  ): number {
    const gross =
      direction === "long"
        ? (exitPrice - entryPrice) * quantity * contractSize
        : (entryPrice - exitPrice) * quantity * contractSize;

    return Number(gross.toFixed(2));
  }

  /**
   * Helper to compute Net Profit/Loss (Gross PnL - fees)
   */
  public static calculateProfitLoss(
    direction: "long" | "short",
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    fees = 0,
    contractSize = 1
  ): number {
    const gross = this.calculateGrossPnl(direction, entryPrice, exitPrice, quantity, contractSize);
    return Number((gross - fees).toFixed(2));
  }

  /**
   * Helper to compute planned monetary risk based on Entry and Stop Loss
   */
  public static calculatePlannedRisk(
    direction: "long" | "short",
    entryPrice: number,
    stopLoss?: number,
    quantity = 1,
    contractSize = 1
  ): number | undefined {
    if (stopLoss === undefined || stopLoss <= 0) return undefined;

    const riskPerUnit =
      direction === "long" ? entryPrice - stopLoss : stopLoss - entryPrice;

    if (riskPerUnit <= 0) return undefined;

    return Number((riskPerUnit * quantity * contractSize).toFixed(2));
  }

  /**
   * Helper to compute planned Risk:Reward ratio based on SL and TP
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

  /**
   * Helper to compute realized R-multiple
   */
  public static calculateRMultiple(
    netPnl: number,
    riskAmount?: number
  ): number | undefined {
    if (!riskAmount || riskAmount <= 0) return undefined;
    return Number((netPnl / riskAmount).toFixed(2));
  }

  static async createTrade(userId: string, data: CreateTradeDTO): Promise<ITrade> {
    const quantity = data.quantity ?? data.lotSize ?? 1;
    const contractSize = data.contractSize ?? 1;
    const entryDate = data.entryAt ?? data.entryDate ?? data.entryTime ?? new Date();

    const plannedRR =
      data.plannedRR ??
      data.riskReward ??
      this.calculateRiskReward(data.direction, data.entryPrice, data.stopLoss, data.takeProfit);

    const riskAmount =
      data.riskAmount ??
      this.calculatePlannedRisk(
        data.direction,
        data.entryPrice,
        data.stopLoss,
        quantity,
        contractSize
      );

    const tradeData: CreateTradeDTO = {
      ...data,
      quantity,
      lotSize: quantity,
      contractSize,
      fees: data.fees ?? 0,
      entryAt: entryDate,
      entryDate,
      plannedRR,
      riskReward: plannedRR,
      riskAmount,
    };

    return await TradeRepository.create(userId, tradeData);
  }

  static async getUserTrades(userId: string, filters: TradeQueryFilters) {
    return await TradeRepository.findManyByUser(userId, filters);
  }

  static async getTradeById(userId: string, tradeId: string): Promise<ITrade | null> {
    return await TradeRepository.findByIdAndUser(tradeId, userId);
  }

  /**
   * Dedicated operation for closing an open trade
   */
  static async closeTrade(
    userId: string,
    tradeId: string,
    closeData: CloseTradeDTO
  ): Promise<ITrade> {
    const existingTrade = await TradeRepository.findDocumentByIdAndUser(tradeId, userId);
    if (!existingTrade) {
      throw new ApiError(404, "Trade not found");
    }

    if (existingTrade.status === "closed") {
      throw new ApiError(400, "Trade is already closed");
    }

    if (existingTrade.status === "cancelled") {
      throw new ApiError(400, "Cannot close a cancelled trade");
    }

    const exitPrice = closeData.exitPrice;
    if (exitPrice <= 0) {
      throw new ApiError(400, "Exit price must be greater than zero");
    }

    const exitAt = closeData.exitAt ?? closeData.exitDate ?? new Date();
    const entryAt = existingTrade.entryAt ?? existingTrade.entryDate ?? existingTrade.createdAt;

    if (exitAt < entryAt) {
      throw new ApiError(400, "Exit date cannot be before trade entry date");
    }

    const direction = existingTrade.direction;
    const quantity = existingTrade.quantity ?? existingTrade.lotSize ?? 1;
    const contractSize = existingTrade.contractSize ?? 1;
    const fees = closeData.fees !== undefined ? closeData.fees : existingTrade.fees ?? 0;

    const pnlGross = this.calculateGrossPnl(direction, existingTrade.entryPrice, exitPrice, quantity, contractSize);
    const pnlNet = this.calculateProfitLoss(direction, existingTrade.entryPrice, exitPrice, quantity, fees, contractSize);

    const riskAmount =
      existingTrade.riskAmount ??
      this.calculatePlannedRisk(
        direction,
        existingTrade.entryPrice,
        existingTrade.stopLoss,
        quantity,
        contractSize
      );

    const rMultiple = this.calculateRMultiple(pnlNet, riskAmount);

    const payload: Partial<ITrade> = {
      status: "closed",
      exitPrice,
      exitAt,
      exitDate: exitAt,
      fees,
      pnlGross,
      pnlNet,
      profitLoss: pnlNet,
      rMultiple,
    };

    if (closeData.notes) {
      payload.notes = existingTrade.notes
        ? `${existingTrade.notes}\n${closeData.notes}`
        : closeData.notes;
    }

    const updated = await TradeRepository.updateByIdAndUser(tradeId, userId, payload);
    if (!updated) {
      throw new ApiError(404, "Trade not found");
    }

    return updated;
  }

  static async updateTrade(
    userId: string,
    tradeId: string,
    updates: UpdateTradeDTO
  ): Promise<ITrade | null> {
    const existingTrade = await TradeRepository.findDocumentByIdAndUser(tradeId, userId);
    if (!existingTrade) return null;

    // Validate lifecycle transitions
    if (existingTrade.status === "closed" && updates.status && updates.status !== "closed") {
      throw new ApiError(400, "Cannot change status of a closed trade");
    }

    if (existingTrade.status === "cancelled" && updates.status === "closed") {
      throw new ApiError(400, "Cannot close a cancelled trade directly");
    }

    const payload: Record<string, any> = { ...updates };

    const direction = updates.direction || existingTrade.direction;
    const entryPrice = updates.entryPrice ?? existingTrade.entryPrice;
    const quantity = updates.quantity ?? updates.lotSize ?? existingTrade.quantity ?? existingTrade.lotSize ?? 1;
    const contractSize = updates.contractSize ?? existingTrade.contractSize ?? 1;
    const fees = updates.fees ?? existingTrade.fees ?? 0;
    const stopLoss = updates.stopLoss ?? existingTrade.stopLoss;
    const takeProfit = updates.takeProfit ?? existingTrade.takeProfit;

    payload.quantity = quantity;
    payload.lotSize = quantity;
    payload.contractSize = contractSize;

    // Recalculate Risk/Reward & Risk Amount
    const computedRR = this.calculateRiskReward(direction, entryPrice, stopLoss, takeProfit);
    if (computedRR !== undefined) {
      payload.plannedRR = computedRR;
      payload.riskReward = computedRR;
    }

    const computedRiskAmount = this.calculatePlannedRisk(direction, entryPrice, stopLoss, quantity, contractSize);
    if (computedRiskAmount !== undefined) {
      payload.riskAmount = computedRiskAmount;
    }

    // Handle trade closing through update
    const exitPrice = updates.exitPrice ?? existingTrade.exitPrice;
    if (exitPrice !== undefined && (updates.status === "closed" || updates.exitPrice !== undefined)) {
      const exitAt = updates.exitAt ?? updates.exitDate ?? updates.exitTime ?? existingTrade.exitAt ?? existingTrade.exitDate ?? new Date();
      const entryAt = updates.entryAt ?? updates.entryDate ?? existingTrade.entryAt ?? existingTrade.entryDate ?? existingTrade.createdAt;

      if (exitAt < entryAt) {
        throw new ApiError(400, "Exit date cannot be before trade entry date");
      }

      const pnlGross = this.calculateGrossPnl(direction, entryPrice, exitPrice, quantity, contractSize);
      const pnlNet = this.calculateProfitLoss(direction, entryPrice, exitPrice, quantity, fees, contractSize);
      const rMultiple = this.calculateRMultiple(pnlNet, payload.riskAmount ?? existingTrade.riskAmount);

      payload.status = "closed";
      payload.exitPrice = exitPrice;
      payload.exitAt = exitAt;
      payload.exitDate = exitAt;
      payload.pnlGross = pnlGross;
      payload.pnlNet = pnlNet;
      payload.profitLoss = pnlNet;
      payload.rMultiple = rMultiple;
    } else if (updates.status === "cancelled") {
      payload.status = "cancelled";
    }

    return await TradeRepository.updateByIdAndUser(tradeId, userId, payload as Partial<ITrade>);
  }

  static async deleteTrade(userId: string, tradeId: string): Promise<boolean> {
    return await TradeRepository.deleteByIdAndUser(tradeId, userId);
  }

  /**
   * Analytics calculation engine for user trade journal
   */
  static async getAnalytics(
    userId: string,
    filters: AnalyticsQueryFilters
  ): Promise<TradeAnalytics> {
    const trades = await TradeRepository.getAnalyticsTrades(userId, filters);

    const totalTrades = trades.length;
    let openTrades = 0;
    let closedTrades = 0;
    let cancelledTrades = 0;

    let winningTrades = 0;
    let losingTrades = 0;
    let breakEvenTrades = 0;

    let totalGrossPnl = 0;
    let totalNetPnl = 0;
    let totalFees = 0;
    let grossProfit = 0;
    let grossLoss = 0;
    let totalRMultiple = 0;
    let rMultipleCount = 0;

    for (const trade of trades) {
      if (trade.status === "open") {
        openTrades++;
      } else if (trade.status === "cancelled") {
        cancelledTrades++;
      } else if (trade.status === "closed") {
        closedTrades++;

        const netPnl = trade.pnlNet ?? trade.profitLoss ?? 0;
        const grossPnl = trade.pnlGross ?? netPnl + (trade.fees ?? 0);
        const fees = trade.fees ?? 0;

        totalGrossPnl += grossPnl;
        totalNetPnl += netPnl;
        totalFees += fees;

        if (netPnl > 0) {
          winningTrades++;
          grossProfit += netPnl;
        } else if (netPnl < 0) {
          losingTrades++;
          grossLoss += Math.abs(netPnl);
        } else {
          breakEvenTrades++;
        }

        if (trade.rMultiple !== undefined && trade.rMultiple !== null) {
          totalRMultiple += trade.rMultiple;
          rMultipleCount++;
        }
      }
    }

    const winRate =
      closedTrades > 0 ? Number(((winningTrades / closedTrades) * 100).toFixed(2)) : 0;
    const lossRate =
      closedTrades > 0 ? Number(((losingTrades / closedTrades) * 100).toFixed(2)) : 0;

    const averageWin =
      winningTrades > 0 ? Number((grossProfit / winningTrades).toFixed(2)) : 0;
    const averageLoss =
      losingTrades > 0 ? Number((grossLoss / losingTrades).toFixed(2)) : 0;

    let profitFactor: number | null = null;
    if (grossLoss > 0) {
      profitFactor = Number((grossProfit / grossLoss).toFixed(2));
    } else if (grossLoss === 0 && grossProfit > 0) {
      profitFactor = null; // Infinite/undefined when no losses
    } else {
      profitFactor = 0;
    }

    const averageRMultiple =
      rMultipleCount > 0 ? Number((totalRMultiple / rMultipleCount).toFixed(2)) : null;

    const expectancy =
      closedTrades > 0 ? Number((totalNetPnl / closedTrades).toFixed(2)) : 0;

    return {
      summary: {
        totalTrades,
        openTrades,
        closedTrades,
        cancelledTrades,
      },
      performance: {
        winningTrades,
        losingTrades,
        breakEvenTrades,
        winRate,
        lossRate,
        totalGrossPnl: Number(totalGrossPnl.toFixed(2)),
        totalNetPnl: Number(totalNetPnl.toFixed(2)),
        totalFees: Number(totalFees.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
        grossLoss: Number(grossLoss.toFixed(2)),
        averageWin,
        averageLoss,
        profitFactor,
        averageRMultiple,
        expectancy,
      },
    };
  }
}

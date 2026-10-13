import type { Types } from "mongoose";

export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed" | "cancelled";
export type MarketType = "forex" | "crypto" | "stocks" | "indices" | "commodities" | "other";

export interface ITrade {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  symbol: string;
  market: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number | undefined;
  quantity: number;
  lotSize: number;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  entryDate: Date;
  exitDate?: Date | undefined;
  fees: number;
  profitLoss?: number | undefined;
  riskReward?: number | undefined;
  strategy?: string | undefined;
  notes?: string | undefined;
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTradeDTO {
  symbol: string;
  market?: string | undefined;
  direction: TradeDirection;
  entryPrice: number;
  quantity?: number | undefined;
  lotSize?: number | undefined;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  entryDate?: Date | undefined;
  entryTime?: Date | undefined;
  fees?: number | undefined;
  riskReward?: number | undefined;
  strategy?: string | undefined;
  notes?: string | undefined;
}

export interface UpdateTradeDTO {
  symbol?: string | undefined;
  market?: string | undefined;
  direction?: TradeDirection | undefined;
  entryPrice?: number | undefined;
  exitPrice?: number | undefined;
  quantity?: number | undefined;
  lotSize?: number | undefined;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  entryDate?: Date | undefined;
  entryTime?: Date | undefined;
  exitDate?: Date | undefined;
  exitTime?: Date | undefined;
  fees?: number | undefined;
  riskReward?: number | undefined;
  strategy?: string | undefined;
  notes?: string | undefined;
  status?: TradeStatus | undefined;
}

export interface TradeQueryFilters {
  page?: number | undefined;
  limit?: number | undefined;
  symbol?: string | undefined;
  market?: string | undefined;
  status?: TradeStatus | undefined;
  direction?: TradeDirection | undefined;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  sortBy?: string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
}

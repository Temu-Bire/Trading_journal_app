import { Types } from "mongoose";

export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed" | "cancelled";

export interface ITrade {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: Date;
  exitTime?: Date;
  status: TradeStatus;
  notes?: string;
  profitLoss?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTradeDTO {
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime?: Date;
  notes?: string;
}

export interface UpdateTradeDTO {
  symbol?: string;
  direction?: TradeDirection;
  entryPrice?: number;
  exitPrice?: number;
  lotSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime?: Date;
  exitTime?: Date;
  status?: TradeStatus;
  notes?: string;
}

export interface TradeQueryFilters {
  page?: number;
  limit?: number;
  symbol?: string;
  status?: TradeStatus;
  direction?: TradeDirection;
}
import type { Types } from "mongoose";

export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed" | "cancelled";
export type MarketType =
  | "forex"
  | "crypto"
  | "stocks"
  | "indices"
  | "commodities"
  | "other";

export const VALID_TRADE_STATUS_TRANSITIONS: Record<TradeStatus, TradeStatus[]> = {
  open: ["closed", "cancelled"],
  closed: [], // Terminal state in MVP: prevent accidental re-closing or re-opening
  cancelled: ["open"], // Re-opening a cancelled trade is permitted
};

export const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "entryAt",
  "exitAt",
  "pnlNet",
  "pnlGross",
  "symbol",
  "entryPrice",
  "exitPrice",
] as const;

export type AllowedSortField = (typeof ALLOWED_SORT_FIELDS)[number];

export interface ITrade {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  symbol: string;
  market: MarketType | string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number | undefined;
  quantity: number;
  contractSize: number;
  lotSize?: number | undefined; // Backward compatibility alias for quantity
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  entryAt: Date;
  exitAt?: Date | undefined;
  entryDate?: Date | undefined; // Backward compatibility alias
  exitDate?: Date | undefined; // Backward compatibility alias
  fees: number;
  riskAmount?: number | undefined;
  plannedRR?: number | undefined;
  pnlGross?: number | undefined;
  pnlNet?: number | undefined;
  rMultiple?: number | undefined;
  profitLoss?: number | undefined; // Backward compatibility alias for pnlNet
  riskReward?: number | undefined; // Backward compatibility alias for plannedRR
  strategy?: string | undefined;
  notes?: string | undefined;
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTradeDTO {
  symbol: string;
  market?: MarketType | string | undefined;
  direction: TradeDirection;
  entryPrice: number;
  quantity?: number | undefined;
  contractSize?: number | undefined;
  lotSize?: number | undefined; // legacy alias
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  entryAt?: Date | undefined;
  entryDate?: Date | undefined; // legacy alias
  entryTime?: Date | undefined; // legacy alias
  fees?: number | undefined;
  strategy?: string | undefined;
  notes?: string | undefined;
  // Server-computed fields (optional on input, calculated on server)
  plannedRR?: number | undefined;
  riskReward?: number | undefined;
  riskAmount?: number | undefined;
}

export interface UpdateTradeDTO {
  symbol?: string | undefined;
  market?: MarketType | string | undefined;
  direction?: TradeDirection | undefined;
  entryPrice?: number | undefined;
  exitPrice?: number | undefined;
  quantity?: number | undefined;
  contractSize?: number | undefined;
  lotSize?: number | undefined;
  stopLoss?: number | undefined;
  takeProfit?: number | undefined;
  entryAt?: Date | undefined;
  entryDate?: Date | undefined;
  entryTime?: Date | undefined;
  exitAt?: Date | undefined;
  exitDate?: Date | undefined;
  exitTime?: Date | undefined;
  fees?: number | undefined;
  strategy?: string | undefined;
  notes?: string | undefined;
  status?: TradeStatus | undefined;
  plannedRR?: number | undefined;
  riskReward?: number | undefined;
  riskAmount?: number | undefined;
  pnlGross?: number | undefined;
  pnlNet?: number | undefined;
  profitLoss?: number | undefined;
  rMultiple?: number | undefined;
}

export interface CloseTradeDTO {
  exitPrice: number;
  exitAt?: Date | undefined;
  exitDate?: Date | undefined;
  fees?: number | undefined;
  notes?: string | undefined;
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
  sortBy?: AllowedSortField | string | undefined;
  sortOrder?: "asc" | "desc" | undefined;
}

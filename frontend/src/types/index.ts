export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed" | "cancelled";
export type MarketType =
  | "forex"
  | "crypto"
  | "stocks"
  | "indices"
  | "commodities"
  | "other";

export interface ITrade {
  _id: string;
  userId: string;
  symbol: string;
  market: MarketType | string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  contractSize: number;
  lotSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  entryAt: string;
  exitAt?: string;
  entryDate?: string;
  exitDate?: string;
  fees: number;
  riskAmount?: number;
  plannedRR?: number;
  pnlGross?: number;
  pnlNet?: number;
  rMultiple?: number;
  profitLoss?: number;
  riskReward?: number;
  strategy?: string;
  notes?: string;
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTradeDTO {
  symbol: string;
  market?: MarketType | string;
  direction: TradeDirection;
  entryPrice: number;
  quantity?: number;
  contractSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  entryAt?: string;
  fees?: number;
  strategy?: string;
  notes?: string;
}

export interface UpdateTradeDTO {
  symbol?: string;
  market?: MarketType | string;
  direction?: TradeDirection;
  entryPrice?: number;
  exitPrice?: number;
  quantity?: number;
  contractSize?: number;
  stopLoss?: number;
  takeProfit?: number;
  entryAt?: string;
  exitAt?: string;
  fees?: number;
  strategy?: string;
  notes?: string;
  status?: TradeStatus;
}

export interface CloseTradeDTO {
  exitPrice: number;
  exitAt?: string;
  fees?: number;
  notes?: string;
}

export interface TradeAnalytics {
  summary: {
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    cancelledTrades: number;
  };
  performance: {
    winningTrades: number;
    losingTrades: number;
    breakEvenTrades: number;
    winRate: number;
    lossRate: number;
    totalGrossPnl: number;
    totalNetPnl: number;
    totalFees: number;
    grossProfit: number;
    grossLoss: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number | null;
    averageRMultiple: number | null;
    expectancy: number;
  };
}

export interface TradeQueryFilters {
  page?: number;
  limit?: number;
  symbol?: string;
  market?: string;
  status?: TradeStatus;
  direction?: TradeDirection;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

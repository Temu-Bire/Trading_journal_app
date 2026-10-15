export interface IStrategy {
  id: string;
  userId?: string;
  name: string;
  description: string;
  market: string;
  symbols?: string;
  entryRules: string[];
  exitRules: string[];
  riskRules: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_STRATEGIES: Omit<IStrategy, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Order Block & FVG Retest",
    description:
      "Institutional liquidity sweep followed by a market structure shift and retest into an unfilled Fair Value Gap.",
    market: "forex",
    symbols: "EURUSD, GBPUSD, USDJPY",
    entryRules: [
      "Liquidity swept on higher timeframe (1h or 4h)",
      "Displacement market structure shift (MSS) on 15m",
      "Limit entry at 50% retracement of the Fair Value Gap",
    ],
    exitRules: [
      "Target opposing liquidity pool / swing high",
      "Take 50% profit at 2.0R and trail stop to breakeven",
    ],
    riskRules: [
      "Max 1.0% account equity risk per trade",
      "Hard stop loss placed behind the displacement swing low",
      "Never widen stop loss during an active session",
    ],
    tags: ["SMC", "Price Action", "FVG", "High-Probability"],
  },
  {
    name: "Breakout & Trend Retest",
    description:
      "Trend continuation strategy capturing clean retests of multi-day consolidation levels with elevated volume.",
    market: "stocks",
    symbols: "NVDA, AAPL, MSFT, SPY",
    entryRules: [
      "Consolidation range breakout with relative volume > 1.8x",
      "First pull-back test to the prior resistance level now acting as support",
      "Bullish confirmation candle closing in upper 25% of range",
    ],
    exitRules: [
      "Take profit at 2.5x planned risk or daily key resistance",
      "Exit immediately if candle closes back inside previous consolidation",
    ],
    riskRules: [
      "Risk capped at 1.0% of portfolio",
      "Stop loss set 2 ATR below retest support",
    ],
    tags: ["Momentum", "Breakout", "Volume", "Equities"],
  },
  {
    name: "VWAP Mean Reversion",
    description:
      "Fading overextended intraday price spikes that extend beyond 2.5 standard deviations from the daily anchored VWAP.",
    market: "crypto",
    symbols: "BTCUSD, ETHUSD, SOLUSD",
    entryRules: [
      "Price stretches 2.5 standard deviations from session VWAP",
      "RSI indicator reaches extreme overbought (>75) or oversold (<25)",
      "Reversal hammer or shooting star on 5m chart",
    ],
    exitRules: [
      "Full take profit at the VWAP benchmark baseline",
      "Time stop: close position if baseline isn't reached within 90 minutes",
    ],
    riskRules: [
      "Max 0.75% account risk",
      "Stop loss 0.4 standard deviations above reversal high",
    ],
    tags: ["Mean Reversion", "VWAP", "Intraday", "Crypto"],
  },
];

function getStorageKey(userId?: string) {
  return `tj_strategies_${userId || "default"}`;
}

export function getStrategies(userId?: string): IStrategy[] {
  if (typeof window === "undefined") return [];

  const key = getStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Seed default strategies
      const seeded: IStrategy[] = DEFAULT_STRATEGIES.map((s, idx) => ({
        ...s,
        id: `strat-${idx + 1}-${Date.now()}`,
        userId,
        createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read strategies from localStorage", err);
    return [];
  }
}

export function saveStrategy(
  data: Omit<IStrategy, "id" | "createdAt" | "updatedAt"> & { id?: string },
  userId?: string
): IStrategy {
  const strategies = getStrategies(userId);
  const now = new Date().toISOString();

  if (data.id) {
    // Update
    const index = strategies.findIndex((s) => s.id === data.id);
    if (index !== -1) {
      const updated: IStrategy = {
        ...strategies[index],
        ...data,
        id: data.id,
        updatedAt: now,
      };
      strategies[index] = updated;
      localStorage.setItem(getStorageKey(userId), JSON.stringify(strategies));
      return updated;
    }
  }

  // Create
  const newStrategy: IStrategy = {
    ...data,
    id: `strat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  strategies.unshift(newStrategy);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(strategies));
  return newStrategy;
}

export function deleteStrategy(id: string, userId?: string): boolean {
  const strategies = getStrategies(userId);
  const filtered = strategies.filter((s) => s.id !== id);
  if (filtered.length !== strategies.length) {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    return true;
  }
  return false;
}

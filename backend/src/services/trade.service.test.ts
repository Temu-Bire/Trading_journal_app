import { jest } from "@jest/globals";
import { TradeRepository } from "../repository/trade.repository.js";
import { TradeService } from "./trade.service.js";

describe("Trade Service", () => {
  const userId = "507f1f77bcf86cd799439011";
  const tradeId = "507f1f77bcf86cd799439022";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Calculations", () => {
    it("should calculate profit/loss for long trades net of fees", () => {
      // Long win: (150 - 100) * 2 - 10 = 90
      const winPnl = TradeService.calculateProfitLoss("long", 100, 150, 2, 10);
      expect(winPnl).toBe(90);

      // Long loss: (80 - 100) * 2 - 10 = -50
      const lossPnl = TradeService.calculateProfitLoss("long", 100, 80, 2, 10);
      expect(lossPnl).toBe(-50);
    });

    it("should calculate profit/loss for short trades net of fees", () => {
      // Short win: (100 - 80) * 3 - 5 = 55
      const winPnl = TradeService.calculateProfitLoss("short", 100, 80, 3, 5);
      expect(winPnl).toBe(55);

      // Short loss: (100 - 120) * 3 - 5 = -65
      const lossPnl = TradeService.calculateProfitLoss("short", 100, 120, 3, 5);
      expect(lossPnl).toBe(-65);
    });

    it("should calculate risk:reward ratio correctly", () => {
      // Long: entry 100, SL 90, TP 130 -> Risk 10, Reward 30 -> RR 3.0
      const rrLong = TradeService.calculateRiskReward("long", 100, 90, 130);
      expect(rrLong).toBe(3);

      // Short: entry 100, SL 105, TP 85 -> Risk 5, Reward 15 -> RR 3.0
      const rrShort = TradeService.calculateRiskReward("short", 100, 105, 85);
      expect(rrShort).toBe(3);

      // Incomplete parameters
      expect(TradeService.calculateRiskReward("long", 100, undefined, 120)).toBeUndefined();
    });
  });

  describe("createTrade", () => {
    it("should create a trade with computed risk/reward and defaults", async () => {
      const input = {
        symbol: "EURUSD",
        market: "forex",
        direction: "long" as const,
        entryPrice: 1.1000,
        stopLoss: 1.0950,
        takeProfit: 1.1100,
        quantity: 1,
      };

      const mockCreated = {
        _id: tradeId as any,
        userId: userId as any,
        ...input,
        lotSize: 1,
        fees: 0,
        riskReward: 2.0,
        status: "open" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(TradeRepository, "create").mockResolvedValue(mockCreated as any);

      const result = await TradeService.createTrade(userId, input);

      expect(TradeRepository.create).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          symbol: "EURUSD",
          quantity: 1,
          riskReward: 2,
        })
      );
      expect(result.status).toBe("open");
    });
  });

  describe("getUserTrades", () => {
    it("should fetch paginated trades for a user with filters", async () => {
      const mockResult = {
        trades: [{ _id: tradeId, symbol: "AAPL" }] as any,
        pagination: { total: 1, page: 1, limit: 20, pages: 1 },
      };

      jest.spyOn(TradeRepository, "findManyByUser").mockResolvedValue(mockResult);

      const result = await TradeService.getUserTrades(userId, { symbol: "AAPL" });

      expect(TradeRepository.findManyByUser).toHaveBeenCalledWith(userId, { symbol: "AAPL" });
      expect(result.trades).toHaveLength(1);
    });
  });

  describe("getTradeById", () => {
    it("should return trade if user is the owner", async () => {
      const mockTrade = { _id: tradeId, userId, symbol: "BTCUSDT" };
      jest.spyOn(TradeRepository, "findByIdAndUser").mockResolvedValue(mockTrade as any);

      const result = await TradeService.getTradeById(userId, tradeId);
      expect(result).toEqual(mockTrade);
    });

    it("should return null if trade does not exist or belongs to another user", async () => {
      jest.spyOn(TradeRepository, "findByIdAndUser").mockResolvedValue(null);

      const result = await TradeService.getTradeById("other_user", tradeId);
      expect(result).toBeNull();
    });
  });

  describe("updateTrade", () => {
    it("should auto-close trade and calculate P&L when exitPrice is provided", async () => {
      const existingTrade = {
        _id: tradeId,
        userId,
        direction: "long",
        entryPrice: 100,
        quantity: 2,
        fees: 5,
        status: "open",
      };

      jest.spyOn(TradeRepository, "findDocumentByIdAndUser").mockResolvedValue(existingTrade as any);
      jest.spyOn(TradeRepository, "updateByIdAndUser").mockImplementation(
        async (_id, _uId, updates) => ({ ...existingTrade, ...updates } as any)
      );

      const result = await TradeService.updateTrade(userId, tradeId, { exitPrice: 120 });

      expect(result?.status).toBe("closed");
      // (120 - 100) * 2 - 5 = 35
      expect(result?.profitLoss).toBe(35);
    });

    it("should return null if trade is not found or user is not the owner", async () => {
      jest.spyOn(TradeRepository, "findDocumentByIdAndUser").mockResolvedValue(null);

      const result = await TradeService.updateTrade("wrong_user", tradeId, { notes: "test" });
      expect(result).toBeNull();
    });
  });

  describe("deleteTrade", () => {
    it("should delete trade and return true for owner", async () => {
      jest.spyOn(TradeRepository, "deleteByIdAndUser").mockResolvedValue(true);

      const result = await TradeService.deleteTrade(userId, tradeId);
      expect(result).toBe(true);
    });

    it("should return false if user does not own the trade", async () => {
      jest.spyOn(TradeRepository, "deleteByIdAndUser").mockResolvedValue(false);

      const result = await TradeService.deleteTrade("other_user", tradeId);
      expect(result).toBe(false);
    });
  });
});

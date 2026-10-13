import { jest } from "@jest/globals";
import { TradeRepository } from "../repository/trade.repository.js";
import { TradeService } from "./trade.service.js";
import { ApiError } from "../utils/apiError.js";

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

    it("should calculate gross P&L taking into account contractSize", () => {
      // Forex 1 lot with contract size 100,000: (1.1050 - 1.1000) * 1 * 100000 = 500
      const gross = TradeService.calculateGrossPnl("long", 1.1000, 1.1050, 1, 100000);
      expect(gross).toBe(500);
    });

    it("should calculate planned monetary risk amount", () => {
      // Long: entry 100, SL 95, qty 10, contractSize 1 -> 5 * 10 * 1 = 50
      const riskLong = TradeService.calculatePlannedRisk("long", 100, 95, 10, 1);
      expect(riskLong).toBe(50);

      // Short: entry 100, SL 105, qty 2 -> 5 * 2 = 10
      const riskShort = TradeService.calculatePlannedRisk("short", 100, 105, 2, 1);
      expect(riskShort).toBe(10);

      // Undefined if SL not provided or invalid
      expect(TradeService.calculatePlannedRisk("long", 100, undefined, 10)).toBeUndefined();
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

    it("should calculate realized R-multiple", () => {
      // Net PnL 150, risk amount 50 -> 3.0
      expect(TradeService.calculateRMultiple(150, 50)).toBe(3);
      // Net loss -50, risk amount 50 -> -1.0
      expect(TradeService.calculateRMultiple(-50, 50)).toBe(-1);
      // Risk amount zero or undefined
      expect(TradeService.calculateRMultiple(150, 0)).toBeUndefined();
      expect(TradeService.calculateRMultiple(150, undefined)).toBeUndefined();
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
        contractSize: 1,
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
          plannedRR: 2,
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

  describe("closeTrade", () => {
    const entryDate = new Date("2026-01-01T10:00:00Z");
    const openTrade = {
      _id: tradeId,
      userId,
      direction: "long" as const,
      entryPrice: 100,
      quantity: 2,
      contractSize: 1,
      stopLoss: 90,
      riskAmount: 20,
      fees: 5,
      status: "open" as const,
      entryAt: entryDate,
      createdAt: entryDate,
    };

    it("should successfully close trade and compute P&L, fees, and R-multiple", async () => {
      jest.spyOn(TradeRepository, "findDocumentByIdAndUser").mockResolvedValue(openTrade as any);
      jest.spyOn(TradeRepository, "updateByIdAndUser").mockImplementation(
        async (_id, _uId, updates) => ({ ...openTrade, ...updates } as any)
      );

      const closeDate = new Date("2026-01-02T10:00:00Z");
      const result = await TradeService.closeTrade(userId, tradeId, {
        exitPrice: 120,
        exitAt: closeDate,
        fees: 10,
        notes: "Target reached",
      });

      expect(result.status).toBe("closed");
      // Gross: (120 - 100) * 2 = 40
      expect(result.pnlGross).toBe(40);
      // Net: 40 - 10 = 30
      expect(result.pnlNet).toBe(30);
      // R-multiple: 30 / 20 = 1.5
      expect(result.rMultiple).toBe(1.5);
    });

    it("should throw 400 ApiError when closing an already closed trade", async () => {
      const closedTrade = { ...openTrade, status: "closed" };
      jest.spyOn(TradeRepository, "findDocumentByIdAndUser").mockResolvedValue(closedTrade as any);

      await expect(
        TradeService.closeTrade(userId, tradeId, { exitPrice: 110 })
      ).rejects.toThrow("Trade is already closed");
    });

    it("should throw 400 ApiError when closing a cancelled trade", async () => {
      const cancelledTrade = { ...openTrade, status: "cancelled" };
      jest.spyOn(TradeRepository, "findDocumentByIdAndUser").mockResolvedValue(cancelledTrade as any);

      await expect(
        TradeService.closeTrade(userId, tradeId, { exitPrice: 110 })
      ).rejects.toThrow("Cannot close a cancelled trade");
    });

    it("should throw 400 ApiError when exit date is before entry date", async () => {
      jest.spyOn(TradeRepository, "findDocumentByIdAndUser").mockResolvedValue(openTrade as any);

      const invalidExitDate = new Date("2025-12-31T00:00:00Z");
      await expect(
        TradeService.closeTrade(userId, tradeId, {
          exitPrice: 110,
          exitAt: invalidExitDate,
        })
      ).rejects.toThrow("Exit date cannot be before trade entry date");
    });

    it("should throw 404 ApiError if trade is not found", async () => {
      jest.spyOn(TradeRepository, "findDocumentByIdAndUser").mockResolvedValue(null);

      await expect(
        TradeService.closeTrade(userId, "nonexistent", { exitPrice: 110 })
      ).rejects.toThrow("Trade not found");
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

    it("should reject modifying status of a closed trade", async () => {
      const closedTrade = {
        _id: tradeId,
        userId,
        status: "closed",
      };

      jest.spyOn(TradeRepository, "findDocumentByIdAndUser").mockResolvedValue(closedTrade as any);

      await expect(
        TradeService.updateTrade(userId, tradeId, { status: "open" })
      ).rejects.toThrow("Cannot change status of a closed trade");
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

  describe("Analytics Engine", () => {
    it("should return clean zero-initialized metrics for an empty trade set", async () => {
      jest.spyOn(TradeRepository, "getAnalyticsTrades").mockResolvedValue([]);

      const analytics = await TradeService.getAnalytics(userId, {});

      expect(analytics.summary).toEqual({
        totalTrades: 0,
        openTrades: 0,
        closedTrades: 0,
        cancelledTrades: 0,
      });
      expect(analytics.performance.winRate).toBe(0);
      expect(analytics.performance.totalNetPnl).toBe(0);
      expect(analytics.performance.profitFactor).toBe(0);
      expect(analytics.performance.expectancy).toBe(0);
    });

    it("should calculate correct performance metrics excluding open and cancelled trades", async () => {
      const mockTrades = [
        // Winning closed trade
        { status: "closed", pnlGross: 110, pnlNet: 100, fees: 10, rMultiple: 2.0 },
        // Winning closed trade
        { status: "closed", pnlGross: 60, pnlNet: 50, fees: 10, rMultiple: 1.0 },
        // Losing closed trade
        { status: "closed", pnlGross: -45, pnlNet: -50, fees: 5, rMultiple: -1.0 },
        // Breakeven closed trade
        { status: "closed", pnlGross: 5, pnlNet: 0, fees: 5, rMultiple: 0.0 },
        // Open trade (must be excluded from performance)
        { status: "open", entryPrice: 100 },
        // Cancelled trade (must be excluded from performance)
        { status: "cancelled", entryPrice: 50 },
      ];

      jest.spyOn(TradeRepository, "getAnalyticsTrades").mockResolvedValue(mockTrades as any);

      const analytics = await TradeService.getAnalytics(userId, {});

      expect(analytics.summary.totalTrades).toBe(6);
      expect(analytics.summary.closedTrades).toBe(4);
      expect(analytics.summary.openTrades).toBe(1);
      expect(analytics.summary.cancelledTrades).toBe(1);

      // Performance: 4 closed trades -> 2 wins, 1 loss, 1 breakeven
      expect(analytics.performance.winningTrades).toBe(2);
      expect(analytics.performance.losingTrades).toBe(1);
      expect(analytics.performance.breakEvenTrades).toBe(1);
      expect(analytics.performance.winRate).toBe(50); // 2/4 = 50%
      expect(analytics.performance.lossRate).toBe(25); // 1/4 = 25%

      // PnL
      expect(analytics.performance.totalNetPnl).toBe(100); // 100 + 50 - 50 + 0 = 100
      expect(analytics.performance.grossProfit).toBe(150); // 100 + 50 = 150
      expect(analytics.performance.grossLoss).toBe(50); // abs(-50) = 50
      expect(analytics.performance.averageWin).toBe(75); // 150 / 2 = 75
      expect(analytics.performance.averageLoss).toBe(50); // 50 / 1 = 50
      expect(analytics.performance.profitFactor).toBe(3); // 150 / 50 = 3.0
      expect(analytics.performance.expectancy).toBe(25); // 100 / 4 = 25
      expect(analytics.performance.averageRMultiple).toBe(0.5); // (2 + 1 - 1 + 0) / 4 = 0.5
    });

    it("should handle division by zero safely when there are no losing trades", async () => {
      const mockTrades = [
        { status: "closed", pnlGross: 100, pnlNet: 100, fees: 0, rMultiple: 2.0 },
      ];
      jest.spyOn(TradeRepository, "getAnalyticsTrades").mockResolvedValue(mockTrades as any);

      const analytics = await TradeService.getAnalytics(userId, {});

      expect(analytics.performance.winningTrades).toBe(1);
      expect(analytics.performance.losingTrades).toBe(0);
      expect(analytics.performance.winRate).toBe(100);
      expect(analytics.performance.profitFactor).toBeNull(); // Safe null when grossLoss == 0
    });
  });
});

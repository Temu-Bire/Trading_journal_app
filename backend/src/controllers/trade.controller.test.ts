import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import { TradeService } from "../services/trade.service.js";
import { generateAccessToken } from "../utils/jwt.js";

describe("Trade API Integration (Supertest)", () => {
  const userId = "507f1f77bcf86cd799439011";
  const tradeId = "507f1f77bcf86cd799439022";
  const validToken = generateAccessToken({
    userId,
    email: "trader@example.com",
    role: "user",
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Authentication Guard", () => {
    it("should return 401 when request lacks authorization token", async () => {
      const res = await request(app).get("/api/v1/trades");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/trades", () => {
    it("should create a new trade with valid input and return 201", async () => {
      const mockTrade = {
        _id: tradeId,
        userId,
        symbol: "EURUSD",
        market: "forex",
        direction: "long",
        entryPrice: 1.1,
        quantity: 1,
        status: "open",
      };

      jest.spyOn(TradeService, "createTrade").mockResolvedValue(mockTrade as any);

      const res = await request(app)
        .post("/api/v1/trades")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          symbol: "EURUSD",
          market: "forex",
          direction: "long",
          entryPrice: 1.1,
          quantity: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.symbol).toBe("EURUSD");
    });

    it("should return 400 when body fails Zod validation", async () => {
      const res = await request(app)
        .post("/api/v1/trades")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          symbol: "", // Invalid symbol
          direction: "invalid_direction",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe("GET /api/v1/trades/analytics", () => {
    it("should return analytics metrics for authenticated user", async () => {
      const mockAnalytics = {
        summary: { totalTrades: 1, openTrades: 0, closedTrades: 1, cancelledTrades: 0 },
        performance: {
          winningTrades: 1,
          losingTrades: 0,
          breakEvenTrades: 0,
          winRate: 100,
          lossRate: 0,
          totalGrossPnl: 50,
          totalNetPnl: 45,
          totalFees: 5,
          grossProfit: 45,
          grossLoss: 0,
          averageWin: 45,
          averageLoss: 0,
          profitFactor: null,
          averageRMultiple: 1.5,
          expectancy: 45,
        },
      };

      jest.spyOn(TradeService, "getAnalytics").mockResolvedValue(mockAnalytics as any);

      const res = await request(app)
        .get("/api/v1/trades/analytics")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalTrades).toBe(1);
      expect(res.body.data.performance.winRate).toBe(100);
    });
  });

  describe("POST /api/v1/trades/:id/close", () => {
    it("should close trade and return 200 with calculated results", async () => {
      const mockClosedTrade = {
        _id: tradeId,
        userId,
        symbol: "AAPL",
        direction: "long",
        entryPrice: 150,
        exitPrice: 160,
        status: "closed",
        pnlNet: 10,
      };

      jest.spyOn(TradeService, "closeTrade").mockResolvedValue(mockClosedTrade as any);

      const res = await request(app)
        .post(`/api/v1/trades/${tradeId}/close`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          exitPrice: 160,
          fees: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("closed");
      expect(res.body.data.exitPrice).toBe(160);
    });

    it("should return 400 when invalid trade ID is provided", async () => {
      const res = await request(app)
        .post("/api/v1/trades/invalid-id/close")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          exitPrice: 160,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid trade ID format");
    });
  });
});

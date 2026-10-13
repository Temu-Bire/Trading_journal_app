import { Schema, model } from "mongoose";
import type { ITrade } from "../types/trade.types.js";

const tradeSchema = new Schema<ITrade>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    market: {
      type: String,
      enum: ["forex", "crypto", "stocks", "indices", "commodities", "other"],
      trim: true,
      default: "forex",
    },
    direction: {
      type: String,
      enum: ["long", "short"],
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    exitPrice: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    contractSize: {
      type: Number,
      default: 1,
      min: 1,
    },
    lotSize: {
      type: Number,
      default: 1,
      min: 0,
    },
    stopLoss: {
      type: Number,
      min: 0,
    },
    takeProfit: {
      type: Number,
      min: 0,
    },
    entryAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    exitAt: {
      type: Date,
    },
    entryDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    exitDate: {
      type: Date,
    },
    fees: {
      type: Number,
      default: 0,
      min: 0,
    },
    riskAmount: {
      type: Number,
    },
    plannedRR: {
      type: Number,
    },
    riskReward: {
      type: Number,
    },
    pnlGross: {
      type: Number,
    },
    pnlNet: {
      type: Number,
    },
    rMultiple: {
      type: Number,
    },
    profitLoss: {
      type: Number,
    },
    strategy: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["open", "closed", "cancelled"],
      default: "open",
      index: true,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize canonical and backward-compatible fields before validation
tradeSchema.pre("validate", function () {
  if (this.entryAt && !this.entryDate) {
    this.entryDate = this.entryAt;
  } else if (this.entryDate && !this.entryAt) {
    this.entryAt = this.entryDate;
  }

  if (this.exitAt && !this.exitDate) {
    this.exitDate = this.exitAt;
  } else if (this.exitDate && !this.exitAt) {
    this.exitAt = this.exitDate;
  }

  if (this.quantity !== undefined && this.lotSize === undefined) {
    this.lotSize = this.quantity;
  } else if (this.lotSize !== undefined && this.quantity === undefined) {
    this.quantity = this.lotSize;
  }

  if (this.pnlNet !== undefined && this.profitLoss === undefined) {
    this.profitLoss = this.pnlNet;
  } else if (this.profitLoss !== undefined && this.pnlNet === undefined) {
    this.pnlNet = this.profitLoss;
  }

  if (this.plannedRR !== undefined && this.riskReward === undefined) {
    this.riskReward = this.plannedRR;
  } else if (this.riskReward !== undefined && this.plannedRR === undefined) {
    this.plannedRR = this.riskReward;
  }
});

// Compound indexes for user queries and analytics
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ userId: 1, status: 1, entryAt: -1 });
tradeSchema.index({ userId: 1, symbol: 1, entryAt: -1 });
tradeSchema.index({ userId: 1, market: 1, entryAt: -1 });
tradeSchema.index({ userId: 1, entryAt: -1 });
tradeSchema.index({ userId: 1, entryDate: -1 });
tradeSchema.index({ userId: 1, pnlNet: -1 });

export const TradeModel = model<ITrade>("Trade", tradeSchema);

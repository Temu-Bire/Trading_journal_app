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
    riskReward: {
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
    profitLoss: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user queries
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ userId: 1, status: 1 });
tradeSchema.index({ userId: 1, symbol: 1 });
tradeSchema.index({ userId: 1, entryDate: -1 });

export const TradeModel = model<ITrade>("Trade", tradeSchema);

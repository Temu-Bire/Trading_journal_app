import { Schema, model } from "mongoose";
import type { ITrade } from "./trade.types.js";

const tradeSchema = new Schema<ITrade>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Speeds up queries scoping trades to specific user
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
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
    lotSize: {
      type: Number,
      required: true,
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
    entryTime: {
      type: Date,
      default: Date.now,
    },
    exitTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["open", "closed", "cancelled"],
      default: "open",
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

// Compound index for user trade history queries with pagination
tradeSchema.index({ userId: 1, createdAt: -1 });

export const TradeModel = model<ITrade>("Trade", tradeSchema);
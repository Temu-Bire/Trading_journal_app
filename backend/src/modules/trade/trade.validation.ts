import type  { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const createTradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(15),
  direction: z.enum(["long", "short"]),
  entryPrice: z.number().positive("Entry price must be positive"),
  lotSize: z.number().positive("Quantity must be positive"),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  entryTime: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  notes: z.string().max(1000).optional(),
});

export const updateTradeSchema = createTradeSchema.partial().extend({
  exitPrice: z.number().positive().optional(),
  exitTime: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  status: z.enum(["open", "closed", "cancelled"]).optional(),
});



import { z } from "zod";

export const createTradeSchema = z.object({
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(20)
    .trim()
    .transform((val) => val.toUpperCase()),
  market: z.string().trim().max(30).optional().default("forex"),
  direction: z.enum(["long", "short"]),
  entryPrice: z.number().positive("Entry price must be positive"),
  quantity: z.number().positive("Quantity must be positive").optional(),
  lotSize: z.number().positive("Lot size must be positive").optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  entryDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional())
    .transform((val) => (val ? new Date(val) : undefined)),
  entryTime: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  fees: z.number().min(0, "Fees must be non-negative").optional().default(0),
  riskReward: z.number().optional(),
  strategy: z.string().trim().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateTradeSchema = createTradeSchema.partial().extend({
  exitPrice: z.number().positive("Exit price must be positive").optional(),
  exitDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional())
    .transform((val) => (val ? new Date(val) : undefined)),
  exitTime: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  status: z.enum(["open", "closed", "cancelled"]).optional(),
});

export const tradeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  symbol: z.string().trim().optional(),
  market: z.string().trim().optional(),
  status: z.enum(["open", "closed", "cancelled"]).optional(),
  direction: z.enum(["long", "short"]).optional(),
  startDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  endDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  sortBy: z.string().trim().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
export type TradeQueryInput = z.infer<typeof tradeQuerySchema>;

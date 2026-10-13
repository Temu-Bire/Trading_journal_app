import { z } from "zod";
import { ALLOWED_SORT_FIELDS, type AllowedSortField } from "../types/trade.types.js";

const dateStringSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
  .transform((val) => new Date(val));

const optionalDateSchema = dateStringSchema.optional();

const marketEnum = z.enum([
  "forex",
  "crypto",
  "stocks",
  "indices",
  "commodities",
  "other",
]);

export const createTradeSchema = z
  .object({
    symbol: z
      .string()
      .min(1, "Symbol is required")
      .max(20)
      .trim()
      .transform((val) => val.toUpperCase()),
    market: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(marketEnum)
      .optional()
      .default("forex"),
    direction: z.enum(["long", "short"]),
    entryPrice: z.number().positive("Entry price must be positive"),
    quantity: z.number().positive("Quantity must be positive").optional(),
    lotSize: z.number().positive("Lot size must be positive").optional(),
    contractSize: z.number().positive("Contract size must be positive").optional().default(1),
    stopLoss: z.number().positive("Stop loss must be positive").optional(),
    takeProfit: z.number().positive("Take profit must be positive").optional(),
    entryAt: optionalDateSchema,
    entryDate: optionalDateSchema,
    entryTime: optionalDateSchema,
    fees: z.number().min(0, "Fees must be non-negative").optional().default(0),
    strategy: z.string().trim().max(100).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.stopLoss !== undefined) {
        if (data.direction === "long" && data.stopLoss >= data.entryPrice) {
          return false;
        }
        if (data.direction === "short" && data.stopLoss <= data.entryPrice) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Stop loss must be below entry price for long and above entry price for short trades",
      path: ["stopLoss"],
    }
  )
  .refine(
    (data) => {
      if (data.takeProfit !== undefined) {
        if (data.direction === "long" && data.takeProfit <= data.entryPrice) {
          return false;
        }
        if (data.direction === "short" && data.takeProfit >= data.entryPrice) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Take profit must be above entry price for long and below entry price for short trades",
      path: ["takeProfit"],
    }
  )
  .transform((data) => {
    const qty = data.quantity ?? data.lotSize ?? 1;
    const entryDateCanonical = data.entryAt ?? data.entryDate ?? data.entryTime ?? new Date();
    return {
      ...data,
      quantity: qty,
      lotSize: qty,
      entryAt: entryDateCanonical,
      entryDate: entryDateCanonical,
    };
  });

export const updateTradeSchema = z
  .object({
    symbol: z
      .string()
      .min(1)
      .max(20)
      .trim()
      .transform((val) => val.toUpperCase())
      .optional(),
    market: z.string().trim().toLowerCase().pipe(marketEnum).optional(),
    direction: z.enum(["long", "short"]).optional(),
    entryPrice: z.number().positive("Entry price must be positive").optional(),
    exitPrice: z.number().positive("Exit price must be positive").optional(),
    quantity: z.number().positive("Quantity must be positive").optional(),
    lotSize: z.number().positive("Lot size must be positive").optional(),
    contractSize: z.number().positive("Contract size must be positive").optional(),
    stopLoss: z.number().positive().optional(),
    takeProfit: z.number().positive().optional(),
    entryAt: optionalDateSchema,
    entryDate: optionalDateSchema,
    entryTime: optionalDateSchema,
    exitAt: optionalDateSchema,
    exitDate: optionalDateSchema,
    exitTime: optionalDateSchema,
    fees: z.number().min(0, "Fees must be non-negative").optional(),
    strategy: z.string().trim().max(100).optional(),
    notes: z.string().max(1000).optional(),
    status: z.enum(["open", "closed", "cancelled"]).optional(),
  })
  .transform((data) => {
    const qty = data.quantity ?? data.lotSize;
    const entryDateCanonical = data.entryAt ?? data.entryDate ?? data.entryTime;
    const exitDateCanonical = data.exitAt ?? data.exitDate ?? data.exitTime;
    return {
      ...data,
      ...(qty !== undefined ? { quantity: qty, lotSize: qty } : {}),
      ...(entryDateCanonical ? { entryAt: entryDateCanonical, entryDate: entryDateCanonical } : {}),
      ...(exitDateCanonical ? { exitAt: exitDateCanonical, exitDate: exitDateCanonical } : {}),
    };
  });

export const closeTradeSchema = z
  .object({
    exitPrice: z.number().positive("Exit price must be positive"),
    exitAt: optionalDateSchema,
    exitDate: optionalDateSchema,
    exitTime: optionalDateSchema,
    fees: z.number().min(0, "Fees must be non-negative").optional(),
    notes: z.string().max(1000).optional(),
  })
  .transform((data) => {
    const exitCanonical = data.exitAt ?? data.exitDate ?? data.exitTime ?? new Date();
    return {
      exitPrice: data.exitPrice,
      exitAt: exitCanonical,
      exitDate: exitCanonical,
      ...(data.fees !== undefined ? { fees: data.fees } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };
  });

export const tradeQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    symbol: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .optional(),
    market: z.string().trim().toLowerCase().optional(),
    status: z.enum(["open", "closed", "cancelled"]).optional(),
    direction: z.enum(["long", "short"]).optional(),
    startDate: optionalDateSchema,
    endDate: optionalDateSchema,
    sortBy: z
      .enum(ALLOWED_SORT_FIELDS as unknown as [AllowedSortField, ...AllowedSortField[]])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    }
  );

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
export type CloseTradeInput = z.infer<typeof closeTradeSchema>;
export type TradeQueryInput = z.infer<typeof tradeQuerySchema>;

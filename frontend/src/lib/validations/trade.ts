import { z } from "zod";

export const createTradeFormSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(1, "Symbol is required")
      .max(20, "Symbol max 20 characters")
      .transform((val) => val.toUpperCase()),
    market: z.enum([
      "forex",
      "crypto",
      "stocks",
      "indices",
      "commodities",
      "other",
    ]),
    direction: z.enum(["long", "short"]),
    entryPrice: z.coerce
      .number({ invalid_type_error: "Entry price must be a number" })
      .positive("Entry price must be greater than zero"),
    quantity: z.coerce
      .number({ invalid_type_error: "Quantity must be a number" })
      .positive("Quantity must be greater than zero"),
    contractSize: z.coerce
      .number({ invalid_type_error: "Contract size must be a number" })
      .positive("Contract size must be greater than zero")
      .default(1),
    stopLoss: z.coerce
      .number()
      .positive("Stop loss must be positive")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    takeProfit: z.coerce
      .number()
      .positive("Take profit must be positive")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    entryAt: z.string().optional(),
    fees: z.coerce
      .number()
      .min(0, "Fees must be non-negative")
      .default(0),
    strategy: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.stopLoss !== undefined && data.entryPrice !== undefined) {
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
      message:
        "Stop loss must be below entry price for long, and above for short",
      path: ["stopLoss"],
    }
  )
  .refine(
    (data) => {
      if (data.takeProfit !== undefined && data.entryPrice !== undefined) {
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
      message:
        "Take profit must be above entry price for long, and below for short",
      path: ["takeProfit"],
    }
  );

export const closeTradeFormSchema = z.object({
  exitPrice: z.coerce
    .number({ invalid_type_error: "Exit price must be a number" })
    .positive("Exit price must be greater than zero"),
  fees: z.coerce
    .number()
    .min(0, "Fees must be non-negative")
    .optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateTradeFormData = z.infer<typeof createTradeFormSchema>;
export type CloseTradeFormData = z.infer<typeof closeTradeFormSchema>;

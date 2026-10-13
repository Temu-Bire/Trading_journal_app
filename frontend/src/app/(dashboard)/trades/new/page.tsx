"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createTradeFormSchema, type CreateTradeFormData } from "@/lib/validations/trade";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const marketOptions = [
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Crypto" },
  { value: "stocks", label: "Stocks / Equities" },
  { value: "indices", label: "Indices" },
  { value: "commodities", label: "Commodities" },
  { value: "other", label: "Other" },
];

export default function CreateTradePage() {
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTradeFormData>({
    resolver: zodResolver(createTradeFormSchema),
    defaultValues: {
      market: "forex",
      direction: "long",
      quantity: 1,
      contractSize: 1,
      fees: 0,
    },
  });

  const direction = watch("direction");
  const entryPrice = watch("entryPrice");
  const stopLoss = watch("stopLoss");
  const takeProfit = watch("takeProfit");

  const calculatePlannedRR = () => {
    if (!entryPrice || !stopLoss || !takeProfit) return null;
    const risk = direction === "long" ? entryPrice - stopLoss : stopLoss - entryPrice;
    const reward = direction === "long" ? takeProfit - entryPrice : entryPrice - takeProfit;
    if (risk > 0 && reward > 0) {
      return (reward / risk).toFixed(2);
    }
    return null;
  };

  const plannedRR = calculatePlannedRR();

  const onSubmit = async (data: CreateTradeFormData) => {
    setSubmitting(true);
    try {
      const res = await apiClient.post("/trades", data);
      if (res.success) {
        success("Trade logged successfully!");
        router.push("/trades");
      } else {
        error(res.message || "Failed to log trade");
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Error logging trade");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/trades"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Trade Log
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              New Trade Entry
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Record position entry, execution targets, and trading rationale
            </p>
          </div>
          {plannedRR && (
            <span className="text-xs font-bold text-primary bg-primary-muted px-3 py-1 rounded-xl">
              Planned R:R 1 : {plannedRR}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 1. Instrument */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              1. Instrument & Direction
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Symbol"
                placeholder="e.g. EURUSD, NVDA, ETH"
                error={errors.symbol?.message}
                {...register("symbol")}
              />

              <Select
                label="Market"
                options={marketOptions}
                error={errors.market?.message}
                {...register("market")}
              />

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-1.5 h-10 p-1 bg-muted rounded-xl">
                  <button
                    type="button"
                    onClick={() => setValue("direction", "long")}
                    className={cn(
                      "rounded-lg text-xs font-semibold transition-all flex items-center justify-center",
                      direction === "long"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Long
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("direction", "short")}
                    className={cn(
                      "rounded-lg text-xs font-semibold transition-all flex items-center justify-center",
                      direction === "short"
                        ? "bg-loss text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Short
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Execution */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              2. Execution & Risk Parameters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Input
                label="Entry Price"
                type="number"
                step="any"
                placeholder="100.00"
                error={errors.entryPrice?.message}
                {...register("entryPrice")}
              />

              <Input
                label="Quantity / Units"
                type="number"
                step="any"
                placeholder="1"
                error={errors.quantity?.message}
                {...register("quantity")}
              />

              <Input
                label="Stop Loss (SL)"
                type="number"
                step="any"
                placeholder="Optional"
                error={errors.stopLoss?.message}
                {...register("stopLoss")}
              />

              <Input
                label="Take Profit (TP)"
                type="number"
                step="any"
                placeholder="Optional"
                error={errors.takeProfit?.message}
                {...register("takeProfit")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input
                label="Contract Size"
                type="number"
                step="any"
                placeholder="1 (100,000 for standard FX lot)"
                error={errors.contractSize?.message}
                {...register("contractSize")}
              />
              <Input
                label="Fees ($)"
                type="number"
                step="any"
                placeholder="0.00"
                error={errors.fees?.message}
                {...register("fees")}
              />
            </div>
          </div>

          {/* 3. Journal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              3. Strategy & Journaling Notes
            </h4>
            <div className="space-y-4">
              <Input
                label="Strategy Setup"
                placeholder="e.g. Support Bounce, Liquidity Sweep"
                error={errors.strategy?.message}
                {...register("strategy")}
              />

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Trade Rationale & Psychology
                </label>
                <textarea
                  rows={4}
                  placeholder="Record market context, timeframes, emotional state, and reasons for taking this setup..."
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  {...register("notes")}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/trades">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Position
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


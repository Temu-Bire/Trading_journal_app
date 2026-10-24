"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createTradeFormSchema, type CreateTradeFormData } from "@/lib/validations/trade";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface CreateTradeModalProps {
  open: boolean;
  onClose: () => void;
  onTradeCreated?: () => void;
}

const marketOptions = [
  { value: "forex", label: "Forex" },
  { value: "crypto", label: "Crypto" },
  { value: "stocks", label: "Stocks / Equities" },
  { value: "indices", label: "Indices" },
  { value: "commodities", label: "Commodities" },
  { value: "other", label: "Other" },
];

import { useAuth } from "@/lib/auth";
import { getStrategies, IStrategy } from "@/lib/strategies";

export function CreateTradeModal({
  open,
  onClose,
  onTradeCreated,
}: CreateTradeModalProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [strategies, setStrategies] = useState<IStrategy[]>([]);
  const { success, error } = useToast();

  React.useEffect(() => {
    if (open) {
      setStrategies(getStrategies(user?.id));
    }
  }, [open, user?.id]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
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

  // Live computed planned Risk:Reward
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
        success("Trade created successfully!");
        reset();
        onClose();
        if (onTradeCreated) onTradeCreated();
      } else {
        error(res.message || "Failed to create trade");
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Error creating trade");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New Trade"
      description="Record a new trade entry with execution details."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Section 1: Instrument */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Instrument
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Symbol"
              placeholder="e.g. EURUSD"
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

        {/* Section 2: Execution & Risk Parameters */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Execution & Risk
            </h4>
            {plannedRR && (
              <span className="text-xs font-semibold text-primary bg-primary-muted px-2 py-0.5 rounded-lg">
                Planned R:R 1 : {plannedRR}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Entry Price"
              type="number"
              step="any"
              placeholder="0.00"
              error={errors.entryPrice?.message}
              {...register("entryPrice")}
            />

            <Input
              label="Quantity"
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

          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input
              label="Contract Size"
              type="number"
              step="any"
              placeholder="1"
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

        {/* Section 3: Notes & Setup */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Setup & Notes (Optional)
          </h4>
          <div className="space-y-3">
            <div>
              <Input
                label="Strategy"
                placeholder="e.g. Trend Breakout"
                list="modal-strategies-datalist"
                error={errors.strategy?.message}
                {...register("strategy")}
              />
              <datalist id="modal-strategies-datalist">
                {strategies.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <textarea
                rows={2}
                placeholder="Notes or entry reason..."
                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                {...register("notes")}
              />
              {errors.notes && (
                <p className="text-xs text-loss mt-1">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Log Trade
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

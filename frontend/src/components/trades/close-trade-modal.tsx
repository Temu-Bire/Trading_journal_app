"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { closeTradeFormSchema, type CloseTradeFormData } from "@/lib/validations/trade";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/toast";
import { formatCurrency } from "@/lib/utils";
import type { ITrade } from "@/types";

interface CloseTradeModalProps {
  trade: ITrade | null;
  open: boolean;
  onClose: () => void;
  onTradeClosed: () => void;
}

export function CloseTradeModal({
  trade,
  open,
  onClose,
  onTradeClosed,
}: CloseTradeModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CloseTradeFormData>({
    resolver: zodResolver(closeTradeFormSchema),
    defaultValues: {
      fees: trade?.fees || 0,
    },
  });

  const exitPrice = watch("exitPrice");
  const fees = watch("fees") ?? 0;

  // Live P&L Preview
  const calculateEstimatedPnl = () => {
    if (!trade || !exitPrice || exitPrice <= 0) return null;
    const qty = trade.quantity || 1;
    const contract = trade.contractSize || 1;
    const gross =
      trade.direction === "long"
        ? (exitPrice - trade.entryPrice) * qty * contract
        : (trade.entryPrice - exitPrice) * qty * contract;
    const net = gross - (fees || 0);
    return { gross, net };
  };

  const estimatedPnl = calculateEstimatedPnl();

  const onSubmit = async (data: CloseTradeFormData) => {
    if (!trade) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post(`/trades/${trade._id}/close`, {
        exitPrice: data.exitPrice,
        fees: data.fees !== undefined ? data.fees : trade.fees,
        notes: data.notes,
      });

      if (res.success) {
        success("Trade closed successfully!");
        reset();
        onClose();
        onTradeClosed();
      } else {
        error(res.message || "Failed to close trade");
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Error closing trade");
    } finally {
      setSubmitting(false);
    }
  };

  if (!trade) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Close Trade: ${trade.symbol}`}
      description={`Record exit execution for this ${trade.direction.toUpperCase()} position.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Position Summary Banner */}
        <div className="p-3.5 rounded-xl bg-muted/60 border border-border flex items-center justify-between text-xs">
          <div>
            <span className="text-muted-foreground block">Entry Price</span>
            <span className="font-bold text-foreground">{trade.entryPrice}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Direction</span>
            <span className="font-bold text-foreground capitalize">{trade.direction}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Size / Lots</span>
            <span className="font-bold text-foreground">{trade.quantity}</span>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3">
          <Input
            label="Exit Price"
            type="number"
            step="any"
            placeholder="e.g. 105.50"
            error={errors.exitPrice?.message}
            {...register("exitPrice")}
          />

          <Input
            label="Additional / Closing Fees ($)"
            type="number"
            step="any"
            placeholder="0.00"
            error={errors.fees?.message}
            {...register("fees")}
          />

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Exit Notes / Takeaway
            </label>
            <textarea
              rows={2}
              placeholder="Why did you exit? Did you follow your trade plan?"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              {...register("notes")}
            />
          </div>
        </div>

        {/* Live P&L Preview */}
        {estimatedPnl && (
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground block">Estimated Net Result</span>
              <span className="text-[10px] text-muted-foreground">After fees & contracts</span>
            </div>
            <div className="text-right">
              <span
                className={`text-lg font-bold ${
                  estimatedPnl.net >= 0 ? "text-profit" : "text-loss"
                }`}
              >
                {estimatedPnl.net >= 0 ? "+" : ""}
                {formatCurrency(estimatedPnl.net)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            Confirm Close
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Target,
  Layers,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CloseTradeModal } from "@/components/trades/close-trade-modal";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/toast";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import type { ITrade } from "@/types";

export default function TradeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const tradeId = resolvedParams.id;
  const [trade, setTrade] = useState<ITrade | null>(null);
  const [loading, setLoading] = useState(true);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const { success, error } = useToast();

  const fetchTrade = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ITrade>(`/trades/${tradeId}`);
      if (res.success && res.data) {
        setTrade(res.data);
      } else {
        error("Trade not found");
        router.push("/trades");
      }
    } catch {
      error("Failed to load trade details");
      router.push("/trades");
    } finally {
      setLoading(false);
    }
  }, [tradeId, router, error]);

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiClient.delete(`/trades/${tradeId}`);
      if (res.success) {
        success("Trade deleted successfully");
        router.push("/trades");
      } else {
        error(res.message || "Failed to delete trade");
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Error deleting trade");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!trade) return null;

  const net = trade.pnlNet ?? trade.profitLoss;
  const isWin = net !== undefined && net > 0;
  const isLoss = net !== undefined && net < 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/trades"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Trade Log
        </Link>

        <div className="flex items-center gap-2">
          {trade.status === "open" && (
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle className="w-4 h-4" />}
              onClick={() => setCloseModalOpen(true)}
            >
              Close Position
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setDeleteConfirmOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Trade Banner */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xs",
                trade.direction === "long"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              )}
            >
              {trade.direction === "long" ? "LONG" : "SHRT"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {trade.symbol}
                </h2>
                <Badge
                  variant={trade.direction === "long" ? "info" : "danger"}
                  className="capitalize"
                >
                  {trade.direction}
                </Badge>
                <Badge
                  variant={
                    trade.status === "open"
                      ? "warning"
                      : isWin
                      ? "success"
                      : "danger"
                  }
                  className="capitalize"
                >
                  {trade.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">
                Market: {trade.market} • Opened {formatDateTime(trade.entryAt || trade.createdAt)}
              </p>
            </div>
          </div>

          {/* Large Financial Outcome */}
          <div className="text-left md:text-right">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
              Net Performance
            </span>
            {trade.status === "open" ? (
              <span className="text-2xl font-bold text-warning">Position Open</span>
            ) : (
              <span
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  isWin ? "text-profit" : isLoss ? "text-loss" : "text-muted-foreground"
                )}
              >
                {isWin ? "+" : ""}
                {formatCurrency(net)}
              </span>
            )}
            {trade.rMultiple !== undefined && trade.rMultiple !== null && (
              <span className="text-xs text-muted-foreground block mt-0.5 font-medium">
                Realized R-Multiple: <strong>{trade.rMultiple}R</strong>
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 3-Column Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Execution Details */}
        <Card className="p-6 space-y-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <DollarSign className="w-4 h-4 text-primary" /> Execution Parameters
          </CardTitle>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Entry Price</span>
              <span className="font-bold text-foreground">{trade.entryPrice}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Exit Price</span>
              <span className="font-bold text-foreground">{trade.exitPrice ?? "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Quantity / Lots</span>
              <span className="font-bold text-foreground">{trade.quantity}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Contract Size</span>
              <span className="font-bold text-foreground">{trade.contractSize}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Fees Deducted</span>
              <span className="font-bold text-foreground">{formatCurrency(trade.fees)}</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Risk Management & R:R */}
        <Card className="p-6 space-y-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <ShieldAlert className="w-4 h-4 text-warning" /> Risk Management
          </CardTitle>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Stop Loss (SL)</span>
              <span className="font-bold text-loss">{trade.stopLoss ?? "Not set"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Take Profit (TP)</span>
              <span className="font-bold text-profit">{trade.takeProfit ?? "Not set"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Planned Risk Amount</span>
              <span className="font-bold text-foreground">
                {trade.riskAmount ? formatCurrency(trade.riskAmount) : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Planned Risk:Reward</span>
              <span className="font-bold text-primary">
                {trade.plannedRR ? `1 : ${trade.plannedRR}` : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Gross P&L</span>
              <span className="font-bold text-foreground">
                {trade.pnlGross !== undefined ? formatCurrency(trade.pnlGross) : "—"}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 3: Journal & Psychological Strategy */}
        <Card className="p-6 space-y-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <FileText className="w-4 h-4 text-emerald-500" /> Journal & Strategy
          </CardTitle>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase font-semibold">
                Strategy Setup
              </span>
              <span className="font-semibold text-foreground mt-0.5 block">
                {trade.strategy || "Discretionary / No strategy tagged"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] uppercase font-semibold">
                Trade Rationale & Notes
              </span>
              <p className="mt-1 p-2.5 rounded-xl bg-muted/60 text-foreground leading-relaxed whitespace-pre-wrap">
                {trade.notes || "No notes entered for this position."}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <CloseTradeModal
        trade={trade}
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onTradeClosed={fetchTrade}
      />

      {/* Delete Confirmation */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card text-foreground rounded-2xl border border-border p-6 max-w-sm w-full shadow-dropdown space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Delete Trade {trade.symbol}?
            </h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this trade record? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CloseTradeModal } from "@/components/trades/close-trade-modal";
import { CreateTradeModal } from "@/components/trades/create-trade-modal";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/lib/toast";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import type { ITrade } from "@/types";

export default function TradesPage() {
  const [trades, setTrades] = useState<ITrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [market, setMarket] = useState("all");
  const [status, setStatus] = useState("all");
  const [direction, setDirection] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTradeToClose, setSelectedTradeToClose] = useState<ITrade | null>(null);
  const [tradeToDelete, setTradeToDelete] = useState<ITrade | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { success, error } = useToast();

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.symbol = search.trim().toUpperCase();
      if (market !== "all") params.market = market;
      if (status !== "all") params.status = status;
      if (direction !== "all") params.direction = direction;

      const res = await apiClient.get<ITrade[]>("/trades", params);

      if (res.success && res.data) {
        setTrades(res.data);
        if (res.pagination) {
          setTotal(res.pagination.total);
          setPages(res.pagination.pages);
        }
      } else {
        setTrades([]);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, market, status, direction, sortBy, sortOrder]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handleDeleteTrade = async () => {
    if (!tradeToDelete) return;
    setDeleting(true);
    try {
      const res = await apiClient.delete(`/trades/${tradeToDelete._id}`);
      if (res.success) {
        success("Trade deleted successfully");
        setTradeToDelete(null);
        fetchTrades();
      } else {
        error(res.message || "Failed to delete trade");
      }
    } catch (err) {
      error(err instanceof Error ? err.message : "Error deleting trade");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search / Filters Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Trade Log ({total})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review, filter, and manage all your historical and live positions
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateModalOpen(true)}
          >
            New Trade
          </Button>
        </div>

        {/* Filter Controls Card */}
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Input
                placeholder="Search symbol (e.g. EURUSD, AAPL)..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Market Filter */}
            <Select
              value={market}
              onChange={(e) => {
                setMarket(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Markets" },
                { value: "forex", label: "Forex" },
                { value: "crypto", label: "Crypto" },
                { value: "stocks", label: "Stocks" },
                { value: "indices", label: "Indices" },
                { value: "commodities", label: "Commodities" },
              ]}
            />

            {/* Status Filter */}
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />

            {/* Direction Filter */}
            <Select
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Directions" },
                { value: "long", label: "Long" },
                { value: "short", label: "Short" },
              ]}
            />
          </div>
        </Card>
      </div>

      {/* Main Trades Table / List */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : trades.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<SlidersHorizontal className="w-6 h-6" />}
              title="No trades found"
              description="Try adjusting your filters or record a new trade entry."
              actionLabel="Log New Trade"
              onAction={() => setCreateModalOpen(true)}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">Instrument</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Entry / Exit</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Planned R:R</th>
                    <th className="py-3 px-4">Net P&L</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {trades.map((trade) => {
                    const net = trade.pnlNet ?? trade.profitLoss;
                    const isWin = net !== undefined && net > 0;
                    const isLoss = net !== undefined && net < 0;

                    return (
                      <tr key={trade._id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                trade.direction === "long"
                                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                              )}
                            >
                              {trade.direction === "long" ? "L" : "S"}
                            </div>
                            <div>
                              <Link
                                href={`/trades/${trade._id}`}
                                className="font-bold text-foreground hover:text-primary transition-colors"
                              >
                                {trade.symbol}
                              </Link>
                              <span className="text-[10px] text-muted-foreground uppercase block">
                                {trade.market}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={trade.direction === "long" ? "info" : "danger"}
                            className="capitalize text-[11px]"
                          >
                            {trade.direction}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-medium">
                          <div>
                            <span className="text-foreground">{trade.entryPrice}</span>
                            {trade.exitPrice !== undefined && (
                              <span className="text-muted-foreground"> → {trade.exitPrice}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground block">
                            {formatDateTime(trade.entryAt || trade.createdAt)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-foreground font-semibold">
                          {trade.quantity}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-muted-foreground font-medium">
                          {trade.plannedRR ? `1 : ${trade.plannedRR}` : "—"}
                        </td>

                        <td className="py-3.5 px-4">
                          {trade.status === "open" ? (
                            <span className="text-xs font-medium text-muted-foreground">—</span>
                          ) : (
                            <span
                              className={cn(
                                "font-bold text-sm",
                                isWin ? "text-profit" : isLoss ? "text-loss" : "text-muted-foreground"
                              )}
                            >
                              {isWin ? "+" : ""}
                              {formatCurrency(net)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              trade.status === "open"
                                ? "warning"
                                : trade.status === "closed"
                                ? isWin
                                  ? "success"
                                  : "danger"
                                : "outline"
                            }
                            className="capitalize text-[10px]"
                          >
                            {trade.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/trades/${trade._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1.5 h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>

                            {trade.status === "open" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1.5 h-8 w-8 text-profit hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                onClick={() => setSelectedTradeToClose(trade)}
                                title="Close trade"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1.5 h-8 w-8 text-loss hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => setTradeToDelete(trade)}
                              title="Delete trade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-border">
              {trades.map((trade) => {
                const net = trade.pnlNet ?? trade.profitLoss;
                const isWin = net !== undefined && net > 0;
                const isLoss = net !== undefined && net < 0;

                return (
                  <div key={trade._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-base text-foreground">
                          {trade.symbol}
                        </span>
                        <Badge
                          variant={trade.direction === "long" ? "info" : "danger"}
                          className="capitalize text-[10px]"
                        >
                          {trade.direction}
                        </Badge>
                      </div>
                      <Badge
                        variant={trade.status === "open" ? "warning" : isWin ? "success" : "danger"}
                        className="capitalize text-[10px]"
                      >
                        {trade.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Entry Price</span>
                        <span className="font-semibold text-foreground">{trade.entryPrice}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Net Result</span>
                        {trade.status === "open" ? (
                          <span className="font-semibold text-muted-foreground">In progress</span>
                        ) : (
                          <span
                            className={cn(
                              "font-bold",
                              isWin ? "text-profit" : isLoss ? "text-loss" : "text-muted-foreground"
                            )}
                          >
                            {isWin ? "+" : ""}
                            {formatCurrency(net)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(trade.entryAt || trade.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link href={`/trades/${trade._id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            Details
                          </Button>
                        </Link>
                        {trade.status === "open" && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedTradeToClose(trade)}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing page <strong className="text-foreground">{page}</strong> of{" "}
                <strong className="text-foreground">{pages}</strong> ({total} total trades)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-8 gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setPage(page + 1)}
                  className="h-8 gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modals */}
      <CreateTradeModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTradeCreated={fetchTrades}
      />

      <CloseTradeModal
        trade={selectedTradeToClose}
        open={!!selectedTradeToClose}
        onClose={() => setSelectedTradeToClose(null)}
        onTradeClosed={fetchTrades}
      />

      {/* Delete Confirmation Dialog */}
      {tradeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card text-foreground rounded-2xl border border-border p-6 max-w-sm w-full shadow-dropdown space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Delete Trade {tradeToDelete.symbol}?
            </h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this trade record? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTradeToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                onClick={handleDeleteTrade}
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

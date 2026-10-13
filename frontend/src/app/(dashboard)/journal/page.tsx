"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  ArrowUpRight,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Tag,
  PenTool,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { ITrade } from "@/types";

export default function JournalPage() {
  const [trades, setTrades] = useState<ITrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [marketFilter, setMarketFilter] = useState("all");

  useEffect(() => {
    async function loadTrades() {
      setLoading(true);
      try {
        const res = await apiClient.get<ITrade[]>("/trades", { limit: 200 });
        if (res.success && res.data) {
          setTrades(res.data);
        }
      } finally {
        setLoading(false);
      }
    }
    loadTrades();
  }, []);

  // Filter trades that have journal notes or comments, or general trade review
  const journalEntries = useMemo(() => {
    return trades.filter((trade) => {
      // outcome filter
      if (outcomeFilter === "win") {
        if ((trade.pnlNet ?? trade.pnlGross ?? 0) <= 0 || trade.status !== "closed") {
          return false;
        }
      } else if (outcomeFilter === "loss") {
        if ((trade.pnlNet ?? trade.pnlGross ?? 0) >= 0 || trade.status !== "closed") {
          return false;
        }
      } else if (outcomeFilter === "open") {
        if (trade.status !== "open") return false;
      }

      // market filter
      if (marketFilter !== "all" && trade.market !== marketFilter) {
        return false;
      }

      // search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSymbol = trade.symbol.toLowerCase().includes(q);
        const matchesNotes = trade.notes?.toLowerCase().includes(q);
        const matchesStrategy = trade.strategy?.toLowerCase().includes(q);
        if (!matchesSymbol && !matchesNotes && !matchesStrategy) {
          return false;
        }
      }

      return true;
    });
  }, [trades, search, outcomeFilter, marketFilter]);

  const stats = useMemo(() => {
    const totalWithNotes = trades.filter((t) => t.notes && t.notes.trim().length > 0).length;
    const closedCount = trades.filter((t) => t.status === "closed").length;
    const wins = trades.filter((t) => (t.pnlNet ?? t.pnlGross ?? 0) > 0 && t.status === "closed").length;
    const winRate = closedCount > 0 ? (wins / closedCount) * 100 : 0;
    return {
      total: trades.length,
      withNotes: totalWithNotes,
      winRate: Math.round(winRate),
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Trading Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log trade context, psychological mindset, execution quality, and post-trade reviews.
          </p>
        </div>

        <Link
          href="/trades/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <PenTool className="w-4 h-4" />
          <span>New Journal Entry</span>
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Journal Entries
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {stats.withNotes} / {stats.total} trades
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-profit/10 flex items-center justify-center text-profit">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Overall Win Rate
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {stats.winRate}%
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent-foreground">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">
              Documented Setups
            </p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {new Set(trades.map((t) => t.strategy).filter(Boolean)).size} Playbooks
            </p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, symbols (e.g. AAPL, EUR/USD), or strategies..."
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex gap-2.5">
          <Select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="w-36 h-10 text-xs rounded-xl"
            options={[
              { value: "all", label: "All Outcomes" },
              { value: "win", label: "Wins Only" },
              { value: "loss", label: "Losses Only" },
              { value: "open", label: "Open Trades" },
            ]}
          />

          <Select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="w-32 h-10 text-xs rounded-xl"
            options={[
              { value: "all", label: "All Markets" },
              { value: "forex", label: "Forex" },
              { value: "crypto", label: "Crypto" },
              { value: "stocks", label: "Stocks" },
              { value: "commodities", label: "Commodities" },
              { value: "indices", label: "Indices" },
            ]}
          />
        </div>
      </div>

      {/* Journal Feed / Timeline */}
      {journalEntries.length === 0 ? (
        <EmptyState
          title="No journal entries found"
          description={
            search
              ? "No trade notes match your current search criteria."
              : "Start recording your thoughts, psychology, and execution reviews when logging trades."
          }
          actionLabel="Log a Trade"
          actionHref="/trades/new"
          icon={<BookOpen className="w-12 h-12 text-muted-foreground/40" />}
        />
      ) : (
        <div className="space-y-4">
          {journalEntries.map((trade) => {
            const pnl = trade.pnlNet ?? trade.pnlGross;
            const hasNotes = Boolean(trade.notes && trade.notes.trim().length > 0);

            return (
              <Card
                key={trade._id}
                className="p-5 hover:border-border/80 transition-shadow transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={trade.direction === "long" ? "profit" : "loss"}
                      className="text-xs uppercase font-bold px-2 py-0.5"
                    >
                      {trade.direction}
                    </Badge>

                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/trades/${trade._id}`}
                          className="font-bold text-base text-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {trade.symbol}
                          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                        </Link>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {trade.market}
                        </Badge>
                        {trade.strategy && (
                          <Badge variant="secondary" className="text-[11px] font-medium">
                            {trade.strategy}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {formatDateTime(trade.entryAt)}
                        {trade.exitAt && ` → ${formatDate(trade.exitAt)}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    {pnl !== undefined && pnl !== null ? (
                      <div>
                        <span
                          className={`text-base font-bold ${
                            pnl >= 0 ? "text-profit" : "text-loss"
                          }`}
                        >
                          {formatCurrency(pnl)}
                        </span>
                        {trade.rMultiple !== undefined && trade.rMultiple !== null && (
                          <span className="text-xs text-muted-foreground block">
                            {trade.rMultiple.toFixed(2)}R
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs capitalize">
                        {trade.status}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Trade Execution Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs py-3 text-muted-foreground border-b border-border/40">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/60 block">
                      Entry Price
                    </span>
                    <span className="font-medium text-foreground">${trade.entryPrice}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/60 block">
                      Exit Price
                    </span>
                    <span className="font-medium text-foreground">
                      {trade.exitPrice ? `$${trade.exitPrice}` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/60 block">
                      Stop Loss
                    </span>
                    <span className="font-medium text-loss">
                      {trade.stopLoss ? `$${trade.stopLoss}` : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/60 block">
                      Take Profit
                    </span>
                    <span className="font-medium text-profit">
                      {trade.takeProfit ? `$${trade.takeProfit}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Journal Notes Content */}
                <div className="pt-3">
                  {hasNotes ? (
                    <div className="bg-muted/30 p-3.5 rounded-xl border border-border/40">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <PenTool className="w-3 h-3 text-primary" />
                        Trader Notes & Reflections
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {trade.notes}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic flex items-center justify-between py-1">
                      <span>No notes recorded for this trade yet.</span>
                      <Link
                        href={`/trades/${trade._id}`}
                        className="text-primary hover:underline text-xs not-italic font-medium"
                      >
                        + Add notes in Trade Details
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

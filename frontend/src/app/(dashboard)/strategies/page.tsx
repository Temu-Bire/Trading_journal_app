"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Award,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  SlidersHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import type { ITrade } from "@/types";

interface StrategyStats {
  name: string;
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  bestTrade: number;
  worstTrade: number;
  avgRR: number;
  trades: ITrade[];
}

export default function StrategiesPage() {
  const [trades, setTrades] = useState<ITrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"pnl" | "trades" | "winRate">("pnl");

  useEffect(() => {
    async function loadTrades() {
      setLoading(false);
      try {
        setLoading(true);
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

  const strategiesMap = useMemo(() => {
    const map = new Map<string, StrategyStats>();

    for (const trade of trades) {
      const name = trade.strategy?.trim() || "Discretionary / No Strategy";
      if (!map.has(name)) {
        map.set(name, {
          name,
          totalTrades: 0,
          openTrades: 0,
          closedTrades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalPnl: 0,
          avgPnl: 0,
          bestTrade: 0,
          worstTrade: 0,
          avgRR: 0,
          trades: [],
        });
      }

      const stat = map.get(name)!;
      stat.totalTrades += 1;
      stat.trades.push(trade);

      if (trade.status === "open") {
        stat.openTrades += 1;
      } else if (trade.status === "closed") {
        stat.closedTrades += 1;
        const pnl = trade.pnlNet ?? trade.pnlGross ?? 0;
        stat.totalPnl += pnl;

        if (pnl > 0) stat.wins += 1;
        else if (pnl < 0) stat.losses += 1;

        if (pnl > stat.bestTrade) stat.bestTrade = pnl;
        if (pnl < stat.worstTrade) stat.worstTrade = pnl;
      }
    }

    // Compute averages
    for (const stat of map.values()) {
      if (stat.closedTrades > 0) {
        stat.winRate = (stat.wins / stat.closedTrades) * 100;
        stat.avgPnl = stat.totalPnl / stat.closedTrades;
      }
      const tradesWithRR = stat.trades.filter((t) => t.plannedRR && t.plannedRR > 0);
      if (tradesWithRR.length > 0) {
        stat.avgRR =
          tradesWithRR.reduce((sum, t) => sum + (t.plannedRR || 0), 0) /
          tradesWithRR.length;
      }
    }

    return map;
  }, [trades]);

  const strategyList = useMemo(() => {
    const list = Array.from(strategiesMap.values());
    return list.sort((a, b) => {
      if (sortBy === "pnl") return b.totalPnl - a.totalPnl;
      if (sortBy === "winRate") return b.winRate - a.winRate;
      return b.totalTrades - a.totalTrades;
    });
  }, [strategiesMap, sortBy]);

  const activeStrategy = useMemo(() => {
    if (!selectedStrategy) return strategyList[0] || null;
    return strategiesMap.get(selectedStrategy) || strategyList[0] || null;
  }, [selectedStrategy, strategyList, strategiesMap]);

  const chartData = useMemo(() => {
    return strategyList.map((s) => ({
      name: s.name.length > 14 ? s.name.slice(0, 12) + "…" : s.name,
      fullName: s.name,
      pnl: Math.round(s.totalPnl * 100) / 100,
      winRate: Math.round(s.winRate),
      trades: s.totalTrades,
    }));
  }, [strategyList]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <EmptyState
        title="No strategy data available"
        description="Log your trades and assign a strategy name (e.g. 'Order Block Breakout', 'Trend Pullback') to visualize playbooks."
        actionLabel="Log First Trade"
        actionHref="/trades/new"
        icon={<Compass className="w-12 h-12 text-muted-foreground/40" />}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Trading Strategies
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Evaluate your playbooks, setups, win rates, and edge across market conditions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-card px-2.5 py-1.5 rounded-xl border border-border shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Sort by:</span>
            <button
              onClick={() => setSortBy("pnl")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                sortBy === "pnl"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Net P&L
            </button>
            <button
              onClick={() => setSortBy("winRate")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                sortBy === "winRate"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Win Rate
            </button>
            <button
              onClick={() => setSortBy("trades")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                sortBy === "trades"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Strategy PnL Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Strategy Net P&L Comparison
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cumulative profitability grouped by assigned setup name.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              {strategyList.length} Active {strategyList.length === 1 ? "Strategy" : "Strategies"}
            </Badge>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="currentColor"
                  className="text-[11px] text-muted-foreground"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-[11px] text-muted-foreground"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-xl border border-border shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground">{data.fullName}</p>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Net P&L:</span>
                            <span
                              className={`font-semibold ${
                                data.pnl >= 0 ? "text-profit" : "text-loss"
                              }`}
                            >
                              {formatCurrency(data.pnl)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Win Rate:</span>
                            <span className="font-medium text-foreground">{data.winRate}%</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Trades:</span>
                            <span className="font-medium text-foreground">{data.trades}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? "var(--profit)" : "var(--loss)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Strategies Grid & Deep Dive Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy Selection List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-foreground tracking-tight px-1">
            Playbook Performance
          </h2>
          <div className="space-y-2.5">
            {strategyList.map((stat) => {
              const isSelected = activeStrategy?.name === stat.name;
              return (
                <div
                  key={stat.name}
                  onClick={() => setSelectedStrategy(stat.name)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-card/70 border-border hover:border-border/80 hover:bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground line-clamp-1">
                      {stat.name}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        stat.totalPnl >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatCurrency(stat.totalPnl)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-muted-foreground">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">
                        Win Rate
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatPercent(stat.winRate)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">
                        Trades
                      </span>
                      <span className="font-semibold text-foreground">
                        {stat.totalTrades}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-muted-foreground/70">
                        Avg R:R
                      </span>
                      <span className="font-semibold text-foreground">
                        {stat.avgRR > 0 ? `1:${stat.avgRR.toFixed(1)}` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Strategy Deep Dive */}
        <div className="lg:col-span-2 space-y-5">
          {activeStrategy && (
            <>
              {/* Detailed Card Header */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">
                        {activeStrategy.name}
                      </h2>
                      <Badge variant="outline" className="text-xs">
                        {activeStrategy.closedTrades} closed / {activeStrategy.openTrades} active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Key performance diagnostics and execution history.
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide block">
                      Total P&L
                    </span>
                    <span
                      className={`text-2xl font-bold tracking-tight ${
                        activeStrategy.totalPnl >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatCurrency(activeStrategy.totalPnl)}
                    </span>
                  </div>
                </div>

                {/* Sub-metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      Win Rate
                    </span>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {formatPercent(activeStrategy.winRate)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {activeStrategy.wins}W / {activeStrategy.losses}L
                    </span>
                  </div>

                  <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      Avg Trade PnL
                    </span>
                    <p
                      className={`text-base font-bold mt-0.5 ${
                        activeStrategy.avgPnl >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatCurrency(activeStrategy.avgPnl)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">per closed trade</span>
                  </div>

                  <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      Best Trade
                    </span>
                    <p className="text-base font-bold text-profit mt-0.5">
                      {formatCurrency(activeStrategy.bestTrade)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Peak gain</span>
                  </div>

                  <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase">
                      Worst Trade
                    </span>
                    <p className="text-base font-bold text-loss mt-0.5">
                      {formatCurrency(activeStrategy.worstTrade)}
                    </p>
                    <span className="text-[10px] text-muted-foreground">Max drawdown</span>
                  </div>
                </div>
              </Card>

              {/* Trade Log under Strategy */}
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Recent Trades in Strategy</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Showing up to {Math.min(activeStrategy.trades.length, 10)} trades
                    </span>
                  </CardTitle>
                </CardHeader>

                <div className="divide-y divide-border -mx-2">
                  {activeStrategy.trades.slice(0, 10).map((trade) => {
                    const pnl = trade.pnlNet ?? trade.pnlGross;
                    return (
                      <div
                        key={trade._id}
                        className="py-3 px-2 flex items-center justify-between hover:bg-muted/30 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={trade.direction === "long" ? "profit" : "loss"}
                            className="text-[10px] uppercase font-bold"
                          >
                            {trade.direction}
                          </Badge>
                          <div>
                            <Link
                              href={`/trades/${trade._id}`}
                              className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                            >
                              {trade.symbol}
                              <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                            </Link>
                            <span className="text-[11px] text-muted-foreground block">
                              {formatDate(trade.entryAt)} · {trade.market.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          {pnl !== undefined && pnl !== null ? (
                            <span
                              className={`text-xs font-bold block ${
                                pnl >= 0 ? "text-profit" : "text-loss"
                              }`}
                            >
                              {formatCurrency(pnl)}
                            </span>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              {trade.status}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            Qty: {trade.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Percent,
  Scale,
  Award,
  BarChart2,
  PieChart as PieIcon,
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
  PieChart,
  Pie,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { ITrade, TradeAnalytics } from "@/types";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null);
  const [trades, setTrades] = useState<ITrade[]>([]);
  const [marketFilter, setMarketFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (marketFilter !== "all") params.market = marketFilter;

      const [analyticsRes, tradesRes] = await Promise.all([
        apiClient.get<TradeAnalytics>("/trades/analytics", params),
        apiClient.get<ITrade[]>("/trades", { limit: 100 }),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      if (tradesRes.success && tradesRes.data) {
        setTrades(tradesRes.data);
      }
    } finally {
      setLoading(false);
    }
  }, [marketFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Outcome distribution data
  const outcomeData = React.useMemo(() => {
    if (!analytics) return [];
    const perf = analytics.performance;
    return [
      { name: "Winning", value: perf.winningTrades, color: "#10B981" },
      { name: "Losing", value: perf.losingTrades, color: "#F43F5E" },
      { name: "Breakeven", value: perf.breakEvenTrades, color: "#94A3B8" },
    ];
  }, [analytics]);

  // Market PnL Breakdown
  const marketPerformanceData = React.useMemo(() => {
    const marketPnl: Record<string, number> = {};
    trades.forEach((t) => {
      if (t.status === "closed") {
        const m = t.market || "other";
        const net = t.pnlNet ?? t.profitLoss ?? 0;
        marketPnl[m] = (marketPnl[m] || 0) + net;
      }
    });

    return Object.entries(marketPnl).map(([m, pnl]) => ({
      name: m.charAt(0).toUpperCase() + m.slice(1),
      pnl: Number(pnl.toFixed(2)),
    }));
  }, [trades]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const perf = analytics?.performance;
  const summary = analytics?.summary;

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Performance Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deep dive into win rates, profit factor, risk-reward ratios, and market performance
          </p>
        </div>

        <div className="w-48">
          <Select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            options={[
              { value: "all", label: "All Markets" },
              { value: "forex", label: "Forex" },
              { value: "crypto", label: "Crypto" },
              { value: "stocks", label: "Stocks" },
              { value: "indices", label: "Indices" },
              { value: "commodities", label: "Commodities" },
            ]}
          />
        </div>
      </div>

      {/* 6 Metric Badges / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Win Rate</span>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {formatPercent(perf?.winRate)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            {perf?.winningTrades || 0} wins / {summary?.closedTrades || 0} closed
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Profit Factor</span>
            <Scale className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {perf?.profitFactor !== null && perf?.profitFactor !== undefined
              ? perf.profitFactor
              : "—"}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Gross Profit / Gross Loss
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Net P&L</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <span
            className={`text-2xl font-bold ${
              (perf?.totalNetPnl || 0) >= 0 ? "text-profit" : "text-loss"
            }`}
          >
            {formatCurrency(perf?.totalNetPnl)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Fees: {formatCurrency(perf?.totalFees)}
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Avg Win</span>
            <TrendingUp className="w-4 h-4 text-profit" />
          </div>
          <span className="text-2xl font-bold text-profit">
            +{formatCurrency(perf?.averageWin)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Per winning trade
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Avg Loss</span>
            <TrendingDown className="w-4 h-4 text-loss" />
          </div>
          <span className="text-2xl font-bold text-loss">
            -{formatCurrency(perf?.averageLoss)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Per losing trade
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Expectancy</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(perf?.expectancy)}
          </span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Average P&L per trade
          </span>
        </Card>
      </div>

      {/* 2-Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Breakdown Chart */}
        <Card className="p-6">
          <CardTitle className="text-base font-bold text-foreground mb-4">
            Win / Loss Distribution
          </CardTitle>
          {summary?.closedTrades === 0 ? (
            <EmptyState
              icon={<BarChart2 className="w-6 h-6" />}
              title="No closed trades"
              description="Close trade positions to generate distribution statistics."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload;
                        return (
                          <div className="bg-card border border-border rounded-xl p-2.5 text-xs shadow-dropdown">
                            <span className="font-semibold text-foreground">
                              {data.name}: {data.value} trades
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Market Net PnL Breakdown */}
        <Card className="p-6">
          <CardTitle className="text-base font-bold text-foreground mb-4">
            Net Performance by Market ($)
          </CardTitle>
          {marketPerformanceData.length === 0 ? (
            <EmptyState
              icon={<PieIcon className="w-6 h-6" />}
              title="No market data"
              description="Trade records will populate market performance analytics."
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketPerformanceData}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload;
                        return (
                          <div className="bg-card border border-border rounded-xl p-2.5 text-xs shadow-dropdown">
                            <span className="font-semibold text-foreground block">
                              {data.name}
                            </span>
                            <span
                              className={
                                data.pnl >= 0 ? "text-profit font-bold" : "text-loss font-bold"
                              }
                            >
                              {formatCurrency(data.pnl)}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
                    {marketPerformanceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? "#10B981" : "#F43F5E"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign,
  ArrowLeftRight,
  Target,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clock,
  PieChart as PieIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { cn, formatCurrency, formatPercent, formatRelativeTime } from "@/lib/utils";
import type { ITrade, TradeAnalytics } from "@/types";

export default function OverviewPage() {
  const [analytics, setAnalytics] = useState<TradeAnalytics | null>(null);
  const [recentTrades, setRecentTrades] = useState<ITrade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, tradesRes] = await Promise.all([
        apiClient.get<TradeAnalytics>("/trades/analytics"),
        apiClient.get<ITrade[]>("/trades", { limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      if (tradesRes.success && tradesRes.data) {
        setRecentTrades(tradesRes.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();

    const handleCreated = () => fetchOverviewData();
    window.addEventListener("tj:trade-created", handleCreated);
    return () => window.removeEventListener("tj:trade-created", handleCreated);
  }, [fetchOverviewData]);

  // Build cumulative equity chart data from recent trades or analytics
  const equityChartData = React.useMemo(() => {
    if (!recentTrades || recentTrades.length === 0) {
      return [
        { name: "Mon", pnl: 0, balance: 0 },
        { name: "Tue", pnl: 0, balance: 0 },
        { name: "Wed", pnl: 0, balance: 0 },
        { name: "Thu", pnl: 0, balance: 0 },
        { name: "Fri", pnl: 0, balance: 0 },
      ];
    }

    // Sort trades chronologically for curve
    const sorted = [...recentTrades].reverse();
    let runningTotal = 0;
    return sorted.map((t, idx) => {
      const net = t.pnlNet ?? t.profitLoss ?? 0;
      runningTotal += net;
      const dateLabel = t.entryAt ? new Date(t.entryAt).toLocaleDateString("en-US", { weekday: "short" }) : `T${idx + 1}`;
      return {
        name: dateLabel,
        pnl: net,
        balance: runningTotal,
        symbol: t.symbol,
      };
    });
  }, [recentTrades]);

  // Market Distribution Chart Data
  const marketDistributionData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    recentTrades.forEach((t) => {
      const m = t.market || "other";
      counts[m] = (counts[m] || 0) + 1;
    });

    const colors: Record<string, string> = {
      forex: "#2563EB",
      crypto: "#10B981",
      stocks: "#F59E0B",
      indices: "#8B5CF6",
      commodities: "#EC4899",
      other: "#64748B",
    };

    const total = recentTrades.length || 1;
    const items = Object.entries(counts).map(([market, count]) => ({
      name: market.charAt(0).toUpperCase() + market.slice(1),
      value: count,
      percentage: Number(((count / total) * 100).toFixed(1)),
      color: colors[market.toLowerCase()] || "#64748B",
    }));

    if (items.length === 0) {
      return [{ name: "Forex", value: 1, percentage: 100, color: "#2563EB" }];
    }
    return items;
  }, [recentTrades]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const netPnl = analytics?.performance?.totalNetPnl ?? 0;
  const isPnlPositive = netPnl >= 0;
  const totalTradesCount = analytics?.summary?.totalTrades ?? recentTrades.length;
  const winRateValue = analytics?.performance?.winRate ?? 0;

  return (
    <div className="space-y-6">
      {/* 1. Top Row: 3 Executive Metric Cards matching uploaded template */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Net P&L"
          value={formatCurrency(netPnl)}
          change={{
            value: `${isPnlPositive ? "+" : ""}${formatCurrency(netPnl)}`,
            isPositive: isPnlPositive,
            period: "total cumulative",
          }}
          icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
          trendColor={isPnlPositive ? "blue" : "rose"}
          sparklineData={equityChartData.map((d) => d.balance)}
        />

        <MetricCard
          title="Total Trades"
          value={totalTradesCount.toLocaleString()}
          change={{
            value: `${analytics?.summary?.openTrades || 0} open`,
            isPositive: true,
            period: "active in market",
          }}
          icon={<ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          trendColor="emerald"
          sparklineData={[5, 8, 12, 10, 15, 20, totalTradesCount || 25]}
        />

        <MetricCard
          title="Win Rate"
          value={formatPercent(winRateValue)}
          change={{
            value: `PF ${analytics?.performance?.profitFactor !== null && analytics?.performance?.profitFactor !== undefined ? analytics.performance.profitFactor : "—"}`,
            isPositive: winRateValue >= 50,
            period: "profit factor",
          }}
          icon={<Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          trendColor="amber"
          sparklineData={[45, 52, 48, 60, 58, 64, winRateValue || 65]}
        />
      </div>

      {/* 2. Middle Row: Main Performance Curve Card matching screenshot */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Performance Curve
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Net balance progression across recorded trades
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-lg border border-border bg-card text-foreground">
              Cumulative Net P&L
            </span>
          </div>
        </div>

        {recentTrades.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="w-6 h-6" />}
            title="No performance curve yet"
            description="Log your first trade to begin charting your cumulative trading edge."
          />
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityChartData}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0]?.payload;
                      return (
                        <div className="bg-card border border-border rounded-xl shadow-dropdown p-3 text-xs">
                          <p className="font-semibold text-foreground mb-1">{data.name}</p>
                          <p className="text-muted-foreground">
                            Balance:{" "}
                            <span className="font-bold text-primary">
                              {formatCurrency(data.balance)}
                            </span>
                          </p>
                          {data.symbol && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Trade: {data.symbol} ({formatCurrency(data.pnl)})
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pnlGrad)"
                  dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 6, fill: "#2563EB" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* 3. Bottom Row: 2-Column Split (Recent Activity & Top Channels Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card (2 Cols): Recent Trades Activity */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-base font-bold text-foreground">
                Recent Activity
              </CardTitle>
              <Link href="/trades">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {recentTrades.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-5 h-5" />}
                title="No trades recorded"
                description="Your trade history will appear here once you enter your first position."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3 pl-1 font-semibold">Instrument</th>
                      <th className="pb-3 font-semibold">Direction</th>
                      <th className="pb-3 font-semibold">Time</th>
                      <th className="pb-3 pr-1 text-right font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {recentTrades.map((trade) => {
                      const net = trade.pnlNet ?? trade.profitLoss;
                      const isWin = net !== undefined && net > 0;
                      const isLoss = net !== undefined && net < 0;

                      return (
                        <tr key={trade._id} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 pl-1">
                            <div className="flex items-center gap-2.5">
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
                                <span className="font-bold text-foreground block text-sm">
                                  {trade.symbol}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase">
                                  {trade.market}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                trade.direction === "long" ? "info" : "danger"
                              }
                              className="capitalize text-[10px] px-2"
                            >
                              {trade.direction}
                            </Badge>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            {formatRelativeTime(trade.createdAt || trade.entryAt)}
                          </td>
                          <td className="py-3 pr-1 text-right">
                            {trade.status === "open" ? (
                              <Badge variant="warning" className="text-[10px]">
                                Open
                              </Badge>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Link href="/trades">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                View All Activity
              </Button>
            </Link>
          </div>
        </Card>

        {/* Right Card (1 Col): Market Distribution Donut matching "Top Channels" */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground mb-4">
              Market Distribution
            </CardTitle>

            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {marketDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-foreground">
                  {recentTrades.length}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Positions
                </span>
              </div>
            </div>

            {/* Distribution Legend matching screenshot list style */}
            <div className="space-y-2 mt-4">
              {marketDistributionData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs py-0.5"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                View Full Report
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

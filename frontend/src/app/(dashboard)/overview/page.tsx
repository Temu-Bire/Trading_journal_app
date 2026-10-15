"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  OverviewEquityAreaChart,
  OverviewMarketPieChart,
} from "@/components/dashboard/overview-charts";
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
  const [closedTrades, setClosedTrades] = useState<ITrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const [analyticsRes, recentTradesRes, closedTradesRes] = await Promise.all([
        apiClient.get<TradeAnalytics>("/trades/analytics"),
        apiClient.get<ITrade[]>("/trades", { limit: 6, sortBy: "createdAt", sortOrder: "desc" }),
        apiClient.get<ITrade[]>("/trades", { limit: 100, status: "closed", sortBy: "exitAt", sortOrder: "asc" }),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      if (recentTradesRes.success && recentTradesRes.data) {
        setRecentTrades(recentTradesRes.data);
      }
      if (closedTradesRes.success && closedTradesRes.data) {
        setClosedTrades(closedTradesRes.data);
      }
    } catch (err) {
      setErrorState(err instanceof Error ? err.message : "Failed to load dashboard data");
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

  // Build cumulative equity chart data strictly from real closed trades
  const equityChartData = useMemo(() => {
    if (!closedTrades || closedTrades.length === 0) {
      return [];
    }

    let runningTotal = 0;
    return closedTrades.map((t, idx) => {
      const net = t.pnlNet ?? t.profitLoss ?? 0;
      runningTotal += net;
      const dateLabel = t.exitAt
        ? new Date(t.exitAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : t.entryAt
        ? new Date(t.entryAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `#${idx + 1}`;

      return {
        name: dateLabel,
        pnl: net,
        balance: Math.round(runningTotal * 100) / 100,
        symbol: t.symbol,
      };
    });
  }, [closedTrades]);

  // Market Distribution Chart Data calculated from recorded trades
  const marketDistributionData = useMemo(() => {
    if (!recentTrades || recentTrades.length === 0) {
      return [];
    }

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

    const total = recentTrades.length;
    return Object.entries(counts).map(([market, count]) => ({
      name: market.charAt(0).toUpperCase() + market.slice(1),
      value: count,
      percentage: Number(((count / total) * 100).toFixed(1)),
      color: colors[market.toLowerCase()] || "#64748B",
    }));
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

  if (errorState) {
    return (
      <div className="p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center space-y-4 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
        <div>
          <h3 className="font-bold text-foreground text-lg">Failed to Load Dashboard Data</h3>
          <p className="text-xs text-muted-foreground mt-1">{errorState}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOverviewData} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </Button>
      </div>
    );
  }

  const netPnl = analytics?.performance?.totalNetPnl ?? 0;
  const isPnlPositive = netPnl >= 0;
  const totalTradesCount = analytics?.summary?.totalTrades ?? recentTrades.length;
  const winRateValue = analytics?.performance?.winRate ?? 0;
  const profitFactorValue = analytics?.performance?.profitFactor;
  const openTradesCount = analytics?.summary?.openTrades ?? recentTrades.filter((t) => t.status === "open").length;

  const sparklineEquity = equityChartData.length >= 2 ? equityChartData.map((d) => d.balance) : undefined;

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
          sparklineData={sparklineEquity}
        />

        <MetricCard
          title="Total Trades"
          value={totalTradesCount.toLocaleString()}
          change={{
            value: `${openTradesCount} open`,
            isPositive: true,
            period: "positions active",
          }}
          icon={<ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          trendColor="emerald"
        />

        <MetricCard
          title="Win Rate"
          value={formatPercent(winRateValue)}
          change={{
            value: profitFactorValue !== null && profitFactorValue !== undefined ? `PF ${profitFactorValue.toFixed(2)}` : "PF —",
            isPositive: winRateValue >= 50,
            period: "profit factor",
          }}
          icon={<Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          trendColor="amber"
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
              Net balance progression across recorded closed trades
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-lg border border-border bg-card text-foreground">
              Cumulative Net P&L ({closedTrades.length} Closed)
            </span>
          </div>
        </div>

        {equityChartData.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="w-6 h-6" />}
            title="No performance curve yet"
            description="Log and close trade positions to begin charting your actual cumulative edge."
            actionLabel="Log a Trade"
            actionHref="/trades/new"
          />
        ) : (
          <div className="h-72 w-full pt-2">
            <OverviewEquityAreaChart data={equityChartData} />
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
                  View All Trades <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            {recentTrades.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-5 h-5" />}
                title="No trades recorded"
                description="Your trade history will appear here once you enter your first position."
                actionLabel="Log First Trade"
                actionHref="/trades/new"
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
                                <Link
                                  href={`/trades/${trade._id}`}
                                  className="font-bold text-foreground hover:text-primary transition-colors block text-sm"
                                >
                                  {trade.symbol}
                                </Link>
                                <span className="text-[10px] text-muted-foreground uppercase">
                                  {trade.market}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={trade.direction === "long" ? "info" : "danger"}
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

          <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
            <Link href="/trades/new">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Trade
              </Button>
            </Link>
            <Link href="/trades">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                View All Activity
              </Button>
            </Link>
          </div>
        </Card>

        {/* Right Card (1 Col): Market Distribution Donut */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground mb-4">
              Market Distribution
            </CardTitle>

            {marketDistributionData.length === 0 ? (
              <EmptyState
                icon={<PieIcon className="w-5 h-5" />}
                title="No market distribution"
                description="Positions you log will reflect here categorized by asset class."
              />
            ) : (
              <>
                <OverviewMarketPieChart
                  data={marketDistributionData}
                  totalPositions={recentTrades.length}
                />

                {/* Distribution Legend */}
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
              </>
            )}
          </div>

          <div className="pt-4 border-t border-border mt-4">
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                View Full Analytics Report
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

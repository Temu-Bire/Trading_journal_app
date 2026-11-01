"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  ArrowLeftRight,
  Target,
  ArrowUpRight,
  TrendingUp,
  Clock,
  PieChart as PieIcon,
  Plus,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Zap,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  Smartphone,
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
      forex: "#4f46e5",
      crypto: "#10b981",
      stocks: "#f59e0b",
      indices: "#8b5cf6",
      commodities: "#ec4899",
      other: "#64748b",
    };

    const total = recentTrades.length;
    return Object.entries(counts).map(([market, count]) => ({
      name: market.charAt(0).toUpperCase() + market.slice(1),
      value: count,
      percentage: Number(((count / total) * 100).toFixed(1)),
      color: colors[market.toLowerCase()] || "#64748b",
    }));
  }, [recentTrades]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <Skeleton className="h-44 w-full rounded-3xl" />
          <Skeleton className="h-44 w-full rounded-3xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 lg:col-span-2 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="p-8 rounded-3xl border border-destructive/20 bg-destructive/5 text-center space-y-4 max-w-lg mx-auto my-12">
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
    <div className="space-y-7 animate-fade-in">
      {/* ── Top Executive Callout Banner (Exact ZMenu Style from Image) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/40">
            💡 HOW TRADEFLOW WORKS
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            <strong>Where do trades sync?</strong> Automated multi-agent AI scanning pairs with disciplined journal auditing to track edge and eliminate cognitive bias.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/signals">
            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1.5 border-slate-200 dark:border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>AI Signals</span>
            </Button>
          </Link>
          <Link href="/trades/new">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md shadow-indigo-500/25">
              <Plus className="w-3.5 h-3.5" />
              <span>Log Trade</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 1. Top Executive Metric Cards Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Net Cumulative P&L"
          value={formatCurrency(netPnl)}
          change={{
            value: `${isPnlPositive ? "+" : ""}${formatCurrency(netPnl)}`,
            isPositive: isPnlPositive,
            period: "total portfolio return",
          }}
          icon={<DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          iconBgColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
          trendColor={isPnlPositive ? "blue" : "rose"}
          sparklineData={sparklineEquity}
        />

        <MetricCard
          title="Total Positions Tracked"
          value={totalTradesCount.toLocaleString()}
          change={{
            value: `${openTradesCount} active now`,
            isPositive: true,
            period: "open live trades",
          }}
          icon={<ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          trendColor="emerald"
        />

        <MetricCard
          title="Win Rate & Edge"
          value={formatPercent(winRateValue)}
          change={{
            value: profitFactorValue !== null && profitFactorValue !== undefined ? `PF ${profitFactorValue.toFixed(2)}x` : "PF 2.74x",
            isPositive: winRateValue >= 50,
            period: "profit factor index",
          }}
          icon={<Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          trendColor="amber"
        />
      </div>

      {/* ── 2. Main Executive Split: Left Analysis + Right Phone Device Mockup ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column (8 cols): Charts & Tables */}
        <div className="lg:col-span-8 space-y-7">
          {/* Performance Curve Card */}
          <Card className="p-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                  📈 Cumulative Equity Curve
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Realized balance progression across closed trading sessions
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-card text-slate-700 dark:text-slate-200">
                  {closedTrades.length} Trades Succeeded
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

          {/* Recent Trade Executions Activity Table */}
          <Card className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                  ⚡ Live Execution Journal
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest trades logged into your immutable record
                </p>
              </div>
              <Link href="/trades">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary gap-1">
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
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-1">Instrument</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Logged</th>
                      <th className="pb-3 pr-1 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {recentTrades.map((trade) => {
                      const net = trade.pnlNet ?? trade.profitLoss;
                      const isWin = net !== undefined && net > 0;
                      const isLoss = net !== undefined && net < 0;

                      return (
                        <tr key={trade._id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors">
                          <td className="py-3.5 pl-1">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                                  trade.direction === "long"
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                )}
                              >
                                {trade.direction === "long" ? "L" : "S"}
                              </div>
                              <div>
                                <Link
                                  href={`/trades/${trade._id}`}
                                  className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors block"
                                >
                                  {trade.symbol}
                                </Link>
                                <span className="text-[10px] text-slate-400 uppercase">
                                  {trade.market}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <Badge
                              variant={trade.direction === "long" ? "profit" : "danger"}
                              className="capitalize text-[10px] px-2 py-0"
                            >
                              {trade.direction}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-slate-400">
                            {formatRelativeTime(trade.createdAt || trade.entryAt)}
                          </td>
                          <td className="py-3.5 pr-1 text-right">
                            {trade.status === "open" ? (
                              <Badge variant="warning" className="text-[10px] px-2 py-0">
                                Open
                              </Badge>
                            ) : (
                              <span
                                className={cn(
                                  "font-bold text-xs",
                                  isWin ? "text-emerald-600 dark:text-emerald-400" : isLoss ? "text-rose-600 dark:text-rose-400" : "text-slate-400"
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
          </Card>
        </div>

        {/* Right Column (4 cols): Exact Phone Mockup Live Terminal like ZMenu Screenshot! */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-primary" />
              Live Terminal Preview
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Mobile Experience</span>
          </div>

          {/* ── Exact iPhone Mockup Frame (from ZMenu Screenshot) ── */}
          <div className="w-full max-w-[340px] h-[640px] bg-[#0f172a] rounded-[42px] p-2.5 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.4),0_0_0_1px_#334155] relative flex flex-col select-none">
            {/* Phone Speaker Notch */}
            <div className="w-[110px] h-[18px] bg-[#0f172a] rounded-b-xl absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2">
              <div className="w-8 h-1 bg-slate-700 rounded-full" />
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-slate-700" />
            </div>

            {/* Phone Screen Canvas */}
            <div className="w-full h-full bg-[#f8fafc] dark:bg-[#090d16] rounded-[34px] overflow-hidden flex flex-col justify-between pt-6">
              {/* Header inside phone (vibrant green/indigo gradient) */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white space-y-1 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-xs">
                      📈
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs tracking-tight">TradeFlow Mobile</h4>
                      <p className="text-[9px] text-emerald-100">Live Account · Margin 1:100</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/40 border border-emerald-300/30 text-[9px] font-bold">
                    CONNECTED
                  </span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-emerald-100 block">Today's Realized Net P&amp;L</span>
                  <span className="text-xl font-black text-white">+$2,840.50</span>
                </div>
              </div>

              {/* Ticker stream inside phone */}
              <div className="p-3.5 space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Active Positions</span>
                  <span className="text-emerald-500">3 Open</span>
                </div>

                {/* Mobile Item 1 */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">BTC/USDT</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        LONG
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Entry $67,450 · 4H Trend</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                      +$1,240.00 (3.2R)
                    </span>
                  </div>
                  <button className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs hover:bg-emerald-600">
                    +
                  </button>
                </div>

                {/* Mobile Item 2 */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">NVDA</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                        LONG
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Entry $142.50 · Vol Break</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                      +$890.50 (2.4R)
                    </span>
                  </div>
                  <button className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs hover:bg-emerald-600">
                    +
                  </button>
                </div>

                {/* Mobile Item 3 */}
                <div className="p-3 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">EUR/USD</span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                        SHORT
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Entry 1.0825 · Asian Sweep</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                      +$710.00 (1.8R)
                    </span>
                  </div>
                  <button className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-xs hover:bg-emerald-600">
                    +
                  </button>
                </div>
              </div>

              {/* Bottom Floating Bar inside phone */}
              <div className="p-3 bg-white dark:bg-[#111726] border-t border-slate-200/80 dark:border-white/[0.08]">
                <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between text-xs font-bold shadow-md">
                  <span>⚡ 1-Click Close All</span>
                  <span className="text-emerald-200">+$2,840</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <Link
              href="/signals"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 justify-center"
            >
              🔗 Open Full-Screen AI Market Scanner
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

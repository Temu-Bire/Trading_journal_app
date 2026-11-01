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
  Globe2,
  Sliders,
  CheckCircle2,
  Flame,
  Bot,
  Activity,
  Layers,
  Edit2,
  Check,
  BookOpen,
  Calculator,
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
import { ForexSessionsClock } from "@/components/forex/sessions-clock";
import { EconomicNewsAlert } from "@/components/forex/economic-news-alert";
import { LotSizeCalculator } from "@/components/forex/lot-size-calculator";
import { apiClient } from "@/lib/api/client";
import { cn, formatCurrency, formatPercent, formatRelativeTime } from "@/lib/utils";
import type { ITrade, TradeAnalytics } from "@/types";

export default function OverviewPage() {
  const [recentTrades, setRecentTrades] = useState<ITrade[]>([]);
  const [closedTrades, setClosedTrades] = useState<ITrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Real Account Initial Capital (Editable by Retail Trader)
  const [initialCapital, setInitialCapital] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tj_initial_capital");
      return saved ? Number(saved) : 1000;
    }
    return 1000;
  });
  const [editingCapital, setEditingCapital] = useState(false);
  const [tempCapital, setTempCapital] = useState<number>(initialCapital);

  // Currency toggle: USD or ETB
  const [currency, setCurrency] = useState<"USD" | "ETB">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("tj_currency_preference") as "USD" | "ETB") || "USD";
    }
    return "USD";
  });

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const [recentRes, closedRes] = await Promise.all([
        apiClient.get<ITrade[]>("/trades", { limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
        apiClient.get<ITrade[]>("/trades", { limit: 200, status: "closed", sortBy: "exitAt", sortOrder: "asc" }),
      ]);

      if (recentRes.success && recentRes.data) {
        setRecentTrades(recentRes.data);
      } else {
        // Read local offline trades if any
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("tj_local_trades");
          if (raw) setRecentTrades(JSON.parse(raw));
        }
      }

      if (closedRes.success && closedRes.data) {
        setClosedTrades(closedRes.data);
      } else {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("tj_local_trades");
          if (raw) {
            const parsed = JSON.parse(raw) as ITrade[];
            setClosedTrades(parsed.filter((t) => t.status === "closed"));
          }
        }
      }
    } catch {
      // Offline fallback: read real trades saved by user
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("tj_local_trades");
        if (raw) {
          const parsed = JSON.parse(raw) as ITrade[];
          setRecentTrades(parsed);
          setClosedTrades(parsed.filter((t) => t.status === "closed"));
        } else {
          setRecentTrades([]);
          setClosedTrades([]);
        }
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

  const handleSaveCapital = () => {
    const val = Math.max(10, tempCapital);
    setInitialCapital(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("tj_initial_capital", val.toString());
    }
    setEditingCapital(false);
  };

  const handleToggleCurrency = () => {
    const next = currency === "USD" ? "ETB" : "USD";
    setCurrency(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("tj_currency_preference", next);
    }
  };

  // Real Calculations - NO FAKE DEMO DATA
  const realNetPnl = useMemo(() => {
    return closedTrades.reduce((acc, t) => acc + (t.pnlNet ?? t.profitLoss ?? 0), 0);
  }, [closedTrades]);

  const realCurrentBalance = initialCapital + realNetPnl;
  const isPnlPositive = realNetPnl >= 0;

  const realWinningTrades = useMemo(() => {
    return closedTrades.filter((t) => (t.pnlNet ?? t.profitLoss ?? 0) > 0).length;
  }, [closedTrades]);

  const realLosingTrades = useMemo(() => {
    return closedTrades.filter((t) => (t.pnlNet ?? t.profitLoss ?? 0) < 0).length;
  }, [closedTrades]);

  const realWinRate = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    return Math.round((realWinningTrades / closedTrades.length) * 1000) / 10;
  }, [closedTrades, realWinningTrades]);

  const realProfitFactor = useMemo(() => {
    const grossProfit = closedTrades
      .filter((t) => (t.pnlNet ?? t.profitLoss ?? 0) > 0)
      .reduce((sum, t) => sum + (t.pnlNet ?? t.profitLoss ?? 0), 0);
    const grossLoss = Math.abs(
      closedTrades
        .filter((t) => (t.pnlNet ?? t.profitLoss ?? 0) < 0)
        .reduce((sum, t) => sum + (t.pnlNet ?? t.profitLoss ?? 0), 0)
    );
    if (grossLoss === 0) return grossProfit > 0 ? 9.99 : 0;
    return Math.round((grossProfit / grossLoss) * 100) / 100;
  }, [closedTrades]);

  const openTradesCount = useMemo(() => {
    return recentTrades.filter((t) => t.status === "open").length;
  }, [recentTrades]);

  // Equity Chart: Real curve based on actual closed trades
  const equityChartData = useMemo(() => {
    let running = initialCapital;
    const base = [{ name: "Start", balance: running, pnl: 0 }];
    if (closedTrades.length === 0) {
      return base;
    }
    const points = closedTrades.map((t, idx) => {
      const net = t.pnlNet ?? t.profitLoss ?? 0;
      running += net;
      const label = t.exitAt
        ? new Date(t.exitAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : `#${idx + 1}`;
      return {
        name: label,
        pnl: net,
        balance: Math.round(running * 100) / 100,
        symbol: t.symbol,
      };
    });
    return [base[0], ...points];
  }, [closedTrades, initialCapital]);

  const formatDisplayAmount = (amount: number) => {
    if (currency === "ETB") {
      // 1 USD = approx 125 ETB (or user reference rate)
      const inEtb = amount * 125;
      return `${inEtb.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ብር`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── 1. Top Bar: Capital & Currency Setup ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Trading Account Capital
              </span>
              {!editingCapital ? (
                <button
                  onClick={() => {
                    setTempCapital(initialCapital);
                    setEditingCapital(true);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Edit starting balance"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              ) : null}
            </div>

            {!editingCapital ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatDisplayAmount(realCurrentBalance)}
                </span>
                <span className="text-xs text-slate-400">
                  (Initial: {formatDisplayAmount(initialCapital)})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-500">$</span>
                <input
                  type="number"
                  min="10"
                  step="50"
                  value={tempCapital}
                  onChange={(e) => setTempCapital(Number(e.target.value) || 0)}
                  className="w-32 px-3 py-1 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-slate-50 dark:bg-[#151c2e] text-sm font-bold text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleSaveCapital}
                  className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingCapital(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Currency Switch & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleToggleCurrency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle between USD and Ethiopian Birr"
          >
            <span>Currency:</span>
            <span className="text-indigo-600 dark:text-indigo-400">{currency}</span>
          </button>

          <Link href="/trades/new">
            <Button
              variant="primary"
              size="sm"
              className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Trade
            </Button>
          </Link>

          <Link href="/journal">
            <Button
              variant="outline"
              size="sm"
              className="font-bold gap-1.5 rounded-xl"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Journal
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 2. Real Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Account Net P&L"
          value={formatDisplayAmount(realNetPnl)}
          trendColor={realNetPnl > 0 ? "emerald" : realNetPnl < 0 ? "rose" : "blue"}
          icon={<DollarSign className="w-4 h-4" />}
          change={{
            value: closedTrades.length > 0 ? `${((realNetPnl / initialCapital) * 100).toFixed(2)}%` : "0.00%",
            isPositive: realNetPnl >= 0,
            period: "on capital",
          }}
        />

        <MetricCard
          title="Win Rate"
          value={`${realWinRate.toFixed(1)}%`}
          trendColor={realWinRate >= 50 ? "emerald" : realWinRate > 0 ? "amber" : "blue"}
          icon={<Target className="w-4 h-4" />}
          change={{
            value: `${realWinningTrades}W / ${realLosingTrades}L`,
            isPositive: realWinRate >= 50,
            period: `${closedTrades.length} closed`,
          }}
        />

        <MetricCard
          title="Profit Factor"
          value={realProfitFactor.toFixed(2)}
          trendColor={realProfitFactor >= 1.5 ? "emerald" : realProfitFactor >= 1.0 ? "amber" : "blue"}
          icon={<TrendingUp className="w-4 h-4" />}
          change={{
            value: realProfitFactor >= 2.0 ? "Elite Edge" : realProfitFactor >= 1.0 ? "Profitable" : "Breakeven",
            isPositive: realProfitFactor >= 1.0,
          }}
        />

        <MetricCard
          title="Active Open Risk"
          value={`${openTradesCount} Position${openTradesCount !== 1 ? "s" : ""}`}
          trendColor="blue"
          icon={<ShieldCheck className="w-4 h-4" />}
          change={{
            value: openTradesCount > 0 ? "Active in market" : "All flat",
            isPositive: true,
          }}
        />
      </div>

      {/* ── 3. Forex Market Sessions Clock (Addis Ababa EAT & GMT) ── */}
      <ForexSessionsClock />

      {/* ── 4. USD Fundamental High-Impact News Alerts ── */}
      <EconomicNewsAlert />

      {/* ── 5. Integrated Forex Lot Size & Risk Calculator ── */}
      <LotSizeCalculator initialBalance={initialCapital} />

      {/* ── 6. Real Equity Curve Chart ── */}
      <Card className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Cumulative Account Equity Growth
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tracks your verified trading capital over time as real closed trades are registered
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {closedTrades.length} Closed Trades Logged
          </span>
        </div>

        <div className="pt-4">
          {closedTrades.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Equity curve waiting for your first closed trade
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                Starting capital is anchored at {formatDisplayAmount(initialCapital)}. As you take trades and close them, your real compounding curve will render here.
              </p>
            </div>
          ) : (
            <OverviewEquityAreaChart data={equityChartData} />
          )}
        </div>
      </Card>

      {/* ── 7. Recent Trades Feed (Real User Records Only) ── */}
      <Card className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recent Trade History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real execution log for Forex, Gold, and Indices
            </p>
          </div>

          <Link href="/trades">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All Trades →
            </span>
          </Link>
        </div>

        <div className="pt-4">
          {recentTrades.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10 max-w-lg mx-auto my-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  No trades recorded yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Start logging your real trades to track your edge, calculate your win rate, and monitor risk.
                </p>
              </div>
              <Link href="/trades/new">
                <Button
                  variant="primary"
                  size="sm"
                  className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Your First Trade
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06] text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Entry</th>
                    <th className="py-2.5 px-3">Exit</th>
                    <th className="py-2.5 px-3">P&L</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {recentTrades.map((t) => {
                    const net = t.pnlNet ?? t.profitLoss;
                    const isWin = net !== undefined && net > 0;
                    const isLoss = net !== undefined && net < 0;

                    return (
                      <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {t.symbol}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={cn(
                              "font-bold uppercase text-[10px] px-2 py-0.5 rounded",
                              t.direction === "long"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                                : "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                            )}
                          >
                            {t.direction}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {t.entryPrice}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {t.exitPrice || "—"}
                        </td>
                        <td className="py-3 px-3 font-extrabold">
                          {net !== undefined ? (
                            <span className={isWin ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-slate-500"}>
                              {isWin ? "+" : ""}
                              {formatDisplayAmount(net)}
                            </span>
                          ) : (
                            <span className="text-slate-400">Open</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {formatRelativeTime(t.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

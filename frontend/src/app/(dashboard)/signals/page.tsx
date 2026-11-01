"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Bot,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  RefreshCw,
  Plus,
  Flame,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AISignal {
  id: string;
  symbol: string;
  market: "crypto" | "forex" | "stocks" | "commodities";
  direction: "BUY" | "SELL";
  timeframe: string;
  agentName: string;
  agentType: string;
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskReward: string;
  status: "ACTIVE" | "PENDING" | "HIT_TP";
  timestamp: string;
  rationale: string;
}

const mockSignals: AISignal[] = [
  {
    id: "sig-1",
    symbol: "BTC/USDT",
    market: "crypto",
    direction: "BUY",
    timeframe: "4H",
    agentName: "AlphaTrend AI v4",
    agentType: "Trend Following",
    confidence: 94,
    entryPrice: 67450,
    stopLoss: 66200,
    takeProfit1: 69800,
    takeProfit2: 71500,
    riskReward: "1:3.2",
    status: "ACTIVE",
    timestamp: "12 mins ago",
    rationale: "Bullish divergence on 4H RSI with high-volume breakout above 200 EMA resistance.",
  },
  {
    id: "sig-2",
    symbol: "NVDA",
    market: "stocks",
    direction: "BUY",
    timeframe: "1D",
    agentName: "Momentum Sentinel",
    agentType: "Order Flow AI",
    confidence: 89,
    entryPrice: 142.5,
    stopLoss: 137.8,
    takeProfit1: 154.0,
    takeProfit2: 162.0,
    riskReward: "1:2.9",
    status: "ACTIVE",
    timestamp: "35 mins ago",
    rationale: "Institutional dark pool accumulation cluster identified at $140-$142 support tier.",
  },
  {
    id: "sig-3",
    symbol: "EUR/USD",
    market: "forex",
    direction: "SELL",
    timeframe: "1H",
    agentName: "MacroFX Engine",
    agentType: "Macro & Volatility",
    confidence: 86,
    entryPrice: 1.0825,
    stopLoss: 1.087,
    takeProfit1: 1.074,
    takeProfit2: 1.069,
    riskReward: "1:2.4",
    status: "ACTIVE",
    timestamp: "1 hour ago",
    rationale: "Fed policy rate divergence pressure with clean liquidity sweep above Asian session high.",
  },
  {
    id: "sig-4",
    symbol: "XAU/USD",
    market: "commodities",
    direction: "BUY",
    timeframe: "15M",
    agentName: "ScalpMatrix Bot",
    agentType: "Microstructure",
    confidence: 91,
    entryPrice: 2742.0,
    stopLoss: 2734.0,
    takeProfit1: 2758.0,
    takeProfit2: 2768.0,
    riskReward: "1:3.1",
    status: "ACTIVE",
    timestamp: "2 hours ago",
    rationale: "Double bottom liquidity sweep at golden Fibonacci ratio (0.618) with volume confirmation.",
  },
  {
    id: "sig-5",
    symbol: "ETH/USDT",
    market: "crypto",
    direction: "BUY",
    timeframe: "1H",
    agentName: "HyperLiquid Copilot",
    agentType: "Funding Rate Arbitrage",
    confidence: 82,
    entryPrice: 2540,
    stopLoss: 2470,
    takeProfit1: 2680,
    takeProfit2: 2790,
    riskReward: "1:2.8",
    status: "ACTIVE",
    timestamp: "3 hours ago",
    rationale: "Perpetual funding rate reset to negative while spot inflows continue growing across exchanges.",
  },
];

export default function AISignalsPage() {
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const filteredSignals =
    selectedMarket === "all"
      ? mockSignals
      : mockSignals.filter((s: AISignal) => s.market === selectedMarket);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#090d16] via-[#0f1422] to-[#151c2e] border border-slate-300 dark:border-white/10 p-6 sm:p-8 text-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Autonomous Agent Scanner
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Live AI Market Signals
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Multi-agent algorithmic consensus scanning Crypto, Forex, Equities, and Commodities 24/7.
              Import verified setups straight into your Trading Journal with one click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 backdrop-blur-sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Scanning Markets..." : "Scan Now"}
            </Button>
            <Link href="/arena">
              <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white gap-2 shadow-lg shadow-indigo-600/30">
                <Bot className="w-4 h-4" />
                View Bot Arena
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-card rounded-xl border border-border w-fit overflow-x-auto">
          {["all", "crypto", "forex", "stocks", "commodities"].map((market) => (
            <button
              key={market}
              onClick={() => setSelectedMarket(market)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                selectedMarket === market
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {market}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            5 Agents Online
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Average Accuracy: <strong className="text-foreground">88.4%</strong></span>
        </div>
      </div>

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredSignals.map((signal: AISignal) => (
          <Card
            key={signal.id}
            className="group relative border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Line */}
            <div
              className={`h-1 w-full ${
                signal.direction === "BUY"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-rose-500 to-amber-500"
              }`}
            />

            <div className="p-5 space-y-4">
              {/* Card Header: Symbol + Bias Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground tracking-tight">
                      {signal.symbol}
                    </h3>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5">
                      {signal.timeframe}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                    {signal.agentName}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={signal.direction === "BUY" ? "profit" : "loss"}
                    className="font-bold tracking-wide text-xs px-2.5 py-0.5"
                  >
                    {signal.direction === "BUY" ? (
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 mr-1" />
                    )}
                    {signal.direction}
                  </Badge>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {signal.confidence}% Confidence
                  </span>
                </div>
              </div>

              {/* Rationale Quote */}
              <p className="text-xs text-muted-foreground bg-muted/40 dark:bg-card/40 border border-border/50 rounded-lg p-2.5 italic">
                "{signal.rationale}"
              </p>

              {/* Target Price Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="bg-muted/40 dark:bg-muted/20 p-2 rounded-lg border border-border/40">
                  <span className="text-[10px] uppercase text-muted-foreground block font-semibold">
                    Entry
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    ${signal.entryPrice.toLocaleString()}
                  </span>
                </div>
                <div className="bg-rose-500/5 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-500/20">
                  <span className="text-[10px] uppercase text-rose-600 dark:text-rose-400 block font-semibold">
                    Stop Loss
                  </span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    ${signal.stopLoss.toLocaleString()}
                  </span>
                </div>
                <div className="bg-emerald-500/5 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block font-semibold">
                    Target 1
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ${signal.takeProfit1.toLocaleString()}
                  </span>
                </div>
                <div className="bg-muted/40 dark:bg-muted/20 p-2 rounded-lg border border-border/40">
                  <span className="text-[10px] uppercase text-muted-foreground block font-semibold">
                    R:R Ratio
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {signal.riskReward}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 pt-0 border-t border-border/40 flex items-center justify-between gap-2 mt-2">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {signal.timestamp}
              </span>

              <Link
                href={`/trades/new?symbol=${encodeURIComponent(signal.symbol)}&direction=${signal.direction}&entryPrice=${signal.entryPrice}&stopLoss=${signal.stopLoss}&takeProfit=${signal.takeProfit1}`}
              >
                <Button size="sm" className="gap-1.5 text-xs font-semibold h-8 bg-primary hover:bg-primary-hover text-white">
                  <Plus className="w-3.5 h-3.5" />
                  Log to Journal
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


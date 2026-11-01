"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Check,
  TrendingUp,
  TrendingDown,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TradePlan {
  id: string;
  symbol: string;
  market: string;
  direction: "LONG" | "SHORT";
  timeframe: string;
  triggerCondition: string;
  plannedEntry: number;
  plannedStopLoss: number;
  plannedTakeProfit: number;
  riskReward: string;
  status: "WATCHING" | "READY" | "EXECUTED" | "EXPIRED";
  notes: string;
}

const mockPlans: TradePlan[] = [
  {
    id: "plan-1",
    symbol: "NVDA",
    market: "stocks",
    direction: "LONG",
    timeframe: "1D",
    triggerCondition: "Wait for 1H candle close above $144.50 with volume > 20M",
    plannedEntry: 144.8,
    plannedStopLoss: 139.5,
    plannedTakeProfit: 158.0,
    riskReward: "1:2.5",
    status: "READY",
    notes: "Earnings run-up momentum. Tech sector exhibiting relative strength.",
  },
  {
    id: "plan-2",
    symbol: "ETH/USDT",
    market: "crypto",
    direction: "LONG",
    timeframe: "4H",
    triggerCondition: "Retest of $2,480 liquidity pool with bullish pin-bar rejection",
    plannedEntry: 2490,
    plannedStopLoss: 2420,
    plannedTakeProfit: 2710,
    riskReward: "1:3.1",
    status: "WATCHING",
    notes: "4H key support level. Divergence building on RSI indicator.",
  },
  {
    id: "plan-3",
    symbol: "GBP/USD",
    market: "forex",
    direction: "SHORT",
    timeframe: "1H",
    triggerCondition: "Failed breakout above 1.3020 during London open session",
    plannedEntry: 1.2995,
    plannedStopLoss: 1.3035,
    plannedTakeProfit: 1.2900,
    riskReward: "1:2.4",
    status: "WATCHING",
    notes: "Macro bias leans bearish following UK inflation print.",
  },
  {
    id: "plan-4",
    symbol: "SPY",
    market: "indices",
    direction: "LONG",
    timeframe: "15M",
    triggerCondition: "Morning gap fill at $578 with VWAP reclaim",
    plannedEntry: 578.5,
    plannedStopLoss: 575.2,
    plannedTakeProfit: 585.0,
    riskReward: "1:2.0",
    status: "EXECUTED",
    notes: "Gap and go play. High conviction trade plan executed at open.",
  },
];

export default function TradePlansPage() {
  const [plans, setPlans] = useState<TradePlan[]>(mockPlans);
  const [filter, setFilter] = useState<string>("ALL");

  const filteredPlans =
    filter === "ALL" ? plans : plans.filter((p: TradePlan) => p.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-primary" />
            Pre-Market Trade Plans
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            "Plan your trade and trade your plan." Pre-define your entries, invalidations, and setup criteria before market opens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/trades/new">
            <Button className="bg-primary hover:bg-primary-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" />
              New Trade Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-card rounded-xl border border-border w-fit">
        {["ALL", "READY", "WATCHING", "EXECUTED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
              filter === tab
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPlans.map((plan: TradePlan) => (
          <Card
            key={plan.id}
            className="border border-border hover:border-primary/40 transition-all duration-200 shadow-sm flex flex-col justify-between"
          >
            <div className="p-5 space-y-3.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      plan.direction === "LONG"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {plan.direction === "LONG" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">{plan.symbol}</h3>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {plan.timeframe}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {plan.market} • {plan.direction}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={
                    plan.status === "READY"
                      ? "success"
                      : plan.status === "WATCHING"
                      ? "warning"
                      : "secondary"
                  }
                  className="font-bold text-xs uppercase"
                >
                  {plan.status}
                </Badge>
              </div>

              {/* Trigger condition box */}
              <div className="bg-muted/40 dark:bg-card/60 p-3 rounded-xl border border-border/50 text-xs space-y-1">
                <span className="font-bold text-foreground block">Execution Trigger:</span>
                <p className="text-muted-foreground leading-relaxed">{plan.triggerCondition}</p>
              </div>

              {/* Targets row */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-[10px] uppercase text-muted-foreground block">Entry</span>
                  <span className="font-bold text-foreground">${plan.plannedEntry}</span>
                </div>
                <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/20">
                  <span className="text-[10px] uppercase text-rose-600 dark:text-rose-400 block">SL</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">${plan.plannedStopLoss}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 block">TP</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">${plan.plannedTakeProfit}</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-[10px] uppercase text-muted-foreground block">R:R</span>
                  <span className="font-bold text-primary">{plan.riskReward}</span>
                </div>
              </div>

              {/* Notes */}
              <p className="text-xs text-muted-foreground italic">"{plan.notes}"</p>
            </div>

            {/* Card Footer */}
            <div className="p-4 pt-0 border-t border-border/40 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Setup Confluence: High</span>
              {plan.status !== "EXECUTED" ? (
                <Link
                  href={`/trades/new?symbol=${encodeURIComponent(plan.symbol)}&direction=${plan.direction}&entryPrice=${plan.plannedEntry}&stopLoss=${plan.plannedStopLoss}&takeProfit=${plan.plannedTakeProfit}`}
                >
                  <Button size="sm" className="h-7 text-xs gap-1 bg-primary hover:bg-primary-hover text-white">
                    Execute Trade
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ) : (
                <Badge variant="outline" className="text-xs text-emerald-600">
                  <Check className="w-3 h-3 mr-1" /> Executed in Journal
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Calculator,
  AlertTriangle,
  Lock,
  Percent,
  DollarSign,
  TrendingDown,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RiskManagementPage() {
  // Position Size Calculator State
  const [accountBalance, setAccountBalance] = useState<number>(25000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopLossPrice, setStopLossPrice] = useState<number>(95);

  const riskAmount = (accountBalance * riskPercent) / 100;
  const slDistance = Math.abs(entryPrice - stopLossPrice);
  const slPercent = entryPrice > 0 ? (slDistance / entryPrice) * 100 : 0;
  const positionUnits = slDistance > 0 ? (riskAmount / slDistance) : 0;
  const totalPositionValue = positionUnits * entryPrice;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          Risk Management &amp; Capital Protection
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Trading is not about maximizing profit on one trade; it is about surviving drawdowns and compounding capital safely.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-border">
          <span className="text-xs text-muted-foreground font-semibold block">Daily Loss Lock</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-foreground">$500.00</span>
            <Badge variant="success" className="text-[10px]">SAFE (0 / $500)</Badge>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Account locks if daily loss reaches -2%</span>
        </Card>

        <Card className="p-4 border border-border">
          <span className="text-xs text-muted-foreground font-semibold block">Current Portfolio Open Risk</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-foreground">1.8%</span>
            <span className="text-xs text-muted-foreground">Cap: 5.0%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "36%" }} />
          </div>
        </Card>

        <Card className="p-4 border border-border">
          <span className="text-xs text-muted-foreground font-semibold block">Risk of Ruin</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">&lt; 0.05%</span>
            <Badge variant="profit" className="text-[10px]">OPTIMAL</Badge>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Based on 67% win rate &amp; 2.5R average</span>
        </Card>

        <Card className="p-4 border border-border">
          <span className="text-xs text-muted-foreground font-semibold block">Max Drawdown Buffer</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-foreground">14 Losses</span>
            <Badge variant="outline" className="text-[10px]">BUFFER</Badge>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Losses until 20% drawdown breach</span>
        </Card>
      </div>

      {/* Main Content: Interactive Position Sizer & Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Position Size Calculator (7 cols) */}
        <Card className="lg:col-span-7 border border-border shadow-sm p-6 space-y-6">
          <div className="border-b border-border/60 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-bold">Position Size Calculator</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">Dynamic Math Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Account Balance ($)</label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(Number(e.target.value))}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Risk per Trade (%)</label>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Planned Entry Price ($)</label>
              <input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Stop Loss Price ($)</label>
              <input
                type="number"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Calculator Output Display */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">
              Calculated Execution Parameters
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-card border border-border shadow-xs">
                <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Max Risk</span>
                <span className="text-sm font-bold text-rose-500">${riskAmount.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border shadow-xs">
                <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Position Units</span>
                <span className="text-sm font-bold text-foreground">{positionUnits.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border shadow-xs">
                <span className="text-[10px] uppercase text-muted-foreground block font-semibold">SL Distance</span>
                <span className="text-sm font-bold text-foreground">{slPercent.toFixed(2)}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-card border border-border shadow-xs">
                <span className="text-[10px] uppercase text-muted-foreground block font-semibold">Total Exposure</span>
                <span className="text-sm font-bold text-foreground">${totalPositionValue.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right: Risk Rules & Guidelines (5 cols) */}
        <Card className="lg:col-span-5 border border-border shadow-sm p-6 space-y-5">
          <div className="border-b border-border/60 pb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-base font-bold">Hard Capital Rules</CardTitle>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Rule 1: Never Risk &gt; 2% on Any Setup</span>
                <p className="text-muted-foreground mt-0.5">
                  Protects account from black swan events and allows statistical edge to play out.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Rule 2: Stop Loss Defined Before Entry</span>
                <p className="text-muted-foreground mt-0.5">
                  No market entry is permitted without an exact mathematical invalidation price.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground">Rule 3: Maximum 3 Losses Per Day</span>
                <p className="text-muted-foreground mt-0.5">
                  If 3 consecutive trades are stopped out, trading is terminated for the session to prevent tilt.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


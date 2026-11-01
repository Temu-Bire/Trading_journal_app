"use client";

import React, { useState, useEffect } from "react";
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
  Calendar,
  Sparkles,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LotSizeCalculator } from "@/components/forex/lot-size-calculator";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export interface TradePlan {
  id: string;
  symbol: string;
  session: "London" | "New York" | "Asian" | "General";
  date: string;
  direction: "LONG" | "SHORT";
  timeframe: string;
  triggerCondition: string;
  plannedEntry: number;
  plannedStopLoss: number;
  plannedTakeProfit: number;
  calculatedLots?: number;
  riskReward: string;
  status: "WATCHING" | "READY" | "EXECUTED" | "CANCELLED";
  confluences: string[];
  notes: string;
  createdAt: string;
}

export default function PlansPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [plans, setPlans] = useState<TradePlan[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`tj_real_trade_plans_${user?.id || "default"}`);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Form
  const [formSymbol, setFormSymbol] = useState("EUR/USD");
  const [formSession, setFormSession] = useState<TradePlan["session"]>("London");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDirection, setFormDirection] = useState<"LONG" | "SHORT">("LONG");
  const [formTimeframe, setFormTimeframe] = useState("15m");
  const [formTrigger, setFormTrigger] = useState("");
  const [formEntry, setFormEntry] = useState("");
  const [formSL, setFormSL] = useState("");
  const [formTP, setFormTP] = useState("");
  const [formLots, setFormLots] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Confluences Checklist
  const [chkHtfBias, setChkHtfBias] = useState(false);
  const [chkLiquiditySweep, setChkLiquiditySweep] = useState(false);
  const [chkFvgOb, setChkFvgOb] = useState(false);
  const [chkNoNews, setChkNoNews] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`tj_real_trade_plans_${user?.id || "default"}`, JSON.stringify(plans));
    }
  }, [plans, user?.id]);

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEntry || !formSL || !formTP) {
      error("Please enter Planned Entry, Stop Loss, and Take Profit.");
      return;
    }

    const entryNum = Number(formEntry);
    const slNum = Number(formSL);
    const tpNum = Number(formTP);
    const risk = Math.abs(entryNum - slNum);
    const reward = Math.abs(tpNum - entryNum);
    const rrRatio = risk > 0 ? `1:${(reward / risk).toFixed(1)}` : "1:2";

    const confluences: string[] = [];
    if (chkHtfBias) confluences.push("Higher Timeframe Trend Alignment");
    if (chkLiquiditySweep) confluences.push("Session Liquidity Swept");
    if (chkFvgOb) confluences.push("Order Block / FVG Confirmation");
    if (chkNoNews) confluences.push("No High-Impact USD News Collision");

    const newPlan: TradePlan = {
      id: `plan-${Date.now()}`,
      symbol: formSymbol,
      session: formSession,
      date: formDate,
      direction: formDirection,
      timeframe: formTimeframe,
      triggerCondition: formTrigger.trim() || "Market structure shift confirmation",
      plannedEntry: entryNum,
      plannedStopLoss: slNum,
      plannedTakeProfit: tpNum,
      calculatedLots: formLots ? Number(formLots) : undefined,
      riskReward: rrRatio,
      status: "WATCHING",
      confluences,
      notes: formNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    setPlans((prev) => [newPlan, ...prev]);
    setModalOpen(false);
    success("Pre-market trade plan saved!");
  };

  const handleStatusChange = (id: string, newStatus: TradePlan["status"]) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    success(`Plan marked as ${newStatus}`);
  };

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    success("Trade plan deleted.");
  };

  const filteredPlans = plans.filter((p) => {
    if (filterStatus === "ALL") return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pre-Market Trade Plans & Analysis
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50">
              Execution Codex
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Write down your confluence rules, triggers, and calculate exact lot sizes before clicking BUY or SELL.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setModalOpen(true)}
          className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Trade Plan
        </Button>
      </div>

      {/* Lot Size Calculator Helper */}
      <LotSizeCalculator
        onApplyPlan={(calc) => {
          setFormSymbol(calc.pair);
          setFormLots(calc.lots.toString());
          setModalOpen(true);
        }}
      />

      {/* Plans List & Status Filter */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          Active Watchlist & Setups ({filteredPlans.length})
        </h2>

        <div className="flex items-center gap-1.5 text-xs">
          {["ALL", "WATCHING", "READY", "EXECUTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                "px-3 py-1 rounded-xl font-bold transition-all cursor-pointer",
                filterStatus === st
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-white/[0.04] text-slate-500 hover:text-slate-900"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-300 dark:border-white/10 max-w-lg mx-auto shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)]">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            No trade plans currently active
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Professional retail traders never trade on impulse. Select your session, analyze higher timeframe key levels, and set your execution triggers.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Plan Next Trade
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlans.map((plan) => (
            <Card
              key={plan.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">
                    {plan.symbol}
                  </span>
                  <span
                    className={cn(
                      "font-bold text-xs px-2.5 py-0.5 rounded-full",
                      plan.direction === "LONG"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                    )}
                  >
                    {plan.direction}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
                    {plan.session}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={plan.status}
                    onChange={(e) => handleStatusChange(plan.id, e.target.value as any)}
                    className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e]"
                  >
                    <option value="WATCHING">WATCHING</option>
                    <option value="READY">READY</option>
                    <option value="EXECUTED">EXECUTED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                    title="Delete plan"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Price Setup */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                  <span className="text-[10px] text-slate-400 block font-medium">Entry</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {plan.plannedEntry}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-rose-600">
                  <span className="text-[10px] text-rose-400 block font-medium">Stop Loss</span>
                  <span className="font-extrabold">{plan.plannedStopLoss}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600">
                  <span className="text-[10px] text-emerald-400 block font-medium">Take Profit</span>
                  <span className="font-extrabold">{plan.plannedTakeProfit}</span>
                </div>
              </div>

              {/* Trigger */}
              <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/30 text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 block text-[10px] uppercase">
                  Execution Trigger:
                </span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {plan.triggerCondition}
                </p>
              </div>

              {/* Confluences Checklist */}
              {plan.confluences && plan.confluences.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verified Confluences:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {plan.confluences.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.06] text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  Planned R:R: {plan.riskReward}
                </span>
                {plan.calculatedLots && (
                  <span className="text-slate-500 font-semibold">
                    Safe Lot Size: <strong>{plan.calculatedLots} Lots</strong>
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Plan Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-white/10 p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Create Pre-Market Trade Plan
            </h3>

            <form onSubmit={handleSavePlan} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1">Pair</label>
                  <select
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e] text-xs font-bold"
                  >
                    <option value="EUR/USD">EUR/USD</option>
                    <option value="GBP/USD">GBP/USD</option>
                    <option value="XAU/USD (Gold)">XAU/USD (Gold)</option>
                    <option value="USD/JPY">USD/JPY</option>
                    <option value="BTC/USD">BTC/USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Session</label>
                  <select
                    value={formSession}
                    onChange={(e) => setFormSession(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e] text-xs font-bold"
                  >
                    <option value="London">London Session</option>
                    <option value="New York">New York Session</option>
                    <option value="Asian">Asian Session</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Direction</label>
                  <select
                    value={formDirection}
                    onChange={(e) => setFormDirection(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e] text-xs font-bold"
                  >
                    <option value="LONG">BUY (Long)</option>
                    <option value="SHORT">SELL (Short)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Planned Entry</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formEntry}
                    onChange={(e) => setFormEntry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formSL}
                    onChange={(e) => setFormSL(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Take Profit</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formTP}
                    onChange={(e) => setFormTP(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Execution Trigger Condition *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wait for 15m candle close below 1.0820 after liquidity sweep"
                  value={formTrigger}
                  onChange={(e) => setFormTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                />
              </div>

              {/* Confluence Checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Confluence Checklist (Check Before Entry):
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chkHtfBias}
                    onChange={(e) => setChkHtfBias(e.target.checked)}
                    className="rounded"
                  />
                  <span>Higher timeframe (4H / Daily) bias aligns with this direction</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chkLiquiditySweep}
                    onChange={(e) => setChkLiquiditySweep(e.target.checked)}
                    className="rounded"
                  />
                  <span>Prior session high or low liquidity has been swept</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chkFvgOb}
                    onChange={(e) => setChkFvgOb(e.target.checked)}
                    className="rounded"
                  />
                  <span>Displacement + Fair Value Gap (FVG) or Order Block retest</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chkNoNews}
                    onChange={(e) => setChkNoNews(e.target.checked)}
                    className="rounded"
                  />
                  <span>No high-impact USD economic calendar news in next 30 minutes</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

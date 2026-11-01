"use client";

import React, { useState, useEffect } from "react";
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
  Save,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotSizeCalculator } from "@/components/forex/lot-size-calculator";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { cn, formatCurrency } from "@/lib/utils";

interface RiskProfile {
  maxTradesPerDay: number;
  maxRiskPerTradePercent: number;
  maxDailyLossAmount: number;
  maxLotSize: number;
  minRiskReward: string;
  hardLockoutEnabled: boolean;
}

export default function RiskManagementPage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [initialCapital, setInitialCapital] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tj_initial_capital");
      return saved ? Number(saved) : 1000;
    }
    return 1000;
  });

  const [profile, setProfile] = useState<RiskProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`tj_real_risk_profile_${user?.id || "default"}`);
      if (saved) return JSON.parse(saved);
    }
    return {
      maxTradesPerDay: 2,
      maxRiskPerTradePercent: 1.0,
      maxDailyLossAmount: 50,
      maxLotSize: 0.5,
      minRiskReward: "1:2.0",
      hardLockoutEnabled: true,
    };
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem(`tj_real_risk_profile_${user?.id || "default"}`, JSON.stringify(profile));
    }
    setSavedNotice(true);
    success("Risk management rules saved!");
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const maxDollarRiskPerTrade = (initialCapital * profile.maxRiskPerTradePercent) / 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Risk Management & Capital Shield
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50">
              Discipline Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Define non-negotiable risk rules, lock your maximum daily trades, and control lot size exposure.
          </p>
        </div>
      </div>

      {/* Top Real Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Risk Per Trade
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {profile.maxRiskPerTradePercent}%
            </span>
            <span className="text-xs font-bold text-rose-600">
              ${maxDollarRiskPerTrade.toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Based on ${initialCapital.toLocaleString()} equity
          </span>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Daily Trades
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {profile.maxTradesPerDay}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Trades/Day
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              Anti-Overtrade
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Hard stop after {profile.maxTradesPerDay} trades
          </span>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Daily Loss Lock
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl sm:text-2xl font-bold text-rose-600">
              -${profile.maxDailyLossAmount}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600">
              Tilt Protection
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Session shutdown if hit
          </span>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Lot Size Limit
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {profile.maxLotSize}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Lots
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
              Safe Leverage
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Never exceed on retail broker
          </span>
        </Card>
      </div>

      {/* Customizable Risk Settings Form */}
      <Card className="p-6 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Personalized Risk & Discipline Rules
              </h3>
              <p className="text-xs text-slate-500">
                Configure your hard limits to prevent emotional overtrading and blown accounts.
              </p>
            </div>
          </div>

          {savedNotice && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Rules Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Trades Allowed Per Day
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={profile.maxTradesPerDay}
                onChange={(e) =>
                  setProfile({ ...profile, maxTradesPerDay: Number(e.target.value) || 1 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold bg-slate-50 dark:bg-[#151c2e]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Stops revenge trading after losses
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Risk Per Trade (% of Balance)
              </label>
              <input
                type="number"
                min="0.25"
                max="5"
                step="0.25"
                value={profile.maxRiskPerTradePercent}
                onChange={(e) =>
                  setProfile({ ...profile, maxRiskPerTradePercent: Number(e.target.value) || 0.25 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold bg-slate-50 dark:bg-[#151c2e]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard institutional recommendation is 1%
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Daily Loss Limit ($)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={profile.maxDailyLossAmount}
                onChange={(e) =>
                  setProfile({ ...profile, maxDailyLossAmount: Number(e.target.value) || 10 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold bg-slate-50 dark:bg-[#151c2e]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Close terminal if day hits this loss
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Lot Size Cap
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={profile.maxLotSize}
                onChange={(e) =>
                  setProfile({ ...profile, maxLotSize: Number(e.target.value) || 0.01 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold bg-slate-50 dark:bg-[#151c2e]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Hard ceiling to avoid margin calls
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Risk-to-Reward Ratio
              </label>
              <input
                type="text"
                value={profile.minRiskReward}
                onChange={(e) =>
                  setProfile({ ...profile, minRiskReward: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold bg-slate-50 dark:bg-[#151c2e]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Never accept trades below 1:2.0 RR
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Risk Codex
            </Button>
          </div>
        </form>
      </Card>

      {/* Embedded Lot Size Calculator */}
      <LotSizeCalculator initialBalance={initialCapital} />
    </div>
  );
}

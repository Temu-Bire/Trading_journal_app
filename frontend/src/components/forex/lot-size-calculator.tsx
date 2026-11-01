"use client";

import React, { useState, useMemo } from "react";
import { Calculator, ArrowRight, ShieldCheck, Check, DollarSign, Percent, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PairConfig {
  pair: string;
  pipMultiplier: number; // For pip calculation
  standardLotUnits: number; // 100,000 for standard forex, 100 for gold
  pipValuePerStandardLotUsd: number;
}

const FOREX_PAIRS: PairConfig[] = [
  { pair: "EUR/USD", pipMultiplier: 10000, standardLotUnits: 100000, pipValuePerStandardLotUsd: 10 },
  { pair: "GBP/USD", pipMultiplier: 10000, standardLotUnits: 100000, pipValuePerStandardLotUsd: 10 },
  { pair: "XAU/USD (Gold)", pipMultiplier: 10, standardLotUnits: 100, pipValuePerStandardLotUsd: 10 },
  { pair: "USD/JPY", pipMultiplier: 100, standardLotUnits: 100000, pipValuePerStandardLotUsd: 6.7 },
  { pair: "GBP/JPY", pipMultiplier: 100, standardLotUnits: 100000, pipValuePerStandardLotUsd: 6.7 },
  { pair: "AUD/USD", pipMultiplier: 10000, standardLotUnits: 100000, pipValuePerStandardLotUsd: 10 },
  { pair: "USD/CAD", pipMultiplier: 10000, standardLotUnits: 100000, pipValuePerStandardLotUsd: 7.4 },
  { pair: "BTC/USD", pipMultiplier: 1, standardLotUnits: 1, pipValuePerStandardLotUsd: 1 },
];

export function LotSizeCalculator({
  initialBalance = 1000,
  onApplyPlan,
}: {
  initialBalance?: number;
  onApplyPlan?: (calc: { pair: string; lots: number; riskAmount: number; slPips: number }) => void;
}) {
  const [selectedPair, setSelectedPair] = useState<string>("EUR/USD");
  const [balance, setBalance] = useState<number>(initialBalance);
  const [riskType, setRiskType] = useState<"percent" | "fixed">("percent");
  const [riskPercent, setRiskPercent] = useState<number>(1.0); // 1%
  const [riskFixed, setRiskFixed] = useState<number>(20); // $20
  const [slPips, setSlPips] = useState<number>(15); // 15 pips stop loss
  const [copied, setCopied] = useState(false);

  const pairConfig = useMemo(() => {
    return FOREX_PAIRS.find((p) => p.pair === selectedPair) || FOREX_PAIRS[0];
  }, [selectedPair]);

  const riskAmount = useMemo(() => {
    if (riskType === "percent") {
      return (balance * (riskPercent / 100));
    }
    return riskFixed;
  }, [balance, riskType, riskPercent, riskFixed]);

  const calculatedLotSize = useMemo(() => {
    if (slPips <= 0 || riskAmount <= 0) return 0;
    // Lot Size = Risk Amount / (Stop Loss in Pips * Pip Value per standard lot)
    const rawLots = riskAmount / (slPips * pairConfig.pipValuePerStandardLotUsd);
    return Math.max(0.01, Math.round(rawLots * 100) / 100);
  }, [riskAmount, slPips, pairConfig]);

  const pipValue = useMemo(() => {
    return Math.round(calculatedLotSize * pairConfig.pipValuePerStandardLotUsd * 100) / 100;
  }, [calculatedLotSize, pairConfig]);

  const handleCopy = () => {
    navigator.clipboard.writeText(calculatedLotSize.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Forex Lot Size & Position Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate safe lot sizes before opening a trade to prevent overleveraging
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300">
          Retail Risk Shield
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
        {/* Left Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Trading Pair / Asset
            </label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {FOREX_PAIRS.map((p) => (
                <option key={p.pair} value={p.pair}>
                  {p.pair}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Balance ($)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Stop Loss (Pips)
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={slPips}
                onChange={(e) => setSlPips(Number(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Risk Per Trade
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setRiskType("percent")}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-semibold transition-all",
                    riskType === "percent"
                      ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  % Equity
                </button>
                <button
                  type="button"
                  onClick={() => setRiskType("fixed")}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-semibold transition-all",
                    riskType === "fixed"
                      ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  $ Fixed
                </button>
              </div>
            </div>

            {riskType === "percent" ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.25"
                  max="10"
                  step="0.25"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value) || 0.25)}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] text-xs font-bold text-slate-900 dark:text-white"
                />
                <span className="text-xs font-bold text-slate-500">% =</span>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                  ${riskAmount.toFixed(2)} Risk
                </span>
                <div className="flex gap-1 ml-auto">
                  {[0.5, 1.0, 2.0].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRiskPercent(preset)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md border",
                        riskPercent === preset
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300"
                          : "border-slate-200 dark:border-white/10 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <input
                type="number"
                min="1"
                step="5"
                value={riskFixed}
                onChange={(e) => setRiskFixed(Number(e.target.value) || 5)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] text-xs font-bold text-slate-900 dark:text-white"
              />
            )}
          </div>
        </div>

        {/* Right Output Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent border border-indigo-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Recommended Execution
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : null}
                {copied ? "Copied!" : "Copy Lots"}
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {calculatedLotSize.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-500 uppercase">Lots</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#151c2e] border border-slate-100 dark:border-white/10">
                <span className="text-[10px] text-slate-400 block font-medium">Risk Capital</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                  ${riskAmount.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#151c2e] border border-slate-100 dark:border-white/10">
                <span className="text-[10px] text-slate-400 block font-medium">Pip Value</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  ${pipValue.toFixed(2)}/pip
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Max loss is locked to ${riskAmount.toFixed(2)}
            </span>
            {onApplyPlan && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  onApplyPlan({
                    pair: selectedPair,
                    lots: calculatedLotSize,
                    riskAmount,
                    slPips,
                  })
                }
                className="text-xs font-bold gap-1 shadow-xs"
              >
                Use in Plan <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

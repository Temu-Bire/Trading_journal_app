"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Smile,
  Meh,
  Frown,
  Zap,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Calendar,
  Plus,
  Trash2,
  Award,
  Sparkles,
  Target,
  Flame,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { cn, formatDate } from "@/lib/utils";

interface MindsetLog {
  id: string;
  date: string;
  state: "Disciplined" | "Calm" | "FOMO" | "Anxious" | "Revenge" | "Impatient";
  whatWentWrong: string;
  whatImproved: string;
  keyLesson: string;
}

interface BacktestRecord {
  id: string;
  strategyName: string;
  pair: string;
  timeframe: string;
  sampleTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  averageRR: string;
  observations: string;
  createdAt: string;
}

export default function PsychologyPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<"mindset" | "backtest">("mindset");

  // Mindset Logs State
  const [mindsetLogs, setMindsetLogs] = useState<MindsetLog[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`tj_real_mindset_logs_${user?.id || "default"}`);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Backtest Records State
  const [backtests, setBacktests] = useState<BacktestRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`tj_real_backtests_${user?.id || "default"}`);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Mindset Modal
  const [mindsetModalOpen, setMindsetModalOpen] = useState(false);
  const [mindsetState, setMindsetState] = useState<MindsetLog["state"]>("Disciplined");
  const [mindsetWrong, setMindsetWrong] = useState("");
  const [mindsetImproved, setMindsetImproved] = useState("");
  const [mindsetLesson, setMindsetLesson] = useState("");

  // Backtest Modal
  const [backtestModalOpen, setBacktestModalOpen] = useState(false);
  const [btStrategy, setBtStrategy] = useState("Order Block & FVG Retest");
  const [btPair, setBtPair] = useState("EUR/USD");
  const [btTimeframe, setBtTimeframe] = useState("15m");
  const [btSample, setBtSample] = useState(30);
  const [btWins, setBtWins] = useState(20);
  const [btLosses, setBtLosses] = useState(10);
  const [btRR, setBtRR] = useState("1:2.5");
  const [btNotes, setBtNotes] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`tj_real_mindset_logs_${user?.id || "default"}`, JSON.stringify(mindsetLogs));
    }
  }, [mindsetLogs, user?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`tj_real_backtests_${user?.id || "default"}`, JSON.stringify(backtests));
    }
  }, [backtests, user?.id]);

  const handleSaveMindset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mindsetLesson.trim() && !mindsetImproved.trim()) {
      error("Please write at least one lesson or improvement.");
      return;
    }

    const newLog: MindsetLog = {
      id: `mind-${Date.now()}`,
      date: new Date().toISOString(),
      state: mindsetState,
      whatWentWrong: mindsetWrong.trim(),
      whatImproved: mindsetImproved.trim(),
      keyLesson: mindsetLesson.trim(),
    };

    setMindsetLogs((prev) => [newLog, ...prev]);
    setMindsetModalOpen(false);
    setMindsetWrong("");
    setMindsetImproved("");
    setMindsetLesson("");
    success("Psychological reflection saved!");
  };

  const handleSaveBacktest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!btStrategy.trim()) {
      error("Please enter a strategy name.");
      return;
    }

    const total = btWins + btLosses;
    const wr = total > 0 ? Math.round((btWins / total) * 1000) / 10 : 0;

    const newBt: BacktestRecord = {
      id: `bt-${Date.now()}`,
      strategyName: btStrategy.trim(),
      pair: btPair,
      timeframe: btTimeframe,
      sampleTrades: total > 0 ? total : btSample,
      wins: btWins,
      losses: btLosses,
      winRate: wr,
      averageRR: btRR,
      observations: btNotes.trim() || "Edge validated over historical data.",
      createdAt: new Date().toISOString(),
    };

    setBacktests((prev) => [newBt, ...prev]);
    setBacktestModalOpen(false);
    setBtNotes("");
    success("Strategy backtest recorded!");
  };

  const handleDeleteMindset = (id: string) => {
    setMindsetLogs((prev) => prev.filter((m) => m.id !== id));
    success("Log removed.");
  };

  const handleDeleteBacktest = (id: string) => {
    setBacktests((prev) => prev.filter((b) => b.id !== id));
    success("Backtest record removed.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Trading Psychology & Strategy Backtesting
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/50">
              Mindset Mastery
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            "Trading is 80% psychology and 20% mechanics." Track emotional tilt, log day-to-day lessons, and validate edge through backtesting.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.06] p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("mindset")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "mindset"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            Psychology Journal ({mindsetLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("backtest")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
              activeTab === "backtest"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            Strategy Backtesting ({backtests.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Psychology Journal */}
      {activeTab === "mindset" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Daily reflections on discipline, mistakes avoided, and mindset evolution.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setMindsetModalOpen(true)}
              className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Log Mindset Check-in
            </Button>
          </div>

          {mindsetLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                No psychological reflections logged yet
              </h3>
              <p className="text-xs text-slate-500">
                Did you feel impatient today? Did you revenge trade after a loss or follow your rules calmly? Start tracking to eliminate bad habits.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setMindsetModalOpen(true)}
                className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Record First Reflection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {mindsetLogs.map((log) => (
                <Card
                  key={log.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">
                        {formatDate(log.date)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                          log.state === "Disciplined" || log.state === "Calm"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/40"
                        )}
                      >
                        {log.state}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteMindset(log.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {log.whatImproved && (
                      <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/40 text-emerald-900 dark:text-emerald-300">
                        <span className="font-bold block uppercase text-[10px] text-emerald-700 dark:text-emerald-400 mb-0.5">
                          ✓ What I Improved Today:
                        </span>
                        <p>{log.whatImproved}</p>
                      </div>
                    )}

                    {log.whatWentWrong && (
                      <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 text-rose-900 dark:text-rose-300">
                        <span className="font-bold block uppercase text-[10px] text-rose-700 dark:text-rose-400 mb-0.5">
                          ⚠️ Mistake / Where I Lacked Discipline:
                        </span>
                        <p>{log.whatWentWrong}</p>
                      </div>
                    )}
                  </div>

                  {log.keyLesson && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] text-xs border border-slate-200/60 dark:border-white/10 flex items-start gap-2">
                      <Award className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] block">
                          Key Psychological Takeaway:
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                          {log.keyLesson}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Strategy Backtesting Journal */}
      {activeTab === "backtest" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Verify your strategy statistics on historical charts before risking live capital.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setBacktestModalOpen(true)}
              className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              New Backtest Log
            </Button>
          </div>

          {backtests.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                No strategy backtests recorded yet
              </h3>
              <p className="text-xs text-slate-500">
                Backtesting 30 to 100 past setups builds conviction and gives you proof that your trading strategy works over time.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setBacktestModalOpen(true)}
                className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Record Backtest Results
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backtests.map((bt) => (
                <Card
                  key={bt.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {bt.strategyName}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {bt.pair} • {bt.timeframe} Timeframe
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteBacktest(bt.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                      <span className="text-[10px] text-slate-400 block font-medium">Sample</span>
                      <span className="font-extrabold">{bt.sampleTrades}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600">
                      <span className="text-[10px] text-emerald-400 block font-medium">Wins</span>
                      <span className="font-extrabold">{bt.wins}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-rose-600">
                      <span className="text-[10px] text-rose-400 block font-medium">Losses</span>
                      <span className="font-extrabold">{bt.losses}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600">
                      <span className="text-[10px] text-indigo-400 block font-medium">Win Rate</span>
                      <span className="font-extrabold">{bt.winRate}%</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[10px] uppercase">
                      Edge Observations:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {bt.observations}
                    </p>
                  </div>

                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Average Risk:Reward: {bt.averageRR}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mindset Check-in Modal */}
      {mindsetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setMindsetModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Log Daily Mindset Reflection
            </h3>

            <form onSubmit={handleSaveMindset} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Current Mindset</label>
                <select
                  value={mindsetState}
                  onChange={(e) => setMindsetState(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e] text-xs font-bold"
                >
                  <option value="Disciplined">Disciplined (Following rules)</option>
                  <option value="Calm">Calm & Patient</option>
                  <option value="FOMO">FOMO (Afraid of missing moves)</option>
                  <option value="Anxious">Anxious (Stressed about loss)</option>
                  <option value="Revenge">Revenge (Upset after loss)</option>
                  <option value="Impatient">Impatient (Chasing candles)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">What went wrong or was lacking?</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cut winner too early or widened stop loss..."
                  value={mindsetWrong}
                  onChange={(e) => setMindsetWrong(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">What did you improve today?</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Waited for London sweep, didn't oversize..."
                  value={mindsetImproved}
                  onChange={(e) => setMindsetImproved(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Key Psychological Lesson</label>
                <input
                  type="text"
                  placeholder="e.g. My edge comes from patience, not trade frequency."
                  value={mindsetLesson}
                  onChange={(e) => setMindsetLesson(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMindsetModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Mindset Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backtest Modal */}
      {backtestModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setBacktestModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Record Strategy Backtest Results
            </h3>

            <form onSubmit={handleSaveBacktest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Strategy Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. London Open FVG Retest"
                  value={btStrategy}
                  onChange={(e) => setBtStrategy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Pair / Asset</label>
                  <select
                    value={btPair}
                    onChange={(e) => setBtPair(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  >
                    <option value="EUR/USD">EUR/USD</option>
                    <option value="GBP/USD">GBP/USD</option>
                    <option value="XAU/USD (Gold)">XAU/USD (Gold)</option>
                    <option value="USD/JPY">USD/JPY</option>
                    <option value="BTC/USD">BTC/USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Timeframe</label>
                  <input
                    type="text"
                    value={btTimeframe}
                    onChange={(e) => setBtTimeframe(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1">Wins</label>
                  <input
                    type="number"
                    min="0"
                    value={btWins}
                    onChange={(e) => setBtWins(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Losses</label>
                  <input
                    type="number"
                    min="0"
                    value={btLosses}
                    onChange={(e) => setBtLosses(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">Avg R:R</label>
                  <input
                    type="text"
                    value={btRR}
                    onChange={(e) => setBtRR(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Edge Validation Observations</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Strategy performs best during Tuesday-Thursday London session..."
                  value={btNotes}
                  onChange={(e) => setBtNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBacktestModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Backtest
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

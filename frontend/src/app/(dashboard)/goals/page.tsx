"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Award,
  Zap,
  Trash2,
  TrendingUp,
  Clock,
  ShieldCheck,
  Edit2,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export type GoalTimeframe = "daily" | "weekly" | "monthly" | "yearly";

export interface IGoal {
  id: string;
  userId?: string;
  title: string;
  timeframe: GoalTimeframe;
  category: "DISCIPLINE" | "FINANCIAL" | "PROCESS";
  targetValue: string;
  currentValue: string;
  progressPercent: number;
  status: "IN_PROGRESS" | "ACHIEVED";
  createdAt: string;
}

export default function GoalsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<GoalTimeframe>("daily");

  const [goals, setGoals] = useState<IGoal[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`tj_real_goals_${user?.id || "default"}`);
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formTimeframe, setFormTimeframe] = useState<GoalTimeframe>("daily");
  const [formCategory, setFormCategory] = useState<IGoal["category"]>("DISCIPLINE");
  const [formTarget, setFormTarget] = useState("");
  const [formCurrent, setFormCurrent] = useState("");
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`tj_real_goals_${user?.id || "default"}`, JSON.stringify(goals));
    }
  }, [goals, user?.id]);

  const handleOpenAdd = (tf?: GoalTimeframe) => {
    setFormTitle("");
    setFormTimeframe(tf || activeTab);
    setFormCategory("DISCIPLINE");
    setFormTarget("");
    setFormCurrent("0");
    setFormProgress(0);
    setModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      error("Please enter a goal title.");
      return;
    }

    const newGoal: IGoal = {
      id: `goal-${Date.now()}`,
      userId: user?.id,
      title: formTitle.trim(),
      timeframe: formTimeframe,
      category: formCategory,
      targetValue: formTarget.trim() || "100%",
      currentValue: formCurrent.trim() || "0%",
      progressPercent: Math.min(100, Math.max(0, Number(formProgress) || 0)),
      status: Number(formProgress) >= 100 ? "ACHIEVED" : "IN_PROGRESS",
      createdAt: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    setModalOpen(false);
    success(`${formTimeframe.toUpperCase()} goal saved!`);
  };

  const handleToggleComplete = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const isAchieved = g.status === "ACHIEVED";
        return {
          ...g,
          status: isAchieved ? "IN_PROGRESS" : "ACHIEVED",
          progressPercent: isAchieved ? 50 : 100,
        };
      })
    );
    success("Goal status updated!");
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    success("Goal removed.");
  };

  const filteredGoals = goals.filter((g) => g.timeframe === activeTab);

  const stats = {
    total: goals.length,
    achieved: goals.filter((g) => g.status === "ACHIEVED").length,
    inProgress: goals.filter((g) => g.status === "IN_PROGRESS").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Trading Goals & Compounding Roadmap
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50">
              Personalized
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set and track your Daily, Weekly, Monthly, and Yearly trading milestones to build compounding discipline.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenAdd(activeTab)}
          className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Set New Goal
        </Button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Goals
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {stats.total}
          </p>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Achieved
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.achieved}
          </p>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            In Progress
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.inProgress}
          </p>
        </Card>
      </div>

      {/* Timeframe Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-3 overflow-x-auto">
        {[
          { id: "daily", label: "Daily Goals", desc: "Max trades/day, lot limits & execution" },
          { id: "weekly", label: "Weekly Goals", desc: "Weekly R targets, review discipline" },
          { id: "monthly", label: "Monthly Goals", desc: "Compounding growth, drawdown cap" },
          { id: "yearly", label: "Yearly Goals", desc: "Capital milestones & prop firm challenge" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as GoalTimeframe)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer",
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            )}
          >
            {tab.label} ({goals.filter((g) => g.timeframe === tab.id).length})
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            No {activeTab.toUpperCase()} goals defined yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeTab === "daily"
              ? "Set hard limits for today (e.g. Max 2 trades/day, Max 1% risk per trade)."
              : activeTab === "weekly"
              ? "Define your weekly R:R targets and journaling routine."
              : activeTab === "monthly"
              ? "Track your monthly portfolio compounding percentage."
              : "Set your long-term funded trader and account capital targets."}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAdd(activeTab)}
            className="font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab} Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const isAchieved = goal.status === "ACHIEVED";
            return (
              <Card
                key={goal.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-500">
                      {goal.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleComplete(goal.id)}
                      className={cn(
                        "p-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer",
                        isAchieved
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                          : "bg-slate-100 text-slate-500 hover:text-emerald-600"
                      )}
                      title={isAchieved ? "Mark in progress" : "Mark as completed"}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-400">Pacing Progress:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {goal.currentValue} / {goal.targetValue} ({goal.progressPercent}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isAchieved
                          ? "bg-emerald-500"
                          : goal.progressPercent >= 50
                          ? "bg-indigo-600"
                          : "bg-amber-500"
                      )}
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0f1422] rounded-3xl border border-slate-200 dark:border-white/10 p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Create Trading Milestone Goal
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Max 2 trades per London session"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Timeframe</label>
                  <select
                    value={formTimeframe}
                    onChange={(e) => setFormTimeframe(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e] text-xs font-bold"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151c2e] text-xs font-bold"
                  >
                    <option value="DISCIPLINE">Discipline</option>
                    <option value="FINANCIAL">Financial / P&L</option>
                    <option value="PROCESS">Process / Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Target Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Trades or $250"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Current Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Trade or $100"
                    value={formCurrent}
                    onChange={(e) => setFormCurrent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Progress Percentage ({formProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formProgress}
                  onChange={(e) => setFormProgress(Number(e.target.value))}
                  className="w-full"
                />
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
                  Save Goal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

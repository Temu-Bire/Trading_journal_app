"use client";

import React, { useState } from "react";
import {
  Flag,
  Target,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Plus,
  Calendar,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Milestone {
  id: string;
  category: "FINANCIAL" | "PROCESS" | "DISCIPLINE";
  title: string;
  target: string;
  current: string;
  progressPercent: number;
  deadline: string;
  status: "IN_PROGRESS" | "COMPLETED";
}

const mockMilestones: Milestone[] = [
  {
    id: "g-1",
    category: "FINANCIAL",
    title: "Monthly Net Profit Target",
    target: "$5,000.00",
    current: "$3,640.00",
    progressPercent: 72.8,
    deadline: "End of Month",
    status: "IN_PROGRESS",
  },
  {
    id: "g-2",
    category: "PROCESS",
    title: "Average R-Multiple Above 2.5R",
    target: "2.50R",
    current: "2.74R",
    progressPercent: 100,
    deadline: "Ongoing",
    status: "COMPLETED",
  },
  {
    id: "g-3",
    category: "DISCIPLINE",
    title: "30-Day Zero Revenge Trading Streak",
    target: "30 Days",
    current: "22 Days",
    progressPercent: 73.3,
    deadline: "Nov 15, 2026",
    status: "IN_PROGRESS",
  },
  {
    id: "g-4",
    category: "FINANCIAL",
    title: "Prop Firm Funded Account Phase 2",
    target: "$10,000 Target",
    current: "$7,800 Reached",
    progressPercent: 78.0,
    deadline: "Dec 31, 2026",
    status: "IN_PROGRESS",
  },
];

export default function GoalsProgressPage() {
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Flag className="w-6 h-6 text-indigo-500" />
            Trading Goals &amp; Milestone Roadmap
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Track both process-oriented discipline milestones and long-term financial compounding targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-primary hover:bg-primary-hover text-white text-xs gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Hero Achievement Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/20 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Milestone Target
          </span>
          <h2 className="text-2xl font-extrabold">Q4 Capital Compounding: $35,000 Milestone</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            You are currently pacing at 112% of your quarterly target with strong Sharpe ratio (2.4).
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span>Overall Pacing</span>
            <span className="text-emerald-400 font-bold">81.4%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
              style={{ width: "81.4%" }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block text-right">$28,490 / $35,000</span>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {milestones.map((m: Milestone) => (
          <Card
            key={m.id}
            className="p-5 border border-border hover:border-primary/40 transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 mb-1.5">
                    {m.category}
                  </Badge>
                  <h3 className="font-bold text-sm text-foreground">{m.title}</h3>
                </div>
                <Badge
                  variant={m.status === "COMPLETED" ? "profit" : "info"}
                  className="text-xs uppercase font-bold"
                >
                  {m.status === "COMPLETED" ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  ) : (
                    "In Progress"
                  )}
                </Badge>
              </div>

              <div className="mt-4 flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground">
                  Current: <strong className="text-foreground">{m.current}</strong>
                </span>
                <span className="text-muted-foreground">
                  Target: <strong className="text-foreground">{m.target}</strong>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    m.progressPercent >= 100
                      ? "bg-emerald-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, m.progressPercent)}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Deadline: {m.deadline}
              </span>
              <span className="font-bold text-foreground">{m.progressPercent}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


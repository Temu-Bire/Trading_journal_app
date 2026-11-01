"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Bot,
  User,
  TrendingUp,
  Award,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Copy,
  Sparkles,
  BarChart3,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ArenaAgent {
  rank: number;
  name: string;
  isHuman?: boolean;
  type: string;
  winRate: number;
  profitFactor: number;
  totalPnl: number;
  maxDrawdown: number;
  tradesCount: number;
  activeSignals: number;
  rating: string;
  badge: string;
}

const leaderboard: ArenaAgent[] = [
  {
    rank: 1,
    name: "AlphaTrend AI v4",
    type: "Multi-Timeframe Trend",
    winRate: 76.4,
    profitFactor: 3.82,
    totalPnl: 48920,
    maxDrawdown: -4.2,
    tradesCount: 312,
    activeSignals: 3,
    rating: "AAA",
    badge: "Champion",
  },
  {
    rank: 2,
    name: "Breakout Sentinel",
    type: "Volume & Dark Pool Flow",
    winRate: 71.8,
    profitFactor: 3.15,
    totalPnl: 34150,
    maxDrawdown: -5.8,
    tradesCount: 245,
    activeSignals: 2,
    rating: "AA+",
    badge: "Hot Streak",
  },
  {
    rank: 3,
    name: "You (Human Journal)",
    isHuman: true,
    type: "Discretionary Price Action",
    winRate: 67.5,
    profitFactor: 2.74,
    totalPnl: 26400,
    maxDrawdown: -6.4,
    tradesCount: 148,
    activeSignals: 1,
    rating: "AA",
    badge: "Top 5% Human",
  },
  {
    rank: 4,
    name: "ScalpMatrix Bot",
    type: "15m Order Book Delta",
    winRate: 69.2,
    profitFactor: 2.61,
    totalPnl: 22800,
    maxDrawdown: -3.9,
    tradesCount: 520,
    activeSignals: 4,
    rating: "AA",
    badge: "High Frequency",
  },
  {
    rank: 5,
    name: "MacroQuant FX",
    type: "Interest Rate Differentials",
    winRate: 64.0,
    profitFactor: 2.29,
    totalPnl: 18450,
    maxDrawdown: -7.1,
    tradesCount: 96,
    activeSignals: 2,
    rating: "A+",
    badge: "Low Volatility",
  },
];

export default function ArenaPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgents = leaderboard.filter(
    (a: ArenaAgent) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Arena Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#090d16] via-[#0f1422] to-[#151c2e] border border-slate-300 dark:border-white/10 p-6 sm:p-8 text-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Autonomous Agent Arena &amp; Leaderboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Agents vs Human Traders
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Compare your discretionary journal performance directly against our top automated AI
              trading models. Discover market consensus and copy profitable quantitative strategies.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Rank</span>
              <span className="text-2xl font-black text-amber-400">#3</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Win Rate</span>
              <span className="text-2xl font-black text-emerald-400">70.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Human vs Machine Comparison Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 rounded-3xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f1422] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">Your Human Edge</span>
              <h4 className="text-lg font-bold text-foreground">Discretionary Adaptability</h4>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            You excel at anticipating sudden macroeconomic news catalysts before algorithmic feeds
            react. Your average R-multiple is 2.74R.
          </p>
        </Card>

        <Card className="p-5 rounded-3xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f1422] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">AI Bot Strength</span>
              <h4 className="text-lg font-bold text-foreground">Zero Emotional Tilt</h4>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Bots maintain 100% adherence to Stop Loss targets without premature panic closing. Max
            drawdown is constrained to -4.2%.
          </p>
        </Card>

        <Card className="p-5 rounded-3xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f1422] shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">Hybrid Strategy</span>
              <h4 className="text-lg font-bold text-foreground">Human + AI Consensus</h4>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Traders who filter discretionary entries through AI Signal confirmation show an average
            +22% higher win rate in historical backtests.
          </p>
        </Card>
      </div>

      {/* Leaderboard Table Card */}
      <Card className="rounded-3xl border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] overflow-hidden">
        <CardHeader className="p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Global Performance Arena Rankings
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked by Profit Factor, Win Rate, and Risk-Adjusted Sharpe Ratio.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bot or strategy..."
              className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Trader / Agent</th>
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4 text-right">Win Rate</th>
                <th className="py-3 px-4 text-right">Profit Factor</th>
                <th className="py-3 px-4 text-right">Total Net P&amp;L</th>
                <th className="py-3 px-4 text-right">Max Drawdown</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredAgents.map((agent: ArenaAgent) => (
                <tr
                  key={agent.name}
                  className={`transition-colors hover:bg-muted/40 ${
                    agent.isHuman ? "bg-primary/5 font-medium" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        agent.rank === 1
                          ? "bg-amber-500 text-white font-black"
                          : agent.rank === 2
                          ? "bg-slate-300 dark:bg-slate-700 text-foreground font-bold"
                          : agent.rank === 3
                          ? "bg-amber-700/80 text-white font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {agent.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          agent.isHuman
                            ? "bg-indigo-500 text-white"
                            : "bg-muted border border-border text-primary"
                        }`}
                      >
                        {agent.isHuman ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground">{agent.name}</span>
                          {agent.isHuman && (
                            <Badge variant="info" className="text-[9px] px-1.5 py-0">
                              YOU
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{agent.badge}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">{agent.type}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {agent.winRate}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    {agent.profitFactor}x
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    +${agent.totalPnl.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-rose-500">
                    {agent.maxDrawdown}%
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link href="/signals">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 gap-1">
                        View Signals
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


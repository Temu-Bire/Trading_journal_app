"use client";

import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Send,
  Bot,
  Zap,
  TrendingUp,
  Award,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuditReport {
  grade: string;
  score: number;
  tradeSummary: string;
  adherenceItems: { label: string; passed: boolean; note: string }[];
  psychologyAudit: {
    bias: string;
    level: "LOW" | "MEDIUM" | "HIGH" | "NONE";
    analysis: string;
  }[];
  recommendation: string;
}

const mockAudit: AuditReport = {
  grade: "A-",
  score: 91,
  tradeSummary: "BTC/USDT Long • Entry $67,400 • Exit $69,800 • Net P&L: +$1,240 (3.2R)",
  adherenceItems: [
    {
      label: "Risk Rule (Max 2% Account Capital)",
      passed: true,
      note: "Planned risk was 1.4% ($280) - well within your risk bounds.",
    },
    {
      label: "Stop Loss Invalidation Integrity",
      passed: true,
      note: "SL was never moved further away during drawdown. Disciplined hold.",
    },
    {
      label: "Strategy Confluence Trigger",
      passed: true,
      note: "Matched 'Liquidity Sweep + 4H Breakout' setup rules.",
    },
    {
      label: "Take Profit Target Patience",
      passed: false,
      note: "Exited 8% earlier than planned target ($70,200) due to mild resistance hesitation.",
    },
  ],
  psychologyAudit: [
    {
      bias: "FOMO (Fear of Missing Out)",
      level: "NONE",
      analysis: "Entry was executed at predetermined limit order rather than chasing green candles.",
    },
    {
      bias: "Premature Profit Taking",
      level: "LOW",
      analysis: "Mild anxiety triggered manual close before Target 2, leaving 0.4R on the table.",
    },
    {
      bias: "Revenge Trading Tendency",
      level: "NONE",
      analysis: "Trade opened 4 hours after previous session with calm physiological state.",
    },
  ],
  recommendation:
    "Outstanding risk control and confluence setup. For your next swing, consider taking 50% partial profit at Target 1 and moving your SL to break-even to let the remainder run to target without anxiety.",
};

export default function CopilotPage() {
  const [messages, setMessages] = useState<{ role: "assistant" | "user"; text: string }[]>([
    {
      role: "assistant",
      text: "Hello! I am your AI Trading Copilot. I continuously audit your trade entries, emotional discipline, and risk formulas. You can select any trade for an instant post-trade audit, or ask me questions about improving your edge.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInputMessage("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Based on your recent 25 journaled trades, your win rate improves by +18% when you take trades only during the London/NY session overlap. Would you like me to auto-tag this rule in your Strategy Checklist?`,
        },
      ]);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/20 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide uppercase">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              AI Trade Auditor &amp; Psychology Copilot
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trade Execution Copilot
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              Objective post-trade AI analysis. Eliminate costly psychological biases,
              audit risk rule breaches, and receive real-time execution feedback.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Discipline</span>
              <span className="text-2xl font-black text-purple-400">94%</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Execution Grade</span>
              <span className="text-2xl font-black text-emerald-400">A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Audit Report & Interactive Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Trade Audit (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Latest Trade Audit
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Score: {mockAudit.score}/100</span>
                  <Badge variant="profit" className="font-extrabold text-sm px-3 py-0.5">
                    Grade {mockAudit.grade}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{mockAudit.tradeSummary}</p>
            </CardHeader>

            <div className="p-5 space-y-5">
              {/* Adherence Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Rules &amp; Discipline Audit
                </h4>
                <div className="space-y-2.5">
                  {mockAudit.adherenceItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 dark:bg-card/40 border border-border/50 text-xs"
                    >
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold text-foreground block">{item.label}</span>
                        <span className="text-muted-foreground">{item.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Psychological Bias Radar */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Psychology &amp; Tilt Analysis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {mockAudit.psychologyAudit.map((psy, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-muted/30 dark:bg-card/30 border border-border/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-foreground">{psy.bias}</span>
                        <Badge
                          variant={psy.level === "NONE" ? "success" : psy.level === "LOW" ? "info" : "danger"}
                          className="text-[9px] uppercase px-1.5 py-0"
                        >
                          {psy.level}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                        {psy.analysis}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copilot Actionable Takeaway */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-foreground block">Copilot Recommendation</span>
                  <p className="text-muted-foreground leading-relaxed">
                    {mockAudit.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Interactive Copilot Chat (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[600px] border border-border bg-card rounded-2xl shadow-sm overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">AI Copilot Chat</h3>
                <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Online &amp; Connected to Journal
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessages([messages[0]])}
              className="h-7 text-xs px-2 text-muted-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Clear
            </Button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-white"
                      : "bg-muted/60 dark:bg-muted/40 text-foreground border border-border/50"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Suggestions */}
          <div className="px-4 py-2 border-t border-border/40 bg-muted/10 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() =>
                setInputMessage("What is my biggest loss trigger across all logged trades?")
              }
              className="px-2.5 py-1 rounded-full bg-muted border border-border hover:bg-card text-muted-foreground whitespace-nowrap"
            >
              🔍 My biggest loss trigger?
            </button>
            <button
              onClick={() =>
                setInputMessage("How can I increase my average R-multiple from 2.1R to 3R?")
              }
              className="px-2.5 py-1 rounded-full bg-muted border border-border hover:bg-card text-muted-foreground whitespace-nowrap"
            >
              📈 Increase R-multiple?
            </button>
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Copilot about any trade, rule, or emotion..."
              className="flex-1 bg-muted/40 border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button type="submit" size="sm" className="bg-primary hover:bg-primary-hover text-white px-3">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}


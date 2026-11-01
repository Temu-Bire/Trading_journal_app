"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Lock,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TradingRule {
  id: string;
  category: "RISK" | "EXECUTION" | "PSYCHOLOGY";
  title: string;
  description: string;
  isMandatory: boolean;
  adherenceRate: number;
}

const initialRules: TradingRule[] = [
  {
    id: "rule-1",
    category: "RISK",
    title: "Hard Stop Loss Placement",
    description: "Every order must have a predetermined hard stop loss placed at market entry. No exceptions.",
    isMandatory: true,
    adherenceRate: 100,
  },
  {
    id: "rule-2",
    category: "RISK",
    title: "Maximum 2% Risk Cap",
    description: "Never risk more than 2% ($500) of total equity on any single trade idea.",
    isMandatory: true,
    adherenceRate: 97,
  },
  {
    id: "rule-3",
    category: "EXECUTION",
    title: "Confluence Requirement",
    description: "At least 3 technical factors (e.g. Key Level + RSI Divergence + Volume) must align.",
    isMandatory: true,
    adherenceRate: 92,
  },
  {
    id: "rule-4",
    category: "PSYCHOLOGY",
    title: "Daily 2-Loss Circuit Breaker",
    description: "If two trades hit full stop losses in a single day, shut down screens and review tomorrow.",
    isMandatory: true,
    adherenceRate: 95,
  },
  {
    id: "rule-5",
    category: "EXECUTION",
    title: "No High-Impact News Gambling",
    description: "Do not open new positions 15 minutes before or after FOMC or CPI releases.",
    isMandatory: false,
    adherenceRate: 90,
  },
];

export default function RulesDisciplinePage() {
  const [rules, setRules] = useState<TradingRule[]>(initialRules);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<"RISK" | "EXECUTION" | "PSYCHOLOGY">("RISK");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRule: TradingRule = {
      id: `rule-${Date.now()}`,
      category: newCategory,
      title: newTitle,
      description: newDesc || "Custom discipline rule.",
      isMandatory: true,
      adherenceRate: 100,
    };

    setRules([...rules, newRule]);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const overallAdherence = Math.round(
    rules.reduce((acc: number, r: TradingRule) => acc + r.adherenceRate, 0) / rules.length
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-primary" />
            Trading Rules &amp; Discipline Codex
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Professional trading is 90% discipline and 10% execution. Define your sacred non-negotiable rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-primary-hover text-white text-xs gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Close Form" : "Add New Rule"}
          </Button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold">Codex Adherence</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {overallAdherence}%
            </div>
            <span className="text-[11px] text-muted-foreground">Across all logged trades</span>
          </div>
          <Award className="w-10 h-10 text-emerald-500/20" />
        </Card>

        <Card className="p-5 border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold">Active Rules</span>
            <div className="text-2xl font-black text-foreground mt-1">{rules.length} Rules</div>
            <span className="text-[11px] text-muted-foreground">Governing every market entry</span>
          </div>
          <ShieldCheck className="w-10 h-10 text-primary/20" />
        </Card>

        <Card className="p-5 border border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-semibold">Rule Breaches This Month</span>
            <div className="text-2xl font-black text-foreground mt-1">1 Breach</div>
            <span className="text-[11px] text-rose-500 font-semibold">Cost: -$140 in slippage</span>
          </div>
          <AlertTriangle className="w-10 h-10 text-rose-500/20" />
        </Card>
      </div>

      {/* Add Rule Form Modal / Inline */}
      {showAddForm && (
        <Card className="p-5 border border-primary/30 bg-primary/5 animate-fade-in space-y-4">
          <CardTitle className="text-sm font-bold text-foreground">Create New Non-Negotiable Rule</CardTitle>
          <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              placeholder="Rule Title (e.g. Max 2% Risk)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-2 text-foreground"
              required
            />
            <input
              type="text"
              placeholder="Description &amp; Reason"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-2 text-foreground"
            />
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-card border border-border rounded-xl px-3 py-2 text-foreground flex-1"
              >
                <option value="RISK">Risk Management</option>
                <option value="EXECUTION">Execution Setup</option>
                <option value="PSYCHOLOGY">Psychology &amp; Tilt</option>
              </select>
              <Button type="submit" size="sm" className="bg-primary text-white">
                Save
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule: TradingRule, idx: number) => (
          <Card
            key={rule.id}
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">{rule.title}</h3>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold py-0">
                    {rule.category}
                  </Badge>
                  {rule.isMandatory && (
                    <Badge variant="danger" className="text-[9px] uppercase py-0 font-bold">
                      MANDATORY
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rule.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 sm:self-center">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Adherence
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {rule.adherenceRate}%
                </span>
              </div>
              <button
                onClick={() => setRules(rules.filter((r: TradingRule) => r.id !== rule.id))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                title="Delete rule"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PsychologyPage() {
  const [currentMood, setCurrentMood] = useState<string>("CALM");
  const [tiltScore, setTiltScore] = useState<number>(14);

  const moods = [
    { label: "CALM", icon: Smile, color: "text-emerald-500", desc: "Patient, objective, detached from outcome." },
    { label: "FOCUSED", icon: Zap, color: "text-primary", desc: "Sharp awareness, following rules strictly." },
    { label: "ANXIOUS", icon: Meh, color: "text-amber-500", desc: "Fear of loss or missing out creeping in." },
    { label: "FRUSTRATED", icon: Frown, color: "text-rose-500", desc: "Tempted to revenge trade or oversize." },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Brain className="w-6 h-6 text-purple-500" />
          Trading Psychology &amp; Emotional Discipline
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          "The market is a device for transferring money from the impatient to the patient." Monitor your mental state and conquer emotional tilt.
        </p>
      </div>

      {/* Tilt Radar & Pre-Session Check */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Live Tilt Risk Meter</span>
              <Badge variant="profit" className="text-[10px]">LOW RISK</Badge>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{tiltScore}%</span>
              <span className="text-xs text-muted-foreground">/ 100% threshold</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  tiltScore > 50 ? "bg-rose-500" : tiltScore > 25 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${tiltScore}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Low emotional arousal detected. Optimal cognitive condition for discretionary execution.
          </p>
        </Card>

        <Card className="p-5 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Discipline Streak</span>
              <Badge variant="info" className="text-[10px]">ACTIVE</Badge>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary">12 Days</span>
              <span className="text-xs text-muted-foreground">streak</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            12 consecutive trading days with 0 broken stop loss rules or revenge trades.
          </p>
        </Card>

        <Card className="p-5 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Optimal Session Time</span>
              <Badge variant="outline" className="text-[10px]">PEAK</Badge>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">9:30 - 11:30</span>
              <span className="text-xs text-muted-foreground">EST</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Your win rate is highest (76%) during the first 2 hours of the New York session.
          </p>
        </Card>
      </div>

      {/* Mood Selector & Correlation Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mood Selector (6 cols) */}
        <Card className="lg:col-span-6 border border-border p-6 space-y-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Check-In Emotional State
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Log your current emotional state before taking any trade today:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {moods.map((m) => {
              const Icon = m.icon;
              const isSelected = currentMood === m.label;
              return (
                <button
                  key={m.label}
                  onClick={() => {
                    setCurrentMood(m.label);
                    setTiltScore(m.label === "FRUSTRATED" ? 75 : m.label === "ANXIOUS" ? 45 : 14);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-150 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{m.label}</span>
                    <Icon className={`w-5 h-5 ${m.color}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Emotion vs Performance Correlation (6 cols) */}
        <Card className="lg:col-span-6 border border-border p-6 space-y-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Mindset vs Performance Correlation
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Data aggregated across your historical trade entries:
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Trades logged when "CALM"</span>
                <span className="text-[11px] text-muted-foreground">Sample: 84 trades</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">78.5% Win Rate</span>
                <span className="text-[11px] text-emerald-600 font-semibold">+3.2R Average</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Trades logged when "FOCUSED"</span>
                <span className="text-[11px] text-muted-foreground">Sample: 52 trades</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-primary block">71.2% Win Rate</span>
                <span className="text-[11px] text-primary font-semibold">+2.8R Average</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Trades logged when "ANXIOUS/FRUSTRATED"</span>
                <span className="text-[11px] text-muted-foreground">Sample: 12 trades</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-rose-500 block">25.0% Win Rate</span>
                <span className="text-[11px] text-rose-500 font-semibold">-1.9R Average</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


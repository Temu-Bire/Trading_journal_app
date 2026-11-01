"use client";

import React, { useState } from "react";
import { AlertTriangle, Calendar, Clock, ShieldAlert, ChevronDown, ChevronUp, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface EconomicEvent {
  id: string;
  currency: string;
  title: string;
  impact: "high" | "medium" | "low";
  timeEat: string;
  forecast: string;
  previous: string;
  tip: string;
}

const UPCOMING_EVENTS: EconomicEvent[] = [
  {
    id: "evt-1",
    currency: "USD",
    title: "US Non-Farm Payrolls (NFP) & Unemployment Rate",
    impact: "high",
    timeEat: "First Friday • 04:30 PM EAT",
    forecast: "165K",
    previous: "182K",
    tip: "Expect massive 40-80 pip volatility in EURUSD, GBPUSD, and Gold (XAUUSD). Best practice: Do not hold open market orders during release.",
  },
  {
    id: "evt-2",
    currency: "USD",
    title: "US Consumer Price Index (CPI YoY)",
    impact: "high",
    timeEat: "Monthly • 04:30 PM EAT",
    forecast: "2.9%",
    previous: "3.1%",
    tip: "Directly steers the Federal Reserve interest rate policy. Spreads widen 3x-5x on retail brokers.",
  },
  {
    id: "evt-3",
    currency: "USD",
    title: "FOMC Rate Decision & Press Conference",
    impact: "high",
    timeEat: "Wednesdays • 10:00 PM EAT",
    forecast: "5.25%",
    previous: "5.50%",
    tip: "Trend reversal hazard. Liquidity gets swept on both sides before the true institutional expansion takes place.",
  },
  {
    id: "evt-4",
    currency: "USD",
    title: "US Core Retail Sales (MoM)",
    impact: "medium",
    timeEat: "Mid-month • 04:30 PM EAT",
    forecast: "0.3%",
    previous: "0.2%",
    tip: "Measures consumer economic strength; creates 20-30 pip intraday impulses.",
  },
];

export function EconomicNewsAlert() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-3xl bg-amber-50/70 dark:bg-amber-950/25 border-2 border-amber-300 dark:border-amber-800/60 p-5 shadow-[0_4px_20px_-2px_rgba(245,158,11,0.08),0_2px_6px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(245,158,11,0.15)] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                USD Fundamental News & High-Impact Calendar
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                🔴 RED FOLDER WARNING
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Protect your retail trading capital: Avoid entering trades 15 minutes before high-impact USD announcements.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white dark:bg-[#151c2e] text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span>{expanded ? "Hide Events" : "View Key Events"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-900/40 space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {UPCOMING_EVENTS.map((event) => (
              <div
                key={event.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#0c101c] border border-slate-200/80 dark:border-white/[0.08] shadow-xs text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{event.title}</span>
                  </div>
                  <span className="font-semibold text-[10px] px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50">
                    High Impact
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> {event.timeEat}
                  </span>
                  <span>Forecast: <strong className="text-slate-700 dark:text-slate-300">{event.forecast}</strong></span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.03] p-2 rounded-xl border border-slate-100 dark:border-white/[0.04]">
                  💡 <strong>Trader Safety:</strong> {event.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


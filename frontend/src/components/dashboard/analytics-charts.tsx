"use client";

import React from "react";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/utils";

interface OutcomeItem {
  name: string;
  value: number;
  color: string;
}

interface MarketPerformanceItem {
  name: string;
  pnl: number;
}

// 1. Dynamic Win / Loss Distribution Bar Chart
const DynamicOutcomeChart = dynamic(
  () =>
    import("recharts").then((recharts) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } = recharts;
      return function OutcomeChartInner({ data }: { data: OutcomeItem[] }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0]?.payload as OutcomeItem;
                    return (
                      <div className="bg-card border border-border rounded-xl p-2.5 text-xs shadow-dropdown">
                        <span className="font-semibold text-foreground">
                          {item.name}: {item.value} trades
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`outcome-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex flex-col items-center justify-center bg-muted/20 rounded-xl gap-2 text-muted-foreground text-xs animate-pulse">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Loading distribution...</span>
      </div>
    ),
  }
);

// 2. Dynamic Market Performance Bar Chart
const DynamicMarketPerformanceChart = dynamic(
  () =>
    import("recharts").then((recharts) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } = recharts;
      return function MarketPerformanceChartInner({
        data,
      }: {
        data: MarketPerformanceItem[];
      }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0]?.payload as MarketPerformanceItem;
                    return (
                      <div className="bg-card border border-border rounded-xl p-2.5 text-xs shadow-dropdown">
                        <span className="font-semibold text-foreground block">
                          {item.name}
                        </span>
                        <span
                          className={
                            item.pnl >= 0 ? "text-profit font-bold" : "text-loss font-bold"
                          }
                        >
                          {formatCurrency(item.pnl)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`market-cell-${index}`}
                    fill={entry.pnl >= 0 ? "#10B981" : "#F43F5E"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full flex flex-col items-center justify-center bg-muted/20 rounded-xl gap-2 text-muted-foreground text-xs animate-pulse">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Loading market performance...</span>
      </div>
    ),
  }
);

export function AnalyticsOutcomeChart({ data }: { data: OutcomeItem[] }) {
  return <DynamicOutcomeChart data={data} />;
}

export function AnalyticsMarketPerformanceChart({
  data,
}: {
  data: MarketPerformanceItem[];
}) {
  return <DynamicMarketPerformanceChart data={data} />;
}

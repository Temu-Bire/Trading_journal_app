"use client";

import React from "react";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/utils";

interface StrategyChartItem {
  name: string;
  fullName: string;
  pnl: number;
  winRate: number;
  trades: number;
}

const DynamicChart = dynamic(
  () =>
    import("recharts").then((recharts) => {
      const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } = recharts;
      return function StrategyChartInner({ data }: { data: StrategyChartItem[] }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <XAxis
                dataKey="name"
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as StrategyChartItem;
                    return (
                      <div className="bg-popover text-popover-foreground px-3 py-2 rounded-xl border border-border shadow-md text-xs space-y-1">
                        <p className="font-semibold text-foreground">{item.fullName}</p>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Net P&L:</span>
                          <span
                            className={`font-semibold ${
                              item.pnl >= 0 ? "text-profit" : "text-loss"
                            }`}
                          >
                            {formatCurrency(item.pnl)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Win Rate:</span>
                          <span className="font-medium text-foreground">{item.winRate}%</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Trades:</span>
                          <span className="font-medium text-foreground">{item.trades}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`strategy-cell-${index}`}
                    fill={entry.pnl >= 0 ? "var(--profit)" : "var(--loss)"}
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
      <div className="h-[200px] w-full flex flex-col items-center justify-center bg-muted/20 rounded-xl gap-2 text-muted-foreground text-xs animate-pulse">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Loading strategy chart...</span>
      </div>
    ),
  }
);

export function StrategyPerformanceChart({ data }: { data: StrategyChartItem[] }) {
  return <DynamicChart data={data} />;
}

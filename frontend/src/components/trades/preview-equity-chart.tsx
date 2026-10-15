"use client";

import React from "react";
import dynamic from "next/dynamic";

const ChartContent = dynamic(
  () =>
    import("recharts").then((recharts) => {
      const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } = recharts;
      return function PreviewChartInner({
        data,
      }: {
        data: Array<{ name: string; balance: number; pnl: number }>;
      }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="landingCurveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0]?.payload;
                    return (
                      <div className="bg-card border border-border rounded-xl shadow-dropdown p-2.5 text-xs">
                        <span className="font-semibold text-foreground block">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-muted-foreground">Balance:</span>
                          <span className="font-bold text-foreground">
                            ${item.balance?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Session P&amp;L:</span>
                          <span
                            className={`font-semibold ${
                              item.pnl >= 0 ? "text-profit" : "text-loss"
                            }`}
                          >
                            {item.pnl >= 0 ? `+$${item.pnl}` : `-$${Math.abs(item.pnl)}`}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#landingCurveGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 rounded-xl gap-2 text-muted-foreground text-xs animate-pulse">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading chart...</span>
      </div>
    ),
  }
);

export function PreviewEquityChart({
  data,
}: {
  data: Array<{ name: string; balance: number; pnl: number }>;
}) {
  return <ChartContent data={data} />;
}

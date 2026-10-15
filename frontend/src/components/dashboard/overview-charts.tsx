"use client";

import React from "react";
import dynamic from "next/dynamic";
import { formatCurrency } from "@/lib/utils";

interface EquityPoint {
  name: string;
  pnl: number;
  balance: number;
  symbol?: string;
}

interface MarketDistributionItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

// 1. Dynamic Equity Curve Chart
const DynamicEquityChart = dynamic(
  () =>
    import("recharts").then((recharts) => {
      const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } = recharts;
      return function EquityChartInner({ data }: { data: EquityPoint[] }) {
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="overviewPnlGrad" x1="0" y1="0" x2="0" y2="1">
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
                    const item = payload[0]?.payload as EquityPoint;
                    return (
                      <div className="bg-card border border-border rounded-xl shadow-dropdown p-3 text-xs">
                        <p className="font-semibold text-foreground mb-1">{item.name}</p>
                        <p className="text-muted-foreground">
                          Cumulative:{" "}
                          <span className="font-bold text-primary">
                            {formatCurrency(item.balance)}
                          </span>
                        </p>
                        {item.symbol && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Trade: {item.symbol} ({formatCurrency(item.pnl)})
                          </p>
                        )}
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
                fill="url(#overviewPnlGrad)"
                dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
                activeDot={{ r: 6, fill: "#2563EB" }}
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
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Rendering performance curve...</span>
      </div>
    ),
  }
);

// 2. Dynamic Market Distribution Donut Chart
const DynamicMarketChart = dynamic(
  () =>
    import("recharts").then((recharts) => {
      const { ResponsiveContainer, PieChart, Pie, Cell } = recharts;
      return function MarketChartInner({
        data,
        totalPositions,
      }: {
        data: MarketDistributionItem[];
        totalPositions: number;
      }) {
        return (
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-foreground">
                {totalPositions}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Positions
              </span>
            </div>
          </div>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-full flex flex-col items-center justify-center bg-muted/20 rounded-xl gap-2 text-muted-foreground text-xs animate-pulse">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Loading distribution...</span>
      </div>
    ),
  }
);

export function OverviewEquityAreaChart({ data }: { data: EquityPoint[] }) {
  return <DynamicEquityChart data={data} />;
}

export function OverviewMarketPieChart({
  data,
  totalPositions,
}: {
  data: MarketDistributionItem[];
  totalPositions: number;
}) {
  return <DynamicMarketChart data={data} totalPositions={totalPositions} />;
}

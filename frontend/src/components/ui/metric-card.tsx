import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive?: boolean;
    period?: string;
  };
  icon?: React.ReactNode;
  iconBgColor?: string;
  trendColor?: "blue" | "emerald" | "amber" | "rose";
  sparklineData?: number[];
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  iconBgColor = "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  trendColor = "blue",
  sparklineData = [10, 15, 12, 18, 14, 22, 28],
  className,
}: MetricCardProps) {
  // Generate simple smooth SVG sparkline path
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 160;
  const height = 36;
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0 revolutionary L 0,${height} Z`.replace("revolutionary", "");

  const colorMap = {
    blue: {
      stroke: "#3B82F6",
      fill: "url(#blue-grad)",
      stopColor: "#3B82F6",
    },
    emerald: {
      stroke: "#10B981",
      fill: "url(#emerald-grad)",
      stopColor: "#10B981",
    },
    amber: {
      stroke: "#F59E0B",
      fill: "url(#amber-grad)",
      stopColor: "#F59E0B",
    },
    rose: {
      stroke: "#F43F5E",
      fill: "url(#rose-grad)",
      stopColor: "#F43F5E",
    },
  };

  const activeColor = colorMap[trendColor] || colorMap.blue;
  const gradId = `${trendColor}-grad-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between",
        className
      )}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && (
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                iconBgColor
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Big Metric Value */}
        <div className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {value}
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={cn(
                "flex items-center gap-0.5 font-semibold",
                change.isPositive !== false ? "text-profit" : "text-loss"
              )}
            >
              {change.isPositive !== false ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {change.value}
            </span>
            <span className="text-muted-foreground">{change.period || "vs last period"}</span>
          </div>
        )}
      </div>

      {/* Mini Sparkline Chart */}
      <div className="mt-4 pt-1 w-full h-9">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor.stopColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={activeColor.stopColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,${points[0]?.split(",")[1]} L ${points.join(" L ")} L ${width},${height} L 0,${height} Z`}
            fill={`url(#${gradId})`}
          />
          <path
            d={pathD}
            fill="none"
            stroke={activeColor.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

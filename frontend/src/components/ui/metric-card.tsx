"use client";

import React, { useId, useRef, useEffect, useState } from "react";
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
  sparklineData,
  className,
}: MetricCardProps) {
  const uid = useId();
  const gradId = `grad-${uid.replace(/:/g, "")}`;
  const sparkRef = useRef<SVGPathElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate sparkline draw on mount
  useEffect(() => {
    if (mounted && sparkRef.current) {
      const len = sparkRef.current.getTotalLength();
      sparkRef.current.style.strokeDasharray = `${len}`;
      sparkRef.current.style.strokeDashoffset = `${len}`;
      sparkRef.current.getBoundingClientRect(); // force reflow
      sparkRef.current.style.transition = "stroke-dashoffset 1.2s ease-out";
      sparkRef.current.style.strokeDashoffset = "0";
    }
  }, [mounted]);

  const hasSparkline = Boolean(sparklineData && sparklineData.length >= 2);
  const data = hasSparkline ? sparklineData! : [0, 0];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 160;
  const height = 36;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  const colorMap = {
    blue: {
      stroke: "#3B82F6",
      stopColor: "#3B82F6",
      iconGlow: "group-hover:shadow-glow-blue",
    },
    emerald: {
      stroke: "#10B981",
      stopColor: "#10B981",
      iconGlow: "group-hover:shadow-glow-emerald",
    },
    amber: {
      stroke: "#F59E0B",
      stopColor: "#F59E0B",
      iconGlow: "group-hover:shadow-glow-amber",
    },
    rose: {
      stroke: "#F43F5E",
      stopColor: "#F43F5E",
      iconGlow: "group-hover:shadow-glow-rose",
    },
  };

  const activeColor = colorMap[trendColor] || colorMap.blue;

  return (
    <div
      className={cn(
        "group rounded-2xl border border-border bg-card p-6 shadow-card",
        "hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary/20",
        "transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
        "gradient-border",
        className
      )}
    >
      {/* Subtle background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at top right, ${activeColor.stopColor}08 0%, transparent 60%)`,
        }}
      />

      <div className="relative">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && (
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                "transition-all duration-300 group-hover:scale-110",
                activeColor.iconGlow,
                iconBgColor
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Big Metric Value with entrance animation */}
        <div
          className={cn(
            "text-3xl font-bold tracking-tight text-foreground mb-2",
            mounted && "animate-count-up"
          )}
        >
          {value}
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={cn(
                "flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md",
                change.isPositive !== false
                  ? "text-profit bg-profit-muted"
                  : "text-loss bg-loss-muted"
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
      {hasSparkline ? (
        <div className="mt-4 pt-1 w-full h-9 relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeColor.stopColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={activeColor.stopColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`M 0,${points[0]?.split(",")[1]} L ${points.join(" L ")} L ${width},${height} L 0,${height} Z`}
              fill={`url(#${gradId})`}
              className="transition-all duration-300"
            />
            {/* Animated line */}
            <path
              ref={sparkRef}
              d={pathD}
              fill="none"
              stroke={activeColor.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* End dot */}
            {points.length > 0 && (() => {
              const lastPt = points[points.length - 1].split(",");
              return (
                <circle
                  cx={lastPt[0]}
                  cy={lastPt[1]}
                  r="3"
                  fill={activeColor.stroke}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              );
            })()}
          </svg>
        </div>
      ) : (
        <div className="mt-4 h-9" />
      )}
    </div>
  );
}

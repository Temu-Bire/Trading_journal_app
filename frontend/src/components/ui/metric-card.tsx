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
  iconBgColor = "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
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

  useEffect(() => {
    if (mounted && sparkRef.current) {
      const len = sparkRef.current.getTotalLength();
      sparkRef.current.style.strokeDasharray = `${len}`;
      sparkRef.current.style.strokeDashoffset = `${len}`;
      sparkRef.current.getBoundingClientRect();
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
  const height = 38;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  const colorMap = {
    blue: {
      stroke: "#4f46e5",
      stopColor: "#4f46e5",
      iconGlow: "group-hover:shadow-[0_0_16px_rgba(79,70,229,0.35)]",
    },
    emerald: {
      stroke: "#10b981",
      stopColor: "#10b981",
      iconGlow: "group-hover:shadow-[0_0_16px_rgba(16,185,129,0.35)]",
    },
    amber: {
      stroke: "#f59e0b",
      stopColor: "#f59e0b",
      iconGlow: "group-hover:shadow-[0_0_16px_rgba(245,158,11,0.35)]",
    },
    rose: {
      stroke: "#f43f5e",
      stopColor: "#f43f5e",
      iconGlow: "group-hover:shadow-[0_0_16px_rgba(244,63,94,0.35)]",
    },
  };

  const activeColor = colorMap[trendColor] || colorMap.blue;

  return (
    <div
      className={cn(
        "group rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111726] p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.05),0_2px_8px_-2px_rgba(15,23,42,0.03)]",
        "hover:shadow-[0_8px_30px_-6px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 hover:border-indigo-500/30",
        "transition-all duration-300 relative overflow-hidden flex flex-col justify-between select-none",
        className
      )}
    >
      {/* Subtle radial ambient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at top right, ${activeColor.stopColor}10 0%, transparent 65%)`,
        }}
      />

      <div className="relative">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title}
          </span>
          {icon && (
            <div
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0",
                "transition-all duration-300 group-hover:scale-110",
                activeColor.iconGlow,
                iconBgColor
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Big Metric Value */}
        <div
          className={cn(
            "text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2",
            mounted && "animate-count-up"
          )}
        >
          {value}
        </div>

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={cn(
                "flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px]",
                change.isPositive !== false
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40"
                  : "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/40"
              )}
            >
              {change.isPositive !== false ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-500" />
              )}
              {change.value}
            </span>
            {change.period && (
              <span className="text-[11px] text-slate-400 capitalize">
                {change.period}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mini Sparkline Chart */}
      {hasSparkline && (
        <div className="relative mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">Session Pacing</span>
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={activeColor.stopColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={activeColor.stopColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L ${width},${height} L 0,${height} Z`}
              fill={`url(#${gradId})`}
            />
            <path
              ref={sparkRef}
              d={pathD}
              fill="none"
              stroke={activeColor.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

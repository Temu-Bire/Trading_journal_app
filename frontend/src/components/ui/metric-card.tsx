"use client";

import React, { useId, useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
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
  unit,
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
        "group rounded-3xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f1422] p-6 sm:p-7",
        "shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)]",
        "hover:shadow-[0_12px_32px_-4px_rgba(15,23,42,0.1),0_4px_12px_-2px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:border-indigo-500/40",
        "transition-all duration-300 relative overflow-hidden flex flex-col justify-between select-none",
        className
      )}
    >
      {/* Subtle radial ambient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at top right, ${activeColor.stopColor}12 0%, transparent 65%)`,
        }}
      />

      <div className="relative">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {icon && (
            <div
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs",
                "transition-all duration-300 group-hover:scale-110",
                activeColor.iconGlow,
                iconBgColor
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Metric Value & Unit */}
        {(() => {
          let displayValue = value;
          let displayUnit = unit;
          if (!displayUnit && typeof value === "string") {
            const match = value.trim().match(/^([\$\€\£\¥\+‐\-]?[0-9,.]+%?)\s+([A-Za-z]+)$/);
            if (match) {
              displayValue = match[1];
              displayUnit = match[2];
            }
          }
          return (
            <div className="flex items-baseline gap-1.5 mb-2">
              <span
                className={cn(
                  "text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white leading-none",
                  mounted && "animate-count-up"
                )}
              >
                {displayValue}
              </span>
              {displayUnit && (
                <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 tracking-normal">
                  {displayUnit}
                </span>
              )}
            </div>
          );
        })()}

        {/* Change Indicator */}
        {change && (
          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={cn(
                "flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-2xs",
                change.isPositive !== false
                  ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/40"
                  : "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800/40"
              )}
            >
              {change.isPositive !== false ? (
                <TrendingUp className="w-3 h-3 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-rose-600" />
              )}
              {change.value}
            </span>
            {change.period && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium">
                {change.period}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mini Sparkline Chart */}
      {hasSparkline && (
        <div className="relative mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
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

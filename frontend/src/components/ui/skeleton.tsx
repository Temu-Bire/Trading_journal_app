import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl shimmer",
        "bg-slate-200/80 dark:bg-slate-800/60",
        className
      )}
      {...props}
    />
  );
}

/** A pre-built skeleton layout for a metric card */
export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col gap-3 animate-fade-in",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-9 w-32" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-9 w-full mt-1" />
    </div>
  );
}

/** A pre-built skeleton for a table row */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-fade-in">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 pr-4">
          <Skeleton className={`h-4 ${i === 0 ? "w-24" : "w-16"}`} />
        </td>
      ))}
    </tr>
  );
}

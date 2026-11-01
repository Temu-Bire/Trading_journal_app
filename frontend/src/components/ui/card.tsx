import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export function Card({
  className,
  children,
  padding = "md",
  interactive = false,
  ...props
}: CardProps) {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#0f1422] text-card-foreground rounded-3xl border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] transition-all duration-300",
        interactive &&
          "hover:shadow-[0_12px_32px_-4px_rgba(15,23,42,0.1),0_4px_12px_-2px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-indigo-500/40 cursor-pointer",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-slate-500 dark:text-slate-400 font-medium", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-slate-200 dark:border-white/10", className)}
      {...props}
    >
      {children}
    </div>
  );
}

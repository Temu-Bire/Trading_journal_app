import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12",
        "rounded-2xl border border-dashed border-border bg-card/50",
        "animate-fade-up",
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-5 animate-float shadow-inner group-hover:shadow-card transition-all duration-300">
          <div className="w-6 h-6">{icon}</div>
        </div>
      )}
      <h4 className="text-base font-semibold text-foreground mb-1.5 animate-fade-up delay-100">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6 animate-fade-up delay-200">
        {description}
      </p>
      {actionLabel && actionHref && (
        <div className="animate-fade-up delay-300">
          <Link href={actionHref}>
            <Button variant="primary" size="md" className="shadow-glow-primary">
              {actionLabel}
            </Button>
          </Link>
        </div>
      )}
      {actionLabel && !actionHref && onAction && (
        <div className="animate-fade-up delay-300">
          <Button variant="primary" size="md" onClick={onAction} className="shadow-glow-primary">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

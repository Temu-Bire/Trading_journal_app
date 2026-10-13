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
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-border bg-card/50",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="md">
            {actionLabel}
          </Button>
        </Link>
      )}
      {actionLabel && !actionHref && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

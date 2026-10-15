"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      onClick,
      ...props
    },
    ref
  ) => {
    const btnRef = useRef<HTMLButtonElement>(null);

    // Ripple effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = (ref as React.RefObject<HTMLButtonElement>)?.current ?? btnRef.current;
      if (btn) {
        const ripple = document.createElement("span");
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${e.clientX - rect.left - size / 2}px;
          top: ${e.clientY - rect.top - size / 2}px;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.5s ease-out forwards;
          pointer-events: none;
        `;
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      }
      onClick?.(e);
    };

    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-gradient-to-r from-primary to-blue-500 text-white hover:from-primary-hover hover:to-blue-600 shadow-sm hover:shadow-glow-primary active:scale-[0.97]",
      secondary:
        "bg-muted text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-[0.97]",
      outline:
        "border border-border bg-card text-foreground hover:bg-muted hover:border-primary/30 active:scale-[0.97]",
      danger:
        "bg-gradient-to-r from-loss to-rose-600 text-white hover:from-rose-700 hover:to-rose-600 active:scale-[0.97]",
      destructive:
        "bg-gradient-to-r from-loss to-rose-600 text-white hover:from-rose-700 hover:to-rose-600 active:scale-[0.97]",
      ghost:
        "text-muted-foreground hover:text-foreground hover:bg-muted",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-5 text-base rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref ?? btnRef}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:opacity-50 disabled:pointer-events-none select-none overflow-hidden",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

import React from "react";
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
      ...props
    },
    ref
  ) => {
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-primary text-white hover:bg-primary-hover shadow-sm active:scale-[0.98]",
      secondary:
        "bg-muted text-foreground hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-[0.98]",
      outline:
        "border border-border bg-card text-foreground hover:bg-muted active:scale-[0.98]",
      danger:
        "bg-loss text-white hover:bg-rose-700 active:scale-[0.98]",
      destructive:
        "bg-loss text-white hover:bg-rose-700 active:scale-[0.98]",
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
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none select-none",
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

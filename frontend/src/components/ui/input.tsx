import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-foreground uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10",
              error && "border-loss focus-visible:ring-loss",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-loss font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

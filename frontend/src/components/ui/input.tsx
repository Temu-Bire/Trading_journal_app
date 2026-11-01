import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#151c2e] px-4 py-2.5",
              "text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal",
              "focus-visible:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15",
              "hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs",
              "transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-11",
              rightIcon && "pr-11",
              error && "border-rose-500 focus:border-rose-600 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

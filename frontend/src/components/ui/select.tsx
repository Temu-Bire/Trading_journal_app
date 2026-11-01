import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-11 w-full appearance-none rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#151c2e] px-4 py-2.5 pr-10",
              "text-sm font-semibold text-slate-900 dark:text-white",
              "focus-visible:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15",
              "hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs cursor-pointer",
              "transition-all disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-rose-500 focus:border-rose-600 focus:ring-rose-500/20",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#151c2e] text-slate-900 dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

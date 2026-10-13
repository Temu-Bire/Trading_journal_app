import React from "react";
import { BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md dark:bg-primary mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Trading Journal Pro
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track decisions, master emotions, and scale your edge
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}

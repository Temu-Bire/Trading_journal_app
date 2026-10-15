import React from "react";
import { BarChart3, TrendingUp, Shield, Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">

      {/* ── Animated background orbs ── */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/8 dark:bg-primary/12 blur-[80px] pointer-events-none animate-orb-1" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-violet-500/6 dark:bg-violet-500/10 blur-[80px] pointer-events-none animate-orb-2" />
      <div className="absolute top-[40%] right-[10%] w-[200px] h-[200px] rounded-full bg-emerald-400/5 dark:bg-emerald-400/8 blur-[60px] pointer-events-none animate-float-slow" />

      {/* ── Grid pattern overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Floating feature pills (decorative) ── */}
      <div className="absolute top-8 left-8 hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-card/80 border border-border/60 shadow-card backdrop-blur-sm animate-fade-in delay-500 text-xs font-medium text-muted-foreground">
        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        +24.7% monthly P&amp;L tracking
      </div>
      <div className="absolute top-20 left-12 hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-card/80 border border-border/60 shadow-card backdrop-blur-sm animate-fade-in delay-700 text-xs font-medium text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-primary" />
        Bank-grade security
      </div>
      <div className="absolute bottom-20 right-10 hidden lg:flex items-center gap-2 px-3 py-2 rounded-full bg-card/80 border border-border/60 shadow-card backdrop-blur-sm animate-fade-in delay-600 text-xs font-medium text-muted-foreground">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        Real-time analytics
      </div>

      {/* ── Main content ── */}
      <div className="w-full max-w-md z-10 animate-fade-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Animated logo */}
          <div className="relative mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-primary dark:to-blue-600 text-white flex items-center justify-center shadow-glow-primary animate-float">
              <BarChart3 className="w-7 h-7" />
            </div>
            {/* Rotating ring */}
            <div className="absolute -inset-1.5 rounded-[18px] border border-primary/20 animate-spin-slow" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground animate-fade-up delay-100">
            Trading Journal{" "}
            <span className="gradient-text">Pro</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 animate-fade-up delay-200">
            Track decisions, master emotions, and scale your edge
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 animate-scale-in delay-100">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground mt-6 animate-fade-in delay-500">
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms</span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

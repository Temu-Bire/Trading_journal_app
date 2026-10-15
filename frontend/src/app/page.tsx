"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Target,
  BookOpen,
  PieChart,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Lock,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  Award,
  Zap,
  Activity,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";

// Sample data exclusively for the guest public preview
const previewSparklineEquity = [10000, 10250, 10180, 10600, 10520, 11100, 11450, 11320, 11980, 12450];

const previewCurveData = [
  { name: "Day 1", balance: 10000, pnl: 0 },
  { name: "Day 3", balance: 10250, pnl: 250 },
  { name: "Day 5", balance: 10180, pnl: -70 },
  { name: "Day 8", balance: 10600, pnl: 420 },
  { name: "Day 12", balance: 10520, pnl: -80 },
  { name: "Day 15", balance: 11100, pnl: 580 },
  { name: "Day 19", balance: 11450, pnl: 350 },
  { name: "Day 23", balance: 11320, pnl: -130 },
  { name: "Day 27", balance: 11980, pnl: 660 },
  { name: "Day 30", balance: 12450, pnl: 470 },
];

const sampleTrades = [
  {
    symbol: "EURUSD",
    market: "Forex",
    direction: "long",
    entry: "1.0840",
    exit: "1.0895",
    pnl: "+$550.00",
    isWin: true,
    strategy: "Order Block Bounce",
  },
  {
    symbol: "NVDA",
    market: "Stocks",
    direction: "long",
    entry: "128.50",
    exit: "134.20",
    pnl: "+$855.00",
    isWin: true,
    strategy: "Breakout Retest",
  },
  {
    symbol: "BTCUSD",
    market: "Crypto",
    direction: "short",
    entry: "64,200",
    exit: "64,550",
    pnl: "-$175.00",
    isWin: false,
    strategy: "Liquidity Sweep",
  },
  {
    symbol: "XAUUSD",
    market: "Commodities",
    direction: "long",
    entry: "2,380.00",
    exit: "2,398.50",
    pnl: "+$925.00",
    isWin: true,
    strategy: "Trend Continuation",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs dark:bg-primary dark:text-white transition-transform group-hover:scale-105">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground block">
                Trading Journal
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Pro Analytics
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              Features
            </a>
            <a
              href="#analytics"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              Analytics
            </a>
            <a
              href="#strategies"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              Strategies
            </a>
            <a
              href="#journal"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              Journal
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors hover:underline underline-offset-4"
            >
              How It Works
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {user ? (
              <Link href="/overview">
                <Button variant="primary" size="sm" className="font-semibold gap-1.5 shadow-xs">
                  Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-semibold text-xs sm:text-sm shadow-xs"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-border text-foreground hover:bg-muted"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card p-4 space-y-3 animate-fade-in shadow-lg">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-foreground">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Features
              </a>
              <a
                href="#analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Analytics
              </a>
              <a
                href="#strategies"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Strategies
              </a>
              <a
                href="#journal"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Journal
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                How It Works
              </a>
            </nav>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {user ? (
                <Link href="/overview" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 lg:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Institutional-Grade Trading Analytics & Journal</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.15]">
            Trade With Clarity.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
              Improve With Every Trade.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your trades, understand your performance, build consistent strategies, and turn every trading experience into a lesson.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href={user ? "/overview" : "/register"} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold shadow-md gap-2"
              >
                {user ? "Open Dashboard" : "Start Your Journal Free"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-medium"
              >
                Explore Features
              </Button>
            </a>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-profit" /> Free forever tier
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-profit" /> Multi-market (Forex, Crypto, Equities)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-profit" /> Realized R-Multiple & P&L tracking
            </span>
          </div>

          {/* 3. Visual Dashboard Preview (Live Components + Sample Guest Data) */}
          <div className="pt-10 max-w-6xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-4 bg-muted/40 border border-border shadow-2xl backdrop-blur-sm">
              {/* Preview Ribbon */}
              <div className="flex items-center justify-between pb-3 px-2 border-b border-border/60 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="font-semibold text-foreground text-[11px] sm:text-xs">
                    Live Platform Preview
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary">
                  Interactive Demo · Sample Data
                </Badge>
              </div>

              {/* Inner Dashboard Cards */}
              <div className="p-2 sm:p-4 space-y-6 text-left">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <MetricCard
                    title="Net P&L"
                    value="+$2,450.00"
                    change={{
                      value: "+$2,450.00",
                      isPositive: true,
                      period: "30-day cumulative",
                    }}
                    icon={<DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    trendColor="blue"
                    sparklineData={previewSparklineEquity}
                  />

                  <MetricCard
                    title="Total Trades"
                    value="42"
                    change={{
                      value: "2 open",
                      isPositive: true,
                      period: "active positions",
                    }}
                    icon={<Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    trendColor="emerald"
                    sparklineData={[5, 10, 18, 22, 28, 35, 42]}
                  />

                  <MetricCard
                    title="Win Rate"
                    value="68.2%"
                    change={{
                      value: "PF 2.45",
                      isPositive: true,
                      period: "profit factor",
                    }}
                    icon={<Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                    trendColor="amber"
                    sparklineData={[50, 55, 62, 59, 64, 68]}
                  />
                </div>

                {/* Equity Curve Chart */}
                <Card className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        Cumulative Performance Curve
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Realized net equity progression over closed trades
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      10 Closed Sessions
                    </Badge>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={previewCurveData}>
                        <defs>
                          <linearGradient id="landingCurveGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          stroke="#94A3B8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: "#E2E8F0" }}
                        />
                        <YAxis
                          stroke="#94A3B8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0]?.payload;
                              return (
                                <div className="bg-card border border-border rounded-xl shadow-dropdown p-2.5 text-xs">
                                  <p className="font-semibold text-foreground">{data.name}</p>
                                  <p className="text-muted-foreground mt-0.5">
                                    Balance:{" "}
                                    <span className="font-bold text-primary">
                                      ${data.balance.toLocaleString()}
                                    </span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="balance"
                          stroke="#2563EB"
                          strokeWidth={2.5}
                          fill="url(#landingCurveGrad)"
                          dot={{ r: 3, fill: "#2563EB" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Recent Sample Positions */}
                <Card className="p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Recent Execution Feed
                    </span>
                    <span className="text-xs font-semibold text-primary">Sample Log</span>
                  </div>
                  <div className="divide-y divide-border">
                    {sampleTrades.map((t) => (
                      <div
                        key={t.symbol}
                        className="py-2.5 px-2 flex items-center justify-between hover:bg-muted/30 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={t.direction === "long" ? "info" : "danger"}
                            className="capitalize text-[10px]"
                          >
                            {t.direction}
                          </Badge>
                          <div>
                            <span className="font-bold text-foreground block text-sm">
                              {t.symbol}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {t.market} · {t.strategy}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={cn(
                              "font-bold text-sm block",
                              t.isWin ? "text-profit" : "text-loss"
                            )}
                          >
                            {t.pnl}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {t.entry} → {t.exit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs font-semibold text-primary">
              Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built for Systematic Traders Who Seek Continuous Improvement
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Every feature is tuned to help you identify statistical patterns, eliminate emotional bias, and optimize your risk-adjusted edge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Trade Tracking</h3>
                  <Badge variant="secondary" className="text-[10px]">Live</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Record position entries, exits, fee structures, stop losses, take profits, and outcomes across Forex, Crypto, Stocks, and Commodities.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Performance Analytics</h3>
                  <Badge variant="secondary" className="text-[10px]">Live</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Understand Net P&L, Win Rate, Profit Factor, Expectancy, and cumulative equity curve trends powered by real-time mathematical aggregation.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Strategy Management</h3>
                  <Badge variant="secondary" className="text-[10px]">Enhanced</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Document trading rules, entry checklists, and exit parameters. Compare individual playbook profitability and win rates side by side.
                </p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Trading Journal</h3>
                  <Badge variant="secondary" className="text-[10px]">Enhanced</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Record subjective context, emotional states (FOMO, discipline, hesitation), mistakes, and key lessons learned from every market session.
                </p>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-loss flex items-center justify-center transition-transform group-hover:scale-110">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Risk Management</h3>
                  <Badge variant="secondary" className="text-[10px]">Live</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Track Stop-Loss, Take-Profit, Planned Risk:Reward ratios, and realized R-Multiples to preserve capital and ensure disciplined sizing.
                </p>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 space-y-4 hover:border-primary/50 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-transform group-hover:scale-110">
                <PieChart className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground">Trading Insights</h3>
                  <Badge variant="secondary" className="text-[10px]">Live</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Identify asset allocation across forex, crypto, and equities. Review win/loss distributions calculated directly from actual closed trades.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Deep-Dive Section: Strategies & Journal Capabilities */}
      <section id="strategies" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <Badge variant="outline" className="text-xs text-primary font-semibold">
                Strategy Management
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Stop Trading Randomly. Turn Setups Into Repeatable Playbooks.
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Most traders lose money not because of their indicator choices, but because they fail to follow clear rules. Our Strategy management lets you write out entry conditions, exit triggers, and risk limits for each setup.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Define entry, exit, and stop-loss rules before clicking buy or sell",
                  "Compare win rates and average profitability per strategy",
                  "Filter historical trades by setup to see what works in trending vs. ranging markets",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href={user ? "/strategies" : "/register"}>
                  <Button variant="primary" className="gap-2">
                    {user ? "View Strategies" : "Build Your First Strategy"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Strategy Card Preview */}
            <Card className="p-6 bg-card/60 border-border space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h4 className="font-bold text-base text-foreground">Breakout Retest Playbook</h4>
                  <p className="text-xs text-muted-foreground">Forex & Equities · 4h Timeframe</p>
                </div>
                <Badge variant="profit" className="text-xs font-bold">
                  +18.4% Win P&L
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs py-2 bg-muted/30 p-3 rounded-xl">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Win Rate</span>
                  <span className="font-bold text-foreground">71.4%</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Avg R:R</span>
                  <span className="font-bold text-foreground">1 : 2.6</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Trades</span>
                  <span className="font-bold text-foreground">28</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wide">
                  Execution Checklist:
                </p>
                <div className="space-y-1.5 pl-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-profit" />
                    <span>Price breaks key 4h resistance with above-average volume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-profit" />
                    <span>Wait for 15m bullish confirmation candle on retest</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-profit" />
                    <span>Stop loss placed 5 pips below swing low (Max 1% account risk)</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. Deep-Dive Section: Journal */}
      <section id="journal" className="py-20 border-t border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Journal Card Preview */}
            <Card className="p-6 bg-card border-border space-y-4 shadow-xl order-2 lg:order-1">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <Badge variant="profit" className="text-xs uppercase font-bold">
                    Long
                  </Badge>
                  <div>
                    <span className="font-bold text-sm text-foreground">EUR/USD</span>
                    <span className="text-[10px] text-muted-foreground block">
                      Forex · 1.0840 → 1.0895
                    </span>
                  </div>
                </div>
                <span className="text-base font-bold text-profit">+$550.00 (+2.2R)</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="text-xs">
                  Mindset: Disciplined
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Plan Followed: Yes
                </Badge>
              </div>

              <div className="bg-muted/40 p-3.5 rounded-xl border border-border/50 text-xs space-y-1.5">
                <p className="font-semibold text-foreground uppercase tracking-wide text-[10px]">
                  Post-Trade Notes & Reflection:
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  &ldquo;Resisted the urge to jump in during news volatility. Waited for liquidity sweep to clear Asian highs, entered on the 15-minute rejection pinbar, and adhered to original TP without premature exit.&rdquo;
                </p>
              </div>
            </Card>

            <div className="space-y-5 order-1 lg:order-2">
              <Badge variant="outline" className="text-xs text-primary font-semibold">
                Trading Psychology & Journal
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Document Mindset, Emotions, and Lessons From Every Session
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                A trading journal isn&apos;t just numbers on a spreadsheet. It&apos;s a mirror that reflects your psychological discipline. By tagging emotional states and noting whether you followed your plan, you prevent costly tilt and repeat errors.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Track whether you followed your rules on winning and losing trades",
                  "Identify emotional triggers like revenge trading, greed, and hesitation",
                  "Filter entries by emotion or setup to find your peak mental state",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href={user ? "/journal" : "/register"}>
                  <Button variant="primary" className="gap-2">
                    {user ? "Open Your Journal" : "Start Journaling Today"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs font-semibold text-primary">
              Simple 3-Step Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How Top Traders Master Their Edge
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              A disciplined feedback loop is the only proven method to achieve sustained profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-6 rounded-2xl border border-border bg-card space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-base shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground">Record Your Trade</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Log instrument, entry, stop-loss, target, and position size. Assign your strategy playbook and record your pre-trade rationale.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-2xl border border-border bg-card space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-base shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground">Review Your Performance</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Analyze your equity curve, profit factor, win rates by asset class, and average R-multiples to understand where edge exists.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-2xl border border-border bg-card space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-base shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground">Learn and Improve</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Reflect on mistakes, cut losing setups that lack edge, and double down on high-expectancy playbooks that consistently generate profits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action (Final CTA) */}
      <section className="py-20 border-t border-border bg-gradient-to-b from-primary/5 via-card to-background relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="outline" className="text-xs text-primary font-semibold">
            Get Started Today
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto">
            Your Next Trade Is an Opportunity to Learn.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Stop letting valuable trading lessons vanish into broker history. Join thousands of disciplined traders tracking their path to consistency.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? "/overview" : "/register"}>
              <Button
                variant="primary"
                size="lg"
                className="px-8 py-3.5 text-base font-semibold shadow-md gap-2"
              >
                {user ? "Go to Dashboard" : "Create Your Free Account"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 py-3.5 text-base font-medium">
                  Sign In With Existing Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="border-t border-border bg-card py-12 mt-auto text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center dark:bg-primary dark:text-white">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-foreground">Trading Journal</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Institutional-grade analytics and reflective journaling for modern financial traders.
              </p>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                Product
              </p>
              <ul className="space-y-1.5">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#analytics" className="hover:text-foreground transition-colors">
                    Analytics
                  </a>
                </li>
                <li>
                  <a href="#strategies" className="hover:text-foreground transition-colors">
                    Strategies
                  </a>
                </li>
                <li>
                  <a href="#journal" className="hover:text-foreground transition-colors">
                    Journal
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Account & Resources */}
            <div className="space-y-2">
              <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                Account & Access
              </p>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Trader Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-foreground transition-colors">
                    Create Free Account
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="hover:text-foreground transition-colors">
                    Authenticated Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* System Info */}
            <div className="space-y-2">
              <p className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                System Architecture
              </p>
              <p className="text-muted-foreground">
                Built with Next.js 15, TypeScript, Tailwind CSS, Recharts, and Express API.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
                <span className="text-[11px] text-foreground font-medium">
                  API Operational (v1)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Trading Journal. All rights reserved.</p>
            <p className="text-[11px]">
              Disclaimer: Past performance is not indicative of future market results. Trading involves financial risk.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

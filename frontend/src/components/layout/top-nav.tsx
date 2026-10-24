"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronDown,
  Sun,
  Moon,
  Plus,
  Menu,
  X,
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  Target,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopNavProps {
  onNewTradeClick?: () => void;
  showNewTradeButton?: boolean;
}

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Trades", href: "/trades", icon: ArrowLeftRight },
  { name: "Strategies", href: "/strategies", icon: Target },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "/help", icon: HelpCircle },
];

export function TopNav({ onNewTradeClick, showNewTradeButton = true }: TopNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");

  const isExcludedPage =
    pathname.startsWith("/trades") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/strategies") ||
    pathname.startsWith("/journal");

  const shouldShowNewTrade = showNewTradeButton && !isExcludedPage;

  const getPageTitle = () => {
    if (pathname.startsWith("/overview")) return "Overview";
    if (pathname.startsWith("/analytics")) return "Analytics";
    if (pathname.startsWith("/trades")) return "Trades";
    if (pathname.startsWith("/strategies")) return "Strategies";
    if (pathname.startsWith("/journal")) return "Journal";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/help")) return "Help & Support";
    return "Dashboard";
  };

  const dateOptions = ["Today", "Last 7 Days", "Last 30 Days", "This Month", "All Time"];

  return (
    <>
      {/* Glassy header */}
      <header className="sticky top-0 z-40 glass border-b border-border/60 px-4 sm:px-8 py-3.5 transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card border border-border transition-all duration-200 hover:shadow-card"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground animate-fade-in">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Date Range Picker */}
            <div className="relative">
              <button
                onClick={() => setDateFilterOpen(!dateFilterOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/80 text-xs sm:text-sm font-medium text-foreground hover:bg-card hover:shadow-card transition-all duration-200"
              >
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="hidden sm:inline">{selectedRange}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                    dateFilterOpen && "rotate-180"
                  )}
                />
              </button>

              {dateFilterOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-dropdown p-1.5 z-50 animate-scale-in animate-fade-down">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedRange(opt);
                        setDateFilterOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        selectedRange === opt
                          ? "bg-primary-muted text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {opt}
                      {selectedRange === opt && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-xl border border-border bg-card/80 text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 hover:shadow-card overflow-hidden group"
              aria-label="Toggle light and dark theme"
            >
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-amber-400/10 to-violet-500/10" />
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 relative z-10" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500 relative z-10" />
              )}
            </button>

            {/* Prominent "+ New Trade" Button with pulse ring */}
            {shouldShowNewTrade && (
              <div className="relative">
                {/* Animated pulse ring */}
                <span className="absolute inset-0 rounded-xl border-2 border-primary/40 animate-ping opacity-30 pointer-events-none" />
                {onNewTradeClick ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={onNewTradeClick}
                    icon={<Plus className="w-4 h-4" />}
                    className="relative font-semibold shadow-glow-primary hover:shadow-glow bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 transition-all duration-300"
                  >
                    <span className="hidden sm:inline">New Trade</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                ) : (
                  <Link href="/trades/new">
                    <Button
                      variant="primary"
                      size="md"
                      icon={<Plus className="w-4 h-4" />}
                      className="relative font-semibold shadow-glow-primary hover:shadow-glow bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 transition-all duration-300"
                    >
                      <span className="hidden sm:inline">New Trade</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/75 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-6 flex flex-col justify-between shadow-dropdown animate-slide-in-left">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-lg text-foreground tracking-tight">
                  Trading Journal
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-0.5">
                {navItems.map((item, idx) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className={cn(
                        "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 animate-fade-up group",
                        isActive
                          ? "bg-primary-muted text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 inset-y-1.5 w-0.5 bg-primary rounded-r-full" />
                      )}
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-transform duration-200",
                          isActive ? "text-primary" : "group-hover:scale-110"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-border animate-fade-up delay-400">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-loss gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 transition-colors"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

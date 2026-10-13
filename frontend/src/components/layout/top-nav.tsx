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
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopNavProps {
  onNewTradeClick?: () => void;
}

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Trades", href: "/trades", icon: ArrowLeftRight },
  { name: "Strategies", href: "/strategies", icon: Target },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function TopNav({ onNewTradeClick }: TopNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");

  // Determine title based on pathname
  const getPageTitle = () => {
    if (pathname.startsWith("/overview")) return "Overview";
    if (pathname.startsWith("/analytics")) return "Analytics";
    if (pathname.startsWith("/trades")) return "Trades";
    if (pathname.startsWith("/strategies")) return "Strategies";
    if (pathname.startsWith("/journal")) return "Journal";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Dashboard";
  };

  const dateOptions = [
    "Today",
    "Last 7 Days",
    "Last 30 Days",
    "This Month",
    "All Time",
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-8 py-4 transition-colors">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile hamburger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card border border-border"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right actions matching screenshot */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Date Range Picker Pill */}
            <div className="relative">
              <button
                onClick={() => setDateFilterOpen(!dateFilterOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card text-xs sm:text-sm font-medium text-foreground hover:bg-muted shadow-xs transition-colors"
              >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="hidden sm:inline">{selectedRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {dateFilterOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-dropdown p-1.5 z-50">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedRange(opt);
                        setDateFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        selectedRange === opt
                          ? "bg-primary-muted text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
              aria-label="Toggle light and dark theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Prominent "+ New Trade" Button */}
            {onNewTradeClick ? (
              <Button
                variant="primary"
                size="md"
                onClick={onNewTradeClick}
                icon={<Plus className="w-4 h-4" />}
                className="font-semibold shadow-xs"
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
                  className="font-semibold shadow-xs"
                >
                  <span className="hidden sm:inline">New Trade</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-6 flex flex-col justify-between shadow-dropdown">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-lg text-foreground">
                  Trading Journal
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary-muted text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-foreground">
                  {user?.name}
                </span>
                <span className="text-[10px] text-muted-foreground capitalize">
                  {user?.role}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-loss gap-2"
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

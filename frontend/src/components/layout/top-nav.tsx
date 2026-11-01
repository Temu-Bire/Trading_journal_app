"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Sun,
  Moon,
  Plus,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const ROUTE_TITLES: Record<string, string> = {
  overview: "Dashboard",
  trades: "Trade History",
  new: "New Trade",
  community: "Trader Community & Chat",
  signals: "AI Signals & Scanner",
  copilot: "AI Trade Copilot",
  arena: "Agent Arena",
  plans: "Trade Plans",
  strategies: "Strategies",
  risk: "Risk Management",
  psychology: "Psychology",
  journal: "Trading Journal",
  rules: "Rules & Discipline",
  analytics: "Analytics & Reports",
  goals: "Goals & Progress",
  settings: "Settings",
  help: "Help & Support",
};

export function TopNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    return ROUTE_TITLES[last] || "Dashboard";
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "PT";

  return (
    <>
      {/* ── Top Header Bar (Exact ZMenu Style from Image) ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0e1a]/95 backdrop-blur-md border-b border-slate-300 dark:border-white/[0.08] transition-all duration-300 shadow-2xs">
        <div className="flex items-center justify-between h-[64px] px-6 sm:px-8">
          {/* Left: Mobile Hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path like Screenshot: "TradeFlow > Branding" */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-semibold tracking-tight">TradeFlow</span>
              <span className="text-slate-300 dark:text-slate-600">
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-slate-900 dark:text-white font-extrabold tracking-tight">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right: Live Pill, Notifications, User Pill & Logout */}
          <div className="flex items-center gap-3.5">
            {/* Live Indicator Pill (from image: mint green background with dot) */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ecfdf5] dark:bg-emerald-950/40 text-[#047857] dark:text-emerald-300 border border-[#a7f3d0] dark:border-emerald-800/40 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.18)]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Live</span>
            </div>

            {/* Yellow Notification Bell with Amber Glow (from image) */}
            <button
              className="relative p-2 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Vertical Divider Line */}
            <div className="h-6 w-px bg-slate-300 dark:bg-white/[0.1] mx-0.5" />

            {/* User Profile Pill (Avatar + Name + Role + Chevron) */}
            <Link
              href="/settings"
              className="hidden sm:flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors group"
            >
              {/* Circular Purple Avatar like screenshot */}
              <div className="w-8 h-8 rounded-full bg-[#8b5cf6] text-white font-bold text-xs flex items-center justify-center shrink-0 border-2 border-white dark:border-[#0a0e1a] shadow-sm">
                {initials}
              </div>

              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {user?.name || "Pro Trader"}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold capitalize">
                  {user?.role || "Trader"}
                </span>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Direct Logout Button */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex">
          <div className="w-[280px] bg-[#090d16] text-white h-full p-5 flex flex-col justify-between border-r border-white/10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                    TF
                  </div>
                  <span className="font-extrabold text-lg">TradeFlow</span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                    PRO
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {[
                  { name: "Dashboard", href: "/overview" },
                  { name: "New Trade", href: "/trades/new" },
                  { name: "Trade History", href: "/trades" },
                  { name: "Trader Community", href: "/community" },
                  { name: "Trading Journal", href: "/journal" },
                  { name: "Trade Plans", href: "/plans" },
                  { name: "Goals & Progress", href: "/goals" },
                  { name: "Risk Management", href: "/risk" },
                  { name: "Psychology", href: "/psychology" },
                  { name: "Analytics & Reports", href: "/analytics" },
                ].map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                        isActive
                          ? "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white shadow-md"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.08]"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#8b5cf6] text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate">{user?.name || "Pro Trader"}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{user?.role || "Trader"}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-rose-400 hover:text-rose-300 text-xs font-semibold p-1.5"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

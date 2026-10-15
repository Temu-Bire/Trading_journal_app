"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  Target,
  BookOpen,
  Settings,
  HelpCircle,
  BarChart3,
  LogOut,
  ChevronUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Trades", href: "/trades", icon: ArrowLeftRight },
  { name: "Strategies", href: "/strategies", icon: Target },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "T";

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 px-4 py-6 justify-between select-none animate-slide-in-left">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-8 animate-fade-up delay-0">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-primary dark:to-blue-600 text-white flex items-center justify-center shadow-glow-primary overflow-hidden group">
            <BarChart3 className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            {/* Shimmer sweep on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground block">
              Trading Journal
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              Pro Analytics
            </span>
          </div>
        </div>

        {/* Navigation list with staggered entrance */}
        <nav className="space-y-0.5">
          {navItems.map((item, idx) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/overview" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group animate-fade-up",
                  `delay-${Math.min(idx * 50 + 50, 300)}`,
                  isActive
                    ? "bg-primary-muted text-primary font-semibold shadow-inner-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {/* Active left accent bar */}
                {isActive && (
                  <span className="absolute left-0 inset-y-1.5 w-0.5 bg-primary rounded-r-full animate-scale-in" />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-all duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                  )}
                />
                <span className="truncate">{item.name}</span>

                {/* Hover glow effect */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-border space-y-1 animate-fade-up delay-500">
        <Link
          href="/help"
          className={cn(
            "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
            pathname === "/help"
              ? "bg-primary-muted text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {pathname === "/help" && (
            <span className="absolute left-0 inset-y-1.5 w-0.5 bg-primary rounded-r-full" />
          )}
          <HelpCircle
            className={cn(
              "w-5 h-5 flex-shrink-0 transition-all duration-200",
              pathname === "/help"
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
            )}
          />
          <span>Help &amp; Support</span>
        </Link>

        {/* User Card */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar with gradient ring */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-foreground font-bold text-xs flex items-center justify-center border-2 border-border group-hover:border-primary/30 transition-colors duration-200">
                  {initials}
                </div>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-card animate-pulse-glow-emerald" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {user?.name || "Trader"}
                </p>
                <p className="text-xs text-muted-foreground truncate leading-tight capitalize">
                  {user?.role || "Member"}
                </p>
              </div>
            </div>
            <ChevronUp
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-300",
                userMenuOpen ? "rotate-180" : ""
              )}
            />
          </button>

          {/* User popup dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-card border border-border rounded-xl shadow-dropdown dark:shadow-dropdown-dark p-1.5 z-50 animate-fade-up">
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-1">
                Signed in as{" "}
                <span className="font-semibold text-foreground block truncate">
                  {user?.email}
                </span>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-loss hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

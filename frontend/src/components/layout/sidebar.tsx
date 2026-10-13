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
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 px-4 py-6 justify-between select-none">
      <div>
        {/* Logo matching uploaded design: black rounded-xl with bar chart */}
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-sm dark:bg-primary dark:text-white">
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
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/overview" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary-muted text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Help and User Avatar pill matching screenshot */}
      <div className="pt-4 border-t border-border space-y-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
          <span>Help & Support</span>
        </Link>

        {/* User Card */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-foreground font-bold text-xs flex items-center justify-center flex-shrink-0 border border-border">
                {initials}
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
                "w-4 h-4 text-muted-foreground transition-transform",
                userMenuOpen ? "rotate-180" : ""
              )}
            />
          </button>

          {/* User popup dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-card border border-border rounded-xl shadow-dropdown p-1.5 z-50">
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-1">
                Signed in as <span className="font-semibold text-foreground block truncate">{user?.email}</span>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-loss hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

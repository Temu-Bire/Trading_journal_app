"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  History,
  ClipboardList,
  Target,
  ShieldCheck,
  Brain,
  BookOpen,
  CheckSquare,
  BarChart3,
  Flag,
  Sparkles,
  Bot,
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Palette,
  CreditCard,
  User,
  Zap,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: "primary" | "emerald" | "amber" | "indigo";
  dividerBefore?: boolean;
}

const navItems: NavItem[] = [
  // CORE EXECUTION
  {
    name: "Dashboard",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    name: "New Trade",
    href: "/trades/new",
    icon: Plus,
    badge: "ACTION",
    badgeColor: "primary",
  },
  {
    name: "Trade History",
    href: "/trades",
    icon: History,
  },

  // AI-TRADER INTELLIGENCE & COMMUNITY
  {
    name: "Trader Community",
    href: "/community",
    icon: MessageSquare,
    badge: "CHAT",
    badgeColor: "emerald",
    dividerBefore: true,
  },
  {
    name: "AI Signals",
    href: "/signals",
    icon: Sparkles,
    badge: "AI",
    badgeColor: "indigo",
  },
  {
    name: "AI Copilot",
    href: "/copilot",
    icon: Bot,
    badge: "NEW",
    badgeColor: "emerald",
  },
  {
    name: "Agent Arena",
    href: "/arena",
    icon: Trophy,
    badge: "LIVE",
    badgeColor: "amber",
  },

  // PLANNING & STRATEGY
  {
    name: "Trade Plans",
    href: "/plans",
    icon: ClipboardList,
    dividerBefore: true,
  },
  {
    name: "Strategies",
    href: "/strategies",
    icon: Target,
  },
  {
    name: "Risk Management",
    href: "/risk",
    icon: ShieldCheck,
  },

  // DISCIPLINE & JOURNAL
  {
    name: "Psychology",
    href: "/psychology",
    icon: Brain,
    dividerBefore: true,
  },
  {
    name: "Trading Journal",
    href: "/journal",
    icon: BookOpen,
  },
  {
    name: "Rules & Discipline",
    href: "/rules",
    icon: CheckSquare,
  },

  // PERFORMANCE
  {
    name: "Analytics & Reports",
    href: "/analytics",
    icon: BarChart3,
    dividerBefore: true,
  },
  {
    name: "Goals & Progress",
    href: "/goals",
    icon: Flag,
  },

  // SYSTEM & PREFERENCES
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    dividerBefore: true,
  },
  {
    name: "Help & Support",
    href: "/help",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "PT";

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-300 ease-in-out shrink-0",
        // Exact ZMenu Dark Midnight Background
        "bg-[#090d16] border-r border-white/[0.08] text-slate-400",
        collapsed ? "w-[68px]" : "w-[245px]"
      )}
    >
      {/* ── Brand Header (Exact ZMenu Style from Image) ── */}
      <div
        className={cn(
          "h-[64px] flex items-center border-b border-white/[0.08] px-4 shrink-0 transition-all duration-300",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed ? (
          <>
            <Link
              href="/overview"
              className="flex items-center gap-2.5 min-w-0 group hover:opacity-95 transition-opacity"
            >
              {/* Blue Rounded Square with 3 Bars Logo */}
              <div className="w-[32px] h-[32px] rounded-lg bg-[#3b82f6] flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-[18px] h-[18px] text-white stroke-current"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 7h16" />
                  <path d="M4 12h12" />
                  <path d="M4 17h14" />
                </svg>
              </div>

              <span className="font-extrabold text-[17px] tracking-tight text-white">
                TradeFlow
              </span>

              {/* Cyan/Blue Rounded PRO Badge */}
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white shadow-[0_2px_8px_rgba(6,182,212,0.4)]">
                PRO
              </span>
            </Link>

            {/* Desktop Collapse Button on far right */}
            <button
              onClick={toggleSidebar}
              className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white/60 hover:text-white flex items-center justify-center transition-all duration-150 cursor-pointer"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          /* Collapsed Logo button with Expand Pill */
          <button
            onClick={toggleSidebar}
            className="relative p-1 flex items-center justify-center cursor-pointer group"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <div className="w-9 h-9 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white stroke-current"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h12" />
                <path d="M4 17h14" />
              </svg>
            </div>
            {/* Expand Pill */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-[#090d16] flex items-center justify-center text-white text-[9px]">
              <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </button>
        )}
      </div>

      {/* ── Nav Items (Exact Active Pill Style from Image) ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/overview" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <React.Fragment key={item.name}>
              {item.dividerBefore && (
                <div className="my-2 px-1">
                  <div className="h-px bg-white/[0.08]" />
                </div>
              )}

              <Link
                href={item.href}
                prefetch={true}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "relative flex items-center rounded-xl text-[13.5px] font-medium transition-all duration-200 group",
                  collapsed
                    ? "justify-center h-10 w-10 mx-auto"
                    : "gap-3 px-3.5 py-2.5 min-h-[40px]",
                  // Exact ZMenu Active Glowing Purple/Indigo Pill
                  isActive
                    ? "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white font-semibold shadow-[0_4px_18px_rgba(99,102,241,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.07] hover:translate-x-0.5"
                )}
              >
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-transform duration-200",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white group-hover:scale-105"
                  )}
                />

                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.name}</span>
                    {item.badge && !isActive && (
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider",
                          item.badgeColor === "emerald"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : item.badgeColor === "indigo"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : item.badgeColor === "amber"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── User Footer Section (Exact ZMenu Style from Image) ── */}
      <div className="border-t border-white/[0.08] p-3 bg-[#090d16] shrink-0">
        <div
          className={cn(
            "flex items-center transition-all duration-150",
            collapsed
              ? "justify-center"
              : "justify-between p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer"
          )}
        >
          <div
            className="flex items-center gap-2.5 min-w-0"
            title={collapsed ? `${user?.name || "Pro Trader"} (Trader)` : undefined}
          >
            {/* Circular Purple Avatar like screenshot */}
            <div className="w-[34px] h-[34px] rounded-full bg-[#8b5cf6] text-white font-bold text-xs flex items-center justify-center shrink-0 border-2 border-white/20 shadow-sm">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <span className="font-semibold text-xs text-white truncate block">
                  {user?.name || "Pro Trader"}
                </span>
                <span className="text-[11px] text-slate-400 capitalize block">
                  {user?.role || "Trader"}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

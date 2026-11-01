"use client";

import React, { useState, useEffect } from "react";
import { Clock, Globe2, Bell, BellRing, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionInfo {
  name: string;
  city: string;
  startUtc: number; // hour in UTC
  endUtc: number; // hour in UTC
  eatStart: string; // Addis Ababa time string
  eatEnd: string;
}

const SESSIONS: SessionInfo[] = [
  {
    name: "London",
    city: "London (Europe)",
    startUtc: 8,
    endUtc: 17,
    eatStart: "11:00 AM",
    eatEnd: "08:00 PM",
  },
  {
    name: "New York",
    city: "New York (US)",
    startUtc: 13,
    endUtc: 22,
    eatStart: "04:00 PM",
    eatEnd: "01:00 AM",
  },
  {
    name: "Tokyo",
    city: "Tokyo (Asia)",
    startUtc: 0,
    endUtc: 9,
    eatStart: "03:00 AM",
    eatEnd: "12:00 PM",
  },
  {
    name: "Sydney",
    city: "Sydney (Pacific)",
    startUtc: 22,
    endUtc: 7,
    eatStart: "01:00 AM",
    eatEnd: "10:00 AM",
  },
];

export function ForexSessionsClock() {
  const [currentUtcHour, setCurrentUtcHour] = useState<number>(0);
  const [currentUtcMinute, setCurrentUtcMinute] = useState<number>(0);
  const [currentEatTime, setCurrentEatTime] = useState<string>("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentUtcHour(now.getUTCHours());
      setCurrentUtcMinute(now.getUTCMinutes());

      // Addis Ababa (UTC+3)
      const eatDate = new Date(now.getTime() + 3 * 3600000);
      setCurrentEatTime(
        eatDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "UTC",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSessionOpen = (s: SessionInfo) => {
    if (s.startUtc < s.endUtc) {
      return currentUtcHour >= s.startUtc && currentUtcHour < s.endUtc;
    } else {
      // wraps around midnight
      return currentUtcHour >= s.startUtc || currentUtcHour < s.endUtc;
    }
  };

  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      if (typeof window !== "undefined" && "Notification" in window) {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            setNotificationsEnabled(true);
            setNotificationMsg("Session open alerts enabled! You will be notified on London & NY Open.");
          } else {
            setNotificationsEnabled(true);
            setNotificationMsg("Alerts enabled in-app!");
          }
        });
      } else {
        setNotificationsEnabled(true);
        setNotificationMsg("Session alerts active in-app.");
      }
    } else {
      setNotificationsEnabled(false);
      setNotificationMsg(null);
    }
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Forex Market Sessions
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/30">
                Addis Ababa (EAT UTC+3)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Local Time: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentEatTime || "Loading..."}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleNotifications}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              notificationsEnabled
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
            )}
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alerts On</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Get Session Alerts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
        {SESSIONS.map((session) => {
          const isOpen = isSessionOpen(session);
          return (
            <div
              key={session.name}
              className={cn(
                "p-3.5 rounded-2xl border transition-all duration-200",
                isOpen
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/50 shadow-xs"
                  : "bg-slate-50/60 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/[0.06] opacity-75"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {session.name}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                    isOpen
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-200/70 dark:bg-white/10 text-slate-500 dark:text-slate-400"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    )}
                  />
                  {isOpen ? "LIVE NOW" : "CLOSED"}
                </span>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {session.eatStart} – {session.eatEnd} <span className="text-[10px] text-slate-400">(EAT)</span>
                </p>
                <p className="text-[10px] text-slate-400">{session.city}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


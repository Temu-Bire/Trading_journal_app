"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { CreateTradeModal } from "@/components/trades/create-trade-modal";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [createTradeModalOpen, setCreateTradeModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background animate-fade-in">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex flex-col w-64 border-r border-border p-6 gap-6">
          <div className="flex items-center gap-3 px-1">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <div className="space-y-1.5 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-full rounded-xl"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        </div>
        {/* Main skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Nav skeleton */}
          <div className="h-14 border-b border-border px-8 flex items-center justify-between">
            <Skeleton className="h-7 w-36" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-32 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </div>
          {/* Content skeleton */}
          <div className="flex-1 p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Skeleton className="h-72 w-full rounded-2xl lg:col-span-2" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hideNewTrade =
    pathname.startsWith("/trades") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/strategies") ||
    pathname.startsWith("/journal");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content view */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          showNewTradeButton={!hideNewTrade}
          onNewTradeClick={hideNewTrade ? undefined : () => setCreateTradeModalOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Trade Creator Dialog */}
      {!hideNewTrade && (
        <CreateTradeModal
          open={createTradeModalOpen}
          onClose={() => setCreateTradeModalOpen(false)}
          onTradeCreated={() => {
            window.dispatchEvent(new CustomEvent("tj:trade-created"));
          }}
        />
      )}
    </div>
  );
}

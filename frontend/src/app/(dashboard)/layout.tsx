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
      <div className="flex h-screen w-full bg-[#edf2f7] dark:bg-[#090d16] animate-fade-in">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex flex-col w-[245px] bg-[#090d16] border-r border-white/[0.08] p-6 gap-6">
          <div className="flex items-center gap-3 px-1">
            <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
            <Skeleton className="h-4 w-28 bg-white/10" />
          </div>
          <div className="space-y-2 pt-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-full rounded-xl bg-white/10"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        </div>
        {/* Main skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b border-border px-8 flex items-center justify-between bg-white dark:bg-[#0a0e1a]">
            <Skeleton className="h-6 w-36" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-xl" />
            </div>
          </div>
          <div className="flex-1 p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-3xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Skeleton className="h-72 w-full rounded-3xl lg:col-span-2" />
              <Skeleton className="h-72 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#edf2f7] dark:bg-[#090d16]">
      {/* Exact ZMenu Dark Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-5 sm:p-8 max-w-[1500px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Trade Creator Dialog */}
      <CreateTradeModal
        open={createTradeModalOpen}
        onClose={() => setCreateTradeModalOpen(false)}
        onTradeCreated={() => {
          window.dispatchEvent(new CustomEvent("tj:trade-created"));
        }}
      />
    </div>
  );
}

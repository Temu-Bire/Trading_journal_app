"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [createTradeModalOpen, setCreateTradeModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="hidden lg:block w-64 border-r border-border p-6 space-y-6">
          <Skeleton className="h-10 w-40" />
          <div className="space-y-3 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 p-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content view */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onNewTradeClick={() => setCreateTradeModalOpen(true)} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Global Quick Trade Creator Dialog */}
      <CreateTradeModal
        open={createTradeModalOpen}
        onClose={() => setCreateTradeModalOpen(false)}
        onTradeCreated={() => {
          // Trigger refresh or router reload
          window.dispatchEvent(new CustomEvent("tj:trade-created"));
        }}
      />
    </div>
  );
}

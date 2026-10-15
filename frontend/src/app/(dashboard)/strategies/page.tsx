"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Layers,
  BookOpen,
  X,
  ExternalLink,
  Info,
} from "lucide-react";
import { StrategyPerformanceChart } from "@/components/dashboard/strategy-chart";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import {
  IStrategy,
  getStrategies,
  saveStrategy,
  deleteStrategy,
} from "@/lib/strategies";
import { formatCurrency, formatPercent, formatDate, cn } from "@/lib/utils";
import type { ITrade } from "@/types";

interface StrategyWithStats extends IStrategy {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  bestTrade: number;
  worstTrade: number;
  avgRR: number;
  associatedTrades: ITrade[];
}

export default function StrategiesPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [trades, setTrades] = useState<ITrade[]>([]);
  const [strategies, setStrategies] = useState<IStrategy[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [marketFilter, setMarketFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"pnl" | "winRate" | "trades" | "name">("pnl");

  // Selection & Details
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [strategyToEdit, setStrategyToEdit] = useState<IStrategy | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [strategyToDelete, setStrategyToDelete] = useState<IStrategy | null>(null);

  // Form State for Create / Edit
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMarket, setFormMarket] = useState("forex");
  const [formSymbols, setFormSymbols] = useState("");
  const [formEntryRules, setFormEntryRules] = useState("");
  const [formExitRules, setFormExitRules] = useState("");
  const [formRiskRules, setFormRiskRules] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load backend trades & stored strategies
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ITrade[]>("/trades", { limit: 200 });
      if (res.success && res.data) {
        setTrades(res.data);
      }
    } catch {
      // Continue with empty trades if API unavailable
    } finally {
      const localStrats = getStrategies(user?.id);
      setStrategies(localStrats);
      if (localStrats.length > 0 && !selectedStrategyId) {
        setSelectedStrategyId(localStrats[0].id);
      }
      setLoading(false);
    }
  }, [user?.id, selectedStrategyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Merge strategy definitions with live trade analytics
  const strategiesWithStats = useMemo<StrategyWithStats[]>(() => {
    return strategies.map((strat) => {
      // Match trades by strategy name (case-insensitive)
      const matched = trades.filter((t) => {
        if (!t.strategy) return false;
        return t.strategy.trim().toLowerCase() === strat.name.trim().toLowerCase();
      });

      let totalPnl = 0;
      let wins = 0;
      let losses = 0;
      let openTrades = 0;
      let closedTrades = 0;
      let bestTrade = 0;
      let worstTrade = 0;
      const validRRs: number[] = [];

      matched.forEach((t) => {
        if (t.status === "open") {
          openTrades += 1;
        } else if (t.status === "closed") {
          closedTrades += 1;
          const pnl = t.pnlNet ?? t.pnlGross ?? 0;
          totalPnl += pnl;

          if (pnl > 0) wins += 1;
          else if (pnl < 0) losses += 1;

          if (pnl > bestTrade) bestTrade = pnl;
          if (pnl < worstTrade) worstTrade = pnl;

          if (t.plannedRR && t.plannedRR > 0) {
            validRRs.push(t.plannedRR);
          }
        }
      });

      const winRate = closedTrades > 0 ? (wins / closedTrades) * 100 : 0;
      const avgPnl = closedTrades > 0 ? totalPnl / closedTrades : 0;
      const avgRR =
        validRRs.length > 0
          ? validRRs.reduce((a, b) => a + b, 0) / validRRs.length
          : 0;

      return {
        ...strat,
        totalTrades: matched.length,
        openTrades,
        closedTrades,
        wins,
        losses,
        winRate,
        totalPnl,
        avgPnl,
        bestTrade,
        worstTrade,
        avgRR,
        associatedTrades: matched,
      };
    });
  }, [strategies, trades]);

  // Filtered and sorted strategy list
  const filteredStrategies = useMemo(() => {
    return strategiesWithStats
      .filter((strat) => {
        if (marketFilter !== "all" && strat.market !== marketFilter && strat.market !== "all") {
          return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = strat.name.toLowerCase().includes(q);
          const matchDesc = strat.description.toLowerCase().includes(q);
          const matchTags = strat.tags.some((tag) => tag.toLowerCase().includes(q));
          const matchSymbols = strat.symbols?.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchTags && !matchSymbols) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "pnl") return b.totalPnl - a.totalPnl;
        if (sortBy === "winRate") return b.winRate - a.winRate;
        if (sortBy === "trades") return b.totalTrades - a.totalTrades;
        return a.name.localeCompare(b.name);
      });
  }, [strategiesWithStats, marketFilter, search, sortBy]);

  // Selected Strategy for Detailed Inspector
  const activeStrategy = useMemo(() => {
    if (!selectedStrategyId) return filteredStrategies[0] || null;
    return (
      strategiesWithStats.find((s) => s.id === selectedStrategyId) ||
      filteredStrategies[0] ||
      null
    );
  }, [selectedStrategyId, filteredStrategies, strategiesWithStats]);

  // Chart data for visual comparison
  const chartData = useMemo(() => {
    return filteredStrategies.map((s) => ({
      name: s.name.length > 14 ? s.name.slice(0, 12) + "…" : s.name,
      fullName: s.name,
      pnl: Math.round(s.totalPnl * 100) / 100,
      winRate: Math.round(s.winRate),
      trades: s.totalTrades,
    }));
  }, [filteredStrategies]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setStrategyToEdit(null);
    setFormName("");
    setFormDescription("");
    setFormMarket("forex");
    setFormSymbols("");
    setFormEntryRules("");
    setFormExitRules("");
    setFormRiskRules("");
    setFormTags("");
    setEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (strat: IStrategy, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStrategyToEdit(strat);
    setFormName(strat.name);
    setFormDescription(strat.description);
    setFormMarket(strat.market);
    setFormSymbols(strat.symbols || "");
    setFormEntryRules(strat.entryRules.join("\n"));
    setFormExitRules(strat.exitRules.join("\n"));
    setFormRiskRules(strat.riskRules.join("\n"));
    setFormTags(strat.tags.join(", "));
    setEditModalOpen(true);
  };

  // Save Strategy Handler
  const handleSaveStrategyForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      error("Strategy name is required.");
      return;
    }

    setFormSubmitting(true);
    try {
      const entryRules = formEntryRules
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const exitRules = formExitRules
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const riskRules = formRiskRules
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const tags = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const saved = saveStrategy(
        {
          id: strategyToEdit?.id,
          name: formName.trim(),
          description: formDescription.trim(),
          market: formMarket,
          symbols: formSymbols.trim(),
          entryRules: entryRules.length ? entryRules : ["Follow confirmation setup"],
          exitRules: exitRules.length ? exitRules : ["Target 2.0R or trailing stop"],
          riskRules: riskRules.length ? riskRules : ["1% account risk limit"],
          tags: tags.length ? tags : ["Standard"],
        },
        user?.id
      );

      const updatedList = getStrategies(user?.id);
      setStrategies(updatedList);
      setSelectedStrategyId(saved.id);
      setEditModalOpen(false);
      success(
        strategyToEdit ? "Strategy playbook updated!" : "New strategy playbook created!"
      );
    } catch {
      error("Failed to save strategy.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Strategy Handler
  const handleDeleteStrategy = () => {
    if (!strategyToDelete) return;
    const deleted = deleteStrategy(strategyToDelete.id, user?.id);
    if (deleted) {
      const updatedList = getStrategies(user?.id);
      setStrategies(updatedList);
      if (selectedStrategyId === strategyToDelete.id) {
        setSelectedStrategyId(updatedList[0]?.id || null);
      }
      success(`Strategy "${strategyToDelete.name}" deleted.`);
      setDeleteConfirmOpen(false);
      setStrategyToDelete(null);
    } else {
      error("Could not delete strategy.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner: Backend Integration Transparency */}
      <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-foreground">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            <strong>Live Trade Sync:</strong> Strategy metrics & P&L are aggregated directly from your Express backend trades. Playbooks are saved to your trader workspace.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary flex-shrink-0">
          API v1 Live
        </Badge>
      </div>

      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Trading Strategies
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize your trading rules and understand how each strategy performs.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="shadow-xs self-start sm:self-auto"
        >
          New Strategy
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search strategy name, description, symbols, or tags..."
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="w-36 h-10 text-xs rounded-xl"
            options={[
              { value: "all", label: "All Markets" },
              { value: "forex", label: "Forex" },
              { value: "crypto", label: "Crypto" },
              { value: "stocks", label: "Stocks / Equities" },
              { value: "indices", label: "Indices" },
              { value: "commodities", label: "Commodities" },
            ]}
          />

          <div className="flex items-center gap-1 bg-card px-2 py-1.5 rounded-xl border border-border shadow-xs text-xs text-muted-foreground font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <button
              onClick={() => setSortBy("pnl")}
              className={`px-2 py-1 rounded-lg transition-colors ${
                sortBy === "pnl"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              P&L
            </button>
            <button
              onClick={() => setSortBy("winRate")}
              className={`px-2 py-1 rounded-lg transition-colors ${
                sortBy === "winRate"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Win %
            </button>
            <button
              onClick={() => setSortBy("trades")}
              className={`px-2 py-1 rounded-lg transition-colors ${
                sortBy === "trades"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Chart (if multiple strategies exist) */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Strategy Net P&L Comparison
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cumulative profitability grouped by assigned setup name.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              {filteredStrategies.length} Active {filteredStrategies.length === 1 ? "Playbook" : "Playbooks"}
            </Badge>
          </div>
          <div className="h-[200px] w-full">
            <StrategyPerformanceChart data={chartData} />
          </div>
        </Card>
      )}

      {/* Main Layout: Strategy Selection List & Deep-Dive Inspector */}
      {filteredStrategies.length === 0 ? (
        <EmptyState
          title="No trading strategies found"
          description={
            search
              ? "No strategies matched your search filters. Try adjusting your query."
              : "Create your first trading playbook with entry, exit, and risk management rules."
          }
          actionLabel="Create Strategy"
          onAction={handleOpenCreate}
          icon={<Target className="w-12 h-12 text-muted-foreground/40" />}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Strategy Cards List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-foreground tracking-tight px-1 flex items-center justify-between">
              <span>Strategy Playbooks ({filteredStrategies.length})</span>
            </h2>

            <div className="space-y-3">
              {filteredStrategies.map((strat) => {
                const isSelected = activeStrategy?.id === strat.id;

                return (
                  <div
                    key={strat.id}
                    onClick={() => setSelectedStrategyId(strat.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer text-left relative group",
                      isSelected
                        ? "bg-card border-primary ring-2 ring-primary/20 shadow-sm"
                        : "bg-card/70 border-border hover:border-border/80 hover:bg-card"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-foreground">
                            {strat.name}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {strat.market}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {strat.description || "No description provided."}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className={cn(
                            "text-xs font-bold block",
                            strat.totalPnl >= 0 ? "text-profit" : "text-loss"
                          )}
                        >
                          {formatCurrency(strat.totalPnl)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {strat.closedTrades} closed
                        </span>
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                          Win Rate
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatPercent(strat.winRate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                          Trades
                        </span>
                        <span className="font-semibold text-foreground">
                          {strat.totalTrades}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                          Avg R:R
                        </span>
                        <span className="font-semibold text-foreground">
                          {strat.avgRR > 0 ? `1:${strat.avgRR.toFixed(1)}` : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Buttons on hover */}
                    <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-border/40 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEdit(strat, e)}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 px-2"
                        title="Edit strategy"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStrategyToDelete(strat);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-loss text-xs flex items-center gap-1 px-2"
                        title="Delete strategy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Strategy Deep Dive & Rules Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {activeStrategy && (
              <>
                {/* Header Card */}
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-border">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-foreground">
                          {activeStrategy.name}
                        </h2>
                        <Badge variant="outline" className="text-xs uppercase font-bold">
                          {activeStrategy.market}
                        </Badge>
                        {activeStrategy.symbols && (
                          <Badge variant="secondary" className="text-xs">
                            {activeStrategy.symbols}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                        {activeStrategy.description}
                      </p>
                      {activeStrategy.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {activeStrategy.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">
                          Net Realized P&L
                        </span>
                        <span
                          className={cn(
                            "text-2xl font-bold tracking-tight block",
                            activeStrategy.totalPnl >= 0 ? "text-profit" : "text-loss"
                          )}
                        >
                          {formatCurrency(activeStrategy.totalPnl)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenEdit(activeStrategy)}
                          className="h-8 text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5 text-loss" />}
                          onClick={() => {
                            setStrategyToDelete(activeStrategy);
                            setDeleteConfirmOpen(true);
                          }}
                          className="h-8 text-xs text-loss hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sub-metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
                    <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Win Rate
                      </span>
                      <p className="text-base font-bold text-foreground mt-0.5">
                        {formatPercent(activeStrategy.winRate)}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {activeStrategy.wins}W / {activeStrategy.losses}L
                      </span>
                    </div>

                    <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Avg Trade
                      </span>
                      <p
                        className={cn(
                          "text-base font-bold mt-0.5",
                          activeStrategy.avgPnl >= 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        {formatCurrency(activeStrategy.avgPnl)}
                      </p>
                      <span className="text-[10px] text-muted-foreground">per closed trade</span>
                    </div>

                    <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Best Trade
                      </span>
                      <p className="text-base font-bold text-profit mt-0.5">
                        +{formatCurrency(activeStrategy.bestTrade)}
                      </p>
                      <span className="text-[10px] text-muted-foreground">Max single gain</span>
                    </div>

                    <div className="bg-muted/40 p-3 rounded-xl border border-border/50">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Worst Trade
                      </span>
                      <p className="text-base font-bold text-loss mt-0.5">
                        {formatCurrency(activeStrategy.worstTrade)}
                      </p>
                      <span className="text-[10px] text-muted-foreground">Max single loss</span>
                    </div>
                  </div>
                </Card>

                {/* Strategy Rules & Checklists */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Entry Rules */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Entry Rules</span>
                    </div>
                    <ul className="space-y-2 text-xs text-foreground">
                      {activeStrategy.entryRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Exit Rules */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-profit font-bold text-xs uppercase tracking-wider">
                      <ArrowUpRight className="w-4 h-4 text-profit" />
                      <span>Exit Rules</span>
                    </div>
                    <ul className="space-y-2 text-xs text-foreground">
                      {activeStrategy.exitRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-profit mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Risk Management Rules */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-warning font-bold text-xs uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-warning" />
                      <span>Risk Controls</span>
                    </div>
                    <ul className="space-y-2 text-xs text-foreground">
                      {activeStrategy.riskRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Associated Trades Feed */}
                <Card className="p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div>
                      <CardTitle className="text-sm font-bold text-foreground">
                        Associated Trades ({activeStrategy.associatedTrades.length})
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Recorded positions tagged with &ldquo;{activeStrategy.name}&rdquo;
                      </p>
                    </div>

                    <Link
                      href="/trades"
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      All Trades <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {activeStrategy.associatedTrades.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">
                        No trades have been tagged with this strategy yet.
                      </p>
                      <Link href="/trades/new">
                        <Button variant="outline" size="sm" className="text-xs">
                          Log a Trade with This Strategy
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-border -mx-2 pt-2">
                      {activeStrategy.associatedTrades.slice(0, 8).map((trade) => {
                        const pnl = trade.pnlNet ?? trade.pnlGross;
                        const isWin = pnl !== undefined && pnl > 0;
                        const isLoss = pnl !== undefined && pnl < 0;

                        return (
                          <div
                            key={trade._id}
                            className="py-3 px-2 flex items-center justify-between hover:bg-muted/30 rounded-lg transition-colors text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={trade.direction === "long" ? "info" : "danger"}
                                className="text-[10px] uppercase font-bold"
                              >
                                {trade.direction}
                              </Badge>
                              <div>
                                <Link
                                  href={`/trades/${trade._id}`}
                                  className="font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  {trade.symbol}
                                  <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                                </Link>
                                <span className="text-[11px] text-muted-foreground">
                                  {formatDate(trade.entryAt)} · {trade.market.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              {trade.status === "open" ? (
                                <Badge variant="warning" className="text-[10px]">
                                  Open
                                </Badge>
                              ) : (
                                <span
                                  className={cn(
                                    "font-bold block",
                                    isWin ? "text-profit" : isLoss ? "text-loss" : "text-muted-foreground"
                                  )}
                                >
                                  {isWin ? "+" : ""}
                                  {formatCurrency(pnl)}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                Size: {trade.quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Strategy Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card text-foreground rounded-2xl border border-border p-6 max-w-xl w-full shadow-dropdown space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {strategyToEdit ? "Edit Strategy Playbook" : "New Strategy Playbook"}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStrategyForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Strategy Name *"
                  placeholder="e.g. Order Block & FVG Retest"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
                <Select
                  label="Target Market"
                  value={formMarket}
                  onChange={(e) => setFormMarket(e.target.value)}
                  options={[
                    { value: "forex", label: "Forex (FX)" },
                    { value: "crypto", label: "Crypto" },
                    { value: "stocks", label: "Stocks / Equities" },
                    { value: "indices", label: "Indices" },
                    { value: "commodities", label: "Commodities" },
                    { value: "all", label: "All Asset Classes" },
                  ]}
                />
              </div>

              <Input
                label="Target Symbols / Instruments"
                placeholder="e.g. EURUSD, GBPUSD, NVDA, BTCUSD (optional)"
                value={formSymbols}
                onChange={(e) => setFormSymbols(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Strategy Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the core premise, timeframe, and edge of this setup..."
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Entry Rules (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formEntryRules}
                  onChange={(e) => setFormEntryRules(e.target.value)}
                  placeholder="e.g.&#10;Liquidity swept on 1h chart&#10;15m market structure shift with displacement&#10;Limit entry at 50% FVG"
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Exit Rules (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formExitRules}
                    onChange={(e) => setFormExitRules(e.target.value)}
                    placeholder="e.g.&#10;Target opposing liquidity pool&#10;50% off at 2R and trail stop"
                    className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Risk Controls (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={formRiskRules}
                    onChange={(e) => setFormRiskRules(e.target.value)}
                    placeholder="e.g.&#10;Max 1.0% account risk&#10;Hard stop placed below swing low"
                    className="w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                  />
                </div>
              </div>

              <Input
                label="Tags (comma-separated)"
                placeholder="e.g. SMC, Breakout, High-Probability"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={formSubmitting}
                >
                  {strategyToEdit ? "Save Changes" : "Create Strategy"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Strategy Confirmation Modal */}
      {deleteConfirmOpen && strategyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card text-foreground rounded-2xl border border-border p-6 max-w-sm w-full shadow-dropdown space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Delete Strategy &ldquo;{strategyToDelete.name}&rdquo;?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this strategy playbook? Existing trade records with this strategy tag will not be deleted, but the playbook rules checklist will be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setStrategyToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteStrategy}
              >
                Delete Strategy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

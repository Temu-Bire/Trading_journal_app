"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Plus,
  Calendar,
  Tag,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Flame,
  Target,
  Edit,
  Trash2,
  X,
  Eye,
  Info,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";
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
  IJournalEntry,
  getJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
} from "@/lib/journal";
import { getStrategies, IStrategy } from "@/lib/strategies";
import { formatCurrency, formatDate, formatDateTime, cn } from "@/lib/utils";
import type { ITrade } from "@/types";

const EMOTIONS = [
  { name: "Disciplined", icon: Target, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { name: "Confident", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  { name: "Anxious", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { name: "FOMO", icon: Flame, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { name: "Revenge", icon: XCircle, color: "text-red-600 bg-red-600/10 border-red-600/20" },
  { name: "Impatient", icon: Clock, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  { name: "Neutral", icon: Minus, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
] as const;

export default function JournalPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [trades, setTrades] = useState<ITrade[]>([]);
  const [strategies, setStrategies] = useState<IStrategy[]>([]);
  const [journalEntries, setJournalEntries] = useState<IJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");

  // Modals
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [selectedEntryToEdit, setSelectedEntryToEdit] = useState<IJournalEntry | null>(null);
  const [viewEntryModalOpen, setViewEntryModalOpen] = useState(false);
  const [activeViewEntry, setActiveViewEntry] = useState<IJournalEntry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<IJournalEntry | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formTradeId, setFormTradeId] = useState<string>("none");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formStrategy, setFormStrategy] = useState("");
  const [formEmotion, setFormEmotion] = useState<IJournalEntry["emotion"]>("Disciplined");
  const [formPlanFollowed, setFormPlanFollowed] = useState(true);
  const [formNotes, setFormNotes] = useState("");
  const [formLessons, setFormLessons] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ITrade[]>("/trades", { limit: 200 });
      if (res.success && res.data) {
        setTrades(res.data);
      }
    } catch {
      // Continue if backend unreachable
    } finally {
      const stored = getJournalEntries(user?.id);
      setJournalEntries(stored);
      setStrategies(getStrategies(user?.id));
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map of trades for quick lookup
  const tradeMap = useMemo(() => {
    const map = new Map<string, ITrade>();
    trades.forEach((t) => map.set(t._id, t));
    return map;
  }, [trades]);

  // Filtered Journal Entries
  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      if (emotionFilter !== "all" && entry.emotion !== emotionFilter) {
        return false;
      }
      if (planFilter === "followed" && !entry.planFollowed) {
        return false;
      }
      if (planFilter === "broken" && entry.planFollowed) {
        return false;
      }
      if (strategyFilter !== "all") {
        const entryStrat = entry.strategy || tradeMap.get(entry.tradeId || "")?.strategy;
        if (entryStrat?.toLowerCase() !== strategyFilter.toLowerCase()) {
          return false;
        }
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = entry.title.toLowerCase().includes(q);
        const matchNotes = entry.notes.toLowerCase().includes(q);
        const matchLessons = entry.lessonsLearned?.toLowerCase().includes(q);
        const matchSymbol = entry.symbol?.toLowerCase().includes(q);
        const matchTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchNotes && !matchLessons && !matchSymbol && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [journalEntries, emotionFilter, planFilter, strategyFilter, search, tradeMap]);

  // Statistics for Review Banner
  const reviewStats = useMemo(() => {
    const total = journalEntries.length;
    if (total === 0) {
      return { total: 0, disciplineRate: 0, dominantEmotion: "None", tradeCount: 0 };
    }

    const followedCount = journalEntries.filter((e) => e.planFollowed).length;
    const disciplineRate = Math.round((followedCount / total) * 100);

    const emotionCounts: Record<string, number> = {};
    journalEntries.forEach((e) => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    });

    let topEmotion = "Disciplined";
    let maxCount = 0;
    Object.entries(emotionCounts).forEach(([emo, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topEmotion = emo;
      }
    });

    const tradeCount = journalEntries.filter((e) => e.tradeId).length;

    return {
      total,
      disciplineRate,
      dominantEmotion: topEmotion,
      tradeCount,
    };
  }, [journalEntries]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setSelectedEntryToEdit(null);
    setFormTitle("");
    setFormTradeId("none");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormStrategy("");
    setFormEmotion("Disciplined");
    setFormPlanFollowed(true);
    setFormNotes("");
    setFormLessons("");
    setFormTags("");
    setEntryModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (entry: IJournalEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedEntryToEdit(entry);
    setFormTitle(entry.title);
    setFormTradeId(entry.tradeId || "none");
    setFormDate(entry.date ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setFormStrategy(entry.strategy || "");
    setFormEmotion(entry.emotion);
    setFormPlanFollowed(entry.planFollowed);
    setFormNotes(entry.notes);
    setFormLessons(entry.lessonsLearned || "");
    setFormTags(entry.tags ? entry.tags.join(", ") : "");
    setEntryModalOpen(true);
  };

  // Open View Modal
  const handleOpenView = (entry: IJournalEntry) => {
    setActiveViewEntry(entry);
    setViewEntryModalOpen(true);
  };

  // Save Entry Handler
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      error("Title is required.");
      return;
    }
    if (!formNotes.trim()) {
      error("Please write your journal reflections or notes.");
      return;
    }

    setFormSubmitting(true);
    try {
      const associatedTrade = formTradeId !== "none" ? tradeMap.get(formTradeId) : null;
      const finalSymbol = associatedTrade ? associatedTrade.symbol : undefined;
      const finalStrategy = formStrategy.trim() || associatedTrade?.strategy || undefined;

      const tags = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const saved = saveJournalEntry(
        {
          id: selectedEntryToEdit?.id,
          title: formTitle.trim(),
          tradeId: formTradeId !== "none" ? formTradeId : undefined,
          symbol: finalSymbol,
          strategy: finalStrategy,
          date: new Date(formDate).toISOString(),
          emotion: formEmotion,
          planFollowed: formPlanFollowed,
          notes: formNotes.trim(),
          lessonsLearned: formLessons.trim(),
          tags,
        },
        user?.id
      );

      // If linked to an existing trade, sync notes with backend trade record!
      if (associatedTrade) {
        try {
          await apiClient.put(`/trades/${associatedTrade._id}`, {
            notes: formNotes.trim(),
            ...(finalStrategy ? { strategy: finalStrategy } : {}),
          });
        } catch {
          // If update fails silently, local entry still saved
        }
      }

      const updated = getJournalEntries(user?.id);
      setJournalEntries(updated);
      setEntryModalOpen(false);
      success(
        selectedEntryToEdit ? "Journal entry updated!" : "Journal entry recorded!"
      );
    } catch {
      error("Failed to save journal entry.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Entry Handler
  const handleDeleteEntry = () => {
    if (!entryToDelete) return;
    const deleted = deleteJournalEntry(entryToDelete.id, user?.id);
    if (deleted) {
      const updated = getJournalEntries(user?.id);
      setJournalEntries(updated);
      setDeleteConfirmOpen(false);
      setEntryToDelete(null);
      if (activeViewEntry?.id === entryToDelete.id) {
        setViewEntryModalOpen(false);
        setActiveViewEntry(null);
      }
      success("Journal entry deleted.");
    } else {
      error("Could not delete entry.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Backend Integration Transparency Banner */}
      <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-foreground">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <span>
            <strong>Dual Persistence:</strong> Notes linked to trades sync directly into your Express MongoDB trade model. Structured psychology, discipline tags, and session reflections are saved to your workspace.
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary flex-shrink-0">
          Sync Active
        </Badge>
      </div>

      {/* Header and New Entry CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Trading Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review your decisions, emotions, mistakes, and lessons from every trading session.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="shadow-xs self-start sm:self-auto"
        >
          New Journal Entry
        </Button>
      </div>

      {/* Process & Discipline Review Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase">Total Entries</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {reviewStats.total}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {reviewStats.tradeCount} linked to trades
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase">Plan Discipline</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {reviewStats.disciplineRate}%
          </p>
          <span className="text-[10px] text-muted-foreground">
            Adhered to trading rules
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase">Dominant State</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-foreground mt-1 truncate">
            {reviewStats.dominantEmotion}
          </p>
          <span className="text-[10px] text-muted-foreground">
            Most frequent mindset
          </span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-semibold uppercase">Playbooks Logged</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-1">
            {new Set(journalEntries.map((e) => e.strategy).filter(Boolean)).size}
          </p>
          <span className="text-[10px] text-muted-foreground">
            Distinct strategies reviewed
          </span>
        </Card>
      </div>

      {/* Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, reflections, lessons, or symbols..."
            className="pl-9 h-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
            className="w-36 h-10 text-xs rounded-xl"
            options={[
              { value: "all", label: "All Mindsets" },
              { value: "Disciplined", label: "Disciplined" },
              { value: "Confident", label: "Confident" },
              { value: "Anxious", label: "Anxious" },
              { value: "FOMO", label: "FOMO" },
              { value: "Revenge", label: "Revenge" },
              { value: "Impatient", label: "Impatient" },
              { value: "Neutral", label: "Neutral" },
            ]}
          />

          <Select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-32 h-10 text-xs rounded-xl"
            options={[
              { value: "all", label: "All Plans" },
              { value: "followed", label: "Plan Followed" },
              { value: "broken", label: "Plan Broken" },
            ]}
          />
        </div>
      </div>

      {/* Journal Feed Cards / Timeline */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          title="No journal entries found"
          description={
            search || emotionFilter !== "all" || planFilter !== "all"
              ? "No entries match your search and filter criteria."
              : "Start recording your thoughts, psychology, and lessons learned from trading."
          }
          actionLabel="Record First Journal Entry"
          onAction={handleOpenCreate}
          icon={<BookOpen className="w-12 h-12 text-muted-foreground/40" />}
        />
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const trade = entry.tradeId ? tradeMap.get(entry.tradeId) : null;
            const net = trade ? trade.pnlNet ?? trade.pnlGross : undefined;
            const isWin = net !== undefined && net > 0;
            const isLoss = net !== undefined && net < 0;
            const isBreakeven = net !== undefined && net === 0;

            const emotionMeta =
              EMOTIONS.find((e) => e.name === entry.emotion) || EMOTIONS[0];
            const EmotionIcon = emotionMeta.icon;

            return (
              <Card
                key={entry.id}
                className="p-5 sm:p-6 hover:border-border/80 transition-all hover:shadow-xs space-y-4 cursor-pointer"
                onClick={() => handleOpenView(entry)}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-border/70">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-foreground hover:text-primary transition-colors">
                        {entry.title}
                      </h3>
                      {entry.symbol && (
                        <Badge variant="outline" className="text-xs uppercase font-bold">
                          {entry.symbol}
                        </Badge>
                      )}
                      {entry.strategy && (
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {entry.strategy}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(entry.date)}
                      </span>

                      {/* Emotion Badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                          emotionMeta.color
                        )}
                      >
                        <EmotionIcon className="w-3 h-3" />
                        {entry.emotion}
                      </span>

                      {/* Plan Followed Badge (Clear distinction with text & icon) */}
                      {entry.planFollowed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Plan Followed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          Plan Broken
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial outcome badge - Not relying on color alone */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 flex-shrink-0">
                    {trade ? (
                      <div className="text-right">
                        {isWin && (
                          <div className="flex items-center gap-1 text-profit font-bold text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>WIN: +{formatCurrency(net)}</span>
                          </div>
                        )}
                        {isLoss && (
                          <div className="flex items-center gap-1 text-loss font-bold text-sm">
                            <TrendingDown className="w-4 h-4" />
                            <span>LOSS: {formatCurrency(net)}</span>
                          </div>
                        )}
                        {isBreakeven && (
                          <div className="flex items-center gap-1 text-muted-foreground font-bold text-sm">
                            <Minus className="w-4 h-4" />
                            <span>BREAKEVEN: $0.00</span>
                          </div>
                        )}
                        {trade.status === "open" && (
                          <Badge variant="warning" className="text-[10px]">
                            Position Open
                          </Badge>
                        )}
                        {trade.rMultiple !== undefined && trade.rMultiple !== null && (
                          <span className="text-[10px] text-muted-foreground block">
                            Realized {trade.rMultiple.toFixed(2)}R
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                        Session Reflection
                      </Badge>
                    )}

                    {/* Quick action buttons */}
                    <div
                      className="flex items-center gap-1 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleOpenEdit(entry, e)}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
                        title="Edit entry"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntryToDelete(entry);
                          setDeleteConfirmOpen(true);
                        }}
                        className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-loss text-xs"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body Notes */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">
                    {entry.notes}
                  </p>

                  {/* Lessons Learned highlight box */}
                  {entry.lessonsLearned && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground uppercase tracking-wide text-[10px] block">
                          Key Lesson / Mistake Identified:
                        </span>
                        <span className="text-muted-foreground leading-relaxed mt-0.5 block">
                          {entry.lessonsLearned}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Journal Entry Modal */}
      {entryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card text-foreground rounded-2xl border border-border p-6 max-w-xl w-full shadow-dropdown space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {selectedEntryToEdit ? "Edit Journal Entry" : "New Journal Entry"}
              </h3>
              <button
                onClick={() => setEntryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <Input
                label="Entry Title *"
                placeholder="e.g. Clean patience on London Open FVG or Daily Pre-Market Plan"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Link to Recorded Trade (optional)
                  </label>
                  <select
                    value={formTradeId}
                    onChange={(e) => setFormTradeId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="none">None (Session / Standalone Log)</option>
                    {trades.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.symbol} ({t.direction.toUpperCase()}) — {formatDate(t.entryAt)} (
                        {t.status === "open"
                          ? "Open"
                          : t.pnlNet !== undefined
                          ? formatCurrency(t.pnlNet)
                          : "Closed"}
                        )
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Date *"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Strategy Playbook"
                    placeholder="e.g. Order Block & FVG Retest"
                    list="journal-strategies-list"
                    value={formStrategy}
                    onChange={(e) => setFormStrategy(e.target.value)}
                  />
                  <datalist id="journal-strategies-list">
                    {strategies.map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                    Emotional Mindset
                  </label>
                  <select
                    value={formEmotion}
                    onChange={(e) =>
                      setFormEmotion(e.target.value as IJournalEntry["emotion"])
                    }
                    className="w-full h-10 rounded-xl border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {EMOTIONS.map((emo) => (
                      <option key={emo.name} value={emo.name}>
                        {emo.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trading Plan Adherence Toggle */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Did you strictly follow your trading plan?
                </label>
                <div className="grid grid-cols-2 gap-3 h-10 p-1 bg-muted rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormPlanFollowed(true)}
                    className={cn(
                      "rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                      formPlanFollowed
                        ? "bg-profit text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Yes, Followed Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPlanFollowed(false)}
                    className={cn(
                      "rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                      !formPlanFollowed
                        ? "bg-loss text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    No, Deviated / Broke Rule
                  </button>
                </div>
              </div>

              {/* Notes & Reflections */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Journal Reflections & Market Context *
                </label>
                <textarea
                  rows={4}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Record your market context, setup confirmation, execution thoughts, and emotional triggers..."
                  required
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                />
              </div>

              {/* Lessons Learned */}
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Lessons Learned & Mistakes to Avoid
                </label>
                <textarea
                  rows={2}
                  value={formLessons}
                  onChange={(e) => setFormLessons(e.target.value)}
                  placeholder="What is the key takeaway? What will you do differently next session?"
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                />
              </div>

              {/* Tags */}
              <Input
                label="Tags (comma-separated)"
                placeholder="e.g. SMC, FOMO, LondonOpen, Disciplined"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEntryModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={formSubmitting}
                >
                  {selectedEntryToEdit ? "Save Changes" : "Save Journal Entry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full View Entry Modal */}
      {viewEntryModalOpen && activeViewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card text-foreground rounded-2xl border border-border p-6 max-w-xl w-full shadow-dropdown space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground">
                    {activeViewEntry.title}
                  </h3>
                  {activeViewEntry.symbol && (
                    <Badge variant="outline" className="text-xs uppercase font-bold">
                      {activeViewEntry.symbol}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Logged on {formatDate(activeViewEntry.date)}
                </p>
              </div>
              <button
                onClick={() => setViewEntryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border bg-muted/40">
                Mindset: <strong>{activeViewEntry.emotion}</strong>
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border bg-muted/40">
                Plan Followed:{" "}
                <strong
                  className={
                    activeViewEntry.planFollowed ? "text-profit" : "text-loss"
                  }
                >
                  {activeViewEntry.planFollowed ? "Yes" : "No"}
                </strong>
              </span>
              {activeViewEntry.strategy && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-border bg-muted/40">
                  Strategy: <strong>{activeViewEntry.strategy}</strong>
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Notes & Psychological Context:
              </h4>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {activeViewEntry.notes}
              </div>
            </div>

            {activeViewEntry.lessonsLearned && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Lessons Learned & Takeaways:
                </h4>
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs sm:text-sm text-foreground">
                  {activeViewEntry.lessonsLearned}
                </div>
              </div>
            )}

            {activeViewEntry.tradeId && tradeMap.get(activeViewEntry.tradeId) && (
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Linked Position Record:</span>
                <Link
                  href={`/trades/${activeViewEntry.tradeId}`}
                  className="font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  View Trade Details <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewEntryModalOpen(false);
                  handleOpenEdit(activeViewEntry);
                }}
              >
                Edit Entry
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setViewEntryModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Entry Confirmation Modal */}
      {deleteConfirmOpen && entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card text-foreground rounded-2xl border border-border p-6 max-w-sm w-full shadow-dropdown space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Delete Journal Entry?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete &ldquo;{entryToDelete.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setEntryToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteEntry}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

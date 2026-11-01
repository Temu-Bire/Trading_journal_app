"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  Mic,
  Square,
  Volume2,
  Image as ImageIcon,
  Camera,
  UploadCloud,
  Play,
  Pause,
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
import { useAudioRecorder } from "@/lib/audio-recorder";
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
  const [strategies, setStrategies] = useState<IStrategy[]>(() => {
    return typeof window !== "undefined" ? getStrategies() : [];
  });
  const [journalEntries, setJournalEntries] = useState<IJournalEntry[]>(() => {
    return typeof window !== "undefined" ? getJournalEntries() : [];
  });
  const [loading, setLoading] = useState(false);

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
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formTradeId, setFormTradeId] = useState<string>("none");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formStrategy, setFormStrategy] = useState("");
  const [formSession, setFormSession] = useState<IJournalEntry["session"]>("London");
  const [formEmotion, setFormEmotion] = useState<IJournalEntry["emotion"]>("Disciplined");
  const [formPlanFollowed, setFormPlanFollowed] = useState(true);
  const [formNotes, setFormNotes] = useState("");
  const [formLessons, setFormLessons] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formAudioUrl, setFormAudioUrl] = useState<string | undefined>(undefined);
  const [formAudioDuration, setFormAudioDuration] = useState<number | undefined>(undefined);
  const [formImageUrl, setFormImageUrl] = useState<string | undefined>(undefined);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Voice recording hook
  const {
    isRecording,
    recordingTime,
    audioResult,
    recorderError,
    startRecording,
    stopRecording,
    clearAudio,
  } = useAudioRecorder();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync recorder result to form
  useEffect(() => {
    if (audioResult) {
      setFormAudioUrl(audioResult.dataUrl);
      setFormAudioDuration(audioResult.durationSeconds);
    }
  }, [audioResult]);

  // Clean old demo entries from previous storage keys once
  useEffect(() => {
    if (typeof window !== "undefined") {
      const oldKeys = ["tj_journal_entries_default", "tj_journal_entries_demo-trader-01", "tj_journal_entries_demo-trader-001"];
      oldKeys.forEach((k) => localStorage.removeItem(k));
    }
  }, []);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      const res = await apiClient.get<ITrade[]>("/trades", { limit: 200 });
      if (res.success && res.data) {
        setTrades(res.data);
      }
    } catch {
      // Offline mode fallback
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

  // Handle Clipboard Image Paste in New Journal Modal
  const handlePasteImage = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormImageUrl(reader.result as string);
            success("Chart screenshot pasted successfully!");
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, [success]);

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
    setFormSession("London");
    setFormEmotion("Disciplined");
    setFormPlanFollowed(true);
    setFormNotes("");
    setFormLessons("");
    setFormTags("");
    setFormAudioUrl(undefined);
    setFormAudioDuration(undefined);
    setFormImageUrl(undefined);
    clearAudio();
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
    setFormSession(entry.session || "London");
    setFormEmotion(entry.emotion);
    setFormPlanFollowed(entry.planFollowed);
    setFormNotes(entry.notes);
    setFormLessons(entry.lessonsLearned || "");
    setFormTags(entry.tags ? entry.tags.join(", ") : "");
    setFormAudioUrl(entry.audioUrl);
    setFormAudioDuration(entry.audioDuration);
    setFormImageUrl(entry.imageUrl);
    clearAudio();
    setEntryModalOpen(true);
  };

  // Open View Modal
  const handleOpenView = (entry: IJournalEntry) => {
    setActiveViewEntry(entry);
    setViewEntryModalOpen(true);
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImageUrl(reader.result as string);
      success("Chart screenshot attached!");
    };
    reader.readAsDataURL(file);
  };

  // Save / Update Entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      error("Please enter a title for this journal entry.");
      return;
    }
    if (!formNotes.trim() && !formAudioUrl) {
      error("Please write your notes or record a voice reflection.");
      return;
    }

    setFormSubmitting(true);
    try {
      const tagsArray = formTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const linkedTrade = formTradeId !== "none" ? tradeMap.get(formTradeId) : null;

      const payload = {
        id: selectedEntryToEdit ? selectedEntryToEdit.id : undefined,
        title: formTitle.trim(),
        tradeId: formTradeId !== "none" ? formTradeId : undefined,
        symbol: linkedTrade?.symbol || undefined,
        strategy: formStrategy.trim() || linkedTrade?.strategy || undefined,
        session: formSession,
        date: formDate,
        emotion: formEmotion,
        planFollowed: formPlanFollowed,
        notes: formNotes.trim(),
        lessonsLearned: formLessons.trim() || undefined,
        tags: tagsArray,
        audioUrl: formAudioUrl,
        audioDuration: formAudioDuration,
        imageUrl: formImageUrl,
      };

      const saved = saveJournalEntry(payload, user?.id);

      // Refresh list
      setJournalEntries(getJournalEntries(user?.id));
      setEntryModalOpen(false);
      clearAudio();
      success(selectedEntryToEdit ? "Journal entry updated!" : "Journal entry saved successfully!");
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to save journal entry.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Entry
  const handleDeleteEntry = () => {
    if (!entryToDelete) return;
    const deleted = deleteJournalEntry(entryToDelete.id, user?.id);
    if (deleted) {
      setJournalEntries(getJournalEntries(user?.id));
      success("Journal entry deleted.");
    } else {
      error("Could not delete journal entry.");
    }
    setDeleteConfirmOpen(false);
    setEntryToDelete(null);
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 animate-fade-in" onPaste={entryModalOpen ? handlePasteImage : undefined}>
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Trading Journal
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50">
              Voice & Screenshot Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review decisions, record voice memos, attach TradingView charts, and track psychological discipline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            className="shadow-md font-bold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl"
            onClick={handleOpenCreate}
          >
            <Plus className="w-4 h-4" />
            New Journal Entry
          </Button>
        </div>
      </div>

      {/* 2. Review Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Entries</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {reviewStats.total}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            {reviewStats.tradeCount} linked to live trades
          </span>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Plan Discipline</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {reviewStats.disciplineRate}%
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            Adhered to trading rules
          </span>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Dominant State</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 truncate">
            {reviewStats.dominantEmotion}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            Most frequent mindset
          </span>
        </Card>

        <Card className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-300 dark:border-white/10 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_28px_-4px_rgba(15,23,42,0.09)] transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Playbooks Logged</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {new Set(journalEntries.map((e) => e.strategy).filter(Boolean)).size}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">
            Distinct strategies reviewed
          </span>
        </Card>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search journal entries by title, notes, pair, or tags..."
            className="pl-10 h-11 rounded-2xl text-xs font-semibold bg-white dark:bg-[#0f1422] border-2 border-slate-300 dark:border-slate-700 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
            className="w-36 h-11 text-xs rounded-2xl bg-white dark:bg-[#0f1422]"
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
            className="w-34 h-11 text-xs rounded-2xl bg-white dark:bg-[#0f1422]"
            options={[
              { value: "all", label: "All Plans" },
              { value: "followed", label: "Plan Followed" },
              { value: "broken", label: "Plan Broken" },
            ]}
          />
        </div>
      </div>

      {/* 4. Journal Feed Cards */}
      {filteredEntries.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white dark:bg-[#0f1422] border border-slate-200/90 dark:border-white/[0.08] text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {search || emotionFilter !== "all"
                ? "No matching journal entries"
                : "Your Trading Journal is Fresh & Ready"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {search || emotionFilter !== "all"
                ? "No entries match your search filter. Clear filters or add a new entry."
                : "Record voice notes after your London or NY session, upload chart screenshots, and reflect on what worked and what to improve."}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
            className="font-bold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Your First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const trade = entry.tradeId ? tradeMap.get(entry.tradeId) : null;
            const net = trade ? trade.pnlNet ?? trade.profitLoss : undefined;
            const isWin = net !== undefined && net > 0;
            const isLoss = net !== undefined && net < 0;

            const emotionMeta =
              EMOTIONS.find((e) => e.name === entry.emotion) || EMOTIONS[0];
            const EmotionIcon = emotionMeta.icon;

            return (
              <Card
                key={entry.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0f1422] border-slate-200/90 dark:border-white/[0.08] hover:shadow-md transition-all space-y-4 cursor-pointer"
                onClick={() => handleOpenView(entry)}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                        {entry.title}
                      </h3>
                      {entry.symbol && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 uppercase">
                          {entry.symbol}
                        </span>
                      )}
                      {entry.session && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200/40">
                          {entry.session} Session
                        </span>
                      )}
                      {entry.strategy && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200/40">
                          {entry.strategy}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
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

                      {/* Plan Followed */}
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

                  {/* Actions & Outcome */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0">
                    {trade ? (
                      <div className="text-right">
                        {isWin && (
                          <span className="font-extrabold text-emerald-600 text-sm">
                            +{formatCurrency(net)}
                          </span>
                        )}
                        {isLoss && (
                          <span className="font-extrabold text-rose-600 text-sm">
                            {formatCurrency(net)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                        Session Reflection
                      </span>
                    )}

                    <div
                      className="flex items-center gap-2 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleOpenEdit(entry, e)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                        title="Edit entry"
                      >
                        <Edit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntryToDelete(entry);
                          setDeleteConfirmOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Voice Note Player if Present */}
                {entry.audioUrl && (
                  <div
                    className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                        <span>Voice Reflection Memo</span>
                        {entry.audioDuration && (
                          <span className="text-[11px] text-slate-500">
                            {formatAudioTime(entry.audioDuration)}
                          </span>
                        )}
                      </div>
                      <audio src={entry.audioUrl} controls className="w-full h-8 rounded-lg" />
                    </div>
                  </div>
                )}

                {/* Chart Screenshot if Present */}
                {entry.imageUrl && (
                  <div
                    className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 group max-h-48 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewZoomImage(entry.imageUrl!);
                    }}
                  >
                    <img
                      src={entry.imageUrl}
                      alt="TradingView Chart Screenshot"
                      className="w-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye className="w-4 h-4" /> Click to Zoom Chart
                    </div>
                  </div>
                )}

                {/* Notes Text */}
                <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <p>{entry.notes}</p>

                  {entry.lessonsLearned && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] text-xs flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] block">
                          Key Lesson / Rule Takeaway:
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 mt-0.5 block leading-relaxed">
                          {entry.lessonsLearned}
                        </span>
                      </div>
                    </div>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-[10px] font-medium text-slate-600 dark:text-slate-400"
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

      {/* 5. Create / Edit Journal Entry Modal */}
      {entryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-6 sm:pt-10 pb-10 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => setEntryModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0f1422] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/10 p-6 max-w-xl w-full shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedEntryToEdit ? "Edit Journal Entry" : "New Trade Journal Entry"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record your session notes, speak a voice reflection, or paste a chart screenshot.
                </p>
              </div>
              <button
                onClick={() => setEntryModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <Input
                label="Entry Title *"
                placeholder="e.g. London Session EURUSD Breakout Review"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Session
                  </label>
                  <select
                    value={formSession}
                    onChange={(e) => setFormSession(e.target.value as any)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="London">London Session</option>
                    <option value="New York">New York Session</option>
                    <option value="Asian">Asian Session</option>
                    <option value="Sydney">Sydney Session</option>
                    <option value="Other">General / Weekend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Emotional State
                  </label>
                  <select
                    value={formEmotion}
                    onChange={(e) => setFormEmotion(e.target.value as any)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] px-3 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {EMOTIONS.map((emo) => (
                      <option key={emo.name} value={emo.name}>
                        {emo.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Voice Memo Recording Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Voice Note Recording
                    </span>
                  </div>
                  {isRecording && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                      Recording {formatAudioTime(recordingTime)}
                    </span>
                  )}
                </div>

                {recorderError && (
                  <p className="text-[11px] text-rose-600 font-medium">{recorderError}</p>
                )}

                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={startRecording}
                      className="text-xs font-bold gap-1.5 border-indigo-300 text-indigo-700 dark:text-indigo-300"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {formAudioUrl ? "Re-record Voice Memo" : "Record Voice Reflection"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={stopRecording}
                      className="text-xs font-bold gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Stop Recording ({formatAudioTime(recordingTime)})
                    </Button>
                  )}

                  {formAudioUrl && !isRecording && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormAudioUrl(undefined);
                        setFormAudioDuration(undefined);
                        clearAudio();
                      }}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600"
                    >
                      Remove Audio
                    </button>
                  )}
                </div>

                {formAudioUrl && (
                  <div className="pt-2">
                    <audio src={formAudioUrl} controls className="w-full h-8 rounded-lg" />
                  </div>
                )}
              </div>

              {/* Screenshot & Camera Upload Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Chart Screenshot / Photo
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    (Tip: You can press Ctrl+V to paste chart)
                  </span>
                </div>

                {formImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 max-h-40">
                    <img src={formImageUrl} alt="Chart screenshot preview" className="w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImageUrl(undefined)}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/20 text-center hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Click to upload chart screenshot, or paste image with Ctrl+V
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WebP</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Plan Followed */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Did you adhere to your trading rules?
                </label>
                <div className="grid grid-cols-2 gap-3 h-10 p-1 bg-slate-100 dark:bg-white/[0.06] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormPlanFollowed(true)}
                    className={cn(
                      "rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      formPlanFollowed
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Yes, Followed Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPlanFollowed(false)}
                    className={cn(
                      "rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                      !formPlanFollowed
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    No, Deviated / Tilted
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Session Notes & Execution Reflection *
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="What was the market doing? What setup triggered entry? What emotions did you feel?"
                  required={!formAudioUrl}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] p-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Lessons Learned */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Key Lesson / Mistake Identified (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formLessons}
                  onChange={(e) => setFormLessons(e.target.value)}
                  placeholder="e.g. Wait for 15m candle closure before entering. Cut losses immediately."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#151c2e] p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
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
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {selectedEntryToEdit ? "Update Entry" : "Save Journal Entry"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Chart Zoom Modal */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-fade-in"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={previewZoomImage} alt="Enlarged chart" className="rounded-2xl max-h-[85vh] object-contain shadow-2xl" />
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

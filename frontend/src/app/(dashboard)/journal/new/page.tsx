"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Target, TrendingUp, AlertTriangle, Flame, Clock, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { apiClient } from "@/lib/api/client";
import { saveJournalEntry, type IJournalEntry } from "@/lib/journal";
import { getStrategies, type IStrategy } from "@/lib/strategies";
import { formatDate, cn } from "@/lib/utils";
import type { ITrade } from "@/types";

const EMOTIONS = [
  { name: "Disciplined", icon: Target },
  { name: "Confident", icon: TrendingUp },
  { name: "Anxious", icon: AlertTriangle },
  { name: "FOMO", icon: Flame },
  { name: "Revenge", icon: XCircle },
  { name: "Impatient", icon: Clock },
  { name: "Neutral", icon: Minus },
] as const;

export default function CreateJournalEntryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();

  const [trades, setTrades] = useState<ITrade[]>([]);
  const [strategies, setStrategies] = useState<IStrategy[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formTradeId, setFormTradeId] = useState<string>("none");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formStrategy, setFormStrategy] = useState("");
  const [formEmotion, setFormEmotion] = useState<IJournalEntry["emotion"]>("Disciplined");
  const [formPlanFollowed, setFormPlanFollowed] = useState(true);
  const [formNotes, setFormNotes] = useState("");
  const [formLessons, setFormLessons] = useState("");
  const [formTags, setFormTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setStrategies(getStrategies(user?.id));
    apiClient.get<ITrade[]>("/trades", { limit: 100 })
      .then((res) => {
        if (res.success && res.data) {
          setTrades(res.data);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      error("Title is required.");
      return;
    }
    if (!formNotes.trim()) {
      error("Please write your journal reflections or notes.");
      return;
    }

    setSubmitting(true);
    try {
      const associatedTrade =
        formTradeId !== "none" ? trades.find((t) => t._id === formTradeId) : undefined;

      const tagsArray = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      saveJournalEntry(
        {
          tradeId: formTradeId !== "none" ? formTradeId : undefined,
          date: new Date(formDate).toISOString(),
          title: formTitle.trim(),
          emotion: formEmotion,
          planFollowed: formPlanFollowed,
          notes: formNotes.trim(),
          lessonsLearned: formLessons.trim() || undefined,
          tags: tagsArray,
          strategy: formStrategy.trim() || associatedTrade?.strategy || undefined,
          symbol: associatedTrade?.symbol,
        },
        user?.id
      );

      // Sync note into backend trade model if trade is linked
      if (associatedTrade) {
        apiClient.put(`/trades/${associatedTrade._id}`, {
          notes: formNotes.trim(),
        }).catch(() => {});
      }

      success("Journal entry logged successfully!");
      router.push("/journal");
    } catch {
      error("Failed to save journal entry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Journal
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="pb-6 border-b border-border">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            New Journal Entry
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Record your session reflections, emotional state, execution notes, and key lessons.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <Input
            label="Entry Title *"
            placeholder="e.g. London Session Review"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Linked Trade (Optional)
              </label>
              <select
                value={formTradeId}
                onChange={(e) => setFormTradeId(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-card px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              >
                <option value="none">None (General Session)</option>
                {trades.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.symbol} ({t.direction.toUpperCase()}) — {formatDate(t.entryAt)}
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
                label="Strategy (Optional)"
                placeholder="e.g. Trend Breakout"
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
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Mindset & Emotion
              </label>
              <select
                value={formEmotion}
                onChange={(e) =>
                  setFormEmotion(e.target.value as IJournalEntry["emotion"])
                }
                className="w-full h-10 rounded-xl border border-input bg-card px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
              >
                {EMOTIONS.map((emo) => (
                  <option key={emo.name} value={emo.name}>
                    {emo.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trading Plan Adherence */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Did you follow your trading plan?
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
                No, Deviated
              </button>
            </div>
          </div>

          {/* Notes & Reflections */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Session Notes & Reflections *
            </label>
            <textarea
              rows={4}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="What happened during this trade or session? How did you execute?"
              required
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>

          {/* Lessons Learned */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Lessons Learned (Optional)
            </label>
            <textarea
              rows={2}
              value={formLessons}
              onChange={(e) => setFormLessons(e.target.value)}
              placeholder="Key takeaway or what to do next time..."
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
            />
          </div>

          <Input
            label="Tags (Optional)"
            placeholder="e.g. disciplined, patient, pullback"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Link href="/journal">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Entry
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

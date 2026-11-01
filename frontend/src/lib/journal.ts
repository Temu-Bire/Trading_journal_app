import type { ITrade } from "@/types";

export interface IJournalEntry {
  id: string;
  userId?: string;
  title: string;
  tradeId?: string;
  date: string;
  symbol?: string;
  strategy?: string;
  session?: "London" | "New York" | "Asian" | "Sydney" | "Other";
  emotion:
    | "Disciplined"
    | "Confident"
    | "Anxious"
    | "FOMO"
    | "Revenge"
    | "Impatient"
    | "Neutral";
  planFollowed: boolean;
  notes: string;
  lessonsLearned?: string;
  tags: string[];
  // Multimedia attachments for real retail trader workflows
  audioUrl?: string; // Voice memo base64 or audio blob URL
  audioDuration?: number; // duration in seconds
  imageUrl?: string; // Chart screenshot base64 or file preview URL
  createdAt: string;
  updatedAt: string;
}

function getStorageKey(userId?: string) {
  return `tj_real_journal_entries_${userId || "default"}`;
}

export function getJournalEntries(userId?: string): IJournalEntry[] {
  if (typeof window === "undefined") return [];

  const key = getStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Start completely fresh with zero fake demo entries
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read journal entries from localStorage", err);
    return [];
  }
}

export function saveJournalEntry(
  data: Omit<IJournalEntry, "id" | "createdAt" | "updatedAt"> & { id?: string },
  userId?: string
): IJournalEntry {
  const entries = getJournalEntries(userId);
  const now = new Date().toISOString();

  if (data.id) {
    const index = entries.findIndex((e) => e.id === data.id);
    if (index !== -1) {
      const updated: IJournalEntry = {
        ...entries[index],
        ...data,
        updatedAt: now,
      };
      entries[index] = updated;
      if (typeof window !== "undefined") {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(entries));
      }
      return updated;
    }
  }

  const newEntry: IJournalEntry = {
    ...data,
    id: `jnl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const updatedEntries = [newEntry, ...entries];
  if (typeof window !== "undefined") {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(updatedEntries));
  }

  return newEntry;
}

export function deleteJournalEntry(id: string, userId?: string): boolean {
  const entries = getJournalEntries(userId);
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length !== entries.length) {
    if (typeof window !== "undefined") {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    }
    return true;
  }
  return false;
}

export function clearAllJournalEntries(userId?: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(getStorageKey(userId));
  }
}

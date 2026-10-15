import type { ITrade } from "@/types";

export interface IJournalEntry {
  id: string;
  userId?: string;
  title: string;
  tradeId?: string;
  date: string;
  symbol?: string;
  strategy?: string;
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
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_JOURNAL_ENTRIES: Omit<IJournalEntry, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Disciplined execution on London Open breakout",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    symbol: "EURUSD",
    strategy: "Order Block & FVG Retest",
    emotion: "Disciplined",
    planFollowed: true,
    notes:
      "Waited patiently for Asian range liquidity to be swept before London session open. When 15m MSS occurred with clean displacement, placed limit at 50% FVG. Executed without hesitation.",
    lessonsLearned:
      "Patience pays off. Avoid entering during the first 10 minutes of session volatility until the sweep completes.",
    tags: ["Forex", "SMC", "LondonSession", "Disciplined"],
  },
  {
    title: "Chased NVDA post-earnings move — Hesitation on initial entry",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    symbol: "NVDA",
    strategy: "Breakout & Trend Retest",
    emotion: "FOMO",
    planFollowed: false,
    notes:
      "Missed the primary pre-market consolidation break at $128.50. Felt anxiety watching price rally, and entered late near $132 with poor risk-reward.",
    lessonsLearned:
      "Never enter mid-expansion. If the primary entry trigger is missed, wait for a multi-hour consolidation retest or move on to the next chart.",
    tags: ["Equities", "FOMO", "Overextended"],
  },
  {
    title: "Weekly Trading Process & Psychological Review",
    date: new Date(Date.now() - 86400000 * 8).toISOString(),
    strategy: "Process Review",
    emotion: "Confident",
    planFollowed: true,
    notes:
      "Completed 8 recorded trades this week with a 62.5% win rate and 1.9 PF. Cut losing positions at designated stop-losses without manual intervention.",
    lessonsLearned:
      "Risk discipline kept max drawdown under 1.8% despite a volatile news calendar.",
    tags: ["WeeklyReview", "Psychology", "RiskDiscipline"],
  },
];

function getStorageKey(userId?: string) {
  return `tj_journal_entries_${userId || "default"}`;
}

export function getJournalEntries(userId?: string): IJournalEntry[] {
  if (typeof window === "undefined") return [];

  const key = getStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const seeded: IJournalEntry[] = DEFAULT_JOURNAL_ENTRIES.map((entry, idx) => ({
        ...entry,
        id: `jnl-${idx + 1}-${Date.now()}`,
        userId,
        createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
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
        id: data.id,
        updatedAt: now,
      };
      entries[index] = updated;
      localStorage.setItem(getStorageKey(userId), JSON.stringify(entries));
      return updated;
    }
  }

  const newEntry: IJournalEntry = {
    ...data,
    id: `jnl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  entries.unshift(newEntry);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(entries));
  return newEntry;
}

export function deleteJournalEntry(id: string, userId?: string): boolean {
  const entries = getJournalEntries(userId);
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length !== entries.length) {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    return true;
  }
  return false;
}

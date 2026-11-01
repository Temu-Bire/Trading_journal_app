export interface IStrategy {
  id: string;
  userId?: string;
  name: string;
  description: string;
  market: string;
  symbols?: string;
  entryRules: string[];
  exitRules: string[];
  riskRules: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

function getStorageKey(userId?: string) {
  return `tj_real_strategies_${userId || "default"}`;
}

export function getStrategies(userId?: string): IStrategy[] {
  if (typeof window === "undefined") return [];

  const key = getStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read strategies from localStorage", err);
    return [];
  }
}

export function saveStrategy(
  data: Omit<IStrategy, "id" | "createdAt" | "updatedAt"> & { id?: string },
  userId?: string
): IStrategy {
  const strategies = getStrategies(userId);
  const now = new Date().toISOString();

  if (data.id) {
    const index = strategies.findIndex((s) => s.id === data.id);
    if (index !== -1) {
      const updated: IStrategy = {
        ...strategies[index],
        ...data,
        id: data.id,
        updatedAt: now,
      };
      strategies[index] = updated;
      localStorage.setItem(getStorageKey(userId), JSON.stringify(strategies));
      return updated;
    }
  }

  const newStrategy: IStrategy = {
    ...data,
    id: `strat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newStrategy, ...strategies];
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  return newStrategy;
}

export function deleteStrategy(id: string, userId?: string): boolean {
  const strategies = getStrategies(userId);
  const filtered = strategies.filter((s) => s.id !== id);
  if (filtered.length !== strategies.length) {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
    return true;
  }
  return false;
}

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "lucidrepo_reading_history";
const MAX_ITEMS = 20;

interface ReadingHistoryItem {
  dreamId: string;
  viewedAt: number;
}

export function useReadingHistory() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = useCallback((dreamId: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.dreamId !== dreamId);
      const updated = [{ dreamId, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const recentIds = history.slice(0, 5).map((h) => h.dreamId);

  return { history, recentIds, addToHistory };
}

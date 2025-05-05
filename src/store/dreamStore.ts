
import { useState, useEffect } from "react";
import { DreamEntry, DreamTag, DreamStore } from "@/types/dream";

const STORAGE_KEY = "dreamweaver_journal";

const DEFAULT_TAGS: DreamTag[] = [
  { id: "nightmare", name: "Nightmare", color: "#ef4444" },
  { id: "lucid", name: "Lucid", color: "#3b82f6" },
  { id: "recurring", name: "Recurring", color: "#8b5cf6" },
  { id: "adventure", name: "Adventure", color: "#10b981" },
  { id: "spiritual", name: "Spiritual", color: "#f59e0b" },
  { id: "flying", name: "Flying", color: "#6366f1" },
  { id: "falling", name: "Falling", color: "#ec4899" },
  { id: "water", name: "Water", color: "#0ea5e9" },
];

const getInitialStore = (): DreamStore => {
  if (typeof window === "undefined") {
    return { entries: [], tags: DEFAULT_TAGS };
  }

  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) {
    return { entries: [], tags: DEFAULT_TAGS };
  }

  try {
    const parsedData = JSON.parse(storedData);
    return {
      entries: parsedData.entries || [],
      tags: parsedData.tags || DEFAULT_TAGS,
    };
  } catch (error) {
    console.error("Failed to parse dream journal data", error);
    return { entries: [], tags: DEFAULT_TAGS };
  }
};

export const useDreamStore = () => {
  const [store, setStore] = useState<DreamStore>(getInitialStore);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  }, [store]);

  const addEntry = (entry: Omit<DreamEntry, "id">) => {
    const newEntry: DreamEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };

    setStore((prev) => ({
      ...prev,
      entries: [newEntry, ...prev.entries],
    }));

    return newEntry;
  };

  const updateEntry = (id: string, updates: Partial<DreamEntry>) => {
    setStore((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  };

  const deleteEntry = (id: string) => {
    setStore((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.id !== id),
    }));
  };

  const addTag = (tag: Omit<DreamTag, "id">) => {
    const newTag: DreamTag = {
      ...tag,
      id: tag.name.toLowerCase().replace(/\s+/g, "-"),
    };

    setStore((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));
  };

  return {
    entries: store.entries,
    tags: store.tags,
    addEntry,
    updateEntry,
    deleteEntry,
    addTag,
  };
};

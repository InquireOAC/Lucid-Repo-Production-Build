
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DreamEntry, DreamTag, DreamStore } from '@/types/dream';

const defaultTags: DreamTag[] = [
  { id: 'lucid', name: 'Lucid', color: '#3b82f6' },
  { id: 'nightmare', name: 'Nightmare', color: '#ef4444' },
  { id: 'recurring', name: 'Recurring', color: '#8b5cf6' },
  { id: 'flying', name: 'Flying', color: '#6366f1' },
  { id: 'falling', name: 'Falling', color: '#ec4899' },
  { id: 'adventure', name: 'Adventure', color: '#10b981' },
  { id: 'spiritual', name: 'Spiritual', color: '#f59e0b' },
  { id: 'water', name: 'Water', color: '#0ea5e9' },
];

// Helper to load from localStorage with fallback
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

// Helper to save to localStorage
const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

export const useDreamStore = create<DreamStore & {
  addEntry: (dream: Omit<DreamEntry, 'id'>) => DreamEntry;
  updateEntry: (id: string, updates: Partial<DreamEntry>) => void;
  deleteEntry: (id: string) => void;
  addTag: (tag: Omit<DreamTag, 'id'>) => DreamTag;
  deleteTag: (id: string) => void;
  setAllEntries: (entries: DreamEntry[]) => void;
}>((set, get) => ({
  entries: loadFromStorage<DreamEntry[]>('dreamEntries', []),
  tags: loadFromStorage<DreamTag[]>('dreamTags', defaultTags),
  
  addEntry: (dream) => {
    const newDream = { ...dream, id: uuidv4() };
    set((state) => {
      const newEntries = [newDream, ...state.entries];
      saveToStorage('dreamEntries', newEntries);
      return { entries: newEntries };
    });
    return newDream;
  },
  
  updateEntry: (id, updates) => {
    set((state) => {
      const newEntries = state.entries.map((entry) => 
        entry.id === id ? { ...entry, ...updates } : entry
      );
      saveToStorage('dreamEntries', newEntries);
      return { entries: newEntries };
    });
  },
  
  deleteEntry: (id) => {
    set((state) => {
      const newEntries = state.entries.filter((entry) => entry.id !== id);
      saveToStorage('dreamEntries', newEntries);
      return { entries: newEntries };
    });
  },
  
  addTag: (tag) => {
    const newTag = { ...tag, id: uuidv4() };
    set((state) => {
      const newTags = [...state.tags, newTag];
      saveToStorage('dreamTags', newTags);
      return { tags: newTags };
    });
    return newTag;
  },
  
  deleteTag: (id) => {
    set((state) => {
      const newTags = state.tags.filter((tag) => tag.id !== id);
      saveToStorage('dreamTags', newTags);
      return { tags: newTags };
    });
  },
  
  // New function to replace all entries at once
  setAllEntries: (entries) => {
    set(() => {
      saveToStorage('dreamEntries', entries);
      return { entries };
    });
  }
}));

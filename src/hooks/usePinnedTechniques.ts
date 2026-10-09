import { useState, useCallback } from "react";

const STORAGE_KEY = "pinned-techniques";

function readPinned(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function usePinnedTechniques() {
  const [pinnedIndices, setPinnedIndices] = useState<number[]>(readPinned);

  const persist = (next: number[]) => {
    setPinnedIndices(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const pinTechnique = useCallback(
    (index: number) => {
      const current = readPinned();
      if (!current.includes(index)) {
        persist([...current, index]);
      }
    },
    []
  );

  const unpinTechnique = useCallback(
    (index: number) => {
      persist(readPinned().filter((i) => i !== index));
    },
    []
  );

  const isPinned = useCallback(
    (index: number) => pinnedIndices.includes(index),
    [pinnedIndices]
  );

  return { pinnedIndices, pinTechnique, unpinTechnique, isPinned };
}

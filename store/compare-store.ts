import { create } from "zustand";
import { persist } from "zustand/middleware";

export const COMPARE_MAX = 3;

interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) =>
          s.ids.includes(id)
            ? { ids: s.ids.filter((x) => x !== id) }
            : { ids: [...s.ids, id].slice(-COMPARE_MAX) },
        ),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "compare-v1" },
  ),
);

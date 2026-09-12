"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface SelectableItem {
  id: string;
  title: string;
  conceptLine: string;
  styleTags: string[];
  vocabTags: string[];
  imageRecipe: string;
  imageUrl: string;
  captureMethod: string;
  platform: string;
  screenType: string | null;
  platformOS: string | null;
  aspectRatio: string | null;
  collectionId: string;
  collectionName: string;
  collectionBriefBlock: string;
  collectionDeployFor: string;
  collectionColorPalette: unknown;
  collectionHeadingFont: string | null;
  collectionBodyFont: string | null;
  collectionMonoFont: string | null;
  collectionSpacingNotes: string | null;
  collectionMotionNotes: string | null;
}

interface SelectionContextValue {
  selected: Map<string, SelectableItem>;
  isSelected: (id: string) => boolean;
  toggle: (item: SelectableItem) => void;
  clear: () => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Map<string, SelectableItem>>(
    () => new Map(),
  );

  const toggle = useCallback((item: SelectableItem) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, item);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Map()), []);

  const isSelected = useCallback(
    (id: string) => selected.has(id),
    [selected],
  );

  const value = useMemo(
    () => ({ selected, isSelected, toggle, clear }),
    [selected, isSelected, toggle, clear],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return ctx;
}

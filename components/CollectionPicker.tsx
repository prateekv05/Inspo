"use client";

import { useEffect, useRef, useState } from "react";

export interface CollectionOption {
  id: string;
  name: string;
}

export type CollectionSelection =
  | { mode: "existing"; collectionId: string }
  | { mode: "new" }
  | { mode: "none" };

interface CollectionPickerProps {
  collections: CollectionOption[];
  selection: CollectionSelection;
  onSelect: (selection: CollectionSelection) => void;
}

export default function CollectionPicker({
  collections,
  selection,
  onSelect,
}: CollectionPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected =
    selection.mode === "existing"
      ? collections.find((c) => c.id === selection.collectionId)
      : undefined;

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
        Collection
      </span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-md border border-border bg-foreground/[0.03] px-2 py-1 text-left text-sm outline-none focus:border-foreground/30"
      >
        {selection.mode === "new"
          ? "+ Create new collection"
          : (selected?.name ?? "Select a collection…")}
      </button>

      {open && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search collections…"
            className="w-full border-b border-border bg-transparent px-2 py-1.5 text-sm outline-none"
          />
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect({ mode: "existing", collectionId: c.id });
                  setOpen(false);
                  setQuery("");
                }}
                className={`block w-full px-2 py-1 text-left text-sm transition-colors hover:bg-foreground/[0.05] ${
                  selection.mode === "existing" &&
                  selection.collectionId === c.id
                    ? "text-foreground"
                    : "text-foreground/70"
                }`}
              >
                {c.name}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-foreground/40">
                No matches
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                onSelect({ mode: "new" });
                setOpen(false);
                setQuery("");
              }}
              className="block w-full border-t border-border px-2 py-1.5 text-left font-mono text-xs uppercase tracking-wide text-foreground/50 transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
            >
              + Create new collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

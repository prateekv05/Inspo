"use client";

import { useEffect, useRef, useState } from "react";

type HouseDna = { id: string; always: string[]; never: string[] };

export default function HouseDnaPanel() {
  const [houseDna, setHouseDna] = useState<HouseDna | null>(null);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    fetch("/api/house-dna")
      .then((res) => res.json())
      .then(setHouseDna);
  }, []);

  async function save(next: HouseDna) {
    setHouseDna(next);
    await fetch("/api/house-dna", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  }

  if (!houseDna) return null;

  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium tracking-tight">House DNA</span>
        <span className="font-mono text-xs text-foreground/50">
          {collapsed ? "Show" : "Hide"}
        </span>
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 gap-6 border-t border-border p-4 sm:grid-cols-2">
          <HouseDnaColumn
            label="Always"
            items={houseDna.always}
            onChange={(always) => save({ ...houseDna, always })}
          />
          <HouseDnaColumn
            label="Never"
            items={houseDna.never}
            onChange={(never) => save({ ...houseDna, never })}
          />
        </div>
      )}
    </div>
  );
}

function HouseDnaColumn({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [local, setLocal] = useState(items);
  const [prevItems, setPrevItems] = useState(items);
  const focusIndexRef = useRef<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset local edits whenever the source `items` prop changes (e.g. after a
  // save round-trip), computed during render instead of in an effect.
  if (items !== prevItems) {
    setPrevItems(items);
    setLocal(items);
  }

  useEffect(() => {
    if (focusIndexRef.current !== null) {
      inputRefs.current[focusIndexRef.current]?.focus();
      focusIndexRef.current = null;
    }
  }, [local.length]);

  function updateAt(index: number, value: string) {
    setLocal((prev) => prev.map((v, i) => (i === index ? value : v)));
  }

  function removeAt(index: number) {
    const next = local.filter((_, i) => i !== index);
    setLocal(next);
    onChange(next);
  }

  function handleBlur(index: number) {
    const value = local[index]?.trim() ?? "";
    const next = value === "" ? local.filter((_, i) => i !== index) : local;
    setLocal(next);
    onChange(next);
  }

  function addItem() {
    focusIndexRef.current = local.length;
    setLocal((prev) => [...prev, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
        {label}
      </span>
      <div className="flex flex-col gap-1">
        {local.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              value={item}
              onChange={(e) => updateAt(index, e.target.value)}
              onBlur={() => handleBlur(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="flex-1 rounded-md border border-border bg-foreground/[0.03] px-2 py-1 text-sm outline-none focus:border-foreground/30"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="text-foreground/40 transition-colors hover:text-foreground"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="self-start font-mono text-xs text-foreground/50 transition-colors hover:text-foreground"
      >
        + Add item
      </button>
    </div>
  );
}

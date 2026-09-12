"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import type { ColorSwatch } from "@/components/DesignSystemPanel";
import type { ParsedDesignSystemJson } from "@/components/PasteJsonParser";

export interface ExistingDesignSystem {
  colorPalette: ColorSwatch[];
  headingFont: string | null;
  bodyFont: string | null;
  monoFont: string | null;
  spacingNotes: string | null;
  motionNotes: string | null;
}

type FieldKey = keyof ParsedDesignSystemJson;

const FIELD_LABELS: Record<FieldKey, string> = {
  colorPalette: "Color palette",
  headingFont: "Heading font",
  bodyFont: "Body font",
  monoFont: "Mono font",
  spacingNotes: "Spacing notes",
  motionNotes: "Motion notes",
};

function formatColorPalette(colors: ColorSwatch[]): string {
  if (colors.length === 0) return "—";
  return colors.map(({ hex, role }) => `${hex} — ${role}`).join(", ");
}

function formatValue(
  key: FieldKey,
  existing: ExistingDesignSystem,
  incoming: ParsedDesignSystemJson,
  which: "old" | "new",
): string {
  if (key === "colorPalette") {
    return formatColorPalette(
      (which === "old" ? existing.colorPalette : incoming.colorPalette) ?? [],
    );
  }
  const value = which === "old" ? existing[key] : incoming[key];
  return value ? value : "—";
}

interface DesignSystemDiffModalProps {
  collectionName: string;
  existing: ExistingDesignSystem;
  incoming: ParsedDesignSystemJson;
  onCancel: () => void;
  onConfirm: (resolved: ParsedDesignSystemJson) => void;
}

export default function DesignSystemDiffModal({
  collectionName,
  existing,
  incoming,
  onCancel,
  onConfirm,
}: DesignSystemDiffModalProps) {
  const fields = (Object.keys(incoming) as FieldKey[]).filter(
    (key) => incoming[key] !== undefined,
  );

  // Default to keeping existing data, since it was presumably deliberate.
  const [choices, setChoices] = useState<Record<string, "old" | "new">>(() =>
    Object.fromEntries(fields.map((key) => [key, "old"])),
  );

  function handleConfirm() {
    const resolved: ParsedDesignSystemJson = {};
    for (const key of fields) {
      if (choices[key] === "new") {
        (resolved as Record<string, unknown>)[key] = incoming[key];
      }
    }
    onConfirm(resolved);
  }

  return (
    <Modal open onClose={onCancel} panelClassName="max-w-xl">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium tracking-tight">
            Design system already set for &ldquo;{collectionName}&rdquo;
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            The pasted JSON also included design-system fields. Choose which
            value to keep, per field.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-md border border-border">
          {fields.map((key) => (
            <div key={key} className="flex flex-col gap-2 p-3">
              <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
                {FIELD_LABELS[key]}
              </span>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setChoices((c) => ({ ...c, [key]: "old" }))}
                  className={`rounded-md border px-2 py-1.5 text-left transition-colors ${
                    choices[key] === "old"
                      ? "border-foreground/40 bg-foreground/[0.06]"
                      : "border-border text-foreground/60"
                  }`}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-wide text-foreground/40">
                    Keep existing
                  </span>
                  {formatValue(key, existing, incoming, "old")}
                </button>
                <button
                  type="button"
                  onClick={() => setChoices((c) => ({ ...c, [key]: "new" }))}
                  className={`rounded-md border px-2 py-1.5 text-left transition-colors ${
                    choices[key] === "new"
                      ? "border-foreground/40 bg-foreground/[0.06]"
                      : "border-border text-foreground/60"
                  }`}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-wide text-foreground/40">
                    Use new
                  </span>
                  {formatValue(key, existing, incoming, "new")}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setChoices(Object.fromEntries(fields.map((key) => [key, "new"])))
            }
            className="font-mono text-xs text-foreground/50 transition-colors hover:text-foreground"
          >
            Use all new
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-border px-3 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-full border border-border bg-foreground/10 px-3 py-1 text-sm text-foreground transition-colors"
            >
              Save item
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

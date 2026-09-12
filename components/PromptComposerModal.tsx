"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Modal from "@/components/Modal";
import CopyButton from "@/components/CopyButton";
import { useSelection } from "@/components/SelectionProvider";
import { PLATFORM_OPTIONS, type PlatformValue } from "@/lib/platform";
import {
  composePrompt,
  inferPlatform,
  type HouseDnaInput,
} from "@/lib/composePrompt";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-border bg-foreground/[0.03] px-2 py-1 text-sm outline-none focus:border-foreground/30";

interface PromptComposerModalProps {
  onClose: () => void;
}

export default function PromptComposerModal({
  onClose,
}: PromptComposerModalProps) {
  const { selected } = useSelection();
  const items = useMemo(() => [...selected.values()], [selected]);

  const [whatWereBuilding, setWhatWereBuilding] = useState("");
  const [platform, setPlatform] = useState<PlatformValue>(
    () => inferPlatform(items) as PlatformValue,
  );
  const [houseDna, setHouseDna] = useState<HouseDnaInput | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/house-dna")
      .then((res) => res.json())
      .then((data) => setHouseDna({ always: data.always, never: data.never }));
  }, []);

  function handleGenerate() {
    setGeneratedPrompt(
      composePrompt({
        whatWereBuilding: whatWereBuilding.trim(),
        platform,
        items,
        houseDna,
      }),
    );
  }

  return (
    <Modal open onClose={onClose} panelClassName="max-w-2xl">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium tracking-tight">Compose Prompt</h2>

        <Field label="What are we building?">
          <textarea
            value={whatWereBuilding}
            onChange={(e) => {
              setWhatWereBuilding(e.target.value);
              setGeneratedPrompt(null);
            }}
            placeholder="A marketing site for..."
            className={`${inputClass} min-h-20 resize-y`}
          />
        </Field>

        <Field label="Platform">
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value as PlatformValue);
              setGeneratedPrompt(null);
            }}
            className={inputClass}
          >
            {PLATFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={items.length === 0}
          className="self-start rounded-full border border-border bg-foreground/10 px-3 py-1 text-sm text-foreground transition-colors disabled:opacity-50"
        >
          Generate
        </button>

        {generatedPrompt !== null && (
          <div className="flex flex-col gap-2">
            <textarea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              rows={16}
              className="w-full rounded-md border border-border bg-foreground/[0.03] px-3 py-2 font-mono text-xs text-foreground/80 outline-none focus:border-foreground/30"
            />
            <CopyButton text={generatedPrompt} label="Copy Prompt" />
          </div>
        )}
      </div>
    </Modal>
  );
}

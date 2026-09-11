"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { parseColorPalette, type ColorSwatch } from "@/components/DesignSystemPanel";

export interface CollectionRecord {
  id: string;
  name: string;
  description: string;
  deployFor: string;
  riskPrompt: string;
  vocabTags: string[];
  briefBlock: string;
  colorPalette: ColorSwatch[] | null;
  headingFont: string | null;
  bodyFont: string | null;
  monoFont: string | null;
  spacingNotes: string | null;
  motionNotes: string | null;
}

interface CollectionFormProps {
  open: boolean;
  onClose: () => void;
  collection?: CollectionRecord;
}

const inputClass =
  "w-full rounded-md border border-border bg-foreground/[0.03] px-2 py-1 text-sm outline-none focus:border-foreground/30";
const textareaClass = `${inputClass} min-h-20 resize-y`;

interface ParsedDesignSystem {
  colorPalette?: ColorSwatch[];
  headingFont?: string | null;
  bodyFont?: string | null;
  monoFont?: string | null;
  spacingNotes?: string | null;
}

const DESIGN_SYSTEM_KEYS = [
  "colorPalette",
  "headingFont",
  "bodyFont",
  "monoFont",
  "spacingNotes",
] as const;

function parseDesignSystemJson(raw: string): ParsedDesignSystem {
  const parsed = JSON.parse(raw);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Expected a JSON object.");
  }

  if (!DESIGN_SYSTEM_KEYS.some((key) => key in parsed)) {
    throw new Error(
      "No recognized design-system fields found (expected one of: colorPalette, headingFont, bodyFont, monoFont, spacingNotes).",
    );
  }

  const result: ParsedDesignSystem = {};

  if ("colorPalette" in parsed) {
    const colors = parseColorPalette(parsed.colorPalette);
    if (colors.length === 0 && Array.isArray(parsed.colorPalette) && parsed.colorPalette.length > 0) {
      throw new Error("colorPalette entries must each have a string 'hex' and 'role'.");
    }
    result.colorPalette = colors;
  }
  if ("headingFont" in parsed) result.headingFont = parsed.headingFont ?? null;
  if ("bodyFont" in parsed) result.bodyFont = parsed.bodyFont ?? null;
  if ("monoFont" in parsed) result.monoFont = parsed.monoFont ?? null;
  if ("spacingNotes" in parsed) result.spacingNotes = parsed.spacingNotes ?? null;

  return result;
}

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

export default function CollectionForm({
  open,
  onClose,
  collection,
}: CollectionFormProps) {
  const router = useRouter();
  const isEdit = collection !== undefined;

  const [name, setName] = useState(collection?.name ?? "");
  const [description, setDescription] = useState(
    collection?.description ?? "",
  );
  const [deployFor, setDeployFor] = useState(collection?.deployFor ?? "");
  const [riskPrompt, setRiskPrompt] = useState(collection?.riskPrompt ?? "");
  const [vocabTagsInput, setVocabTagsInput] = useState(
    collection?.vocabTags.join(", ") ?? "",
  );
  const [briefBlock, setBriefBlock] = useState(collection?.briefBlock ?? "");
  const [colorRows, setColorRows] = useState<ColorSwatch[]>(
    collection?.colorPalette ?? [],
  );
  const [headingFont, setHeadingFont] = useState(
    collection?.headingFont ?? "",
  );
  const [bodyFont, setBodyFont] = useState(collection?.bodyFont ?? "");
  const [monoFont, setMonoFont] = useState(collection?.monoFont ?? "");
  const [spacingNotes, setSpacingNotes] = useState(
    collection?.spacingNotes ?? "",
  );
  const [motionNotes, setMotionNotes] = useState(
    collection?.motionNotes ?? "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [designSystemJson, setDesignSystemJson] = useState("");
  const [designSystemJsonError, setDesignSystemJsonError] = useState<
    string | null
  >(null);
  const [designSystemJsonApplied, setDesignSystemJsonApplied] =
    useState(false);

  function handleParseDesignSystemJson() {
    if (!designSystemJson.trim()) return;
    setDesignSystemJsonApplied(false);
    try {
      const parsed = parseDesignSystemJson(designSystemJson);
      if (parsed.colorPalette) setColorRows(parsed.colorPalette);
      if ("headingFont" in parsed) setHeadingFont(parsed.headingFont ?? "");
      if ("bodyFont" in parsed) setBodyFont(parsed.bodyFont ?? "");
      if ("monoFont" in parsed) setMonoFont(parsed.monoFont ?? "");
      if ("spacingNotes" in parsed) setSpacingNotes(parsed.spacingNotes ?? "");
      setDesignSystemJsonError(null);
      setDesignSystemJsonApplied(true);
    } catch (err) {
      setDesignSystemJsonError(
        err instanceof Error ? err.message : "Couldn't parse that JSON.",
      );
    }
  }

  function addColorRow() {
    setColorRows((rows) => [...rows, { hex: "#", role: "" }]);
  }

  function updateColorRow(index: number, field: "hex" | "role", value: string) {
    setColorRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function removeColorRow(index: number) {
    setColorRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const vocabTags = vocabTagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const cleanedColorRows = colorRows.filter(
      (row) => row.hex.trim() && row.role.trim(),
    );

    const payload = {
      name,
      description,
      deployFor,
      riskPrompt,
      vocabTags,
      briefBlock,
      colorPalette: cleanedColorRows.length > 0 ? cleanedColorRows : null,
      headingFont: headingFont.trim() || null,
      bodyFont: bodyFont.trim() || null,
      monoFont: monoFont.trim() || null,
      spacingNotes: spacingNotes.trim() || null,
      motionNotes: motionNotes.trim() || null,
    };

    const res = await fetch(
      isEdit ? `/api/collections/${collection.id}` : "/api/collections",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setSubmitting(false);

    if (!res.ok) {
      setError("Something went wrong saving this collection.");
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-lg font-medium tracking-tight">
          {isEdit ? "Edit Collection" : "New Collection"}
        </h2>

        <Field label="Name">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={textareaClass}
          />
        </Field>
        <Field label="Deploy for">
          <input
            required
            value={deployFor}
            onChange={(e) => setDeployFor(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Risk prompt">
          <input
            required
            value={riskPrompt}
            onChange={(e) => setRiskPrompt(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Vocab tags (comma-separated)">
          <input
            value={vocabTagsInput}
            onChange={(e) => setVocabTagsInput(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Brief block">
          <textarea
            required
            value={briefBlock}
            onChange={(e) => setBriefBlock(e.target.value)}
            className={textareaClass}
          />
        </Field>

        <div className="flex flex-col gap-2 rounded-md border border-border bg-foreground/[0.03] p-3">
          <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
            Paste design system JSON (optional)
          </span>
          <p className="text-xs text-foreground/50">
            Paste the JSON reply from the &ldquo;Extract a Collection&apos;s
            design system&rdquo; standing prompt — it pre-fills the fields
            below, which stay editable after.
          </p>
          <textarea
            value={designSystemJson}
            onChange={(e) => {
              setDesignSystemJson(e.target.value);
              setDesignSystemJsonError(null);
              setDesignSystemJsonApplied(false);
            }}
            onBlur={handleParseDesignSystemJson}
            placeholder='{ "colorPalette": [...], "headingFont": "...", ... }'
            className={`${textareaClass} font-mono text-xs`}
          />
          {designSystemJsonError && (
            <p className="text-xs text-red-400">{designSystemJsonError}</p>
          )}
          {designSystemJsonApplied && !designSystemJsonError && (
            <p className="text-xs text-foreground/50">
              Parsed — fields below updated.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
            Color palette (optional)
          </span>
          {colorRows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                placeholder="#hex"
                value={row.hex}
                onChange={(e) => updateColorRow(index, "hex", e.target.value)}
                className={`${inputClass} w-24 font-mono`}
              />
              <input
                placeholder="role"
                value={row.role}
                onChange={(e) =>
                  updateColorRow(index, "role", e.target.value)
                }
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeColorRow(index)}
                className="text-foreground/40 transition-colors hover:text-foreground"
                aria-label="Remove color"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addColorRow}
            className="self-start font-mono text-xs text-foreground/50 transition-colors hover:text-foreground"
          >
            + Add color
          </button>
        </div>

        <Field label="Heading font (optional)">
          <input
            value={headingFont}
            onChange={(e) => setHeadingFont(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Body font (optional)">
          <input
            value={bodyFont}
            onChange={(e) => setBodyFont(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Mono font (optional)">
          <input
            value={monoFont}
            onChange={(e) => setMonoFont(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Spacing notes (optional)">
          <input
            value={spacingNotes}
            onChange={(e) => setSpacingNotes(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Motion notes (optional)">
          <input
            value={motionNotes}
            onChange={(e) => setMotionNotes(e.target.value)}
            className={inputClass}
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-border bg-foreground/10 px-3 py-1 text-sm text-foreground transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create collection"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

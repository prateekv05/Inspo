"use client";

import { useState } from "react";
import { parseColorPalette, type ColorSwatch } from "@/components/DesignSystemPanel";

const PLATFORM_VALUES = ["WEB", "MOBILE", "BOTH"] as const;

// All fields are optional here: validation is per-field (see `validate`
// below), so a single bad field shouldn't stop the rest from populating.
export interface ParsedItemJson {
  title?: string;
  conceptLine?: string;
  styleTags?: string[];
  vocabTags?: string[];
  imageRecipe?: string;
  platform?: (typeof PLATFORM_VALUES)[number];
  screenType?: string;
  platformOS?: string;
  aspectRatio?: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

// Models sometimes reply with lowercase/mixed-case platform values even when
// asked for an enum, so tolerate case and surrounding whitespace.
function normalizePlatform(
  value: unknown,
): (typeof PLATFORM_VALUES)[number] | null {
  if (typeof value !== "string") return null;
  const upper = value.trim().toUpperCase();
  return (PLATFORM_VALUES as readonly string[]).includes(upper)
    ? (upper as (typeof PLATFORM_VALUES)[number])
    : null;
}

interface ValidationResult {
  data: ParsedItemJson;
  errors: string[];
}

// Validates field-by-field rather than all-or-nothing: a bad or missing
// field is reported as an error but doesn't stop the other valid fields
// from being returned and populated.
function validate(data: unknown): ValidationResult {
  if (typeof data !== "object" || data === null) {
    return { data: {}, errors: ["Expected a JSON object."] };
  }
  const obj = data as Record<string, unknown>;
  const result: ParsedItemJson = {};
  const errors: string[] = [];

  if (typeof obj.title === "string") result.title = obj.title;
  else errors.push('"title" must be a string.');

  if (typeof obj.conceptLine === "string") result.conceptLine = obj.conceptLine;
  else errors.push('"conceptLine" must be a string.');

  if (isStringArray(obj.styleTags)) result.styleTags = obj.styleTags;
  else errors.push('"styleTags" must be an array of strings.');

  if (isStringArray(obj.vocabTags)) result.vocabTags = obj.vocabTags;
  else errors.push('"vocabTags" must be an array of strings.');

  if (typeof obj.imageRecipe === "string") result.imageRecipe = obj.imageRecipe;
  else errors.push('"imageRecipe" must be a string.');

  const platform = normalizePlatform(obj.platform);
  if (platform) result.platform = platform;
  else errors.push('"platform" must be one of WEB, MOBILE, BOTH.');

  for (const key of ["screenType", "platformOS", "aspectRatio"] as const) {
    const value = obj[key];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      errors.push(`"${key}" must be a string.`);
      continue;
    }
    result[key] = value;
  }

  return { data: result, errors };
}

// Design-system fields sometimes ride along in the same paste when it came
// from the combined Claude-for-Chrome prompt. They belong to the Collection,
// not the Item, so they're extracted separately and held aside by the caller
// rather than folded into ParsedItemJson.
export interface ParsedDesignSystemJson {
  colorPalette?: ColorSwatch[];
  headingFont?: string;
  bodyFont?: string;
  monoFont?: string;
  spacingNotes?: string;
  motionNotes?: string;
}

const DESIGN_SYSTEM_KEYS = [
  "colorPalette",
  "headingFont",
  "bodyFont",
  "monoFont",
  "spacingNotes",
  "motionNotes",
] as const;

function extractDesignSystem(
  obj: Record<string, unknown>,
): ParsedDesignSystemJson | null {
  if (!DESIGN_SYSTEM_KEYS.some((key) => key in obj)) return null;

  const result: ParsedDesignSystemJson = {};

  if ("colorPalette" in obj) {
    const colors = parseColorPalette(obj.colorPalette);
    if (
      colors.length === 0 &&
      Array.isArray(obj.colorPalette) &&
      obj.colorPalette.length > 0
    ) {
      throw new Error(
        "colorPalette entries must each have a string 'hex' and 'role'.",
      );
    }
    result.colorPalette = colors;
  }

  for (const key of [
    "headingFont",
    "bodyFont",
    "monoFont",
    "spacingNotes",
    "motionNotes",
  ] as const) {
    if (key in obj) {
      const value = obj[key];
      if (typeof value !== "string") {
        throw new Error(`"${key}" must be a string.`);
      }
      result[key] = value;
    }
  }

  return result;
}

interface PasteJsonParserProps {
  onParsed: (data: ParsedItemJson) => void;
  onDesignSystemParsed?: (data: ParsedDesignSystemJson | null) => void;
}

export default function PasteJsonParser({
  onParsed,
  onDesignSystemParsed,
}: PasteJsonParserProps) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);

  function tryParse(text: string) {
    const trimmed = text.trim();
    if (!trimmed) {
      setError(null);
      return;
    }
    let json: unknown;
    try {
      json = JSON.parse(trimmed);
    } catch {
      setError("That's not valid JSON — check for a trailing comma or missing quote.");
      return;
    }

    const { data: item, errors } = validate(json);
    onParsed(item);

    let designSystemError: string | null = null;
    if (typeof json === "object" && json !== null) {
      try {
        onDesignSystemParsed?.(extractDesignSystem(json as Record<string, unknown>));
      } catch (err) {
        designSystemError =
          err instanceof Error ? err.message : "Design system fields failed to parse.";
      }
    }

    const allErrors = designSystemError ? [...errors, designSystemError] : errors;
    setError(allErrors.length > 0 ? allErrors.join(" ") : null);
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
          Paste Claude&apos;s JSON reply here
        </span>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={(e) => tryParse(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            const el = e.currentTarget;
            const pasted = e.clipboardData.getData("text");
            const start = el.selectionStart ?? el.value.length;
            const end = el.selectionEnd ?? el.value.length;
            const next = el.value.slice(0, start) + pasted + el.value.slice(end);
            setRaw(next);
            tryParse(next);
          }}
          rows={8}
          placeholder='{ "title": "...", "conceptLine": "...", "styleTags": [...], "vocabTags": [...], "imageRecipe": "...", "platform": "WEB" }'
          className="w-full rounded-md border border-border bg-foreground/[0.03] px-2 py-1.5 font-mono text-xs outline-none focus:border-foreground/30"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

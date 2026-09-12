"use client";

import { useState } from "react";

const PLATFORM_VALUES = ["WEB", "MOBILE", "BOTH"] as const;

export interface ParsedItemJson {
  title: string;
  conceptLine: string;
  styleTags: string[];
  vocabTags: string[];
  imageRecipe: string;
  platform: (typeof PLATFORM_VALUES)[number];
  screenType?: string;
  platformOS?: string;
  aspectRatio?: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validate(data: unknown): ParsedItemJson {
  if (typeof data !== "object" || data === null) {
    throw new Error("Expected a JSON object.");
  }
  const obj = data as Record<string, unknown>;

  const requiredKeys = [
    "title",
    "conceptLine",
    "styleTags",
    "vocabTags",
    "imageRecipe",
    "platform",
  ] as const;
  for (const key of requiredKeys) {
    if (!(key in obj)) {
      throw new Error(`Missing "${key}" field.`);
    }
  }

  if (typeof obj.title !== "string") throw new Error('"title" must be a string.');
  if (typeof obj.conceptLine !== "string")
    throw new Error('"conceptLine" must be a string.');
  if (!isStringArray(obj.styleTags))
    throw new Error('"styleTags" must be an array of strings.');
  if (!isStringArray(obj.vocabTags))
    throw new Error('"vocabTags" must be an array of strings.');
  if (typeof obj.imageRecipe !== "string")
    throw new Error('"imageRecipe" must be a string.');
  if (
    typeof obj.platform !== "string" ||
    !PLATFORM_VALUES.includes(obj.platform as (typeof PLATFORM_VALUES)[number])
  ) {
    throw new Error('"platform" must be one of WEB, MOBILE, BOTH.');
  }

  const result: ParsedItemJson = {
    title: obj.title,
    conceptLine: obj.conceptLine,
    styleTags: obj.styleTags,
    vocabTags: obj.vocabTags,
    imageRecipe: obj.imageRecipe,
    platform: obj.platform as ParsedItemJson["platform"],
  };

  for (const key of ["screenType", "platformOS", "aspectRatio"] as const) {
    const value = obj[key];
    if (value === undefined) continue;
    if (typeof value !== "string") {
      throw new Error(`"${key}" must be a string.`);
    }
    result[key] = value;
  }

  return result;
}

interface PasteJsonParserProps {
  onParsed: (data: ParsedItemJson) => void;
}

export default function PasteJsonParser({ onParsed }: PasteJsonParserProps) {
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
    try {
      onParsed(validate(json));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That JSON is missing expected fields.");
    }
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

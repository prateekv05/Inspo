"use client";

import { useState, type KeyboardEvent } from "react";

interface CaptureUrlFormProps {
  onCaptured: (imageUrl: string, sourceUrl: string) => void;
}

export default function CaptureUrlForm({ onCaptured }: CaptureUrlFormProps) {
  const [url, setUrl] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleCapture() {
    if (!url.trim() || capturing) return;

    setCapturing(true);
    setError(null);

    try {
      const res = await fetch("/api/capture-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Couldn't capture that URL.");
      }

      setPreviewUrl(data.imageUrl);
      onCaptured(data.imageUrl, data.sourceUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't capture that URL.",
      );
    } finally {
      setCapturing(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleCapture();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://..."
          className="flex-1 rounded-md border border-border bg-foreground/[0.03] px-2 py-1 text-sm outline-none focus:border-foreground/30"
        />
        <button
          type="button"
          onClick={() => void handleCapture()}
          disabled={capturing || !url.trim()}
          className="rounded-full border border-border bg-foreground/10 px-3 py-1 text-sm text-foreground transition-colors hover:bg-foreground/15 disabled:opacity-50"
        >
          {capturing ? "Capturing…" : "Capture"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {previewUrl && (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Capture preview"
            className="max-h-96 w-auto rounded-lg border border-border object-contain"
          />
          <span className="font-mono text-xs text-foreground/40">
            Captured
          </span>
        </div>
      )}
    </div>
  );
}

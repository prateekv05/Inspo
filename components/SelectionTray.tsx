"use client";

import { useState } from "react";
import { useSelection } from "@/components/SelectionProvider";
import PromptComposerModal from "@/components/PromptComposerModal";

export default function SelectionTray() {
  const { selected, clear } = useSelection();
  const [composerOpen, setComposerOpen] = useState(false);
  const count = selected.size;

  if (count === 0) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-border bg-background/90 px-6 py-3 backdrop-blur-sm">
        <span className="font-mono text-xs uppercase tracking-wide text-foreground/70">
          {count} item{count === 1 ? "" : "s"} selected
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clear}
            className="text-sm text-foreground/50 transition-colors hover:text-foreground"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="rounded-full border border-border bg-foreground/10 px-3 py-1 text-sm text-foreground transition-colors hover:bg-foreground/15"
          >
            Compose Prompt
          </button>
        </div>
      </div>
      {composerOpen && (
        <PromptComposerModal onClose={() => setComposerOpen(false)} />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import CollectionForm from "@/components/CollectionForm";

export default function NewCollectionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full border border-border px-3 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
      >
        + New Collection
      </button>
      <CollectionForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}

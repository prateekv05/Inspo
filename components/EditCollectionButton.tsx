"use client";

import { useState } from "react";
import CollectionForm, { type CollectionRecord } from "@/components/CollectionForm";
import { parseColorPalette } from "@/components/DesignSystemPanel";

interface EditCollectionButtonProps {
  collection: Omit<CollectionRecord, "colorPalette"> & { colorPalette: unknown };
}

export default function EditCollectionButton({
  collection,
}: EditCollectionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-full border border-border px-3 py-1 text-sm text-foreground/70 transition-colors hover:text-foreground"
      >
        Edit
      </button>
      <CollectionForm
        open={open}
        onClose={() => setOpen(false)}
        collection={{
          ...collection,
          colorPalette: parseColorPalette(collection.colorPalette),
        }}
      />
    </>
  );
}

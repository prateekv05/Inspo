"use client";

import { useState } from "react";
import Image from "next/image";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import CopyButton from "@/components/CopyButton";

interface GridItem {
  id: string;
  title: string;
  conceptLine: string;
  styleTags: string[];
  vocabTags: string[];
  imageRecipe: string;
  imageUrl: string;
  captureMethod: string;
  platform: string;
}

const CAPTURE_METHOD_LABELS: Record<string, string> = {
  MANUAL_SCREENSHOT: "Manual screenshot — colors approximate",
  PHONE_SCREENSHOT: "Phone screenshot — colors approximate",
  SCREEN_RECORDING: "Screen recording — motion notes reliable",
  SCREENSHOT_API: "Screenshot API — colors reliable",
  CHROME_ASSISTED: "Chrome-assisted capture — colors & fonts reliable",
};

function formatItemBrief(item: GridItem): string {
  const parts = [`${item.title} — ${item.conceptLine}`];
  if (item.vocabTags.length > 0) {
    parts.push(`Vocabulary: ${item.vocabTags.join(", ")}.`);
  }
  return parts.join(" ");
}

export default function ItemGrid({ items }: { items: GridItem[] }) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const openItem = items.find((item) => item.id === openItemId) ?? null;

  if (items.length === 0) {
    return <p className="text-sm text-foreground/50">No items yet.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenItemId(item.id)}
            className={`group relative overflow-hidden rounded-lg border border-border text-left ${
              item.platform === "MOBILE" ? "aspect-[9/16]" : "aspect-[4/3]"
            }`}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <Badge className="absolute top-2 right-2 max-w-[calc(100%-1rem)] truncate bg-background/80 backdrop-blur-sm">
              {item.captureMethod}
            </Badge>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2">
              <p className="truncate text-sm text-foreground">{item.title}</p>
            </div>
          </button>
        ))}
      </div>

      <Modal
        open={openItem !== null}
        onClose={() => setOpenItemId(null)}
        panelClassName="max-w-2xl"
      >
        {openItem && (
          <div className="flex flex-col gap-4">
            <div
              className={`relative w-full overflow-hidden rounded-lg border border-border ${
                openItem.platform === "MOBILE" ? "aspect-[9/16]" : "aspect-[16/10]"
              }`}
            >
              <Image
                src={openItem.imageUrl}
                alt={openItem.title}
                fill
                className="object-cover"
                sizes="(max-width: 672px) 100vw, 672px"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-medium tracking-tight">
                {openItem.title}
              </h3>
              <p className="text-sm text-foreground/70">
                {openItem.conceptLine}
              </p>
            </div>

            <Badge className="w-fit bg-foreground/[0.03]">
              {CAPTURE_METHOD_LABELS[openItem.captureMethod] ??
                openItem.captureMethod}
            </Badge>

            {openItem.styleTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {openItem.styleTags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            )}

            {openItem.vocabTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {openItem.vocabTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-foreground/[0.08] px-2 py-0.5 font-mono text-xs text-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 rounded-lg border border-border bg-foreground/[0.03] p-3">
              <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
                Image recipe
              </span>
              <p className="whitespace-pre-wrap font-mono text-xs text-foreground/70">
                {openItem.imageRecipe}
              </p>
            </div>

            <div className="flex gap-2">
              <CopyButton text={formatItemBrief(openItem)} label="Copy Brief" />
              <CopyButton
                text={openItem.imageRecipe}
                label="Copy Image Prompt"
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

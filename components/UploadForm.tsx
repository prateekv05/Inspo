"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import CaptureUrlForm from "@/components/CaptureUrlForm";
import PasteJsonParser, {
  type ParsedItemJson,
} from "@/components/PasteJsonParser";
import CollectionPicker, {
  type CollectionOption,
  type CollectionSelection,
} from "@/components/CollectionPicker";
import {
  CAPTURE_METHOD_LABELS,
  CAPTURE_METHOD_VALUES,
  type CaptureMethodValue,
} from "@/lib/captureMethod";
import { createItemAction } from "@/app/upload/actions";

const inputClass =
  "w-full rounded-md border border-border bg-foreground/[0.03] px-2 py-1 text-sm outline-none focus:border-foreground/30";

const PLATFORM_OPTIONS = [
  { value: "WEB", label: "Web" },
  { value: "MOBILE", label: "Mobile" },
  { value: "BOTH", label: "Both" },
] as const;

const textareaClass = `${inputClass} min-h-20 resize-y`;

type PlatformValue = (typeof PLATFORM_OPTIONS)[number]["value"];

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

interface UploadFormProps {
  collections: CollectionOption[];
  captureUrlEnabled?: boolean;
}

export default function UploadForm({
  collections,
  captureUrlEnabled = false,
}: UploadFormProps) {
  const [imageSource, setImageSource] = useState<"upload" | "capture">(
    "upload",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");

  const [title, setTitle] = useState("");
  const [conceptLine, setConceptLine] = useState("");
  const [styleTags, setStyleTags] = useState("");
  const [vocabTags, setVocabTags] = useState("");
  const [imageRecipe, setImageRecipe] = useState("");
  const [platform, setPlatform] = useState<PlatformValue>("WEB");
  const [screenType, setScreenType] = useState("");
  const [platformOS, setPlatformOS] = useState("");
  const [aspectRatio, setAspectRatio] = useState("");
  const [captureMethod, setCaptureMethod] =
    useState<CaptureMethodValue>("MANUAL_SCREENSHOT");

  const [collectionSelection, setCollectionSelection] =
    useState<CollectionSelection>({ mode: "none" });
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] =
    useState("");
  const [newCollectionDeployFor, setNewCollectionDeployFor] = useState("");
  const [newCollectionVocabTags, setNewCollectionVocabTags] = useState("");
  const [newCollectionBriefBlock, setNewCollectionBriefBlock] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleParsed(data: ParsedItemJson) {
    setTitle(data.title);
    setConceptLine(data.conceptLine);
    setStyleTags(data.styleTags.join(", "));
    setVocabTags(data.vocabTags.join(", "));
    setImageRecipe(data.imageRecipe);
    setPlatform(data.platform);
    setScreenType(data.screenType ?? "");
    setPlatformOS(data.platformOS ?? "");
    setAspectRatio(data.aspectRatio ?? "");
  }

  function handleCaptured(capturedImageUrl: string, capturedSourceUrl: string) {
    setImageUrl(capturedImageUrl);
    setSourceUrl(capturedSourceUrl);
    setCaptureMethod("SCREENSHOT_API");
  }

  const isMobile = platform === "MOBILE" || platform === "BOTH";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!imageUrl) {
      setError("Upload an image first.");
      return;
    }
    if (!title.trim() || !conceptLine.trim() || !imageRecipe.trim()) {
      setError("Title, concept line, and image recipe are required.");
      return;
    }

    let collectionId: string | null = null;
    let newCollection: Parameters<typeof createItemAction>[0]["newCollection"] =
      null;

    if (collectionSelection.mode === "existing") {
      collectionId = collectionSelection.collectionId;
    } else if (collectionSelection.mode === "new") {
      if (
        !newCollectionName.trim() ||
        !newCollectionDescription.trim() ||
        !newCollectionDeployFor.trim() ||
        !newCollectionBriefBlock.trim()
      ) {
        setError(
          "Fill in the new collection's name, description, deploy for, and brief block.",
        );
        return;
      }
      newCollection = {
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        deployFor: newCollectionDeployFor.trim(),
        vocabTags: newCollectionVocabTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        briefBlock: newCollectionBriefBlock.trim(),
      };
    } else {
      setError("Choose a collection or create a new one.");
      return;
    }

    setSubmitting(true);
    await createItemAction({
      title: title.trim(),
      conceptLine: conceptLine.trim(),
      styleTags: styleTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      vocabTags: vocabTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      imageRecipe: imageRecipe.trim(),
      imageUrl,
      sourceUrl: sourceUrl.trim() || null,
      platform,
      screenType: isMobile && screenType.trim() ? screenType.trim() : null,
      platformOS: isMobile && platformOS.trim() ? platformOS.trim() : null,
      aspectRatio: isMobile && aspectRatio.trim() ? aspectRatio.trim() : null,
      captureMethod,
      collectionId,
      newCollection,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {captureUrlEnabled && (
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => setImageSource("upload")}
            className={`transition-colors ${
              imageSource === "upload"
                ? "text-foreground"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            Upload screenshot
          </button>
          <button
            type="button"
            onClick={() => setImageSource("capture")}
            className={`transition-colors ${
              imageSource === "capture"
                ? "text-foreground"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            Capture from URL
          </button>
        </div>
      )}

      {imageSource === "upload" || !captureUrlEnabled ? (
        <UploadDropzone onUploaded={setImageUrl} />
      ) : (
        <CaptureUrlForm onCaptured={handleCaptured} />
      )}

      <Field label="Source URL (optional)">
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </Field>

      <PasteJsonParser onParsed={handleParsed} />

      <Field label="Title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Concept line">
        <input
          type="text"
          value={conceptLine}
          onChange={(e) => setConceptLine(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Style tags (comma-separated)">
        <input
          type="text"
          value={styleTags}
          onChange={(e) => setStyleTags(e.target.value)}
          placeholder="glassmorphism, retro-futurist, ..."
          className={inputClass}
        />
      </Field>

      <Field label="Vocab tags (comma-separated)">
        <input
          type="text"
          value={vocabTags}
          onChange={(e) => setVocabTags(e.target.value)}
          placeholder="thin dividers, negative space, ..."
          className={inputClass}
        />
      </Field>

      <Field label="Image recipe">
        <textarea
          value={imageRecipe}
          onChange={(e) => setImageRecipe(e.target.value)}
          placeholder="Image-generation prompt for recreating this style..."
          className={textareaClass}
        />
      </Field>

      <Field label="Platform">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PlatformValue)}
          className={inputClass}
        >
          {PLATFORM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      {isMobile && (
        <>
          <Field label="Screen type">
            <input
              type="text"
              value={screenType}
              onChange={(e) => setScreenType(e.target.value)}
              placeholder="Onboarding, settings, ..."
              className={inputClass}
            />
          </Field>

          <Field label="Platform OS">
            <input
              type="text"
              value={platformOS}
              onChange={(e) => setPlatformOS(e.target.value)}
              placeholder="iOS, Android, ..."
              className={inputClass}
            />
          </Field>

          <Field label="Aspect ratio">
            <input
              type="text"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              placeholder="19.5:9"
              className={inputClass}
            />
          </Field>
        </>
      )}

      <Field label="Capture method">
        <select
          value={captureMethod}
          onChange={(e) =>
            setCaptureMethod(e.target.value as CaptureMethodValue)
          }
          className={inputClass}
        >
          {CAPTURE_METHOD_VALUES.map((value) => (
            <option key={value} value={value}>
              {CAPTURE_METHOD_LABELS[value]}
            </option>
          ))}
        </select>
      </Field>

      <CollectionPicker
        collections={collections}
        selection={collectionSelection}
        onSelect={setCollectionSelection}
      />

      {collectionSelection.mode === "new" && (
        <div className="flex flex-col gap-4 rounded-md border border-border bg-foreground/[0.03] p-3">
          <Field label="Name">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={newCollectionDescription}
              onChange={(e) => setNewCollectionDescription(e.target.value)}
              className={textareaClass}
            />
          </Field>
          <Field label="Deploy for">
            <input
              type="text"
              value={newCollectionDeployFor}
              onChange={(e) => setNewCollectionDeployFor(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Vocab tags (comma-separated)">
            <input
              type="text"
              value={newCollectionVocabTags}
              onChange={(e) => setNewCollectionVocabTags(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Brief block">
            <textarea
              value={newCollectionBriefBlock}
              onChange={(e) => setNewCollectionBriefBlock(e.target.value)}
              className={textareaClass}
            />
          </Field>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full border border-border bg-foreground/10 px-3 py-1 text-sm text-foreground transition-colors disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Add to library"}
      </button>
    </form>
  );
}

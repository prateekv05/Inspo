"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import CaptureUrlForm from "@/components/CaptureUrlForm";
import PasteJsonParser, {
  type ParsedItemJson,
  type ParsedDesignSystemJson,
  type ParsedCollectionSuggestion,
} from "@/components/PasteJsonParser";
import CollectionPicker, {
  type CollectionOption,
  type CollectionSelection,
} from "@/components/CollectionPicker";
import DesignSystemDiffModal from "@/components/DesignSystemDiffModal";
import { hasDesignSystemFields } from "@/components/DesignSystemPanel";
import {
  CAPTURE_METHOD_LABELS,
  CAPTURE_METHOD_VALUES,
  type CaptureMethodValue,
} from "@/lib/captureMethod";
import { createItemAction } from "@/app/upload/actions";

type ItemSubmission = Omit<
  Parameters<typeof createItemAction>[0],
  "designSystemUpdate"
>;

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

  const [pendingDesignSystem, setPendingDesignSystem] =
    useState<ParsedDesignSystemJson | null>(null);
  const [diffRequest, setDiffRequest] = useState<{
    itemInput: ItemSubmission;
    collection: CollectionOption;
    incoming: ParsedDesignSystemJson;
  } | null>(null);

  function handleParsed(data: ParsedItemJson) {
    // Only fields that parsed successfully are present here — leave
    // anything else in the form untouched rather than blanking it out.
    if (data.title !== undefined) setTitle(data.title);
    if (data.conceptLine !== undefined) setConceptLine(data.conceptLine);
    if (data.styleTags !== undefined) setStyleTags(data.styleTags.join(", "));
    if (data.vocabTags !== undefined) setVocabTags(data.vocabTags.join(", "));
    if (data.imageRecipe !== undefined) setImageRecipe(data.imageRecipe);
    if (data.platform !== undefined) setPlatform(data.platform);
    if (data.screenType !== undefined) setScreenType(data.screenType);
    if (data.platformOS !== undefined) setPlatformOS(data.platformOS);
    if (data.aspectRatio !== undefined) setAspectRatio(data.aspectRatio);
  }

  function handleDesignSystemParsed(data: ParsedDesignSystemJson | null) {
    setPendingDesignSystem(data);
  }

  function handleCollectionSuggested(suggestion: ParsedCollectionSuggestion | null) {
    // Only act on the first suggestion of a session — once you've picked a
    // collection (existing or new), a later paste shouldn't yank you out of it.
    if (!suggestion || collectionSelection.mode !== "none") return;

    const existing = collections.find(
      (c) => c.name.toLowerCase() === suggestion.name.toLowerCase(),
    );
    if (existing) {
      setCollectionSelection({ mode: "existing", collectionId: existing.id });
      return;
    }

    setCollectionSelection({ mode: "new" });
    setNewCollectionName(suggestion.name);
    if (suggestion.description !== undefined) {
      setNewCollectionDescription(suggestion.description);
    }
    if (suggestion.deployFor !== undefined) {
      setNewCollectionDeployFor(suggestion.deployFor);
    }
    if (suggestion.vocabTags !== undefined) {
      setNewCollectionVocabTags(suggestion.vocabTags.join(", "));
    }
    if (suggestion.briefBlock !== undefined) {
      setNewCollectionBriefBlock(suggestion.briefBlock);
    }
  }

  function handleCaptured(
    capturedImageUrl: string,
    capturedSourceUrl: string,
    method: CaptureMethodValue,
  ) {
    setImageUrl(capturedImageUrl);
    setSourceUrl(capturedSourceUrl);
    setCaptureMethod(method);
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

    const itemInput: ItemSubmission = {
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
    };

    // A newly-created collection has nothing set yet, so only an existing
    // collection can conflict with fields the paste held aside.
    const targetCollection =
      collectionSelection.mode === "existing"
        ? collections.find((c) => c.id === collectionSelection.collectionId)
        : undefined;

    if (
      pendingDesignSystem &&
      targetCollection &&
      hasDesignSystemFields(targetCollection)
    ) {
      setDiffRequest({
        itemInput,
        collection: targetCollection,
        incoming: pendingDesignSystem,
      });
      return;
    }

    await submitItem(itemInput, pendingDesignSystem);
  }

  async function submitItem(
    itemInput: ItemSubmission,
    designSystemUpdate: ParsedDesignSystemJson | null,
  ) {
    setSubmitting(true);
    await createItemAction({
      ...itemInput,
      designSystemUpdate:
        designSystemUpdate && Object.keys(designSystemUpdate).length > 0
          ? designSystemUpdate
          : null,
    });
  }

  function handleDiffResolved(resolved: ParsedDesignSystemJson) {
    if (!diffRequest) return;
    const { itemInput } = diffRequest;
    setDiffRequest(null);
    void submitItem(itemInput, resolved);
  }

  return (
    <>
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

      <PasteJsonParser
        onParsed={handleParsed}
        onDesignSystemParsed={handleDesignSystemParsed}
        onCollectionSuggested={handleCollectionSuggested}
      />

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
    {diffRequest && (
      <DesignSystemDiffModal
        collectionName={diffRequest.collection.name}
        existing={diffRequest.collection}
        incoming={diffRequest.incoming}
        onCancel={() => setDiffRequest(null)}
        onConfirm={handleDiffResolved}
      />
    )}
    </>
  );
}

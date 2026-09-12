import { parseColorPalette } from "@/components/DesignSystemPanel";
import type { SelectableItem } from "@/components/SelectionProvider";

export interface HouseDnaInput {
  always: string[];
  never: string[];
}

interface ComposePromptInput {
  whatWereBuilding: string;
  platform: string;
  items: SelectableItem[];
  houseDna: HouseDnaInput | null;
}

function dedupe(values: (string | null | undefined)[]): string[] {
  const cleaned = values
    .map((v) => v?.trim() ?? "")
    .filter((v) => v !== "");
  return Array.from(new Set(cleaned));
}

function platformLabel(platform: string): string {
  if (platform === "WEB") return "Web";
  if (platform === "MOBILE") return "Mobile";
  return "Both (web + mobile)";
}

export function composePrompt({
  whatWereBuilding,
  platform,
  items,
  houseDna,
}: ComposePromptInput): string {
  const sections: string[] = ["# Build brief"];

  if (whatWereBuilding.trim() !== "") {
    sections.push(`## What we're building\n${whatWereBuilding.trim()}`);
  }

  // One entry per represented collection, in first-seen order.
  const collectionsById = new Map<string, SelectableItem>();
  for (const item of items) {
    if (!collectionsById.has(item.collectionId)) {
      collectionsById.set(item.collectionId, item);
    }
  }
  const collections = Array.from(collectionsById.values());

  const collectionNames = dedupe(collections.map((c) => c.collectionName));
  const briefBlocks = dedupe(collections.map((c) => c.collectionBriefBlock));
  const deployFors = dedupe(collections.map((c) => c.collectionDeployFor));
  const itemVocab = dedupe(items.flatMap((i) => i.vocabTags));

  const visualDirectionLines: string[] = [];
  if (briefBlocks.length > 0) visualDirectionLines.push(briefBlocks.join("\n\n"));
  if (deployFors.length > 0) {
    visualDirectionLines.push(`Deploy for: ${deployFors.join("; ")}`);
  }
  if (itemVocab.length > 0) {
    visualDirectionLines.push(`Vocabulary to draw from: ${itemVocab.join(", ")}`);
  }
  if (visualDirectionLines.length > 0) {
    const heading =
      collectionNames.length > 0
        ? `## Visual direction — ${collectionNames.join(", ")}`
        : "## Visual direction";
    sections.push(`${heading}\n${visualDirectionLines.join("\n\n")}`);
  }

  const colorSwatches: { hex: string; role: string }[] = [];
  const seenColors = new Set<string>();
  for (const c of collections) {
    for (const swatch of parseColorPalette(c.collectionColorPalette)) {
      const key = `${swatch.hex}|${swatch.role}`;
      if (!seenColors.has(key)) {
        seenColors.add(key);
        colorSwatches.push(swatch);
      }
    }
  }
  const headingFonts = dedupe(collections.map((c) => c.collectionHeadingFont));
  const bodyFonts = dedupe(collections.map((c) => c.collectionBodyFont));
  const monoFonts = dedupe(collections.map((c) => c.collectionMonoFont));
  const spacingNotes = dedupe(collections.map((c) => c.collectionSpacingNotes));
  const motionNotes = dedupe(collections.map((c) => c.collectionMotionNotes));

  const typographyParts: string[] = [];
  if (headingFonts.length > 0) typographyParts.push(`Heading — ${headingFonts.join("; ")}`);
  if (bodyFonts.length > 0) typographyParts.push(`Body — ${bodyFonts.join("; ")}`);
  if (monoFonts.length > 0) typographyParts.push(`Mono — ${monoFonts.join("; ")}`);

  const designSystemLines: string[] = [];
  if (colorSwatches.length > 0) {
    designSystemLines.push(
      `Colors: ${colorSwatches.map((s) => `${s.hex} (${s.role})`).join(", ")}`,
    );
  }
  if (typographyParts.length > 0) {
    designSystemLines.push(`Typography: ${typographyParts.join("; ")}`);
  }
  if (spacingNotes.length > 0) designSystemLines.push(`Spacing: ${spacingNotes.join("; ")}`);
  if (motionNotes.length > 0) designSystemLines.push(`Motion: ${motionNotes.join("; ")}`);

  if (designSystemLines.length > 0) {
    sections.push(`## Design system\n${designSystemLines.join("\n")}`);
  }

  const always = dedupe(houseDna?.always ?? []);
  const never = dedupe(houseDna?.never ?? []);
  if (always.length > 0 || never.length > 0) {
    const lines: string[] = [];
    if (always.length > 0) lines.push(`Always: ${always.join(", ")}`);
    if (never.length > 0) lines.push(`Never: ${never.join(", ")}`);
    sections.push(`## House DNA — always / never\n${lines.join("\n")}`);
  }

  const referenceLines = items.map((item) => {
    const tags = item.styleTags.length > 0 ? ` — ${item.styleTags.join(", ")}` : "";
    return `- ${item.title}: ${item.conceptLine}${tags}`;
  });
  sections.push(`## Reference items\n${referenceLines.join("\n")}`);

  const platformLines: string[] = [platformLabel(platform)];
  if (platform !== "WEB") {
    const mobileItems = items.filter((i) => i.platform === "MOBILE");
    const osValues = dedupe(mobileItems.map((i) => i.platformOS));
    const aspectValues = dedupe(mobileItems.map((i) => i.aspectRatio));
    if (osValues.length > 0) platformLines.push(`OS: ${osValues.join(", ")}`);
    if (aspectValues.length > 0) {
      platformLines.push(`Aspect ratio: ${aspectValues.join(", ")}`);
    }
  }
  sections.push(`## Platform\n${platformLines.join("\n")}`);

  return sections.join("\n\n");
}

export function inferPlatform(items: SelectableItem[]): string {
  const distinct = dedupe(items.map((i) => i.platform));
  if (distinct.length === 1) return distinct[0];
  return "BOTH";
}

import CopyButton from "@/components/CopyButton";

export interface ColorSwatch {
  hex: string;
  role: string;
}

interface DesignSystemPanelProps {
  colorPalette: unknown;
  headingFont: string | null;
  bodyFont: string | null;
  monoFont: string | null;
  spacingNotes: string | null;
  motionNotes: string | null;
}

export function parseColorPalette(value: unknown): ColorSwatch[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is ColorSwatch =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as Record<string, unknown>).hex === "string" &&
      typeof (entry as Record<string, unknown>).role === "string",
  );
}

function formatTokens({
  colors,
  headingFont,
  bodyFont,
  monoFont,
  spacingNotes,
  motionNotes,
}: {
  colors: ColorSwatch[];
  headingFont: string | null;
  bodyFont: string | null;
  monoFont: string | null;
  spacingNotes: string | null;
  motionNotes: string | null;
}): string {
  const lines: string[] = [];

  if (colors.length > 0) {
    lines.push("Colors:");
    for (const { hex, role } of colors) {
      lines.push(`${hex} — ${role}`);
    }
  }
  if (headingFont) lines.push(`Heading font: ${headingFont}`);
  if (bodyFont) lines.push(`Body font: ${bodyFont}`);
  if (monoFont) lines.push(`Mono font: ${monoFont}`);
  if (spacingNotes) lines.push(`Spacing: ${spacingNotes}`);
  if (motionNotes) lines.push(`Motion: ${motionNotes}`);

  return lines.join("\n");
}

export default function DesignSystemPanel({
  colorPalette,
  headingFont,
  bodyFont,
  monoFont,
  spacingNotes,
  motionNotes,
}: DesignSystemPanelProps) {
  const colors = parseColorPalette(colorPalette);

  const hasAnyField =
    colors.length > 0 ||
    headingFont !== null ||
    bodyFont !== null ||
    monoFont !== null ||
    spacingNotes !== null ||
    motionNotes !== null;

  if (!hasAnyField) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-foreground/[0.03] p-4">
      <span className="font-mono text-xs uppercase tracking-wide text-foreground/50">
        Design system
      </span>

      {colors.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {colors.map(({ hex, role }) => (
            <div key={`${hex}-${role}`} className="flex items-center gap-2">
              <span
                className="h-5 w-5 rounded-full border border-border"
                style={{ backgroundColor: hex }}
              />
              <span className="font-mono text-xs text-foreground/70">
                {hex}
              </span>
              <span className="text-xs text-foreground/50">{role}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1 text-sm text-foreground/70">
        {headingFont && (
          <p>
            <span className="text-foreground/50">Heading font — </span>
            {headingFont}
          </p>
        )}
        {bodyFont && (
          <p>
            <span className="text-foreground/50">Body font — </span>
            {bodyFont}
          </p>
        )}
        {monoFont && (
          <p>
            <span className="text-foreground/50">Mono font — </span>
            {monoFont}
          </p>
        )}
        {spacingNotes && (
          <p>
            <span className="text-foreground/50">Spacing — </span>
            {spacingNotes}
          </p>
        )}
        {motionNotes && (
          <p>
            <span className="text-foreground/50">Motion — </span>
            {motionNotes}
          </p>
        )}
      </div>

      <div>
        <CopyButton
          text={formatTokens({
            colors,
            headingFont,
            bodyFont,
            monoFont,
            spacingNotes,
            motionNotes,
          })}
          label="Copy Design Tokens"
        />
      </div>
    </div>
  );
}

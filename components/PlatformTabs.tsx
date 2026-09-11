import Link from "next/link";

const PLATFORM_OPTIONS = [
  { value: undefined, label: "All" },
  { value: "WEB", label: "Web" },
  { value: "MOBILE", label: "Mobile" },
  { value: "BOTH", label: "Both" },
] as const;

interface PlatformTabsProps {
  activeSlug?: string;
  activePlatform?: string;
}

function tabHref(slug: string | undefined, platform: string | undefined) {
  const params = new URLSearchParams();
  if (slug) params.set("collection", slug);
  if (platform) params.set("platform", platform);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default function PlatformTabs({
  activeSlug,
  activePlatform,
}: PlatformTabsProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      {PLATFORM_OPTIONS.map((option) => (
        <Link
          key={option.label}
          href={tabHref(activeSlug, option.value)}
          className={`transition-colors ${
            activePlatform === option.value
              ? "text-foreground"
              : "text-foreground/50 hover:text-foreground"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

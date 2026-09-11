import Link from "next/link";

interface CollectionTabsProps {
  collections: { slug: string; name: string; itemCount: number }[];
  totalCount: number;
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

export default function CollectionTabs({
  collections,
  totalCount,
  activeSlug,
  activePlatform,
}: CollectionTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 overflow-x-auto rounded-full border border-border p-1">
      <Link
        href={tabHref(undefined, activePlatform)}
        className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors ${
          !activeSlug
            ? "bg-foreground/10 text-foreground"
            : "text-foreground/60 hover:text-foreground"
        }`}
      >
        All ({totalCount})
      </Link>
      {collections.map((collection) => (
        <Link
          key={collection.slug}
          href={tabHref(collection.slug, activePlatform)}
          className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors ${
            activeSlug === collection.slug
              ? "bg-foreground/10 text-foreground"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {collection.name} ({collection.itemCount})
        </Link>
      ))}
    </div>
  );
}

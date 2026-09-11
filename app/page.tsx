import CollectionTabs from "@/components/CollectionTabs";
import PlatformTabs from "@/components/PlatformTabs";
import ItemGrid from "@/components/ItemGrid";
import HouseDnaPanel from "@/components/HouseDnaPanel";
import CollectionDetail from "@/components/CollectionDetail";
import DesignSystemPanel from "@/components/DesignSystemPanel";
import NewCollectionButton from "@/components/NewCollectionButton";
import EditCollectionButton from "@/components/EditCollectionButton";
import { prisma } from "@/lib/prisma";
import { Platform } from "@/app/generated/prisma/enums";

const PLATFORM_VALUES = new Set<string>(Object.values(Platform));

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const collectionParam = params.collection;
  const platformParam = params.platform;

  const activeSlug =
    typeof collectionParam === "string" ? collectionParam : undefined;
  const activePlatform =
    typeof platformParam === "string" && PLATFORM_VALUES.has(platformParam)
      ? (platformParam as Platform)
      : undefined;

  const collections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      deployFor: true,
      riskPrompt: true,
      vocabTags: true,
      briefBlock: true,
      colorPalette: true,
      headingFont: true,
      bodyFont: true,
      monoFont: true,
      spacingNotes: true,
      motionNotes: true,
      _count: { select: { items: true } },
    },
  });

  const totalCount = collections.reduce((sum, c) => sum + c._count.items, 0);
  const activeCollection = collections.find((c) => c.slug === activeSlug);

  const items = await prisma.item.findMany({
    where: {
      ...(activeCollection && { collectionId: activeCollection.id }),
      ...(activePlatform && { platform: activePlatform }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      conceptLine: true,
      styleTags: true,
      vocabTags: true,
      imageRecipe: true,
      imageUrl: true,
      captureMethod: true,
      platform: true,
    },
  });

  return (
    <div className="flex flex-col gap-4 p-8">
      <HouseDnaPanel />
      <div className="flex items-center justify-between gap-4">
        <CollectionTabs
          collections={collections.map((c) => ({
            slug: c.slug,
            name: c.name,
            itemCount: c._count.items,
          }))}
          totalCount={totalCount}
          activeSlug={activeSlug}
          activePlatform={activePlatform}
        />
        <NewCollectionButton />
      </div>
      <PlatformTabs activeSlug={activeSlug} activePlatform={activePlatform} />
      {activeCollection && (
        <div className="flex flex-col gap-2">
          <CollectionDetail
            name={activeCollection.name}
            description={activeCollection.description}
            deployFor={activeCollection.deployFor}
            vocabTags={activeCollection.vocabTags}
            briefBlock={activeCollection.briefBlock}
          />
          <EditCollectionButton collection={activeCollection} />
        </div>
      )}
      {activeCollection && (
        <DesignSystemPanel
          colorPalette={activeCollection.colorPalette}
          headingFont={activeCollection.headingFont}
          bodyFont={activeCollection.bodyFont}
          monoFont={activeCollection.monoFont}
          spacingNotes={activeCollection.spacingNotes}
          motionNotes={activeCollection.motionNotes}
        />
      )}
      <ItemGrid items={items} />
    </div>
  );
}

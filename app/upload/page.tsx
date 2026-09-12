import UploadForm from "@/components/UploadForm";
import { prisma } from "@/lib/prisma";
import { isScreenshotCaptureConfigured } from "@/lib/screenshotone";
import { parseColorPalette } from "@/components/DesignSystemPanel";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const rawCollections = await prisma.collection.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      colorPalette: true,
      headingFont: true,
      bodyFont: true,
      monoFont: true,
      spacingNotes: true,
      motionNotes: true,
    },
  });

  const collections = rawCollections.map((c) => ({
    ...c,
    colorPalette: parseColorPalette(c.colorPalette),
  }));

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-sm font-medium tracking-tight">Upload</h1>
      <UploadForm
        collections={collections}
        captureUrlEnabled={isScreenshotCaptureConfigured()}
      />
    </div>
  );
}

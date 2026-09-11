-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('WEB', 'MOBILE', 'BOTH');

-- CreateEnum
CREATE TYPE "CaptureMethod" AS ENUM ('MANUAL_SCREENSHOT', 'PHONE_SCREENSHOT', 'SCREEN_RECORDING', 'SCREENSHOT_API', 'CHROME_ASSISTED');

-- CreateTable
CREATE TABLE "HouseDNA" (
    "id" TEXT NOT NULL,
    "always" TEXT[],
    "never" TEXT[],

    CONSTRAINT "HouseDNA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deployFor" TEXT NOT NULL,
    "riskPrompt" TEXT NOT NULL,
    "vocabTags" TEXT[],
    "briefBlock" TEXT NOT NULL,
    "colorPalette" JSONB,
    "headingFont" TEXT,
    "bodyFont" TEXT,
    "monoFont" TEXT,
    "spacingNotes" TEXT,
    "motionNotes" TEXT,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "conceptLine" TEXT NOT NULL,
    "styleTags" TEXT[],
    "vocabTags" TEXT[],
    "imageRecipe" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "platform" "Platform" NOT NULL DEFAULT 'WEB',
    "screenType" TEXT,
    "platformOS" TEXT,
    "aspectRatio" TEXT,
    "captureMethod" "CaptureMethod" NOT NULL DEFAULT 'MANUAL_SCREENSHOT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectionId" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

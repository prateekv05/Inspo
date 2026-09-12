"use server";

import { redirect } from "next/navigation";
import { uploadImage } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { uniqueCollectionSlug } from "@/lib/slug";
import type { Platform } from "@/app/generated/prisma/enums";
import type { CaptureMethodValue } from "@/lib/captureMethod";

export async function uploadImageAction(file: File): Promise<string> {
  return uploadImage(file);
}

interface NewCollectionInput {
  name: string;
  description: string;
  deployFor: string;
  vocabTags: string[];
  briefBlock: string;
}

export interface CreateItemInput {
  title: string;
  conceptLine: string;
  styleTags: string[];
  vocabTags: string[];
  imageRecipe: string;
  imageUrl: string;
  sourceUrl: string | null;
  platform: Platform;
  screenType: string | null;
  platformOS: string | null;
  aspectRatio: string | null;
  captureMethod: CaptureMethodValue;
  collectionId: string | null;
  newCollection: NewCollectionInput | null;
}

export async function createItemAction(input: CreateItemInput) {
  let collectionId = input.collectionId;
  let collectionSlug: string;

  if (collectionId) {
    const collection = await prisma.collection.findUniqueOrThrow({
      where: { id: collectionId },
      select: { slug: true },
    });
    collectionSlug = collection.slug;
  } else {
    if (!input.newCollection) {
      throw new Error("Select an existing collection or create a new one.");
    }
    const slug = await uniqueCollectionSlug(input.newCollection.name);
    const collection = await prisma.collection.create({
      data: {
        name: input.newCollection.name,
        slug,
        description: input.newCollection.description,
        deployFor: input.newCollection.deployFor,
        riskPrompt: "",
        vocabTags: input.newCollection.vocabTags,
        briefBlock: input.newCollection.briefBlock,
      },
    });
    collectionId = collection.id;
    collectionSlug = collection.slug;
  }

  await prisma.item.create({
    data: {
      title: input.title,
      conceptLine: input.conceptLine,
      styleTags: input.styleTags,
      vocabTags: input.vocabTags,
      imageRecipe: input.imageRecipe,
      imageUrl: input.imageUrl,
      sourceUrl: input.sourceUrl,
      platform: input.platform,
      screenType: input.screenType,
      platformOS: input.platformOS,
      aspectRatio: input.aspectRatio,
      captureMethod: input.captureMethod,
      collectionId,
    },
  });

  redirect(`/?collection=${collectionSlug}`);
}

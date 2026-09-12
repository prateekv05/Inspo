import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueCollectionSlug } from "@/lib/slug";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    description,
    deployFor,
    riskPrompt,
    vocabTags,
    briefBlock,
    colorPalette,
    headingFont,
    bodyFont,
    monoFont,
    spacingNotes,
    motionNotes,
  } = body;

  const slug = await uniqueCollectionSlug(name);

  const collection = await prisma.collection.create({
    data: {
      name,
      slug,
      description,
      deployFor,
      riskPrompt,
      vocabTags,
      briefBlock,
      colorPalette,
      headingFont,
      bodyFont,
      monoFont,
      spacingNotes,
      motionNotes,
    },
  });

  return NextResponse.json(collection, { status: 201 });
}

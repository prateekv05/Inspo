import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const collection = await prisma.collection.update({
    where: { id },
    data: {
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
    },
  });

  return NextResponse.json(collection);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let suffix = 2;
  while (await prisma.collection.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

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

  const slug = await uniqueSlug(name);

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

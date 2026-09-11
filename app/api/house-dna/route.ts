import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let houseDna = await prisma.houseDNA.findFirst();

  if (!houseDna) {
    houseDna = await prisma.houseDNA.create({
      data: { always: [], never: [] },
    });
  }

  return NextResponse.json(houseDna);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, always, never } = body;

  const houseDna = await prisma.houseDNA.update({
    where: { id },
    data: { always, never },
  });

  return NextResponse.json(houseDna);
}

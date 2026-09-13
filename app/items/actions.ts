"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function deleteItemAction(id: string, imageUrl: string) {
  await prisma.item.delete({ where: { id } });

  try {
    await del(imageUrl);
  } catch {
    // Best-effort — the row is already gone; an orphaned blob just means
    // unused storage, not a broken app state.
  }

  revalidatePath("/");
}

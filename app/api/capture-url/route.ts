import { NextRequest, NextResponse } from "next/server";
import { captureScreenshot, ScreenshotCaptureError } from "@/lib/screenshotone";
import { uploadImage } from "@/lib/blob";

// Full-page capture of a heavy/animated site can take longer than the
// platform's default function timeout, which otherwise surfaces as a bare
// 502 with no error message in the logs.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  if (typeof url !== "string" || url.trim() === "") {
    return NextResponse.json({ error: "A URL is required." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return NextResponse.json({ error: "Enter a valid URL." }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "Enter a valid URL." }, { status: 400 });
  }

  try {
    const { arrayBuffer, contentType } = await captureScreenshot(
      parsed.toString(),
    );
    const extension = contentType.includes("png") ? "png" : "jpg";
    const file = new File([arrayBuffer], `capture.${extension}`, {
      type: contentType,
    });
    const imageUrl = await uploadImage(file);

    return NextResponse.json({ imageUrl, sourceUrl: parsed.toString() });
  } catch (error) {
    console.error("[capture-url] failed:", error);
    const message =
      error instanceof ScreenshotCaptureError
        ? error.message
        : "Couldn't capture that URL.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

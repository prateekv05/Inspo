import "server-only";
import { createHmac } from "crypto";

const API_TAKE_URL = "https://api.screenshotone.com/take";

export class ScreenshotCaptureError extends Error {}

export function isScreenshotCaptureConfigured(): boolean {
  return Boolean(
    process.env.SCREENSHOTONE_ACCESS_KEY && process.env.SCREENSHOTONE_SECRET_KEY,
  );
}

export async function captureScreenshot(
  targetUrl: string,
): Promise<{ arrayBuffer: ArrayBuffer; contentType: string }> {
  const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
  const secretKey = process.env.SCREENSHOTONE_SECRET_KEY;

  if (!accessKey || !secretKey) {
    throw new ScreenshotCaptureError(
      "Screenshot capture isn't configured — set SCREENSHOTONE_ACCESS_KEY and SCREENSHOTONE_SECRET_KEY.",
    );
  }

  const query = new URLSearchParams({
    url: targetUrl,
    format: "png",
    full_page: "true",
    block_ads: "true",
    block_cookie_banners: "true",
    viewport_width: "1440",
    viewport_height: "900",
  });
  query.append("access_key", accessKey);

  const queryString = query.toString();
  const signature = createHmac("sha256", secretKey)
    .update(queryString)
    .digest("hex");

  const response = await fetch(
    `${API_TAKE_URL}?${queryString}&signature=${signature}`,
  );

  if (!response.ok) {
    throw new ScreenshotCaptureError(
      `Screenshot capture failed (${response.status}).`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const arrayBuffer = await response.arrayBuffer();

  return { arrayBuffer, contentType };
}

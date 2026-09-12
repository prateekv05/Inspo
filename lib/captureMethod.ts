export const CAPTURE_METHOD_LABELS: Record<string, string> = {
  MANUAL_SCREENSHOT: "Manual screenshot — colors approximate",
  PHONE_SCREENSHOT: "Phone screenshot — colors approximate",
  SCREEN_RECORDING: "Screen recording — motion notes reliable",
  SCREENSHOT_API: "Screenshot API — colors reliable",
  CHROME_ASSISTED: "Chrome-assisted capture — colors & fonts reliable",
};

export const CAPTURE_METHOD_VALUES = [
  "MANUAL_SCREENSHOT",
  "PHONE_SCREENSHOT",
  "SCREEN_RECORDING",
  "SCREENSHOT_API",
  "CHROME_ASSISTED",
] as const;

export type CaptureMethodValue = (typeof CAPTURE_METHOD_VALUES)[number];

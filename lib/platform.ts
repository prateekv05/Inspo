export const PLATFORM_OPTIONS = [
  { value: "WEB", label: "Web" },
  { value: "MOBILE", label: "Mobile" },
  { value: "BOTH", label: "Both" },
] as const;

export type PlatformValue = (typeof PLATFORM_OPTIONS)[number]["value"];

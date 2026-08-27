export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8081";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const CHAT_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;
export type ChatModel = (typeof CHAT_MODELS)[number];

export const SOURCE_TYPES = [
  "PDF",
  "WEBSITE",
  "YOUTUBE",
  "TEXT",
  "MARKDOWN",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const SOURCE_STATUSES = [
  "PENDING",
  "PROCESSING",
  "READY",
  "FAILED",
] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

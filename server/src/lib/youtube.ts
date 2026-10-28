
import { ValidationError } from "../types/app-error.js";

const SUPADATA_URL = "https://api.supadata.ai/v1/transcript";

type TranscriptSegment = {
  text: string;
  offset?: number;
  duration?: number;
};

type TranscriptResponse = {
  content?: string | TranscriptSegment[];
  jobId?: string;
  status?: string;
  error?: string;
  message?: string;
  details?: string;
};

function extractVideoId(input: string): string {
  const value = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new ValidationError("Enter a valid YouTube URL");
  }

  if (!["https:", "http:"].includes(url.protocol)) {
    throw new ValidationError("Enter a valid YouTube URL");
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = parts[0] ?? null;
  } else if (
    ["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)
  ) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else if (
      ["shorts", "embed", "live", "v"].includes(parts[0])
    ) {
      videoId = parts[1] ?? null;
    }
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    throw new ValidationError("Enter a valid YouTube video URL");
  }

  return videoId;
}

function formatTimestamp(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const pad = (number: number) => String(number).padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`
    : `${pad(minutes)}:${pad(remainingSeconds)}`;
}

function getApiError(status: number, data: TranscriptResponse): string {
  const error = `${data.error ?? ""} ${data.message ?? ""} ${data.details ?? ""}`
    .toLowerCase();

  if (status === 401 || status === 403) {
    return "YouTube transcript API authentication failed. Check your Supadata API key.";
  }

  if (status === 402 || status === 429) {
    return "YouTube transcript API quota or rate limit reached. Please try again later.";
  }

  if (
    error.includes("transcript-unavailable") ||
    error.includes("no transcript")
  ) {
    return "No captions are available for this YouTube video.";
  }

  if (status === 400 || status === 404) {
    return "The YouTube video is invalid, unavailable, or unsupported.";
  }

  return "Could not fetch the YouTube transcript. Please try again later.";
}

async function requestTranscript(
  url: string,
  apiKey: string
): Promise<TranscriptResponse> {
  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30000),
  });

  const data = (await response.json().catch(() => ({}))) as TranscriptResponse;

  if (!response.ok) {
    console.error("Supadata transcript request failed:", {
      status: response.status,
      error: data.error,
      message: data.message,
      details: data.details,
    });

    throw new ValidationError(getApiError(response.status, data));
  }

  return data;
}

async function resolveTranscript(
  initialData: TranscriptResponse,
  apiKey: string
): Promise<TranscriptResponse> {
  if (!initialData.jobId) {
    return initialData;
  }

  const jobId = initialData.jobId;

  if (!/^[a-zA-Z0-9_-]+$/.test(jobId)) {
    throw new ValidationError("Invalid transcript job ID.");
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = await requestTranscript(
      `${SUPADATA_URL}/${jobId}`,
      apiKey
    );

    if (data.status === "failed") {
      throw new ValidationError(
        "YouTube transcript processing failed."
      );
    }

    if (data.status === "completed" || data.content !== undefined) {
      return data;
    }
  }

  throw new ValidationError(
    "YouTube transcript is still processing. Please try again later."
  );
}

export async function fetchYoutubeTranscript(url: string) {
  const videoId = extractVideoId(url);

  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    throw new Error("SUPADATA_API_KEY is not configured");
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const params = new URLSearchParams({
    url: videoUrl,
    mode: "native",
  });

  try {
    const initialData = await requestTranscript(
      `${SUPADATA_URL}?${params.toString()}`,
      apiKey
    );

    const data = await resolveTranscript(initialData, apiKey);

    let content = "";

    if (typeof data.content === "string") {
      content = data.content.trim();
    } else if (Array.isArray(data.content)) {
      content = data.content
        .filter(
          (segment) =>
            typeof segment.text === "string" &&
            segment.text.trim().length > 0
        )
        .map((segment) => {
          const text = segment.text.replace(/\s+/g, " ").trim();

          if (typeof segment.offset === "number") {
            return `[${formatTimestamp(segment.offset)}] ${text}`;
          }

          return text;
        })
        .join("\n")
        .trim();
    }

    if (!content) {
      throw new ValidationError(
        "No captions are available for this YouTube video."
      );
    }

    return { videoId, content };
  } catch (error) {
    console.error("YouTube transcript error:", error);

    if (error instanceof ValidationError) {
      throw error;
    }

    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      throw new ValidationError(
        "YouTube transcript request timed out. Please try again."
      );
    }

    throw new ValidationError(
      "Could not connect to the YouTube transcript service."
    );
  }
}

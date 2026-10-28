
import { YoutubeTranscript } from "youtube-transcript";
import { ValidationError } from "../types/app-error.js";

function extractVideoId(input: string): string {
  const value = input.trim();

  // Accept a raw YouTube video ID.
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new ValidationError("Enter a valid YouTube URL");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ValidationError("Enter a valid YouTube URL");
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  let videoId: string | null = null;

  if (hostname === "youtu.be") {
    videoId = parts[0] ?? null;
  } else if (
    hostname === "youtube.com" ||
    hostname === "m.youtube.com" ||
    hostname === "music.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else if (
      parts[0] === "shorts" ||
      parts[0] === "embed" ||
      parts[0] === "live" ||
      parts[0] === "v"
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
  const totalSeconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const twoDigits = (value: number) =>
    String(value).padStart(2, "0");

  if (hours > 0) {
    return `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
  }

  return `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}

export async function fetchYoutubeTranscript(url: string) {
  const videoId = extractVideoId(url);

  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!segments || segments.length === 0) {
      throw new ValidationError(
        "No transcript is available for this video."
      );
    }

    const content = segments
      .filter(
        (segment) =>
          typeof segment.text === "string" &&
          segment.text.trim().length > 0
      )
      .map((segment) => {
        const text = segment.text
          .replace(/\s+/g, " ")
          .trim();

        const offset =
          typeof segment.offset === "number"
            ? segment.offset
            : 0;

        return `[${formatTimestamp(offset)}] ${text}`;
      })
      .join("\n")
      .trim();

    if (!content) {
      throw new ValidationError(
        "The video transcript is empty."
      );
    }

    return {
      videoId,
      content,
    };
  } catch (error) {
    console.error("YouTube transcript error:", error);

    if (error instanceof ValidationError) {
      throw error;
    }

    const message =
      error instanceof Error
        ? error.message.toLowerCase()
        : "";

    if (
      message.includes("disabled") ||
      message.includes("transcript is disabled")
    ) {
      throw new ValidationError(
        "Transcripts are disabled for this YouTube video."
      );
    }

    if (
      message.includes("unavailable") ||
      message.includes("not available")
    ) {
      throw new ValidationError(
        "This YouTube video or its transcript is unavailable."
      );
    }

    if (
      message.includes("too many requests") ||
      message.includes("429")
    ) {
      throw new ValidationError(
        "YouTube is temporarily rate-limiting transcript requests. Please try again later."
      );
    }

    throw new ValidationError(
      "Could not retrieve this video's transcript. Captions may be unavailable, or YouTube may be blocking the request."
    );
  }
}

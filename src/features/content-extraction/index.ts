import type { ContentType } from "@/generated/prisma";
import type { ExtractionResult, ContentTypeDetection } from "./types";
import {
  extractYouTubeTranscript,
  extractTikTokTranscript,
  isYouTubeURL,
  isTikTokURL,
} from "./video-extractor";
import { extractPDFText, isPDFURL } from "./pdf-extractor";
import { extractArticleText, isArticleURL } from "./url-extractor";
import { extractPodcastTranscript, isPodcastURL } from "./podcast-extractor";

/**
 * Detect content type from URL
 */
export function detectContentType(url: string): ContentTypeDetection {
  // Check in order of specificity
  if (isYouTubeURL(url)) {
    return { contentType: "youtube", confidence: 1.0 };
  }

  if (isTikTokURL(url)) {
    return { contentType: "tiktok", confidence: 1.0 };
  }

  if (isPDFURL(url)) {
    return { contentType: "pdf", confidence: 1.0 };
  }

  if (isPodcastURL(url)) {
    return { contentType: "podcast", confidence: 0.9 };
  }

  // Default to article/URL
  if (isArticleURL(url)) {
    return { contentType: "url", confidence: 0.7 };
  }

  // Fallback
  return { contentType: "url", confidence: 0.5 };
}

/**
 * Extract content based on detected content type
 */
export async function extractContent(url: string): Promise<{
  contentType: ContentType;
  result: ExtractionResult;
}> {
  const detection = detectContentType(url);
  const { contentType } = detection;

  console.log(`Detected content type: ${contentType} (confidence: ${detection.confidence})`);

  let result: ExtractionResult;

  switch (contentType) {
    case "youtube":
      result = await extractYouTubeTranscript(url);
      break;

    case "tiktok":
      result = await extractTikTokTranscript(url);
      break;

    case "pdf":
      result = await extractPDFText(url);
      break;

    case "url":
      result = await extractArticleText(url);
      break;

    case "podcast":
      result = await extractPodcastTranscript(url);
      break;

    default:
      result = {
        success: false,
        error: `Unsupported content type: ${contentType}`,
      };
  }

  return {
    contentType,
    result,
  };
}

// Re-export extractors for direct use
export {
  extractYouTubeTranscript,
  extractTikTokTranscript,
  extractPDFText,
  extractArticleText,
  extractPodcastTranscript,
};

// Re-export type detectors
export {
  isYouTubeURL,
  isTikTokURL,
  isPDFURL,
  isArticleURL,
  isPodcastURL,
};

// Re-export types
export type * from "./types";

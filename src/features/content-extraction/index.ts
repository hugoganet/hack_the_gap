import type { ContentType } from "@/generated/prisma";
import type { ExtractionResult, ContentTypeDetection } from "./types";
import {
  extractYouTubeTranscript,
  extractTikTokTranscript,
  isYouTubeURL,
  isTikTokURL,
} from "./video-extractor";
import { extractArticleText, isArticleURL } from "./url-extractor";
import { extractPodcastTranscript, isPodcastURL } from "./podcast-extractor";

/**
 * Dynamic import for PDF extractor to prevent canvas/DOMMatrix issues
 * in serverless environments. The pdf-parse library uses canvas internally,
 * which requires browser APIs not available in Node.js/Vercel runtime.
 */
async function loadPDFExtractor() {
  const { extractPDFText, isPDFURL } = await import("./pdf-extractor");
  return { extractPDFText, isPDFURL };
}

/**
 * Detect if URL is a PDF (without importing pdf-extractor)
 */
function isPDFURLLocal(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith(".pdf") || lowerUrl.includes(".pdf?");
}

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

  if (isPDFURLLocal(url)) {
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
 * Uses dynamic imports for PDF extraction to avoid bundling canvas in non-PDF routes
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

    case "pdf": {
      // Dynamic import to prevent canvas/DOMMatrix issues in serverless
      const { extractPDFText } = await loadPDFExtractor();
      result = await extractPDFText(url);
      break;
    }

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
  extractArticleText,
  extractPodcastTranscript,
};

/**
 * Re-export PDF extractor with dynamic import wrapper
 * This prevents canvas from being bundled in non-PDF routes
 */
export async function extractPDFText(url: string) {
  const { extractPDFText: pdfExtractor } = await loadPDFExtractor();
  return pdfExtractor(url);
}

/**
 * Re-export PDF URL detector with dynamic import wrapper
 */
export async function isPDFURL(url: string): Promise<boolean> {
  const { isPDFURL: pdfDetector } = await loadPDFExtractor();
  return pdfDetector(url);
}

// Re-export type detectors (non-PDF)
export {
  isYouTubeURL,
  isTikTokURL,
  isArticleURL,
  isPodcastURL,
};

// Re-export types
export type * from "./types";

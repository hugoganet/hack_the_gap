import type { URLExtractionResult } from "./types";

/**
 * Extract article text from URL
 *
 * TODO: Implement using a service like:
 * - Mozilla Readability
 * - Puppeteer/Playwright for dynamic content
 * - Jina AI Reader API (https://jina.ai/reader)
 * - r.jina.ai prefix for instant article extraction
 */
export async function extractArticleText(url: string): Promise<URLExtractionResult> {
  // Placeholder implementation
  console.log("Article extraction not yet implemented for URL:", url);

  return {
    success: false,
    error: "Article extraction is not yet implemented. Coming soon!",
  };
}

/**
 * Detect if URL is a regular web article
 */
export function isArticleURL(url: string): boolean {
  // Basic heuristic - not a video platform, not a PDF
  const lowerUrl = url.toLowerCase();
  const videoSites = ["youtube.com", "youtu.be", "tiktok.com"];
  const isVideo = videoSites.some(site => lowerUrl.includes(site));
  const isPDF = lowerUrl.endsWith(".pdf") || lowerUrl.includes(".pdf?");

  return !isVideo && !isPDF;
}

import { env } from "@/lib/env";
import type { VideoExtractionResult } from "./types";

type SocialKitResponse = {
  success: boolean;
  data?: {
    url: string;
    transcript: string;
    transcriptSegments: {
      text: string;
      start: number;
      duration: number;
      timestamp: string;
    }[];
    wordCount: number;
    segments: number;
  };
  error?: string;
};

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Handle youtu.be format
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    }

    // Handle youtube.com format
    if (urlObj.hostname.includes("youtube.com")) {
      // Check for /watch?v= format
      const vParam = urlObj.searchParams.get("v");
      if (vParam) {
        return vParam;
      }

      // Check for /shorts/ format (YouTube Shorts)
      const shortsMatch = urlObj.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) {
        return shortsMatch[1];
      }

      // Check for /embed/ format
      const embedMatch = urlObj.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) {
        return embedMatch[1];
      }

      // Check for /v/ format
      const vMatch = urlObj.pathname.match(/\/v\/([^/?]+)/);
      if (vMatch?.[1]) {
        return vMatch[1];
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting YouTube video ID:", error);
    return null;
  }
}

/**
 * Extract TikTok video ID from URL
 * Format: https://www.tiktok.com/@username/video/VIDEO_ID
 */
function extractTikTokVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Check if it's a TikTok URL
    if (urlObj.hostname.includes("tiktok.com")) {
      // Extract from /video/VIDEO_ID format
      const videoMatch = urlObj.pathname.match(/\/video\/(\d+)/);
      if (videoMatch?.[1]) {
        return videoMatch[1];
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting TikTok video ID:", error);
    return null;
  }
}

/**
 * Extract transcript from YouTube video using SocialKit API
 */
export async function extractYouTubeTranscript(
  url: string
): Promise<VideoExtractionResult> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    return {
      success: false,
      error: "Could not extract video ID from YouTube URL",
    };
  }

  if (!env.SOCIALKIT_API_KEY) {
    console.error("SOCIALKIT_API_KEY is not configured");
    return {
      success: false,
      error: "API key not configured. Please check your environment variables.",
    };
  }

  const apiUrl = `https://api.socialkit.dev/youtube/transcript?access_key=${env.SOCIALKIT_API_KEY}&url=${encodeURIComponent(url)}`;
  console.log("Calling SocialKit YouTube API:", apiUrl.replace(env.SOCIALKIT_API_KEY, "***"));

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);

      let errorData: { message?: string };
      try {
        errorData = JSON.parse(errorText) as { message?: string };
      } catch {
        errorData = { message: errorText };
      }

      return {
        success: false,
        error: errorData.message ?? `API error: ${response.status} - ${errorText}`,
      };
    }

    const apiResponse: SocialKitResponse = await response.json();

    if (!apiResponse.success || apiResponse.error) {
      return {
        success: false,
        error: apiResponse.error ?? "Failed to process video",
      };
    }

    if (!apiResponse.data) {
      return {
        success: false,
        error: "Failed to process video - no data returned",
      };
    }

    const fullTranscript = apiResponse.data.transcript;

    console.log("Processed YouTube video:", {
      url: apiResponse.data.url,
      wordCount: apiResponse.data.wordCount,
      segments: apiResponse.data.segments,
      transcriptPreview: `${fullTranscript.substring(0, 100)}...`,
    });

    return {
      success: true,
      data: {
        extractedText: fullTranscript,
        metadata: {
          videoId,
          url: apiResponse.data.url,
          wordCount: apiResponse.data.wordCount,
          segments: apiResponse.data.segments,
          transcriptSegments: apiResponse.data.transcriptSegments,
        },
      },
    };
  } catch (error) {
    console.error("YouTube extraction error:", error);
    return {
      success: false,
      error: "Failed to fetch transcript from YouTube",
    };
  }
}

/**
 * Extract transcript from TikTok video using SocialKit API
 */
export async function extractTikTokTranscript(
  url: string
): Promise<VideoExtractionResult> {
  const videoId = extractTikTokVideoId(url);
  if (!videoId) {
    return {
      success: false,
      error: "Could not extract video ID from TikTok URL",
    };
  }

  if (!env.SOCIALKIT_API_KEY) {
    console.error("SOCIALKIT_API_KEY is not configured");
    return {
      success: false,
      error: "API key not configured. Please check your environment variables.",
    };
  }

  const apiUrl = `https://api.socialkit.dev/tiktok/transcript?access_key=${env.SOCIALKIT_API_KEY}&url=${encodeURIComponent(url)}`;
  console.log("Calling SocialKit TikTok API:", apiUrl.replace(env.SOCIALKIT_API_KEY, "***"));

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);

      let errorData: { message?: string };
      try {
        errorData = JSON.parse(errorText) as { message?: string };
      } catch {
        errorData = { message: errorText };
      }

      return {
        success: false,
        error: errorData.message ?? `API error: ${response.status} - ${errorText}`,
      };
    }

    const apiResponse: SocialKitResponse = await response.json();

    if (!apiResponse.success || apiResponse.error) {
      return {
        success: false,
        error: apiResponse.error ?? "Failed to process video",
      };
    }

    if (!apiResponse.data) {
      return {
        success: false,
        error: "Failed to process video - no data returned",
      };
    }

    const fullTranscript = apiResponse.data.transcript;

    console.log("Processed TikTok video:", {
      url: apiResponse.data.url,
      wordCount: apiResponse.data.wordCount,
      segments: apiResponse.data.segments,
      transcriptPreview: `${fullTranscript.substring(0, 100)}...`,
    });

    return {
      success: true,
      data: {
        extractedText: fullTranscript,
        metadata: {
          videoId,
          url: apiResponse.data.url,
          wordCount: apiResponse.data.wordCount,
          segments: apiResponse.data.segments,
          transcriptSegments: apiResponse.data.transcriptSegments,
        },
      },
    };
  } catch (error) {
    console.error("TikTok extraction error:", error);
    return {
      success: false,
      error: "Failed to fetch transcript from TikTok",
    };
  }
}

/**
 * Detect if URL is a YouTube video
 */
export function isYouTubeURL(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Detect if URL is a TikTok video
 */
export function isTikTokURL(url: string): boolean {
  return url.includes("tiktok.com");
}

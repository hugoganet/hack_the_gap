"use server";

import { env } from "@/lib/env";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProcessContentSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

type SocialKitYouTubeResponse = {
  success: boolean;
  data?: {
    url: string;
    transcript: string; // Already a full string, not an array
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

export async function processContent(url: string) {
  // Get authenticated user
  const user = await getRequiredUser();

  try {
    // Validate URL
    const validation = ProcessContentSchema.safeParse({ url });
    
    if (!validation.success) {
      return {
        success: false,
        error: "Please enter a valid URL",
      };
    }

    const validatedUrl = validation.data.url;

    // Check if it's a YouTube URL
    const isYouTube = 
      validatedUrl.includes("youtube.com") || 
      validatedUrl.includes("youtu.be");

    if (!isYouTube) {
      return {
        success: false,
        error: "Currently only YouTube videos are supported",
      };
    }

    // Extract video ID from YouTube URL
    const videoId = extractYouTubeVideoId(validatedUrl);
    
    if (!videoId) {
      return {
        success: false,
        error: "Could not extract video ID from YouTube URL",
      };
    }

    // Check if API key is available
    if (!env.SOCIALKIT_API_KEY) {
      console.error("SOCIALKIT_API_KEY is not configured");
      return {
        success: false,
        error: "API key not configured. Please check your environment variables.",
      };
    }

    // Based on SocialKit docs: GET /youtube/transcript?access_key=<key>&url=<youtube-url>
    const apiUrl = `https://api.socialkit.dev/youtube/transcript?access_key=${env.SOCIALKIT_API_KEY}&url=${encodeURIComponent(validatedUrl)}`;
    console.log("Calling SocialKit API:", apiUrl.replace(env.SOCIALKIT_API_KEY, "***"));

    // Call SocialKit API
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
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      return {
        success: false,
        error: errorData.message ?? `API error: ${response.status} - ${errorText}`,
      };
    }

    const apiResponse: SocialKitYouTubeResponse = await response.json();

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

    // The transcript is already a full string from the API
    const fullTranscript = apiResponse.data.transcript;
    
    console.log("Processed video data:", {
      url: apiResponse.data.url,
      wordCount: apiResponse.data.wordCount,
      segments: apiResponse.data.segments,
      transcriptPreview: `${fullTranscript.substring(0, 100)}...`,
    });

    // Store transcript in database
    try {
      const videoJob = await prisma.videoJob.create({
        data: {
          userId: user.id,
          url: validatedUrl,
          youtubeVideoId: videoId,
          transcript: fullTranscript,
          status: "transcript_fetched",
        },
      });

      console.log("Stored video job in database:", videoJob.id);

      return {
        success: true,
        message: `Successfully fetched transcript! (${apiResponse.data.wordCount} words)`,
        data: {
          videoJobId: videoJob.id,
          url: apiResponse.data.url,
          wordCount: apiResponse.data.wordCount,
          segments: apiResponse.data.segments,
        },
      };
    } catch (dbError) {
      console.error("Database error:", dbError);
      return {
        success: false,
        error: "Failed to store transcript in database",
      };
    }
  } catch (err) {
    console.error("Process content error:", err);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

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
      
      // Check for /embed/ format
      const embedMatch = urlObj.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch) {
        return embedMatch[1];
      }
      
      // Check for /v/ format
      const vMatch = urlObj.pathname.match(/\/v\/([^/?]+)/);
      if (vMatch) {
        return vMatch[1];
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

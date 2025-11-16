"use server";

import { env } from "@/lib/env";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs/promises";
import { generateText } from "ai";
import { getBlackboxModel } from "@/lib/blackbox";
import { matchConceptsAction } from "./match-concepts.action";

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

      // Phase 2: Extract concepts using the production prompt (prefer Blackbox, fallback OpenAI)
      let processedConceptsCount: number | undefined;
      try {
        // Choose model provider: Blackbox first if key present, else OpenAI if key present
        let model: ReturnType<typeof getBlackboxModel> | null = null;
        if (env.BLACKBOX_API_KEY) {
          model = getBlackboxModel();
        } else if (env.OPENAI_API_KEY) {
          const { openaiModel } = await import("@/lib/ai");
          model = openaiModel;
        } else {
          console.warn("No AI provider configured (BLACKBOX_API_KEY or OPENAI_API_KEY). Skipping concept extraction.");
        }

        if (model) {
          const promptPath = path.resolve(process.cwd(), "src/master-prompts/transcript-concept-extraction-prompt.md");
          const promptContent = await fs.readFile(promptPath, "utf8");

          // Build user message using the template defined in the prompt
          const transcriptBlock = [
            "Please extract atomic, testable learning concepts from the following video transcript.",
            "Return a single JSON object that follows the schema in your instructions.",
            "",
            "---TRANSCRIPT START---",
            fullTranscript,
            "---TRANSCRIPT END---",
          ].join("\n");

          // Keep temperature low for consistency
          const { text } = await generateText({
            model,
            temperature: 0.2,
            maxOutputTokens: 3000,
            // Provide the entire prompt as context plus the user message
            prompt: `${promptContent}\n\n${transcriptBlock}`,
          });

          // Extract JSON from model response
          const jsonText = extractJson(text);
          const parsed = JSON.parse(jsonText) as {
            concepts?: {
              conceptText: string;
              definition?: string | null;
              timestamp?: string | null;
              confidence: number;
            }[];
            error?: unknown;
          };

          if (parsed.error) {
            console.warn("Concept extraction returned error:", parsed.error);
          } else if (parsed.concepts && parsed.concepts.length > 0) {
            // Normalize and clamp fields to Prisma constraints
            const conceptsData = parsed.concepts.map((c) => ({
              videoJobId: videoJob.id,
              conceptText: truncate(c.conceptText.trim(), 100),
              definition: c.definition ? truncate(c.definition.trim(), 400) : null,
              timestamp: c.timestamp?.trim() ?? null,
              confidence: Number.isFinite(c.confidence) ? Math.max(0, Math.min(1, c.confidence)) : 0.0,
            })).filter((c) => c.conceptText.length >= 3);

            if (conceptsData.length > 0) {
              // Insert concepts
              await prisma.concept.createMany({ data: conceptsData });
              processedConceptsCount = conceptsData.length;

              // Update job with count and status
              await prisma.videoJob.update({
                where: { id: videoJob.id },
                data: {
                  processedConceptsCount,
                  status: "concepts_extracted",
                  completedAt: new Date(),
                },
              });
              console.log(
                `Concept extraction complete: ${processedConceptsCount} concepts inserted for videoJob ${videoJob.id}`,
              );

              // 🆕 AUTO-TRIGGER MATCHING
              // Automatically match concepts to user's active courses
              try {
                console.log(`[Auto-Match] Checking for active courses to match...`);
                const userCourses = await prisma.userCourse.findMany({
                  where: { userId: user.id, isActive: true },
                  include: { course: { select: { name: true } } },
                });

                if (userCourses.length === 0) {
                  console.log(`[Auto-Match] Skipped: User has no active courses`);
                } else if (userCourses.length === 1) {
                  // Single course - auto-match immediately
                  const course = userCourses[0];
                  console.log(`[Auto-Match] Triggering automatic matching to course: ${course.course.name}`);
                  
                  const matchResult = await matchConceptsAction({
                    videoJobId: videoJob.id,
                    courseId: course.courseId,
                  });

                  if (matchResult.success && matchResult.data) {
                    console.log(
                      `[Auto-Match] ✓ Completed: ${matchResult.data.created} matches created (${matchResult.data.high} high, ${matchResult.data.medium} medium confidence)`,
                    );
                  } else {
                    console.error(`[Auto-Match] ✗ Failed:`, matchResult.error);
                  }
                } else {
                  // Multiple courses - match to all active courses
                  console.log(`[Auto-Match] User has ${userCourses.length} active courses, matching to all...`);
                  
                  const matchPromises = userCourses.map(async (userCourse) => {
                    try {
                      const result = await matchConceptsAction({
                        videoJobId: videoJob.id,
                        courseId: userCourse.courseId,
                      });
                      
                      if (result.success && result.data) {
                        console.log(
                          `[Auto-Match] ✓ ${userCourse.course.name}: ${result.data.created} matches (${result.data.high} high, ${result.data.medium} medium)`,
                        );
                      } else {
                        console.error(`[Auto-Match] ✗ ${userCourse.course.name}:`, result.error);
                      }
                      
                      return result;
                    } catch (err) {
                      console.error(`[Auto-Match] ✗ ${userCourse.course.name} error:`, err);
                      return { success: false, error: "Matching failed" };
                    }
                  });

                  // Wait for all matches to complete
                  await Promise.all(matchPromises);
                  console.log(`[Auto-Match] ✓ Completed matching to all ${userCourses.length} courses`);
                }
              } catch (autoMatchError) {
                console.error("[Auto-Match] Error during automatic matching:", autoMatchError);
                // Don't fail the video processing if auto-match fails
              }
            }
          } else {
            console.warn("Concept extraction produced no concepts.");
          }
        }
      } catch (aiErr) {
        console.error("Concept extraction error:", aiErr);
      }

      return {
        success: true,
        message: `Successfully fetched transcript! (${apiResponse.data.wordCount} words)` +
          (processedConceptsCount ? ` • Extracted ${processedConceptsCount} concepts` : ""),
        data: {
          videoJobId: videoJob.id,
          url: apiResponse.data.url,
          wordCount: apiResponse.data.wordCount,
          segments: apiResponse.data.segments,
          processedConceptsCount: processedConceptsCount ?? 0,
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
 * Extract the first valid JSON object from a possibly noisy model response.
 */
function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  // Fallback - return as-is (will likely throw JSON.parse error)
  return text.trim();
}

function truncate(s: string | undefined, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

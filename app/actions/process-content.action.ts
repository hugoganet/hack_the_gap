"use server";

import { env } from "@/lib/env";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs/promises";
import { generateText } from "ai";
import { getBlackboxModel } from "@/lib/blackbox";
import { MATCH_THRESHOLDS } from "@/features/matching/config";
import { matchConceptsAction } from "./match-concepts.action";
import { extractContent, detectContentType } from "@/features/content-extraction";
import { matchConceptsToSyllabus } from "@/features/matching/concept-matcher";

const ProcessContentSchema = z.object({
  url: z.string().url("Invalid URL format"),
});

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

    // Detect content type and extract content
    const detection = detectContentType(validatedUrl);
    console.log(`Processing ${detection.contentType} content from: ${validatedUrl}`);

    const { contentType, result: extractionResult } = await extractContent(validatedUrl);

    if (!extractionResult.success || !extractionResult.data) {
      return {
        success: false,
        error: extractionResult.error ?? "Failed to extract content",
      };
    }

    const { extractedText, metadata } = extractionResult.data;

    console.log("Content extracted successfully:", {
      contentType,
      textLength: extractedText.length,
      metadata,
    });

    // Store content in database
    try {
      // Prepare content-type specific fields
      const contentJobData: {
        userId: string;
        url: string;
        contentType: typeof contentType;
        extractedText: string;
        status: string;
        youtubeVideoId?: string;
        tiktokVideoId?: string;
        fileName?: string;
        fileSize?: number;
        pageCount?: number;
      } = {
        userId: user.id,
        url: validatedUrl,
        contentType,
        extractedText,
        status: "text_extracted",
      };

      // Add content-type specific metadata
      if (contentType === "youtube" || contentType === "tiktok") {
        const videoMetadata = metadata as {
          videoId: string;
          wordCount: number;
          segments: number;
        };

        if (contentType === "youtube") {
          contentJobData.youtubeVideoId = videoMetadata.videoId;
        } else {
          contentJobData.tiktokVideoId = videoMetadata.videoId;
        }
      } else if (contentType === "pdf") {
        const pdfMetadata = metadata as {
          fileName: string;
          fileSize: number;
          pageCount: number;
        };

        contentJobData.fileName = pdfMetadata.fileName;
        contentJobData.fileSize = pdfMetadata.fileSize;
        contentJobData.pageCount = pdfMetadata.pageCount;
      }

      const contentJob = await prisma.contentJob.create({
        data: contentJobData,
      });

      console.log("Stored content job in database:", contentJob.id);

      // Phase 2: Extract concepts using the production prompt
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
          console.warn(
            "No AI provider configured (BLACKBOX_API_KEY or OPENAI_API_KEY). Skipping concept extraction."
          );
        }

        if (model) {
          const promptPath = path.resolve(
            process.cwd(),
            "src/master-prompts/transcript-concept-extraction-prompt.md"
          );
          const promptContent = await fs.readFile(promptPath, "utf8");

          // Build user message using the template defined in the prompt
          const transcriptBlock = [
            `Please extract atomic, testable learning concepts from the following ${contentType} content.`,
            "Return a single JSON object that follows the schema in your instructions.",
            "",
            "---CONTENT START---",
            extractedText,
            "---CONTENT END---",
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
            const conceptsData = parsed.concepts
              .map(c => ({
                contentJobId: contentJob.id,
                conceptText: truncate(c.conceptText.trim(), 100),
                definition: c.definition ? truncate(c.definition.trim(), 400) : null,
                timestamp: c.timestamp?.trim() ?? null,
                confidence: Number.isFinite(c.confidence)
                  ? Math.max(0, Math.min(1, c.confidence))
                  : 0.0,
              }))
              .filter(c => c.conceptText.length >= 3);

            if (conceptsData.length > 0) {
              // Insert concepts
              await prisma.concept.createMany({ data: conceptsData });
              processedConceptsCount = conceptsData.length;

              // Update job with count and status
              await prisma.contentJob.update({
                where: { id: contentJob.id },
                data: {
                  processedConceptsCount,
                  status: "concepts_extracted",
                  completedAt: new Date(),
                },
              });
              console.log(
                `Concept extraction complete: ${processedConceptsCount} concepts inserted for contentJob ${contentJob.id}`
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
                  console.log(
                    `[Auto-Match] Triggering automatic matching to course: ${course.course.name}`
                  );

                  const matchResult = await matchConceptsAction({
                    videoJobId: contentJob.id, // Note: the action still uses videoJobId param name for now
                    courseId: course.courseId,
                  });

                  if (matchResult.success && matchResult.data) {
                    console.log(
                      `[Auto-Match] ✓ Completed: ${matchResult.data.created} matches created (${matchResult.data.high} high, ${matchResult.data.medium} medium confidence)`
                    );
                  } else {
                    console.error(`[Auto-Match] ✗ Failed:`, matchResult.error);
                  }
                } else {
                  // Multiple courses - match to all active courses
                  console.log(
                    `[Auto-Match] User has ${userCourses.length} active courses, matching to all...`
                  );

                  const matchPromises = userCourses.map(async userCourse => {
                    try {
                      const result = await matchConceptsAction({
                        videoJobId: contentJob.id,
                        courseId: userCourse.courseId,
                      });

                      if (result.success && result.data) {
                        console.log(
                          `[Auto-Match] ✓ ${userCourse.course.name}: ${result.data.created} matches (${result.data.high} high, ${result.data.medium} medium)`
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
                // Don't fail the content processing if auto-match fails
              }
            }
          } else {
            console.warn("Concept extraction produced no concepts.");
          }
        }
      } catch (aiErr) {
        console.error("Concept extraction error:", aiErr);
      }

      // Step 3: Match concepts against ALL active courses
      let matchData = null;
      if (processedConceptsCount && processedConceptsCount > 0) {
        try {
          // Fetch user's active courses
          const activeCourses = await prisma.userCourse.findMany({
            where: {
              userId: user.id,
              isActive: true,
            },
            select: {
              courseId: true,
            },
          });

          if (activeCourses.length > 0) {
            console.log(
              `Matching ${processedConceptsCount} concepts against ${activeCourses.length} active courses...`
            );

            // Match against each course and aggregate results
            const allResults = [];
            let totalDurationMs = 0;

            // Process courses sequentially to avoid overwhelming the system
            for (const { courseId } of activeCourses) {
              const startTime = Date.now();
              const { results } = await matchConceptsToSyllabus(contentJob.id, courseId);
              const durationMs = Date.now() - startTime;
              totalDurationMs += durationMs;

              // Store matches in database (batch create for better performance)
              if (results.length > 0) {
                await prisma.conceptMatch.createMany({
                  data: results.map(match => ({
                    conceptId: match.conceptId,
                    syllabusConceptId: match.syllabusConceptId,
                    confidence: match.confidence,
                    matchType: match.matchType,
                    rationale: match.rationale,
                  })),
                  skipDuplicates: true,
                });
              }

              allResults.push(...results);
            }

            // Aggregate results across all courses
            // Treat "exact" matches as high confidence even if slightly below threshold
            const high = allResults.filter(
              r => r.confidence >= MATCH_THRESHOLDS.HIGH || r.matchType === "exact"
            ).length;
            const medium = allResults.filter(
              r =>
                r.confidence >= MATCH_THRESHOLDS.MEDIUM &&
                r.confidence < MATCH_THRESHOLDS.HIGH &&
                r.matchType !== "exact"
            ).length;
            const created = allResults.length;
            const avgConfidence =
              created > 0 ? allResults.reduce((sum, r) => sum + r.confidence, 0) / created : 0;

            // Fetch concept and syllabus details for the dialog
            // Include "exact" matches in high confidence even if slightly below threshold
            const highMatches = await Promise.all(
              allResults
                .filter(r => r.confidence >= MATCH_THRESHOLDS.HIGH || r.matchType === "exact")
                .map(async r => {
                  const concept = await prisma.concept.findUnique({
                    where: { id: r.conceptId },
                    select: { conceptText: true },
                  });
                  const syllabusConcept = await prisma.syllabusConcept.findUnique({
                    where: { id: r.syllabusConceptId },
                    select: { conceptText: true },
                  });
                  const match = await prisma.conceptMatch.findFirst({
                    where: {
                      conceptId: r.conceptId,
                      syllabusConceptId: r.syllabusConceptId,
                    },
                    select: { id: true, userFeedback: true },
                  });
                  return {
                    id: match?.id ?? r.conceptId,
                    conceptId: r.conceptId,
                    syllabusConceptId: r.syllabusConceptId,
                    extractedConcept: concept?.conceptText ?? "",
                    matchedConcept: syllabusConcept?.conceptText ?? "",
                    confidence: r.confidence,
                    matchType: r.matchType,
                    rationale: r.rationale,
                    userFeedback: match?.userFeedback,
                  };
                })
            );

            const mediumMatches = await Promise.all(
              allResults
                .filter(
                  r =>
                    r.confidence >= MATCH_THRESHOLDS.MEDIUM &&
                    r.confidence < MATCH_THRESHOLDS.HIGH &&
                    r.matchType !== "exact"
                )
                .map(async r => {
                  const concept = await prisma.concept.findUnique({
                    where: { id: r.conceptId },
                    select: { conceptText: true },
                  });
                  const syllabusConcept = await prisma.syllabusConcept.findUnique({
                    where: { id: r.syllabusConceptId },
                    select: { conceptText: true },
                  });
                  const match = await prisma.conceptMatch.findFirst({
                    where: {
                      conceptId: r.conceptId,
                      syllabusConceptId: r.syllabusConceptId,
                    },
                    select: { id: true, userFeedback: true },
                  });
                  return {
                    id: match?.id ?? r.conceptId,
                    conceptId: r.conceptId,
                    syllabusConceptId: r.syllabusConceptId,
                    extractedConcept: concept?.conceptText ?? "",
                    matchedConcept: syllabusConcept?.conceptText ?? "",
                    confidence: r.confidence,
                    matchType: r.matchType,
                    rationale: r.rationale,
                    userFeedback: match?.userFeedback,
                  };
                })
            );

            matchData = {
              totalConcepts: processedConceptsCount,
              created,
              high,
              medium,
              avgConfidence,
              durationMs: totalDurationMs,
              highMatches,
              mediumMatches,
            };

            const message = `Matching complete: ${high} high, ${medium} medium, ${created} total matches`;
            console.log(message);
          } else {
            console.log("No active courses found for user, skipping matching");
          }
        } catch (matchError) {
          console.error("Error during concept matching:", matchError);
          // Don't fail the entire request if matching fails
        }
      }

      // Build success message based on content type
      let successMessage = "";
      if (contentType === "youtube" || contentType === "tiktok") {
        const videoMetadata = metadata as { wordCount: number };
        successMessage = `Successfully processed ${contentType} video! (${videoMetadata.wordCount} words)`;
      } else if (contentType === "pdf") {
        const pdfMetadata = metadata as { pageCount: number };
        successMessage = `Successfully processed PDF! (${pdfMetadata.pageCount} pages)`;
      } else {
        successMessage = `Successfully processed ${contentType} content!`;
      }

      if (processedConceptsCount) {
        successMessage += ` • Extracted ${processedConceptsCount} concepts`;
      }

      return {
        success: true,
        message: successMessage,
        data: {
          videoJobId: contentJob.id, // Keep this name for backward compatibility with UI
          url: validatedUrl,
          contentType,
          processedConceptsCount: processedConceptsCount ?? 0,
          matchData,
        },
      };
    } catch (dbError: unknown) {
      console.error("Database error:", dbError);
      return {
        success: false,
        error: "Failed to store content in database",
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

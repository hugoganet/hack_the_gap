"use server";

import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs/promises";
import { generateText } from "ai";
import { getBlackboxModel } from "@/lib/blackbox";
import { env } from "@/lib/env";
import { MATCH_THRESHOLDS } from "@/features/matching/config";
import { matchConceptsAction } from "./match-concepts.action";
import { matchConceptsToSyllabus } from "@/features/matching/concept-matcher";

const ProcessUploadedPDFSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
  pageCount: z.number(),
  extractedText: z.string().min(10, "PDF appears to be empty"),
});

/**
 * Process an uploaded PDF file
 * Similar to processContent but for uploaded files
 */
export async function processUploadedPDF(data: {
  fileName: string;
  fileSize: number;
  pageCount: number;
  extractedText: string;
}) {
  // Get authenticated user
  const user = await getRequiredUser();

  try {
    // Validate input
    const validation = ProcessUploadedPDFSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid PDF data",
      };
    }

    const { fileName, fileSize, pageCount, extractedText } = validation.data;

    console.log("Processing uploaded PDF:", {
      fileName,
      fileSize,
      pageCount,
      textLength: extractedText.length,
    });

    // Store content in database
    try {
      const contentJob = await prisma.contentJob.create({
        data: {
          userId: user.id,
          url: fileName, // Use filename as URL for uploaded files
          contentType: "pdf",
          extractedText,
          status: "text_extracted",
          fileName,
          fileSize,
          pageCount,
        },
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
            "Please extract atomic, testable learning concepts from the following PDF content.",
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
                timestamp: null, // PDFs don't have timestamps
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

              // AUTO-TRIGGER MATCHING
              try {
                console.log(`[Auto-Match] Checking for active courses to match...`);
                const userCourses = await prisma.userCourse.findMany({
                  where: { userId: user.id, isActive: true },
                  include: { course: { select: { name: true } } },
                });

                if (userCourses.length === 0) {
                  console.log(`[Auto-Match] Skipped: User has no active courses`);
                } else if (userCourses.length === 1) {
                  const course = userCourses[0];
                  console.log(
                    `[Auto-Match] Triggering automatic matching to course: ${course.course.name}`
                  );

                  const matchResult = await matchConceptsAction({
                    videoJobId: contentJob.id,
                    courseId: course.courseId,
                  });

                  if (matchResult.success && matchResult.data) {
                    console.log(
                      `[Auto-Match] ✓ Completed: ${matchResult.data.created} matches created`
                    );
                  }
                } else {
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
                          `[Auto-Match] ✓ ${userCourse.course.name}: ${result.data.created} matches`
                        );
                      }
                      return result;
                    } catch (err) {
                      console.error(`[Auto-Match] ✗ ${userCourse.course.name} error:`, err);
                      return { success: false, error: "Matching failed" };
                    }
                  });

                  await Promise.all(matchPromises);
                  console.log(`[Auto-Match] ✓ Completed matching to all ${userCourses.length} courses`);
                }
              } catch (autoMatchError) {
                console.error("[Auto-Match] Error during automatic matching:", autoMatchError);
              }
            }
          }
        }
      } catch (aiErr) {
        console.error("Concept extraction error:", aiErr);
      }

      // Step 3: Get match data for response
      let matchData = null;
      if (processedConceptsCount && processedConceptsCount > 0) {
        try {
          const activeCourses = await prisma.userCourse.findMany({
            where: { userId: user.id, isActive: true },
            select: { courseId: true },
          });

          if (activeCourses.length > 0) {
            const allResults = [];
            let totalDurationMs = 0;

            for (const { courseId } of activeCourses) {
              const startTime = Date.now();
              const { results } = await matchConceptsToSyllabus(contentJob.id, courseId, user.id);
              totalDurationMs += Date.now() - startTime;

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
                    where: { conceptId: r.conceptId, syllabusConceptId: r.syllabusConceptId },
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
                    where: { conceptId: r.conceptId, syllabusConceptId: r.syllabusConceptId },
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
          }
        } catch (matchError) {
          console.error("Error during concept matching:", matchError);
        }
      }

      return {
        success: true,
        message: `Successfully processed PDF! (${pageCount} pages)${
          processedConceptsCount ? ` • Extracted ${processedConceptsCount} concepts` : ""
        }`,
        data: {
          videoJobId: contentJob.id,
          url: fileName,
          contentType: "pdf" as const,
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
    console.error("Process uploaded PDF error:", err);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return text.trim();
}

function truncate(s: string | undefined, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

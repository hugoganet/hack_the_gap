"use server";

import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { matchConceptsToSyllabus } from "@/features/matching/concept-matcher";
import { writeConceptMatches } from "@/features/matching/write-concept-matches";
import { generateFlashcardsForVideoJob } from "@/features/flashcards/flashcard-generator";

const MatchConceptsSchema = z.object({
  videoJobId: z.string().uuid("Invalid video job ID"),
  courseId: z.string().uuid("Invalid course ID"),
});

type MatchConceptsResult = {
  success: boolean;
  error?: string;
  data?: {
    totalConcepts: number;
    evaluated: number;
    created: number;
    updated: number;
    high: number;
    medium: number;
    avgConfidence: number;
    durationMs: number;
  };
};

/**
 * Server action to match extracted concepts from a video to syllabus concepts.
 * 
 * Security checks:
 * - User must be authenticated
 * - User must own the video job
 * - User must be enrolled in the course (or be an admin)
 * 
 * Flow:
 * 1. Validate input
 * 2. Check ownership and enrollment
 * 3. Update video job status to "matching"
 * 4. Run matching algorithm
 * 5. Write matches to database
 * 6. Update video job status to "matched"
 * 7. Return summary
 */
export async function matchConceptsAction(input: {
  videoJobId: string;
  courseId: string;
}): Promise<MatchConceptsResult> {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const user = await getRequiredUser();

    // 2. Validate input
    const validation = MatchConceptsSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { videoJobId, courseId } = validation.data;

    // 3. Check content job ownership
    const contentJob = await prisma.contentJob.findUnique({
      where: { id: videoJobId },
      select: { userId: true, status: true },
    });

    if (!contentJob) {
      return {
        success: false,
        error: "Content job not found",
      };
    }

    if (contentJob.userId !== user.id) {
      return {
        success: false,
        error: "You don't have permission to access this content job",
      };
    }

    // 4. Check course enrollment (or admin access)
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    // Allow if enrolled OR if user is admin
    const isAdmin = user.role === "admin" || user.role === "super-admin";
    if (!enrollment && !isAdmin) {
      return {
        success: false,
        error: "You must be enrolled in this course to match concepts",
      };
    }

    // 5. Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, name: true },
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found",
      };
    }

    // 6. Update content job status to "matching"
    await prisma.contentJob.update({
      where: { id: videoJobId },
      data: { status: "matching" },
    });

    // 7. Run matching algorithm
    console.log(`[Matching] Starting concept matching for videoJob ${videoJobId} to course ${courseId}`);
    let matchResult;
    try {
      matchResult = await matchConceptsToSyllabus(videoJobId, courseId, user.id);
      console.log(`[Matching] Algorithm completed:`, {
        totalConcepts: matchResult.summary.totalConcepts,
        evaluated: matchResult.summary.candidatesEvaluated,
        matchesFound: matchResult.results.length,
        high: matchResult.summary.high,
        medium: matchResult.summary.medium,
        avgConfidence: matchResult.summary.avgConfidence.toFixed(2),
      });
    } catch (matchError) {
      console.error("[Matching] Algorithm error:", matchError);
      
      // Update status to failed
      await prisma.contentJob.update({
        where: { id: videoJobId },
        data: {
          status: "matching_failed",
          errorMessage: matchError instanceof Error ? matchError.message : "Unknown matching error",
        },
      });

      return {
        success: false,
        error: "Failed to match concepts. Please try again.",
      };
    }

    // 8. Write matches to database
    console.log(`[Matching] Writing ${matchResult.results.length} matches to database...`);
    let writeResult;
    try {
      writeResult = await writeConceptMatches(matchResult.results, videoJobId, user.id);
      console.log(`[Matching] Database write completed:`, {
        created: writeResult.created,
        updated: writeResult.updated,
      });
    } catch (writeError) {
      console.error("[Matching] Database write error:", writeError);
      
      // Update status to failed
      await prisma.contentJob.update({
        where: { id: videoJobId },
        data: {
          status: "matching_failed",
          errorMessage: writeError instanceof Error ? writeError.message : "Failed to save matches",
        },
      });

      return {
        success: false,
        error: "Failed to save concept matches. Please try again.",
      };
    }

    // 9. Update content job status to "matched"
    await prisma.contentJob.update({
      where: { id: videoJobId },
      data: {
        status: "matched",
      },
    });

    console.log(`[Matching] ✓ Matching completed successfully`);
    console.log(`[Matching] Summary: ${matchResult.summary.high} high confidence, ${matchResult.summary.medium} medium confidence matches`);

    // 10. Auto-generate flashcards for high-confidence matches
    console.log(`[Matching] Starting automatic flashcard generation...`);
    try {
      const flashcardSummary = await generateFlashcardsForVideoJob(videoJobId, user.id);
      console.log(`[Matching] ✓ Flashcard generation completed:`, {
        successful: flashcardSummary.successful,
        failed: flashcardSummary.failed,
        skipped: flashcardSummary.skipped,
      });

      // Update content job status to "completed" after flashcard generation
      await prisma.contentJob.update({
        where: { id: videoJobId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });
    } catch (flashcardError) {
      console.error("[Matching] Flashcard generation error:", flashcardError);
      // Don't fail the entire operation if flashcard generation fails
      // Just update status to "matched" (flashcards can be generated later)
      console.warn("[Matching] Continuing despite flashcard generation error");
      
      await prisma.contentJob.update({
        where: { id: videoJobId },
        data: {
          status: "matched",
          completedAt: new Date(),
        },
      });
    }

    // 11. Calculate duration
    const durationMs = Date.now() - startTime;

    // 12. Return summary
    return {
      success: true,
      data: {
        totalConcepts: matchResult.summary.totalConcepts,
        evaluated: matchResult.summary.candidatesEvaluated,
        created: writeResult.created,
        updated: writeResult.updated,
        high: matchResult.summary.high,
        medium: matchResult.summary.medium,
        avgConfidence: Math.round(matchResult.summary.avgConfidence * 100) / 100,
        durationMs,
      },
    };
  } catch (error) {
    console.error("Match concepts action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

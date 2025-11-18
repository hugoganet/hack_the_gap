"use server";

import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateFlashcardsForVideoJob } from "@/features/flashcards/flashcard-generator";
import type { FlashcardGenerationSummary } from "@/features/flashcards/types";

const GenerateFlashcardsSchema = z.object({
  videoJobId: z.string().uuid("Invalid video job ID"),
});

type GenerateFlashcardsResult = {
  success: boolean;
  error?: string;
  data?: FlashcardGenerationSummary;
};

/**
 * Server action to generate flashcards from matched concepts.
 * 
 * Security checks:
 * - User must be authenticated
 * - User must own the video job
 * - Video job must have status "matched" (concepts already matched)
 * 
 * Flow:
 * 1. Validate input
 * 2. Check ownership
 * 3. Verify video job is in correct state
 * 4. Generate flashcards for all high-confidence matches
 * 5. Return summary
 */
export async function generateFlashcardsAction(input: {
  videoJobId: string;
}): Promise<GenerateFlashcardsResult | undefined> {
  try {
    // 1. Authenticate user
    const user = await getRequiredUser();

    // 2. Validate input
    const validation = GenerateFlashcardsSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { videoJobId } = validation.data;

    // 3. Check content job ownership and status
    const contentJob = await prisma.contentJob.findUnique({
      where: { id: videoJobId },
      select: {
        userId: true,
        status: true,
        processedConceptsCount: true,
      },
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

    // 4. Verify content job is in correct state
    if (contentJob.status !== "matched") {
      return {
        success: false,
        error: `Cannot generate flashcards: content job status is "${contentJob.status}". Concepts must be matched first.`,
      };
    }

    if (!contentJob.processedConceptsCount || contentJob.processedConceptsCount === 0) {
      return {
        success: false,
        error: "No concepts found for this content. Cannot generate flashcards.",
      };
    }

    // 5. Update content job status to "generating_flashcards"
    await prisma.contentJob.update({
      where: { id: videoJobId },
      data: { status: "generating_flashcards" },
    });

    console.log(`[Generate Flashcards Action] Starting flashcard generation for videoJob ${videoJobId}`);

    // 6. Generate flashcards
    let summary: FlashcardGenerationSummary;
    try {
      summary = await generateFlashcardsForVideoJob(videoJobId, user.id);
      console.log(`[Generate Flashcards Action] Generation completed:`, {
        successful: summary.successful,
        failed: summary.failed,
        skipped: summary.skipped,
      });
    } catch (generationError) {
      console.error("[Generate Flashcards Action] Generation error:", generationError);
      
      // Update status to failed
      await prisma.contentJob.update({
        where: { id: videoJobId },
        data: {
          status: "flashcard_generation_failed",
          errorMessage: generationError instanceof Error ? generationError.message : "Unknown generation error",
        },
      });

      return {
        success: false,
        error: "Failed to generate flashcards. Please try again.",
      };
    }

    // 7. Update content job status to "completed"
    await prisma.contentJob.update({
      where: { id: videoJobId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    console.log(`[Generate Flashcards Action] ✓ Flashcard generation completed successfully`);
    console.log(`[Generate Flashcards Action] Summary: ${summary.successful} successful, ${summary.failed} failed, ${summary.skipped} skipped`);

    // 8. Return summary
    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Generate flashcards action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

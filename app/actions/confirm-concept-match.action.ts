"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { forceUnlockFlashcardAnswer } from "@/features/flashcards/unlock-service";

/**
 * Action: User confirms a medium-confidence (or any) concept match as correct.
 * Effect: Treats it as an exact match and unlocks corresponding flashcard immediately.
 */
export const confirmConceptMatchAction = authAction
  .inputSchema(
    z.object({
      conceptMatchId: z.string().uuid("Invalid concept match id"),
    })
  )
  .action(async ({ parsedInput: { conceptMatchId }, ctx: { user } }) => {
    // Fetch match with ownership validation via underlying content job
    const match = await prisma.conceptMatch.findUnique({
      where: { id: conceptMatchId },
      include: {
        concept: {
          include: {
            contentJob: { select: { userId: true, id: true } },
          },
        },
        syllabusConcept: true,
      },
    });

    if (!match) {
      return { success: false, error: "Concept match not found" } as const;
    }

    if (match.concept.contentJob.userId !== user.id) {
      return { success: false, error: "You don't own the source content" } as const;
    }

    // Ensure user has a flashcard for this syllabus concept (created during knowledge structure)
    const flashcard = await prisma.flashcard.findFirst({
      where: {
        syllabusConceptId: match.syllabusConcept.id,
        userId: user.id,
      },
    });

    if (!flashcard) {
      return { success: false, error: "No flashcard exists for this concept" } as const;
    }

    const unlocked = await forceUnlockFlashcardAnswer(conceptMatchId, user.id);
    if (!unlocked) {
      return { success: false, error: "Unable to unlock flashcard" } as const;
    }

    return {
      success: true,
      data: {
        flashcardId: unlocked.flashcardId,
        question: unlocked.question,
        answerPreview: unlocked.answer.slice(0, 120),
        unlockedAt: unlocked.unlockedAt,
        confidence: unlocked.confidence,
      },
    } as const;
  });


import { authRoute } from "@/lib/zod-route";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { forceUnlockFlashcardAnswer } from "@/features/flashcards/unlock-service";

export const POST = authRoute
  .params(z.object({ conceptMatchId: z.string().uuid("Invalid conceptMatchId") }))
  .handler(async (_req, { params, ctx }) => {
    const { conceptMatchId } = params;
    const userId = ctx.user.id;

    const match = await prisma.conceptMatch.findUnique({
      where: { id: conceptMatchId },
      include: {
        concept: { include: { contentJob: true } },
        syllabusConcept: true,
        flashcards: {
          where: { userId },
          take: 1,
        },
      },
    });

    if (!match) {
      return { success: false, error: "Concept match not found" } as const;
    }

    // Ownership check: user must own the originating content job or at least have a flashcard for the syllabus concept
    if (match.concept.contentJob.userId !== userId) {
      // If user doesn't own video but has flashcard (multi-user future) allow only if flashcard exists
      if (match.flashcards.length === 0) {
        return { success: false, error: "Not authorized for this match" } as const;
      }
    }

    const unlock = await forceUnlockFlashcardAnswer(conceptMatchId, userId);
    if (!unlock) {
      return { success: false, error: "Unable to unlock flashcard" } as const;
    }

    return {
      success: true,
      data: {
        flashcardId: unlock.flashcardId,
        question: unlock.question,
        answerPreview: unlock.answer.slice(0, 120),
        unlockedAt: unlock.unlockedAt,
        confidence: unlock.confidence,
      },
    } as const;
  });

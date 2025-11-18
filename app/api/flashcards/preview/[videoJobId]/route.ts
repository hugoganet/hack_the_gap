 import { NextResponse } from "next/server";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/flashcards/preview/:videoJobId
 * Preview flashcards generated for a video job
 */
export async function GET(
  request: Request,
  { params }: { params: { videoJobId: string } }
) {
  try {
    // Authenticate user
    const user = await getRequiredUser();

    const { videoJobId } = params;

    if (!videoJobId) {
      return NextResponse.json(
        { error: "videoJobId is required" },
        { status: 400 }
      );
    }

    // Check content job ownership
    const contentJob = await prisma.contentJob.findUnique({
      where: { id: videoJobId },
      select: { userId: true, status: true },
    });

    if (!contentJob) {
      return NextResponse.json(
        { error: "Content job not found" },
        { status: 404 }
      );
    }

    if (contentJob.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get flashcards for this content job
    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId: user.id,
        conceptMatch: {
          concept: {
            contentJobId: videoJobId,
          },
        },
      },
      include: {
        conceptMatch: {
          include: {
            concept: {
              select: {
                conceptText: true,
                timestamp: true,
              },
            },
            syllabusConcept: {
              select: {
                conceptText: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Format response
    const formattedFlashcards = flashcards.map((flashcard) => ({
      id: flashcard.id,
      question: flashcard.question,
      answer: flashcard.answer,
      sourceTimestamp: flashcard.sourceTimestamp,
      conceptName: flashcard.conceptMatch.concept.conceptText,
      syllabusConceptName: flashcard.conceptMatch.syllabusConcept.conceptText,
      category: flashcard.conceptMatch.syllabusConcept.category,
      timesReviewed: flashcard.timesReviewed,
      timesCorrect: flashcard.timesCorrect,
      createdAt: flashcard.createdAt,
    }));

    return NextResponse.json({
      flashcards: formattedFlashcards,
      totalCount: formattedFlashcards.length,
      readyForReview: formattedFlashcards.length > 0,
      videoJobStatus: videoJob.status,
    });
  } catch (error) {
    console.error("Flashcard preview API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

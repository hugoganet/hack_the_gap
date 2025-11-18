import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET /api/flashcards
 * Fetch flashcards for the authenticated user
 * Query params:
 *   - courseId: Filter by course (optional)
 *   - state: Filter by state (locked | unlocked | mastered) (optional)
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const state = searchParams.get("state");

  const where: any = { userId: session.user.id };
  
  if (courseId) {
    where.syllabusConcept = { courseId };
  }
  
  if (state && ["locked", "unlocked", "mastered"].includes(state)) {
    where.state = state;
  }

  try {
    const flashcards = await prisma.flashcard.findMany({
      where,
      include: {
        syllabusConcept: {
          select: {
            conceptText: true,
            category: true,
            importance: true,
          },
        },
        conceptMatch: {
          select: {
            confidence: true,
          },
        },
      },
      orderBy: [
        { state: "asc" }, // locked first, then unlocked, then mastered
        { createdAt: "desc" },
      ],
    });

    // Transform for client
    const transformed = flashcards.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      state: f.state,
      difficulty: f.difficulty,
      hints: f.hints as string[] | undefined,
      conceptName: f.syllabusConcept.conceptText,
      category: f.syllabusConcept.category,
      unlockedAt: f.unlockedAt,
      unlockedBy: f.unlockedBy,
      sourceTimestamp: f.sourceTimestamp,
      timesReviewed: f.timesReviewed,
      timesCorrect: f.timesCorrect,
      language: f.language,
    }));

    return NextResponse.json({ flashcards: transformed });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
}

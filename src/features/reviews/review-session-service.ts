/**
 * Review session service
 * Handles business logic for review sessions
 */

import { prisma } from "@/lib/prisma";
import type { DifficultyRating, ReviewFlashcard, ReviewSummary } from "./types";

/**
 * Calculate next review date based on difficulty
 * Uses spaced repetition intervals
 */
export function calculateNextReviewDate(difficulty: DifficultyRating): Date {
  const now = new Date();
  const intervals = {
    hard: 1, // 1 day
    medium: 3, // 3 days
    easy: 7, // 7 days
  };

  const days = intervals[difficulty];
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + days);
  
  return nextReview;
}

/**
 * Get flashcards for review session
 */
export async function getFlashcardsForReview(
  courseId: string,
  userId: string
): Promise<ReviewFlashcard[]> {
  const conceptMatches = await prisma.conceptMatch.findMany({
    where: {
      syllabusConcept: {
        courseId,
      },
      flashcards: {
        some: {
          userId,
        },
      },
    },
    include: {
      concept: true,
      syllabusConcept: true,
      flashcards: {
        where: {
          userId,
        },
        take: 1,
      },
    },
  });

  return conceptMatches
    .filter((match) => match.flashcards.length > 0)
    .map((match) => {
      const flashcard = match.flashcards[0];
      return {
        id: flashcard.id,
        question: flashcard.question,
        answer: flashcard.answer,
        sourceTimestamp: flashcard.sourceTimestamp,
        conceptName: match.concept.conceptText,
        category: match.syllabusConcept.category,
      };
    });
}

/**
 * Create a new review session
 */
export async function createReviewSession(
  userId: string,
  courseId: string,
  flashcardIds: string[]
) {
  return prisma.reviewSession.create({
    data: {
      userId,
      courseId,
      flashcardCount: flashcardIds.length,
      currentCardIndex: 0,
      status: "in-progress",
      startedAt: new Date(),
    },
  });
}

/**
 * Get active review session for user and course
 */
export async function getActiveReviewSession(userId: string, courseId: string) {
  return prisma.reviewSession.findFirst({
    where: {
      userId,
      courseId,
      status: "in-progress",
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}

/**
 * Update review session progress
 */
export async function updateSessionProgress(
  sessionId: string,
  currentCardIndex: number
) {
  return prisma.reviewSession.update({
    where: { id: sessionId },
    data: { currentCardIndex },
  });
}

/**
 * Complete review session
 */
export async function completeReviewSession(sessionId: string) {
  return prisma.reviewSession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
  });
}

/**
 * Abandon review session
 */
export async function abandonReviewSession(sessionId: string) {
  return prisma.reviewSession.update({
    where: { id: sessionId },
    data: {
      status: "abandoned",
    },
  });
}

/**
 * Record a review event (rating a flashcard)
 */
export async function recordReviewEvent(
  sessionId: string,
  flashcardId: string,
  difficulty: DifficultyRating,
  timeToRevealMs?: number,
  timeToRateMs?: number
) {
  // Create review event
  await prisma.reviewEvent.create({
    data: {
      sessionId,
      flashcardId,
      difficulty,
      timeToRevealMs,
      timeToRateMs,
    },
  });

  // Update flashcard statistics
  const nextReviewAt = calculateNextReviewDate(difficulty);
  
  await prisma.flashcard.update({
    where: { id: flashcardId },
    data: {
      timesReviewed: { increment: 1 },
      timesCorrect: difficulty === "easy" ? { increment: 1 } : undefined,
      lastReviewedAt: new Date(),
      nextReviewAt,
    },
  });
}

/**
 * Get review session summary
 */
export async function getReviewSummary(sessionId: string): Promise<ReviewSummary> {
  const events = await prisma.reviewEvent.findMany({
    where: { sessionId },
    include: {
      flashcard: true,
    },
  });

  const hardCount = events.filter((e) => e.difficulty === "hard").length;
  const mediumCount = events.filter((e) => e.difficulty === "medium").length;
  const easyCount = events.filter((e) => e.difficulty === "easy").length;

  // Group by difficulty and calculate next review dates
  const schedule = [
    {
      difficulty: "hard" as DifficultyRating,
      count: hardCount,
      interval: "tomorrow",
      nextReviewDate: calculateNextReviewDate("hard"),
    },
    {
      difficulty: "medium" as DifficultyRating,
      count: mediumCount,
      interval: "in 3 days",
      nextReviewDate: calculateNextReviewDate("medium"),
    },
    {
      difficulty: "easy" as DifficultyRating,
      count: easyCount,
      interval: "in 1 week",
      nextReviewDate: calculateNextReviewDate("easy"),
    },
  ].filter((item) => item.count > 0);

  return {
    totalReviewed: events.length,
    hardCount,
    mediumCount,
    easyCount,
    nextReviewSchedule: schedule,
  };
}

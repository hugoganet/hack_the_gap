"use server";

import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import {
  createReviewSession,
  getFlashcardsForReview,
  recordReviewEvent,
  updateSessionProgress,
  completeReviewSession,
  getReviewSummary,
  abandonReviewSession,
} from "@/features/reviews/review-session-service";
import type { DifficultyRating } from "@/features/reviews/types";
import { z } from "zod";

const StartReviewSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

const RateFlashcardSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  flashcardId: z.string().uuid("Invalid flashcard ID"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeToRevealMs: z.number().optional(),
  timeToRateMs: z.number().optional(),
});

const CompleteSessionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
});

type StartReviewResult = {
  success: boolean;
  error?: string;
  data?: {
    sessionId: string;
    flashcards: Array<{
      id: string;
      question: string;
      answer: string;
      sourceTimestamp: string | null;
      conceptName: string;
      category: string | null;
    }>;
  };
};

type RateFlashcardResult = {
  success: boolean;
  error?: string;
  data?: {
    nextCardIndex: number;
    isComplete: boolean;
  };
};

type CompleteSessionResult = {
  success: boolean;
  error?: string;
  data?: {
    totalReviewed: number;
    hardCount: number;
    mediumCount: number;
    easyCount: number;
    nextReviewSchedule: Array<{
      difficulty: DifficultyRating;
      count: number;
      interval: string;
    }>;
  };
};

/**
 * Start a new review session for a course
 */
export async function startReviewSessionAction(input: {
  courseId: string;
}): Promise<StartReviewResult> {
  try {
    // 1. Authenticate user
    const user = await getRequiredUser();

    // 2. Validate input
    const validation = StartReviewSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { courseId } = validation.data;

    // 3. Check course enrollment
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    const isAdmin = user.role === "admin" || user.role === "super-admin";
    if (!enrollment && !isAdmin) {
      return {
        success: false,
        error: "You must be enrolled in this course to review flashcards",
      };
    }

    // 4. Get flashcards for review
    const flashcards = await getFlashcardsForReview(courseId, user.id);

    if (flashcards.length === 0) {
      return {
        success: false,
        error: "No flashcards available for review",
      };
    }

    // 5. Create review session
    const session = await createReviewSession(
      user.id,
      courseId,
      flashcards.map((f) => f.id)
    );

    return {
      success: true,
      data: {
        sessionId: session.id,
        flashcards,
      },
    };
  } catch (error) {
    console.error("Start review session error:", error);
    return {
      success: false,
      error: "Failed to start review session. Please try again.",
    };
  }
}

/**
 * Rate a flashcard during review session
 */
export async function rateFlashcardAction(input: {
  sessionId: string;
  flashcardId: string;
  difficulty: DifficultyRating;
  timeToRevealMs?: number;
  timeToRateMs?: number;
}): Promise<RateFlashcardResult> {
  try {
    // 1. Authenticate user
    const user = await getRequiredUser();

    // 2. Validate input
    const validation = RateFlashcardSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { sessionId, flashcardId, difficulty, timeToRevealMs, timeToRateMs } =
      validation.data;

    // 3. Verify session ownership
    const session = await prisma.reviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return {
        success: false,
        error: "Review session not found",
      };
    }

    if (session.userId !== user.id) {
      return {
        success: false,
        error: "You don't have permission to access this session",
      };
    }

    if (session.status !== "in-progress") {
      return {
        success: false,
        error: "This review session is no longer active",
      };
    }

    // 4. Record review event
    await recordReviewEvent(
      sessionId,
      flashcardId,
      difficulty,
      timeToRevealMs,
      timeToRateMs
    );

    // 5. Update session progress
    const nextCardIndex = session.currentCardIndex + 1;
    const isComplete = nextCardIndex >= session.flashcardCount;

    if (!isComplete) {
      await updateSessionProgress(sessionId, nextCardIndex);
    }

    return {
      success: true,
      data: {
        nextCardIndex,
        isComplete,
      },
    };
  } catch (error) {
    console.error("Rate flashcard error:", error);
    return {
      success: false,
      error: "Failed to record rating. Please try again.",
    };
  }
}

/**
 * Complete a review session
 */
export async function completeReviewSessionAction(input: {
  sessionId: string;
}): Promise<CompleteSessionResult> {
  try {
    // 1. Authenticate user
    const user = await getRequiredUser();

    // 2. Validate input
    const validation = CompleteSessionSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { sessionId } = validation.data;

    // 3. Verify session ownership
    const session = await prisma.reviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return {
        success: false,
        error: "Review session not found",
      };
    }

    if (session.userId !== user.id) {
      return {
        success: false,
        error: "You don't have permission to access this session",
      };
    }

    // 4. Complete session
    await completeReviewSession(sessionId);

    // 5. Get summary
    const summary = await getReviewSummary(sessionId);

    return {
      success: true,
      data: {
        totalReviewed: summary.totalReviewed,
        hardCount: summary.hardCount,
        mediumCount: summary.mediumCount,
        easyCount: summary.easyCount,
        nextReviewSchedule: summary.nextReviewSchedule.map((item) => ({
          difficulty: item.difficulty,
          count: item.count,
          interval: item.interval,
        })),
      },
    };
  } catch (error) {
    console.error("Complete review session error:", error);
    return {
      success: false,
      error: "Failed to complete review session. Please try again.",
    };
  }
}

/**
 * Abandon a review session (user exits early)
 */
export async function abandonReviewSessionAction(input: {
  sessionId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Authenticate user
    const user = await getRequiredUser();

    // 2. Validate input
    const validation = CompleteSessionSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { sessionId } = validation.data;

    // 3. Verify session ownership
    const session = await prisma.reviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return {
        success: false,
        error: "Review session not found",
      };
    }

    if (session.userId !== user.id) {
      return {
        success: false,
        error: "You don't have permission to access this session",
      };
    }

    // 4. Abandon session
    await abandonReviewSession(sessionId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Abandon review session error:", error);
    return {
      success: false,
      error: "Failed to abandon review session.",
    };
  }
}

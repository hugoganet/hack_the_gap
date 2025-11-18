import { prisma } from "@/lib/prisma";

export type DashboardStats = {
  totalConcepts: number;
  conceptsChange: number;
  activeCourses: number;
  coursesChange: number;
  totalFlashcards: number;
  flashcardsChange: number;
  completedSessions: number;
  sessionsChange: number;
};

/**
 * Fetches dashboard statistics for a specific user
 * @param userId - The ID of the logged-in user
 * @returns Dashboard statistics with month-over-month changes
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Get current date and date from last month
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  // Fetch all statistics in parallel for better performance
  const [
    // Total concepts extracted from user's video jobs
    totalConcepts,
    conceptsLastMonth,
    
    // Active courses (user is enrolled in)
    activeCourses,
    coursesLastMonth,
    
    // Total flashcards created by user
    totalFlashcards,
    flashcardsLastMonth,
    
    // Completed review sessions
    completedSessions,
    sessionsLastMonth,
  ] = await Promise.all([
    // Total concepts from user's content jobs
    prisma.concept.count({
      where: {
        contentJob: {
          userId,
        },
      },
    }),
    prisma.concept.count({
      where: {
        contentJob: {
          userId,
        },
        createdAt: {
          lt: lastMonth,
        },
      },
    }),

    // Active courses (where user is enrolled and active)
    prisma.userCourse.count({
      where: {
        userId,
        isActive: true,
      },
    }),
    prisma.userCourse.count({
      where: {
        userId,
        isActive: true,
        createdAt: {
          lt: lastMonth,
        },
      },
    }),

    // Total flashcards
    prisma.flashcard.count({
      where: {
        userId,
      },
    }),
    prisma.flashcard.count({
      where: {
        userId,
        createdAt: {
          lt: lastMonth,
        },
      },
    }),

    // Completed review sessions
    prisma.reviewSession.count({
      where: {
        userId,
        status: "completed",
      },
    }),
    prisma.reviewSession.count({
      where: {
        userId,
        status: "completed",
        completedAt: {
          lt: lastMonth,
        },
      },
    }),
  ]);

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
  };

  return {
    totalConcepts,
    conceptsChange: calculateChange(totalConcepts, conceptsLastMonth),
    activeCourses,
    coursesChange: calculateChange(activeCourses, coursesLastMonth),
    totalFlashcards,
    flashcardsChange: calculateChange(totalFlashcards, flashcardsLastMonth),
    completedSessions,
    sessionsChange: calculateChange(completedSessions, sessionsLastMonth),
  };
}

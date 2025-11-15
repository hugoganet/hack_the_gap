import { getRequiredUser } from "@/lib/auth/auth-user";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/test/user-stats
 * Récupère les statistiques de l'utilisateur connecté
 * Endpoint de test pour la dev frontend
 */
export async function GET() {
  try {
    const user = await getRequiredUser();

    // Récupérer les stats de l'utilisateur
    const [enrollments, flashcards, reviewSessions, videoJobs] =
      await Promise.all([
        prisma.userCourse.findMany({
          where: { userId: user.id },
          include: {
            course: {
              include: {
                subject: true,
              },
            },
          },
        }),
        prisma.flashcard.findMany({
          where: { userId: user.id },
          take: 10,
          orderBy: { createdAt: "desc" },
        }),
        prisma.reviewSession.findMany({
          where: { userId: user.id },
          take: 5,
          orderBy: { startedAt: "desc" },
          include: {
            course: true,
          },
        }),
        prisma.videoJob.findMany({
          where: { userId: user.id },
          take: 5,
          orderBy: { createdAt: "desc" },
        }),
      ]);

    // Calculer des stats agrégées
    const stats = {
      totalEnrollments: enrollments.length,
      totalFlashcards: flashcards.length,
      totalReviewSessions: reviewSessions.length,
      totalVideoJobs: videoJobs.length,
      totalLearnedConcepts: enrollments.reduce(
        (sum, e) => sum + e.learnedCount,
        0
      ),
      activeCourses: enrollments.filter((e) => e.isActive).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        stats,
        enrollments,
        recentFlashcards: flashcards,
        recentReviewSessions: reviewSessions,
        recentVideoJobs: videoJobs,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching user stats:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

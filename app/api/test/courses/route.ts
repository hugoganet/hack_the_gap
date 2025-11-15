import { getRequiredUser } from "@/lib/auth/auth-user";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/test/courses
 * Récupère tous les cours avec leurs relations
 * Endpoint de test pour la dev frontend
 */
export async function GET() {
  try {
    // Vérifier que l'utilisateur est connecté
    const user = await getRequiredUser();

    // Récupérer les cours avec toutes les relations
    const courses = await prisma.course.findMany({
      include: {
        subject: true,
        year: true,
        semester: true,
        syllabusConcepts: {
          take: 5, // Limiter à 5 concepts par cours pour ne pas surcharger
        },
        enrollments: {
          where: {
            userId: user.id,
          },
        },
        _count: {
          select: {
            syllabusConcepts: true,
            enrollments: true,
            reviewSessions: true,
          },
        },
      },
      take: 10, // Limiter à 10 cours pour les tests
    });

    return NextResponse.json({
      success: true,
      data: courses,
      meta: {
        total: courses.length,
        userId: user.id,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching courses:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

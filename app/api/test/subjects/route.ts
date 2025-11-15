import { getRequiredUser } from "@/lib/auth/auth-user";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/test/subjects
 * Récupère tous les subjects (matières)
 * Endpoint de test pour la dev frontend
 */
export async function GET() {
  try {
    // Vérifier que l'utilisateur est connecté
    await getRequiredUser();

    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: subjects,
      meta: {
        total: subjects.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching subjects:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

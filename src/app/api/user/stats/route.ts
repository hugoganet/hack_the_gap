import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET /api/user/stats
 * Fetch unlock statistics for the authenticated user
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let stats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
    });

    if (!stats) {
      // Initialize stats if not exists
      stats = await prisma.userStats.create({
        data: {
          userId: session.user.id,
          totalUnlocks: 0,
          totalLocked: 0,
          totalMastered: 0,
          unlockRate: 0.0,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

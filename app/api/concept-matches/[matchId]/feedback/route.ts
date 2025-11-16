import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequiredUser } from "@/lib/auth/auth-user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const user = await getRequiredUser();
    const { matchId } = await params;
    const body = await request.json();
    const { userFeedback } = body;

    if (!userFeedback || !["correct", "incorrect"].includes(userFeedback)) {
      return NextResponse.json(
        { error: "Invalid feedback value" },
        { status: 400 }
      );
    }

    // Verify the match exists and belongs to a concept owned by the user
    const match = await prisma.conceptMatch.findUnique({
      where: { id: matchId },
      include: {
        concept: {
          include: {
            videoJob: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    if (match.concept.videoJob.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update the feedback
    const updated = await prisma.conceptMatch.update({
      where: { id: matchId },
      data: { userFeedback },
    });

    return NextResponse.json({ success: true, match: updated });
  } catch (error) {
    console.error("Error updating concept match feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

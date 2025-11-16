import { NextResponse } from "next/server";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { generateFlashcardsAction } from "@app/actions/generate-flashcards.action";

/**
 * POST /api/flashcards/generate
 * Generate flashcards from matched concepts
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    await getRequiredUser();

    // Parse request body
    const body = await request.json();
    const { videoJobId } = body;

    if (!videoJobId) {
      return NextResponse.json(
        { error: "videoJobId is required" },
        { status: 400 }
      );
    }

    // Call server action
    const result = await generateFlashcardsAction({ videoJobId });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to generate flashcards" },
        { status: 500 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Flashcard generation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

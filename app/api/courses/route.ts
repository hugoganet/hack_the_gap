import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/auth-user";

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's enrolled courses
    const enrollments = await prisma.userCourse.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        course: {
          include: {
            subject: true,
            syllabusConcepts: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to match expected format
    const courses = enrollments.map((enrollment) => ({
      id: enrollment.course.id,
      code: enrollment.course.code,
      name: enrollment.course.name,
      subject: {
        id: enrollment.course.subject.id,
        name: enrollment.course.subject.name,
      },
      syllabusConcepts: enrollment.course.syllabusConcepts,
      enrolledAt: enrollment.createdAt,
      learnedCount: enrollment.learnedCount,
    }));

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, subject: subjectName, learningGoal } = body;

    // Validate input
    if (!name || !subjectName || !learningGoal) {
      return NextResponse.json(
        { error: "Course name, subject, and learning goal are required" },
        { status: 400 }
      );
    }

    if (typeof name !== "string" || name.length < 3) {
      return NextResponse.json(
        { error: "Course name must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (typeof subjectName !== "string" || subjectName.length < 1) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (typeof learningGoal !== "string" || learningGoal.length < 10) {
      return NextResponse.json(
        { error: "Learning goal must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Import AI and DB modules dynamically to avoid loading them on GET requests
    const { extractHierarchicalKnowledge } = await import(
      "@/lib/ai/hierarchical-extraction"
    );
    const { createKnowledgeStructure } = await import(
      "@/lib/db/create-knowledge-structure"
    );
    const {
      validateExtractionQuality,
      requiresManualReview,
    } = await import("@/lib/validation/extraction-quality");

    // Step 1: Call AI to extract hierarchical knowledge structure
    console.log("Starting AI extraction for:", { subject: subjectName, course: name });
    
    let extraction;
    try {
      extraction = await extractHierarchicalKnowledge({
        subject: subjectName,
        courseName: name,
        learningGoalText: learningGoal,
        userId: user.id,
      });
    } catch (error) {
      console.error("AI extraction failed:", error);
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          return NextResponse.json(
            {
              error: {
                code: "AI_PROCESSING_FAILED",
                message: "Processing took too long. Please try again.",
                details: "The AI processing exceeded the 60-second timeout.",
              },
            },
            { status: 500 }
          );
        }
        
        if (error.message.includes("INSUFFICIENT_DATA")) {
          return NextResponse.json(
            {
              error: {
                code: "INSUFFICIENT_DATA",
                message: "Please provide more details about what you want to learn.",
                suggestions: [
                  "Specify the subject area (e.g., Philosophy, Biology, Economics)",
                  "Provide course content or learning objectives",
                  "Describe specific topics you want to master",
                ],
              },
            },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        {
          error: {
            code: "AI_PROCESSING_FAILED",
            message: "Failed to process your learning goal. Please try again.",
            details: error instanceof Error ? error.message : "Unknown error",
          },
        },
        { status: 500 }
      );
    }

    // Step 2: Validate extraction quality
    try {
      validateExtractionQuality(extraction);
    } catch (error) {
      console.error("Quality validation failed:", error);
      
      return NextResponse.json(
        {
          error: {
            code: "QUALITY_CHECK_FAILED",
            message: "We couldn't process your learning goal with sufficient quality.",
            details: error instanceof Error ? error.message : "Quality checks failed",
            suggestions: [
              "Try providing more detailed information",
              "Ensure your learning goal is clear and specific",
              "Include course objectives or syllabus content if available",
            ],
          },
        },
        { status: 400 }
      );
    }

    // Step 3: Create database records in transaction
    console.log("Creating knowledge structure in database...");
    
    let result;
    try {
      result = await createKnowledgeStructure(prisma, user.id, extraction);
    } catch (error) {
      console.error("Database creation failed:", error);
      
      return NextResponse.json(
        {
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to create course structure. Please try again.",
            details: error instanceof Error ? error.message : "Database error",
          },
        },
        { status: 500 }
      );
    }

    // Step 4: Log extraction metadata for monitoring
    const needsReview = requiresManualReview(
      extraction.extractionMetadata,
      extraction.qualityChecks
    );
    
    console.log("Course created successfully:", {
      courseId: result.courseId,
      totalConcepts: result.totalConcepts,
      treeDepth: result.treeDepth,
      confidence: result.extractionConfidence,
      needsReview,
    });

    // Step 5: Return success response
    return NextResponse.json({
      id: result.courseId,
      code: result.courseCode,
      name: result.courseName,
      subjectId: result.subjectId,
      subject: {
        id: result.subjectId,
        name: result.subjectName,
      },
      metadata: {
        totalConcepts: result.totalConcepts,
        treeDepth: result.treeDepth,
        extractionConfidence: result.extractionConfidence,
        inputType: result.inputType,
        requiresReview: needsReview,
      },
    });
  } catch (error) {
    console.error("Unexpected error creating course:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred. Please try again.",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

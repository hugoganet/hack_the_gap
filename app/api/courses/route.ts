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

    // Fetch all courses with their relationships
    const courses = await prisma.course.findMany({
      include: {
        subject: true,
        syllabusConcepts: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { subject: { name: "asc" } },
        { name: "asc" },
      ],
    });

    // Transform data to include concept count and IDs
    const coursesWithCount = courses.map((course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
      subjectId: course.subjectId,
      subject: {
        id: course.subject.id,
        name: course.subject.name,
      },
      totalConcepts: course.syllabusConcepts.length,
    }));

    return NextResponse.json({ courses: coursesWithCount });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

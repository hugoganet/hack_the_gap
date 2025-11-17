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

    if (!name || !subjectName || !learningGoal) {
      return NextResponse.json(
        { error: "Course name, subject, and learning goal are required" },
        { status: 400 }
      );
    }

    // Find or create subject
    let subject = await prisma.subject.findUnique({
      where: { name: subjectName },
    });

    subject ??= await prisma.subject.create({
      data: { name: subjectName },
    });

    // Generate a simple course code from the name
    const code = name
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 6);

    // Create course
    const course = await prisma.course.create({
      data: {
        name,
        code,
        subjectId: subject.id,
        syllabusUrl: null, // Learning goal stored separately if needed
      },
      include: {
        subject: true,
      },
    });

    // Enroll user in the course
    await prisma.userCourse.create({
      data: {
        userId: user.id,
        courseId: course.id,
        isActive: true,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getRequiredUser } from "@/lib/auth/auth-user";

export async function GET() {
  try {
    const user = await getRequiredUser();

    // Fetch user's active courses
    const userCourses = await prisma.userCourse.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        course: {
          include: {
            subject: true,
            year: true,
            semester: true,
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

    const activeCourses = userCourses.map((uc) => ({
      id: uc.course.id,
      code: uc.course.code,
      name: uc.course.name,
      subjectId: uc.course.subjectId,
      yearId: uc.course.yearId,
      semesterId: uc.course.semesterId,
      subject: {
        id: uc.course.subject.id,
        name: uc.course.subject.name,
      },
      year: uc.course.year
        ? {
            id: uc.course.year.id,
            name: uc.course.year.name,
            level: uc.course.year.level,
          }
        : null,
      semester: uc.course.semester
        ? {
            id: uc.course.semester.id,
            number: uc.course.semester.number,
          }
        : null,
      totalConcepts: uc.course.syllabusConcepts.length,
      learnedCount: uc.learnedCount,
    }));

    return NextResponse.json({ courses: activeCourses });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch user courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequiredUser();
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subject: true,
        year: true,
        semester: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Add or reactivate course for user
    const userCourse = await prisma.userCourse.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        userId: user.id,
        courseId: courseId,
        isActive: true,
        learnedCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        code: course.code,
        name: course.name,
        subject: course.subject,
        year: course.year,
        semester: course.semester,
      },
    });
  } catch (error) {
    console.error("Error adding course:", error);
    return NextResponse.json(
      { error: "Failed to add course" },
      { status: 500 }
    );
  }
}

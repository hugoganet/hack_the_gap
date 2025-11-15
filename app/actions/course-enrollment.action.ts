"use server";

import { getUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type EnrollmentResult = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * Enroll a user in a course
 */
export async function enrollInCourse(
  courseId: string
): Promise<EnrollmentResult> {
  try {
    const user = await getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to enroll in a course",
      };
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found",
      };
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return {
        success: false,
        error: "You are already enrolled in this course",
      };
    }

    // Create enrollment
    await prisma.userCourse.create({
      data: {
        userId: user.id,
        courseId: courseId,
        isActive: true,
        learnedCount: 0,
      },
    });

    revalidatePath("/courses/select");
    revalidatePath("/orgs");

    return {
      success: true,
      message: `Successfully enrolled in ${course.name}`,
    };
  } catch (error) {
    console.error("Error enrolling in course:", error);
    return {
      success: false,
      error: "Failed to enroll in course. Please try again.",
    };
  }
}

/**
 * Get all available courses with their details
 */
export async function getAvailableCourses() {
  try {
    const user = await getUser();

    if (!user) {
      return [];
    }

    const courses = await prisma.course.findMany({
      include: {
        subject: true,
        year: true,
        semester: true,
        _count: {
          select: {
            syllabusConcepts: true,
          },
        },
        enrollments: {
          where: {
            userId: user.id,
          },
          select: {
            userId: true,
          },
        },
      },
      orderBy: [
        { subject: { name: "asc" } },
        { code: "asc" },
      ],
    });

    return courses.map((course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
      subject: course.subject.name,
      year: course.year?.name || null,
      semester: course.semester?.number || null,
      ueNumber: course.ueNumber,
      conceptCount: course._count.syllabusConcepts,
      isEnrolled: course.enrollments.length > 0,
    }));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

/**
 * Check if user has any course enrollments
 */
export async function hasAnyCourseEnrollment(): Promise<boolean> {
  try {
    const user = await getUser();

    if (!user) {
      return false;
    }

    const enrollmentCount = await prisma.userCourse.count({
      where: {
        userId: user.id,
      },
    });

    return enrollmentCount > 0;
  } catch (error) {
    console.error("Error checking enrollments:", error);
    return false;
  }
}

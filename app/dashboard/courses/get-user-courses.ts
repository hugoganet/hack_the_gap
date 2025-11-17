import { prisma } from "@/lib/prisma";

export async function getUserCourses(userId: string) {
  const enrollments = await prisma.userCourse.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      course: {
        include: {
          subject: true,
          syllabusConcepts: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return enrollments.map((enrollment) => ({
    ...enrollment.course,
    enrolledAt: enrollment.createdAt,
    learnedCount: enrollment.learnedCount,
  }));
}

export async function getCourseProgress(courseId: string, userId: string) {
  // Get total concepts for the course
  const totalConcepts = await prisma.syllabusConcept.count({
    where: { courseId },
  });

  // Get matched concepts with flashcards
  const matchedConcepts = await prisma.conceptMatch.count({
    where: {
      syllabusConcept: {
        courseId,
      },
      flashcards: {
        some: {
          userId,
        },
      },
    },
  });

  // Get reviewed flashcards
  const reviewedFlashcards = await prisma.flashcard.count({
    where: {
      userId,
      conceptMatch: {
        syllabusConcept: {
          courseId,
        },
      },
      timesReviewed: {
        gt: 0,
      },
    },
  });

  const totalFlashcards = await prisma.flashcard.count({
    where: {
      userId,
      conceptMatch: {
        syllabusConcept: {
          courseId,
        },
      },
    },
  });

  return {
    totalConcepts,
    matchedConcepts,
    reviewedFlashcards,
    totalFlashcards,
    progressPercentage:
      totalConcepts > 0 ? Math.round((matchedConcepts / totalConcepts) * 100) : 0,
  };
}

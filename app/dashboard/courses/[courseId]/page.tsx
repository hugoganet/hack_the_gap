import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseFlashcardsView } from "./course-flashcards-view";

type PageProps = {
  params: Promise<{
    orgSlug: string;
    courseId: string;
  }>;
};

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const user = await getRequiredUser();

  // Fetch course with enrollment check
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      subject: true,
      syllabusConcepts: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Check if user is enrolled
  const enrollment = await prisma.userCourse.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment && user.role !== "admin") {
    notFound();
  }

  // Fetch concept matches with flashcards for this course
  const conceptMatches = await prisma.conceptMatch.findMany({
    where: {
      syllabusConcept: {
        courseId: course.id,
      },
      flashcards: {
        some: {
          userId: user.id,
        },
      },
    },
    include: {
      concept: {
        select: {
          conceptText: true,
          definition: true,
        },
      },
      syllabusConcept: {
        select: {
          conceptText: true,
          category: true,
        },
      },
      flashcards: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          question: true,
          answer: true,
          sourceTimestamp: true,
          timesReviewed: true,
          timesCorrect: true,
          lastReviewedAt: true,
        },
      },
    },
    orderBy: {
      confidence: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <CourseFlashcardsView
        course={course}
        conceptMatches={conceptMatches}
      />
    </div>
  );
}

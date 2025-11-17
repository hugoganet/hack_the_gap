import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseFlashcardsView } from "./course-flashcards-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderTree } from "lucide-react";
import Link from "next/link";

function getNodeDescription(meta: unknown): string | undefined {
  if (meta && typeof meta === "object") {
    const maybeObj = meta as { description?: unknown };
    const desc = maybeObj.description;
    if (typeof desc === "string") return desc;
  }
  return undefined;
}

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

  const topSubdirectories = await prisma.knowledgeNode.findMany({
    where: {
      parentId: null,
      subjectId: course.subjectId,
    },
    orderBy: { order: "asc" },
    include: {
      concepts: {
        where: {
          syllabusConcept: { courseId: course.id },
        },
        select: { syllabusConceptId: true },
      },
      children: {
        include: {
          concepts: {
            where: {
              syllabusConcept: { courseId: course.id },
            },
            select: { syllabusConceptId: true },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  // Only display top-level nodes that are relevant to this course:
  // - either the node itself has linked concepts for this course
  // - or at least one of its direct children has linked concepts for this course
  const visibleTopSubdirectories = topSubdirectories.filter(
    (node) =>
      node.concepts.length > 0 ||
      node.children.some((child) => child.concepts.length > 0),
  );

  return (
    <div className="container mx-auto py-8 space-y-6">

      <CourseFlashcardsView
        course={course}
        conceptMatches={conceptMatches}
      />

      {visibleTopSubdirectories.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="size-5" />
              Subdirectories
            </CardTitle>
            <CardDescription>Browse the course structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {visibleTopSubdirectories.map((node) => {
                const directCount = node.concepts.length;
                const childCount = node.children.reduce(
                  (acc, child) => acc + child.concepts.length,
                  0,
                );
                const totalCount = directCount + childCount;
                return (
                  <Link
                    key={node.id}
                    href={`/dashboard/courses/${course.id}/nodes/${node.id}`}
                  >
                    <Card className="hover:border-primary transition-all cursor-pointer">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{node.name}</CardTitle>
                        {getNodeDescription(node.metadata) ? (
                          <CardDescription className="line-clamp-2">
                            {getNodeDescription(node.metadata)}
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          {totalCount} concepts
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

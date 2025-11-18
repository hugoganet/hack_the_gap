import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CourseFlashcardsView } from "./course-flashcards-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderTree } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

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
  const locale = await getLocale();
  const t = await getTranslations("dashboard.courses.detail.subdirectories");

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

  // Fetch all flashcards for this course (locked + unlocked)
  const flashcardsRaw = await prisma.flashcard.findMany({
    where: {
      userId: user.id,
      syllabusConcept: { courseId: course.id },
    },
    include: {
      syllabusConcept: {
        select: { conceptText: true, category: true },
      },
    },
    orderBy: {
      syllabusConcept: { order: "asc" },
    },
  });

  // Normalize hints JSON -> string[] | undefined for client component
  const flashcards = flashcardsRaw.map(f => {
    const rawHints = f.hints as unknown;
    const hints = Array.isArray(rawHints) ? rawHints.filter(h => typeof h === "string") : undefined;
    return {
      id: f.id,
      question: f.question,
      answer: f.answer,
      state: f.state,
      difficulty: f.difficulty,
      hints,
      syllabusConcept: f.syllabusConcept,
      unlockedAt: f.unlockedAt,
      unlockedBy: f.unlockedBy,
      sourceTimestamp: f.sourceTimestamp,
      timesReviewed: f.timesReviewed,
      timesCorrect: f.timesCorrect,
    };
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
  const visibleTopSubdirectories = topSubdirectories.filter((node) => {
    const hasDirect = node.concepts.length > 0;
    const hasChild = node.children.some(
      (child) => child.concepts.length > 0,
    );
    return hasDirect || hasChild;
  });

  return (
    <div className="container mx-auto py-8 space-y-6">

      <CourseFlashcardsView course={course} flashcards={flashcards} />

      {visibleTopSubdirectories.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="size-5" />
              {t("title")}
            </CardTitle>
            <CardDescription>{t("description")}</CardDescription>
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
                    href={`/${locale}/dashboard/courses/${course.id}/nodes/${node.id}`}
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
                          {t("count", { count: totalCount })}
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

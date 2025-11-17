import { notFound } from "next/navigation";
import Link from "next/link";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderTree, ArrowLeft, BookOpen } from "lucide-react";

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
    courseId: string;
    nodeId: string;
  }>;
};

export default async function NodeDetailPage({ params }: PageProps) {
  const { courseId, nodeId } = await params;
  const user = await getRequiredUser();

  // Fetch course and ensure existence
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      subject: true,
    },
  });
  if (!course) notFound();

  // Enrollment check (admins bypass)
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

  // Fetch the requested node, ensure it belongs to the same subject as the course
  const node = await prisma.knowledgeNode.findUnique({
    where: { id: nodeId },
    include: {
      // Direct children with their concept links filtered to this course
      children: {
        orderBy: { order: "asc" },
        include: {
          concepts: {
            where: {
              syllabusConcept: { courseId: course.id },
            },
            select: { syllabusConceptId: true },
          },
        },
      },
      // Concepts attached to this node filtered to the current course
      concepts: {
        where: {
          syllabusConcept: { courseId: course.id },
        },
        include: {
          syllabusConcept: {
            select: {
              id: true,
              conceptText: true,
              category: true,
              importance: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!node || node.subjectId !== course.subjectId) {
    notFound();
  }

  // Compute child nodes visibility/counts
  const visibleChildren = node.children.filter(
    (child) => child.concepts.length > 0,
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4" />
            <span>{course.subject.name}</span>
          </div>
          <Link href={`/dashboard/courses/${course.id}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to course
            </Button>
          </Link>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{node.name}</h1>
          {getNodeDescription(node.metadata) ? (
            <p className="text-muted-foreground">
              {getNodeDescription(node.metadata)}
            </p>
          ) : null}
        </div>
      </div>

      {/* Subdirectories */}
      {visibleChildren.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="size-5" />
              Subdirectories
            </CardTitle>
            <CardDescription>Explore the structure beneath this section</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {visibleChildren.map((child) => (
                <Link
                  key={child.id}
                  href={`/dashboard/courses/${course.id}/nodes/${child.id}`}
                >
                  <Card className="hover:border-primary transition-all cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{child.name}</CardTitle>
                      {/* child.metadata may include description, but we didn't include child.metadata in query
                          Keeping only the title for children for now to avoid extra payload */}
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {child.concepts.length} concepts
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concepts attached to this node for the current course */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            Concepts
          </CardTitle>
          <CardDescription>
            Concepts linked to this section for the course "{course.name}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          {node.concepts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No concepts directly attached to this subdirectory for this course.
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {node.concepts
                .slice()
                .sort((a, b) => {
                  const ao = a.syllabusConcept.order;
                  const bo = b.syllabusConcept.order;
                  return ao - bo;
                })
                .map((attachment) => {
                  const sc = attachment.syllabusConcept;
                  return (
                    <Card key={sc.id} className="h-full">
                      <CardHeader>
                        <CardTitle className="text-base line-clamp-2">
                          {sc.conceptText}
                        </CardTitle>
                        {typeof sc.category === "string" && sc.category.length > 0 ? (
                          <CardDescription className="line-clamp-1">
                            {sc.category}
                          </CardDescription>
                        ) : null}
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">
                          Importance: {sc.importance ?? "—"}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

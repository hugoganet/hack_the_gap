import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

export async function CardsToReviewToday() {
  const user = await getRequiredUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get flashcards due for review today
  const flashcardsToday = await prisma.flashcard.findMany({
    where: {
      userId: user.id,
      nextReviewAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      conceptMatch: {
        include: {
          concept: {
            select: {
              conceptText: true,
              videoJob: {
                select: {
                  id: true,
                },
              },
            },
          },
          syllabusConcept: {
            select: {
              course: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      nextReviewAt: "asc",
    },
  });

  // Get flashcards due tomorrow
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const flashcardsTomorrow = await prisma.flashcard.count({
    where: {
      userId: user.id,
      nextReviewAt: {
        gte: tomorrow,
        lt: dayAfterTomorrow,
      },
    },
  });

  // Group flashcards by course
  const flashcardsByCourse = flashcardsToday.reduce<Record<string, { course: { id: string; name: string; code: string }; flashcards: typeof flashcardsToday }>>((acc, flashcard) => {
    const courseId = flashcard.conceptMatch.syllabusConcept.course.id;
    if (!(courseId in acc)) {
      acc[courseId] = {
        course: flashcard.conceptMatch.syllabusConcept.course,
        flashcards: [],
      };
    }
    acc[courseId].flashcards.push(flashcard);
    return acc;
  }, {});

  const coursesWithFlashcards = Object.values(flashcardsByCourse);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="size-5" />
          Cartes à réviser aujourd'hui
        </CardTitle>
        <CardDescription>
          {flashcardsToday.length === 0
            ? "Aucune carte à réviser"
            : `${flashcardsToday.length} carte${flashcardsToday.length > 1 ? "s" : ""} à réviser`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {flashcardsToday.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-success/10 p-3">
                <Brain className="size-8 text-success" />
              </div>
            </div>
            <div>
              <p className="font-medium text-success">
                Tu es à jour de tes répétitions pour aujourd'hui ! 🎉
              </p>
              {flashcardsTomorrow > 0 && (
                <p className="mt-2 text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Calendar className="size-4" />
                  Tu as {flashcardsTomorrow} carte{flashcardsTomorrow > 1 ? "s" : ""} à réviser demain
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {coursesWithFlashcards.map(({ course, flashcards }) => (
              <Link
                key={course.id}
                href={`/orgs/${user.id}/courses/${course.id}/review`}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto py-4 px-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-3 text-left flex-1">
                    <div className="mt-0.5">
                      <Brain className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base">
                        {course.name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {course.code}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {flashcards.length} carte{flashcards.length > 1 ? "s" : ""} à réviser
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground flex-shrink-0" />
                </Button>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

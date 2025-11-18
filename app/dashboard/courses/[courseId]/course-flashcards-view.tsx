"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { BookOpen, Play, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlashcardCard } from "@/components/flashcards/flashcard-card";

type Course = {
  id: string;
  name: string;
  subject: { name: string };
};

type FlashcardItem = {
  id: string;
  question: string;
  answer: string | null;
  state: string;
  difficulty: string;
  hints?: string[] | null;
  syllabusConcept: {
    conceptText: string;
    category: string | null;
  };
  unlockedAt: Date | null;
  unlockedBy: string | null;
  sourceTimestamp: string | null;
  timesReviewed: number;
  timesCorrect: number;
};

type Props = {
  course: Course;
  flashcards: FlashcardItem[];
};

export function CourseFlashcardsView({ course, flashcards }: Props) {
  const t = useTranslations("dashboard.courses.flashcards");
  const locale = useLocale();
  const unlockedCount = flashcards.filter(f => f.state === "unlocked" || (f.answer && f.answer.length > 0)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4" />
            <span>{course.subject.name}</span>
          </div>
          <Link href={`/${locale}/dashboard/courses`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              {t("back")}
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{course.name}</h1>
          {unlockedCount > 0 && (
            <Button size="lg" className="gap-2" asChild>
              <Link href={`/${locale}/dashboard/courses/${course.id}/review`}>
                <Play className="size-4" />
                {t("startReview")}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Flashcards Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{t("section.title")}</CardTitle>
          <CardDescription>{t("section.descriptionFlashcards")}</CardDescription>
        </CardHeader>
        <CardContent>
          {flashcards.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mt-4 text-sm text-muted-foreground">{t("empty.title")}</p>
              <p className="mt-2 text-xs text-muted-foreground">{t("empty.hintFlashcards")}</p>
              <Button variant="outline" asChild className="mt-4">
                <Link href={`/${locale}/dashboard/users`}>{t("cta.ingestContent")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {flashcards.map(f => (
                <FlashcardCard
                  key={f.id}
                  id={f.id}
                  question={f.question}
                  answer={f.answer}
                  state={f.state as any}
                  difficulty={f.difficulty}
                  hints={f.hints ?? undefined}
                  conceptName={f.syllabusConcept.conceptText}
                  category={f.syllabusConcept.category}
                  unlockedAt={f.unlockedAt}
                  unlockedBy={f.unlockedBy}
                  sourceTimestamp={f.sourceTimestamp}
                  timesReviewed={f.timesReviewed}
                  timesCorrect={f.timesCorrect}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

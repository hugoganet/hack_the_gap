"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Brain, ChevronRight, Clock, CheckCircle2, Play, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Course = {
  id: string;
  code: string;
  name: string;
  subject: {
    name: string;
  };
};

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  sourceTimestamp: string | null;
  timesReviewed: number;
  timesCorrect: number;
  lastReviewedAt: Date | null;
};

type ConceptMatch = {
  id: string;
  confidence: number;
  concept: {
    conceptText: string;
    definition: string | null;
  };
  syllabusConcept: {
    conceptText: string;
    category: string | null;
  };
  flashcards: Flashcard[];
};

type CourseFlashcardsViewProps = {
  course: Course;
  conceptMatches: ConceptMatch[];
};

export function CourseFlashcardsView({ course, conceptMatches }: CourseFlashcardsViewProps) {
  const router = useRouter();
  const [selectedConcept, setSelectedConcept] = useState<ConceptMatch | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleConceptClick = (concept: ConceptMatch) => {
    setSelectedConcept(concept);
    setShowAnswer(false);
  };

  const handleCloseModal = () => {
    setSelectedConcept(null);
    setShowAnswer(false);
  };

  const flashcard = selectedConcept?.flashcards[0];

  const handleStartReview = () => {
    router.push(`/dashboard/courses/${course.id}/review`);
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4" />
            <span>{course.subject.name}</span>
          </div>
          <Link href="/dashboard/courses">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to courses
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{course.name}</h1>
          {conceptMatches.length > 0 && (
            <Button onClick={handleStartReview} size="lg" className="gap-2">
              <Play className="size-4" />
              Start Review Session
            </Button>
          )}
        </div>
      </div>

      {/* Concepts with Flashcards */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="size-5" />
            Concepts & Flashcards
          </CardTitle>
          <CardDescription>
            Click on a concept to view its flashcard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conceptMatches.length === 0 ? (
            <div className="py-12 text-center">
              <Brain className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                No flashcards available yet for this course.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Flashcards will be generated automatically when you upload and process videos.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conceptMatches.map((match) => {
                const flashcard = match.flashcards[0];
                const accuracy = flashcard.timesReviewed > 0
                  ? Math.round((flashcard.timesCorrect / flashcard.timesReviewed) * 100)
                  : null;

                return (
                  <Button
                    key={match.id}
                    variant="outline"
                    onClick={() => handleConceptClick(match)}
                    className={cn(
                      "w-full justify-between h-auto py-4 px-4",
                      "hover:bg-accent transition-colors"
                    )}
                  >
                    <div className="flex items-start gap-3 text-left flex-1">
                      <div className="mt-0.5">
                        <Brain className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base">
                          {match.concept.conceptText}
                        </div>
                        {match.syllabusConcept.category && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {match.syllabusConcept.category}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {flashcard.timesReviewed > 0 && (
                            <>
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                Reviewed {flashcard.timesReviewed}x
                              </span>
                              {accuracy !== null && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="size-3" />
                                  {accuracy}% correct
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground flex-shrink-0" />
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flashcard Modal */}
      <Dialog open={!!selectedConcept} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="size-5" />
              {selectedConcept?.concept.conceptText}
            </DialogTitle>
          </DialogHeader>

          {flashcard && (
            <div className="space-y-6 py-4">
              {/* Question */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Question</div>
                <div className="text-lg font-medium">{flashcard.question}</div>
              </div>

              {/* Show Answer Button / Answer */}
              {!showAnswer ? (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="w-full"
                  size="lg"
                >
                  Show Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Answer</div>
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <p className="text-base leading-relaxed">{flashcard.answer}</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    {flashcard.sourceTimestamp && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        Source: {flashcard.sourceTimestamp}
                      </span>
                    )}
                    {flashcard.timesReviewed > 0 && (
                      <>
                        <span>•</span>
                        <span>Reviewed {flashcard.timesReviewed} times</span>
                        <span>•</span>
                        <span>
                          {flashcard.timesCorrect}/{flashcard.timesReviewed} correct
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

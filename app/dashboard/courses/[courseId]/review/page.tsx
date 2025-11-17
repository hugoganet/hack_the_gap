"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, Loader2 } from "lucide-react";
import { ReviewCard } from "@/components/reviews/review-card";
import { CompletionScreen } from "@/components/reviews/completion-screen";
import { ProgressBar } from "@/components/reviews/progress-bar";
import {
  startReviewSessionAction,
  rateFlashcardAction,
  completeReviewSessionAction,
  abandonReviewSessionAction,
} from "@app/actions/review-session.action";
import type { DifficultyRating, ReviewFlashcard, ReviewSummary } from "@/features/reviews/types";
import { KEYBOARD_SHORTCUTS } from "@/features/reviews/types";

export default function ReviewSessionPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<ReviewFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [rating, setRating] = useState(false);

  // Initialize review session
  useEffect(() => {
    async function initSession() {
      try {
        setLoading(true);
        const result = await startReviewSessionAction({ courseId });

        if (!result.success || !result.data) {
          setError(result.error ?? "Failed to start review session");
          return;
        }

        setSessionId(result.data.sessionId);
        setFlashcards(result.data.flashcards);
      } catch (err) {
        console.error("Failed to initialize session:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    void initSession();
  }, [courseId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Exit on Escape
      if (KEYBOARD_SHORTCUTS.exit.includes(e.key as "Escape")) {
        void handleExit();
        return;
      }

      // Don't handle other shortcuts if rating or complete
      if (rating || isComplete || currentIndex >= flashcards.length) {
        return;
      }

      // Reveal answer (Space)
      if (KEYBOARD_SHORTCUTS.reveal.includes(e.key as " " | "Space")) {
        e.preventDefault();
        // The reveal is handled by ReviewCard component
        return;
      }

      // Rate flashcard (1, 2, 3 or Arrow keys)
      if (KEYBOARD_SHORTCUTS.hard.includes(e.key as "1" | "ArrowLeft")) {
        e.preventDefault();
        void handleRate("hard");
      } else if (KEYBOARD_SHORTCUTS.medium.includes(e.key as "2" | "ArrowDown")) {
        e.preventDefault();
        void handleRate("medium");
      } else if (KEYBOARD_SHORTCUTS.easy.includes(e.key as "3" | "ArrowRight")) {
        e.preventDefault();
        void handleRate("easy");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [rating, isComplete, currentIndex, flashcards.length]);

  const handleRate = async (
    difficulty: DifficultyRating,
    timeToRevealMs?: number,
    timeToRateMs?: number
  ) => {
    if (!sessionId || rating || currentIndex >= flashcards.length) return;

    try {
      setRating(true);
      const flashcard = flashcards[currentIndex];

      const result = await rateFlashcardAction({
        sessionId,
        flashcardId: flashcard.id,
        difficulty,
        timeToRevealMs,
        timeToRateMs,
      });

      if (!result.success || !result.data) {
        setError(result.error ?? "Failed to record rating");
        return;
      }

      // Check if session is complete
      if (result.data.isComplete) {
        // Get summary and show completion screen
        const summaryResult = await completeReviewSessionAction({ sessionId });
        if (summaryResult.success && summaryResult.data) {
          setSummary(summaryResult.data);
          setIsComplete(true);
        }
      } else {
        // Move to next card
        setCurrentIndex(result.data.nextCardIndex);
      }
    } catch (err) {
      console.error("Failed to rate flashcard:", err);
      setError("An unexpected error occurred");
    } finally {
      setRating(false);
    }
  };

  const handleExit = async () => {
    if (sessionId && !isComplete) {
      await abandonReviewSessionAction({ sessionId });
    }
    router.push(`/dashboard/courses/${courseId}`);
  };

  const handleBackToCourse = () => {
    router.push(`/dashboard/courses/${courseId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={handleBackToCourse}>Back to Course</Button>
        </div>
      </div>
    );
  }

  // Completion state
  if (isComplete && summary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <CompletionScreen summary={summary} onBackToCourse={handleBackToCourse} />
      </div>
    );
  }

  // Review state
  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Button variant="ghost" onClick={handleExit} disabled={rating}>
            <ArrowLeft className="size-4" />
            Exit
          </Button>
          <div className="text-sm font-medium">
            Card {currentIndex + 1} of {flashcards.length}
          </div>
          <Button variant="ghost" size="icon">
            <HelpCircle className="size-4" />
          </Button>
        </div>
        <ProgressBar current={currentIndex + 1} total={flashcards.length} />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <ReviewCard
          flashcard={currentFlashcard}
          onRate={handleRate}
          disabled={rating}
        />
      </div>

      {/* Footer Hint */}
      <footer className="border-t bg-card p-4">
        <div className="container mx-auto text-center text-xs text-muted-foreground">
          Press Space to reveal answer • Press 1, 2, or 3 to rate • Press Esc to exit
        </div>
      </footer>
    </div>
  );
}

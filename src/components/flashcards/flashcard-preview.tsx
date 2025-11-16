"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, AlertCircle } from "lucide-react";
import { FlashcardList } from "./flashcard-list";

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  conceptName: string;
  category?: string | null;
  sourceTimestamp?: string | null;
  timesReviewed?: number;
  timesCorrect?: number;
};

type FlashcardPreviewProps = {
  videoJobId: string;
  onStartReview?: () => void;
  onSkip?: () => void;
};

export function FlashcardPreview({ 
  videoJobId, 
  onStartReview,
  onSkip 
}: FlashcardPreviewProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFlashcards() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/flashcards/preview/${videoJobId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error ?? "Failed to load flashcards");
        }

        const data = await response.json();
        setFlashcards(data.flashcards ?? []);
      } catch (err) {
        console.error("Error loading flashcards:", err);
        setError(err instanceof Error ? err.message : "Failed to load flashcards");
      } finally {
        setIsLoading(false);
      }
    }

    void loadFlashcards();
  }, [videoJobId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading flashcards...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Flashcard Preview
          </CardTitle>
          <CardDescription>
            {flashcards.length === 0 
              ? "No flashcards have been generated yet."
              : `Generated ${flashcards.length} flashcard${flashcards.length === 1 ? "" : "s"} from this video`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlashcardList 
            flashcards={flashcards}
            emptyMessage="No flashcards available. Generate flashcards from matched concepts first."
          />
        </CardContent>
      </Card>

      {flashcards.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={onSkip}
            disabled={!onSkip}
          >
            Skip for now
          </Button>
          <Button
            onClick={onStartReview}
            disabled={!onStartReview}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Start Review ({flashcards.length} cards)
          </Button>
        </div>
      )}
    </div>
  );
}

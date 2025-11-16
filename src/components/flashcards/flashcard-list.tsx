"use client";

import { FlashcardCard } from "./flashcard-card";

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

type FlashcardListProps = {
  flashcards: Flashcard[];
  emptyMessage?: string;
};

export function FlashcardList({ 
  flashcards, 
  emptyMessage = "No flashcards available yet." 
}: FlashcardListProps) {
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flashcards.map((flashcard) => (
        <FlashcardCard
          key={flashcard.id}
          id={flashcard.id}
          question={flashcard.question}
          answer={flashcard.answer}
          conceptName={flashcard.conceptName}
          category={flashcard.category}
          sourceTimestamp={flashcard.sourceTimestamp}
          timesReviewed={flashcard.timesReviewed}
          timesCorrect={flashcard.timesCorrect}
        />
      ))}
    </div>
  );
}

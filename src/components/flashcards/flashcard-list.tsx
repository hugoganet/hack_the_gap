"use client";

import { FlashcardCard } from "./flashcard-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Flashcard = {
  id: string;
  question: string;
  answer: string | null;
  state: "locked" | "unlocked" | "mastered";
  difficulty: string;
  hints?: string[];
  conceptName: string;
  category?: string | null;
  unlockedAt?: Date | null;
  unlockedBy?: string | null;
  sourceTimestamp?: string | null;
  timesReviewed?: number;
  timesCorrect?: number;
};

type FlashcardListProps = {
  flashcards: Flashcard[];
  onReview?: (flashcardId: string) => void;
};

export function FlashcardList({ flashcards, onReview }: FlashcardListProps) {
  const locked = flashcards.filter((f) => f.state === "locked");
  const unlocked = flashcards.filter((f) => f.state === "unlocked");
  const mastered = flashcards.filter((f) => f.state === "mastered");

  return (
    <Tabs defaultValue="unlocked" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="unlocked">
          Unlocked ({unlocked.length})
        </TabsTrigger>
        <TabsTrigger value="locked">
          Locked ({locked.length})
        </TabsTrigger>
        <TabsTrigger value="mastered">
          Mastered ({mastered.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="unlocked" className="space-y-4 mt-6">
        {unlocked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No unlocked flashcards yet. Watch content to unlock answers!
            </p>
          </div>
        ) : (
          unlocked.map((flashcard) => (
            <FlashcardCard
              key={flashcard.id}
              id={flashcard.id}
              question={flashcard.question}
              answer={flashcard.answer}
              state={flashcard.state}
              difficulty={flashcard.difficulty}
              hints={flashcard.hints}
              conceptName={flashcard.conceptName}
              category={flashcard.category}
              unlockedAt={flashcard.unlockedAt}
              unlockedBy={flashcard.unlockedBy}
              sourceTimestamp={flashcard.sourceTimestamp}
              timesReviewed={flashcard.timesReviewed}
              timesCorrect={flashcard.timesCorrect}
              onReview={onReview ? () => onReview(flashcard.id) : undefined}
              showAnswer={false}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="locked" className="space-y-4 mt-6">
        {locked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              All flashcards unlocked! 🎉
            </p>
          </div>
        ) : (
          locked.map((flashcard) => (
            <FlashcardCard
              key={flashcard.id}
              id={flashcard.id}
              question={flashcard.question}
              answer={flashcard.answer}
              state={flashcard.state}
              difficulty={flashcard.difficulty}
              hints={flashcard.hints}
              conceptName={flashcard.conceptName}
              category={flashcard.category}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="mastered" className="space-y-4 mt-6">
        {mastered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No mastered flashcards yet. Keep reviewing!
            </p>
          </div>
        ) : (
          mastered.map((flashcard) => (
            <FlashcardCard
              key={flashcard.id}
              id={flashcard.id}
              question={flashcard.question}
              answer={flashcard.answer}
              state={flashcard.state}
              difficulty={flashcard.difficulty}
              hints={flashcard.hints}
              conceptName={flashcard.conceptName}
              category={flashcard.category}
              unlockedAt={flashcard.unlockedAt}
              unlockedBy={flashcard.unlockedBy}
              sourceTimestamp={flashcard.sourceTimestamp}
              timesReviewed={flashcard.timesReviewed}
              timesCorrect={flashcard.timesCorrect}
              onReview={onReview ? () => onReview(flashcard.id) : undefined}
              showAnswer={true}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}

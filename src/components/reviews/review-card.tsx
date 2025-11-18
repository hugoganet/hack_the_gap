"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Brain, Clock, ChevronDown } from "lucide-react";
import { DifficultyButton } from "./difficulty-button";
import { FeedbackNudgeInline } from "@/features/contact/feedback/feedback-nudge";
import { DIFFICULTY_CONFIGS, type DifficultyRating, type ReviewFlashcard } from "@/features/reviews/types";

type ReviewCardProps = {
  flashcard: ReviewFlashcard;
  onRate: (difficulty: DifficultyRating, timeToRevealMs?: number, timeToRateMs?: number) => void;
  disabled?: boolean;
};

export function ReviewCard({ flashcard, onRate, disabled = false }: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [revealedAt, setRevealedAt] = useState<number | null>(null);
  const [questionShownAt] = useState<number>(Date.now());
  const [showNudge, setShowNudge] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
    setRevealedAt(Date.now());
  };

  const handleRate = (difficulty: DifficultyRating) => {
    const now = Date.now();
    const timeToRevealMs = revealedAt ? revealedAt - questionShownAt : undefined;
    const timeToRateMs = revealedAt ? now - revealedAt : undefined;
    
    onRate(difficulty, timeToRevealMs, timeToRateMs);

    try {
      const cnt = Number(sessionStorage.getItem("review_rating_count") || "0") + 1;
      sessionStorage.setItem("review_rating_count", String(cnt));
      const nudgeShown = sessionStorage.getItem("review_nudge_shown") === "1";
      if (!nudgeShown && cnt >= 3) {
        setShowNudge(true);
        sessionStorage.setItem("review_nudge_shown", "1");
      }
    } catch {
      // ignore storage errors
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="size-5" />
          {flashcard.conceptName}
        </CardTitle>
        {flashcard.category && (
          <p className="text-sm text-muted-foreground">{flashcard.category}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Question</div>
          <div className="text-lg font-medium leading-relaxed">
            {flashcard.question}
          </div>
        </div>

        {/* Show Answer Button or Answer */}
        {!revealed ? (
          <Button
            onClick={handleReveal}
            disabled={disabled}
            className="w-full"
            size="lg"
          >
            Show Answer
            <ChevronDown className="size-4" />
          </Button>
        ) : (
          <>
            <Separator />
            
            {/* Answer */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Answer</div>
              <div className="rounded-lg border border-learning/30 bg-learning/10 p-4">
                <p className="text-base leading-relaxed">{flashcard.answer}</p>
              </div>
              {flashcard.sourceTimestamp && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  Source: {flashcard.sourceTimestamp}
                </div>
              )}
            </div>

            {/* Difficulty Buttons */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-center">
                How well did you know this?
              </div>
              <div className="grid grid-cols-3 gap-3">
                <DifficultyButton
                  config={DIFFICULTY_CONFIGS.hard}
                  onClick={() => handleRate("hard")}
                  disabled={disabled}
                />
                <DifficultyButton
                  config={DIFFICULTY_CONFIGS.medium}
                  onClick={() => handleRate("medium")}
                  disabled={disabled}
                />
                <DifficultyButton
                  config={DIFFICULTY_CONFIGS.easy}
                  onClick={() => handleRate("easy")}
                  disabled={disabled}
                />
              </div>
              <div className="text-xs text-center text-muted-foreground">
                Press 1, 2, or 3
              </div>

              {showNudge && (
                <div className="mt-2 flex justify-center">
                  <FeedbackNudgeInline
                    label="Something confusing? Tell us."
                    presetMessage={`Flashcard review feedback: `}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

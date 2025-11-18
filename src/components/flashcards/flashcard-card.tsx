"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Star, Lightbulb, ChevronDown, ChevronUp, Clock } from "lucide-react";

type FlashcardState = "locked" | "unlocked" | "mastered";

type FlashcardCardProps = {
  id: string;
  question: string;
  answer: string | null;
  state: FlashcardState;
  difficulty: string;
  hints?: string[];
  conceptName: string;
  category?: string | null;
  unlockedAt?: Date | null;
  unlockedBy?: string | null;
  sourceTimestamp?: string | null;
  timesReviewed?: number;
  timesCorrect?: number;
  onReview?: () => void;
  showAnswer?: boolean;
};

export function FlashcardCard({
  question,
  answer,
  state,
  difficulty,
  hints,
  conceptName,
  category,
  unlockedAt,
  unlockedBy,
  sourceTimestamp,
  timesReviewed = 0,
  timesCorrect = 0,
  onReview,
  showAnswer = false,
}: FlashcardCardProps) {
  const [isAnswerVisible, setIsAnswerVisible] = useState(showAnswer);
  
  const isLocked = state === "locked";
  const isMastered = state === "mastered";
  const successRate = timesReviewed > 0 
    ? Math.round((timesCorrect / timesReviewed) * 100) 
    : null;

  return (
    <Card 
      className={`relative ${
        isLocked 
          ? "border-secondary" 
          : isMastered 
          ? "border-success" 
          : "border-learning"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg flex-1">{question}</CardTitle>
          <Badge 
            variant={isLocked ? "secondary" : isMastered ? "default" : "outline"}
            className="flex items-center gap-1"
          >
            {isLocked && <Lock className="w-3 h-3" />}
            {!isLocked && !isMastered && <Unlock className="w-3 h-3" />}
            {isMastered && <Star className="w-3 h-3" />}
            {state}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {conceptName}
          </Badge>
          {category && (
            <Badge variant="outline" className="text-xs border-connection text-connection">
              {category}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {difficulty}
          </Badge>
          {sourceTimestamp && !isLocked && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {sourceTimestamp}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLocked ? (
          <LockedContent hints={hints} />
        ) : (
          <UnlockedContent
            answer={answer ?? ""}
            unlockedAt={unlockedAt}
            unlockedBy={unlockedBy}
            isAnswerVisible={isAnswerVisible}
            onToggleAnswer={() => setIsAnswerVisible(!isAnswerVisible)}
            timesReviewed={timesReviewed}
            timesCorrect={timesCorrect}
            successRate={successRate}
            isMastered={isMastered}
          />
        )}

        {!isLocked && onReview && (
          <Button onClick={onReview} className="w-full">
            {isMastered ? "Review again" : "Start reviewing"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function LockedContent({ hints }: { hints?: string[] }) {
  return (
    <div className="bg-secondary/40 p-4 rounded-lg space-y-3">
      <div className="flex items-center gap-2 text-foreground">
        <Lock className="w-5 h-5" />
        <p className="font-medium">Answer locked</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Add or watch learning content for this course to unlock this answer.
      </p>
      <Button
        variant="outline"
        className="w-full text-sm"
        onClick={() => {
          const localePrefix = window.location.pathname.startsWith('/fr/') ? '/fr' : '';
          window.location.href = `${localePrefix}/dashboard/users`;
        }}
      >
        Engage with content →
      </Button>
      {hints && hints.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="w-4 h-4" />
            <span>Hints:</span>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {hints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UnlockedContent({
  answer,
  unlockedAt,
  unlockedBy,
  isAnswerVisible,
  onToggleAnswer,
  timesReviewed,
  timesCorrect,
  successRate,
  isMastered,
}: {
  answer: string;
  unlockedAt?: Date | null;
  unlockedBy?: string | null;
  isAnswerVisible: boolean;
  onToggleAnswer: () => void;
  timesReviewed: number;
  timesCorrect: number;
  successRate: number | null;
  isMastered: boolean;
}) {
  return (
    <div className="space-y-3">
      {unlockedAt && (
        <div className="flex items-center gap-2 text-sm text-success">
          <Unlock className="w-4 h-4" />
          <span>
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
            {unlockedBy && ` • From content`}
          </span>
        </div>
      )}

      <Button
        variant="outline"
        className="w-full"
        onClick={onToggleAnswer}
      >
        {isAnswerVisible ? (
          <>
            <ChevronUp className="mr-2 h-4 w-4" />
            Hide Answer
          </>
        ) : (
          <>
            <ChevronDown className="mr-2 h-4 w-4" />
            Show Answer
          </>
        )}
      </Button>

      {isAnswerVisible && (
        <div className="rounded-lg border border-learning/30 bg-learning/10 p-4">
          <p className="text-sm font-medium mb-2">Answer:</p>
          <p className="text-sm leading-relaxed">{answer}</p>
        </div>
      )}

      {timesReviewed > 0 && (
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <span>Reviewed: {timesReviewed} times</span>
          {successRate !== null && (
            <span className={successRate >= 70 ? "text-success" : "text-needs-work"}>
              {timesCorrect}/{timesReviewed} ({successRate}%)
              {isMastered && " • ⭐ Mastered"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";

type FlashcardCardProps = {
  id: string;
  question: string;
  answer: string;
  conceptName: string;
  category?: string | null;
  sourceTimestamp?: string | null;
  timesReviewed?: number;
  timesCorrect?: number;
};

export function FlashcardCard({
  question,
  answer,
  conceptName,
  category,
  sourceTimestamp,
  timesReviewed = 0,
  timesCorrect = 0,
}: FlashcardCardProps) {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  const successRate = timesReviewed > 0 
    ? Math.round((timesCorrect / timesReviewed) * 100) 
    : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {question}
            </CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {conceptName}
              </Badge>
              {category && (
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
              )}
              {sourceTimestamp && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {sourceTimestamp}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAnswerVisible(!isAnswerVisible)}
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
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm leading-relaxed">{answer}</p>
            </div>
          )}

          {timesReviewed > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Reviewed {timesReviewed} times</span>
              {successRate !== null && (
                <span className={successRate >= 70 ? "text-green-600" : "text-amber-600"}>
                  {successRate}% correct
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

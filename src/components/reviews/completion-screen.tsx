"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ChevronRight } from "lucide-react";
import type { ReviewSummary } from "@/features/reviews/types";
import { DIFFICULTY_CONFIGS } from "@/features/reviews/types";
import { cn } from "@/lib/utils";
import { FeedbackNudgeInline } from "@/features/contact/feedback/feedback-nudge";

type CompletionScreenProps = {
  summary: ReviewSummary;
  onBackToCourse: () => void;
};

export function CompletionScreen({ summary, onBackToCourse }: CompletionScreenProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="space-y-6 py-12">
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle2 className="size-16 text-success" />
        </div>

        {/* Title and Summary */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">Review Complete!</h2>
          <p className="text-muted-foreground">
            You reviewed {summary.totalReviewed} concept
            {summary.totalReviewed !== 1 ? "s" : ""}
          </p>
        </div>

        <Separator />

        {/* Next Review Schedule */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center">Next Review Schedule:</h3>
          <div className="space-y-2">
            {summary.nextReviewSchedule.map((item) => {
              const config = DIFFICULTY_CONFIGS[item.difficulty];
              return (
                <div
                  key={item.difficulty}
                  className={cn("flex items-center gap-3 rounded-lg border p-3", item.difficulty === "hard" ? "border-needs-work" : item.difficulty === "medium" ? "border-learning" : "border-success")}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {item.count} card{item.count !== 1 ? "s" : ""} {item.interval}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {config.label} difficulty
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Back to Course Button */}
        <Button onClick={onBackToCourse} size="lg" className="w-full">
          Back to Course
          <ChevronRight className="size-4" />
        </Button>

        {/* Soft feedback nudge */}
        <div className="flex justify-center">
          <FeedbackNudgeInline
            label="How was this review session?"
            presetMessage="Review session feedback: "
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}

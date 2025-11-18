"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export type ConceptMatchDetail = {
  id: string;
  conceptId: string;
  syllabusConceptId: string;
  extractedConcept: string;
  matchedConcept: string;
  confidence: number;
  matchType: string;
  rationale: string;
  userFeedback?: string | null;
};

export type MatchResultsData = {
  totalConcepts: number;
  created: number;
  high: number;
  medium: number;
  avgConfidence: number;
  durationMs: number;
  highMatches?: ConceptMatchDetail[];
  mediumMatches?: ConceptMatchDetail[];
};

type MatchResultsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: MatchResultsData | null;
  onFlashcardUnlocked?: () => void;
};

export function MatchResultsDialog({
  open,
  onOpenChange,
  data,
  onFlashcardUnlocked,
}: MatchResultsDialogProps) {
  const [expandedSection, setExpandedSection] = useState<"high" | "medium" | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "correct" | "incorrect">>({});
  const [unlocking, setUnlocking] = useState<Record<string, boolean>>({});

  if (!data) return null;

  const unmatched = data.totalConcepts - data.created;
  const confidencePercentage = Math.round(data.avgConfidence * 100);

  // Determine overall sentiment based on high confidence matches
  const isExcellent = data.high >= 5;
  const isGood = data.high >= 3;

  const toggleSection = (section: "high" | "medium") => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleFeedback = async (matchId: string, feedback: "correct" | "incorrect") => {
    if (feedback === "correct") {
      // Unlock flow
      setUnlocking(prev => ({ ...prev, [matchId]: true }));
      try {
        const res = await fetch(`/api/concept-matches/confirm/${matchId}`, { method: "POST" });
        const json = await res.json();
        if (json.success) {
          setFeedbackMap(prev => ({ ...prev, [matchId]: "correct" }));
          toast.success("🎉 Flashcard unlocked! Ready to review");
          // Notify parent that a flashcard was unlocked
          onFlashcardUnlocked?.();
        } else {
          toast.error(json.error || "Failed to unlock flashcard");
        }
      } catch (e) {
        toast.error("Failed to unlock flashcard");
      } finally {
        setUnlocking(prev => ({ ...prev, [matchId]: false }));
      }
      return;
    }
    // Incorrect feedback path
    setFeedbackMap(prev => ({ ...prev, [matchId]: "incorrect" }));
    try {
      await fetch(`/api/concept-matches/${matchId}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userFeedback: "incorrect" }),
      });
      toast.success("Thanks for the feedback! We'll improve our matching");
    } catch {
      setFeedbackMap(prev => {
        const { [matchId]: _, ...rest } = prev;
        return rest;
      });
      toast.error("Failed to process feedback. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-6 text-yellow-500" />
            <DialogTitle className="text-2xl">
              {isExcellent
                ? "🎉 Excellent Matches!"
                : isGood
                  ? "✅ Great Progress!"
                  : "📊 Matching Complete"}
            </DialogTitle>
          </div>
          <DialogDescription>
            Your concepts have been matched to your course syllabi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Match Breakdown - Expandable */}
          <div className="grid gap-3">
            {/* High Confidence */}
            {data.high > 0 && (
              <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleSection("high")}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-green-100 dark:hover:bg-green-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">
                          High Confidence
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {expandedSection === "high" ? "Click to collapse" : "Click to review matches"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        {data.high}
                      </Badge>
                      {expandedSection === "high" ? (
                        <ChevronUp className="size-4 text-green-600" />
                      ) : (
                        <ChevronDown className="size-4 text-green-600" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSection === "high" && data.highMatches && data.highMatches.length > 0 && (
                    <div className="border-t border-green-200 bg-white p-4 dark:border-green-800 dark:bg-gray-950">
                      <div className="space-y-3">
                        {data.highMatches.map((match) => (
                          <div
                            key={match.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-green-100 bg-green-50/50 p-3 dark:border-green-900 dark:bg-green-950/30"
                          >
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {match.extractedConcept}
                                </span>
                                <ArrowRight className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {match.matchedConcept}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {match.rationale}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(match.confidence * 100)}% confident
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {match.matchType}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Feedback Buttons */}
                            <div className="flex gap-1 flex-shrink-0">
                              {feedbackMap[match.id] === "correct" ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  ✓ Confirmed
                                </Badge>
                              ) : feedbackMap[match.id] === "incorrect" ? (
                                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                  ✗ Rejected
                                </Badge>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900"
                                    onClick={() => void handleFeedback(match.id, "incorrect")}
                                    title="Mark as incorrect match"
                                  >
                                    <ThumbsDown className="size-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={unlocking[match.id]}
                                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 disabled:opacity-50"
                                    onClick={() => void handleFeedback(match.id, "correct")}
                                    title="Confirm match"
                                  >
                                    {unlocking[match.id] ? <Loader2 className="size-4 animate-spin" /> : <ThumbsUp className="size-4" />}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Partial Matches */}
            {data.medium > 0 && (
              <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleSection("medium")}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                          Partial Matches
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {expandedSection === "medium" ? "Click to collapse" : "Click to review - confirmation recommended"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-yellow-600 text-white">
                        {data.medium}
                      </Badge>
                      {expandedSection === "medium" ? (
                        <ChevronUp className="size-4 text-yellow-600" />
                      ) : (
                        <ChevronDown className="size-4 text-yellow-600" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSection === "medium" && data.mediumMatches && data.mediumMatches.length > 0 && (
                    <div className="border-t border-yellow-200 bg-white p-4 dark:border-yellow-800 dark:bg-gray-950">
                      <div className="space-y-3">
                        {data.mediumMatches.map((match) => (
                          <div
                            key={match.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-yellow-100 bg-yellow-50/50 p-3 dark:border-yellow-900 dark:bg-yellow-950/30"
                          >
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {match.extractedConcept}
                                </span>
                                <ArrowRight className="size-3 text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {match.matchedConcept}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                {match.rationale}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(match.confidence * 100)}% confident
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {match.matchType}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Feedback Buttons */}
                            <div className="flex gap-1 flex-shrink-0">
                              {feedbackMap[match.id] === "correct" ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                  ✓ Confirmed
                                </Badge>
                              ) : feedbackMap[match.id] === "incorrect" ? (
                                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                                  ✗ Rejected
                                </Badge>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={unlocking[match.id]}
                                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900 disabled:opacity-50"
                                    onClick={() => void handleFeedback(match.id, "correct")}
                                    title="Confirm match"
                                  >
                                    {unlocking[match.id] ? <Loader2 className="size-4 animate-spin" /> : <ThumbsUp className="size-4" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900"
                                    onClick={() => void handleFeedback(match.id, "incorrect")}
                                    title="Mark as incorrect match"
                                  >
                                    <ThumbsDown className="size-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Unmatched */}
            {unmatched > 0 && (
              <Card className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="size-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Unmatched
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No clear syllabus match
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    {unmatched}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Avg. Confidence</p>
                <p className="text-lg font-semibold">{confidencePercentage}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Processing Time</p>
                <p className="text-lg font-semibold">
                  {(data.durationMs / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          {isExcellent && (
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm font-medium text-primary">
                🌟 Outstanding! You're covering the course material excellently.
              </p>
            </div>
          )}
          {isGood && !isExcellent && (
            <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-950">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                💪 Great job! You're building solid coverage of the syllabus.
              </p>
            </div>
          )}
          {!isGood && (
            <div className="rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-950">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                📚 Keep going! Try more videos to cover additional concepts.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              // TODO: Navigate to flashcards or learning page
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            Start Learning →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

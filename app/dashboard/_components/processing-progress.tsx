"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Download,
  Brain,
  Target,
  Sparkles,
  Unlock,
  CheckCircle,
  Check,
} from "lucide-react";
import {
  saveProcessingState,
  updateProcessingState,
  clearProcessingState,
} from "@/lib/processing-storage";

type ProcessingPhase = {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  estimatedSeconds: number;
  tipsKey: string;
};

const PROCESSING_PHASES: ProcessingPhase[] = [
  {
    id: "fetching",
    labelKey: "phases.fetching",
    icon: <Download className="size-4" />,
    estimatedSeconds: 30,
    tipsKey: "tips.fetching",
  },
  {
    id: "analyzing",
    labelKey: "phases.analyzing",
    icon: <Brain className="size-4 animate-pulse" />,
    estimatedSeconds: 120,
    tipsKey: "tips.analyzing",
  },
  {
    id: "matching",
    labelKey: "phases.matching",
    icon: <Target className="size-4" />,
    estimatedSeconds: 80,
    tipsKey: "tips.matching",
  },
  {
    id: "generating",
    labelKey: "phases.generating",
    icon: <Sparkles className="size-4" />,
    estimatedSeconds: 60,
    tipsKey: "tips.generating",
  },
  {
    id: "unlocking",
    labelKey: "phases.unlocking",
    icon: <Unlock className="size-4" />,
    estimatedSeconds: 30,
    tipsKey: "tips.unlocking",
  },
  {
    id: "complete",
    labelKey: "phases.complete",
    icon: <CheckCircle className="size-4 text-success" />,
    estimatedSeconds: 0,
    tipsKey: "",
  },
];

type ProcessingProgressProps = {
  contentName: string;
  contentType: "youtube" | "pdf" | "tiktok";
  url: string;
  onComplete?: () => void;
  initialPhaseIndex?: number;
  initialProgress?: number;
  isProcessingComplete?: boolean; // Signal from parent that API finished
};

export function ProcessingProgress({
  contentName,
  contentType,
  url,
  onComplete,
  initialPhaseIndex = 0,
  initialProgress = 0,
  isProcessingComplete = false,
}: ProcessingProgressProps) {
  const t = useTranslations("dashboard.processing");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialPhaseIndex);
  const [progress, setProgress] = useState(initialProgress);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Safely get current phase (prevent undefined after completion)
  const currentPhase = PROCESSING_PHASES[currentPhaseIndex] || PROCESSING_PHASES[PROCESSING_PHASES.length - 1];
  
  // Get tips array for current phase
  const tipsArray = currentPhase.tipsKey 
    ? (t.raw(currentPhase.tipsKey) as string[])
    : [];
  const currentTip = tipsArray[currentTipIndex] || "";
  
  // Get encouragement messages array
  const encouragementMessages = t.raw("encouragement") as string[];
  const currentMessage = encouragementMessages[currentMessageIndex] || "";

  // Calculate total estimated time remaining
  const estimatedTimeRemaining = PROCESSING_PHASES.slice(currentPhaseIndex)
    .reduce((sum, phase) => sum + phase.estimatedSeconds, 0);

  // Lazy load confetti with contrasting brand colors
  const triggerConfetti = useCallback(() => {
    void (async () => {
      try {
        const confetti = (await import("canvas-confetti")).default;
        void confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#D97757", "#88C9A1", "#FF9B7C"], // Terracotta, Sage Green, Coral
        });
      } catch (error) {
        console.error("Failed to load confetti:", error);
      }
    })();
  }, []);

  const celebratePhaseComplete = useCallback(
    (phase: ProcessingPhase) => {
      // Confetti animation (fire and forget)
      triggerConfetti();

      // Success toast
      const celebrationKey = `celebrations.${phase.id}` as const;
      const message = t(celebrationKey);

      toast.success(message, {
        duration: 2000,
      });
    },
    [triggerConfetti, t]
  );

  // Simulate progress through phases
  useEffect(() => {
    if (currentPhaseIndex >= PROCESSING_PHASES.length - 1) {
      // On last phase, wait for API to complete
      if (isProcessingComplete) {
        clearProcessingState();
        onComplete?.();
      }
      return;
    }

    const phase = PROCESSING_PHASES[currentPhaseIndex];
    const incrementPerSecond = 100 / phase.estimatedSeconds;
    
    // On the last real phase (unlocking), stop at 99% and wait for API
    const isLastPhase = currentPhaseIndex === PROCESSING_PHASES.length - 2;
    const maxProgress = isLastPhase ? 99 : 100;

    const interval = setInterval(() => {
      setProgress((prev: number): number => {
        const newProgress = prev + incrementPerSecond;
        
        // If last phase and API complete, finish the phase
        if (isLastPhase && isProcessingComplete && prev >= 99) {
          void celebratePhaseComplete(phase);
          setCurrentPhaseIndex((p) => p + 1);
          updateProcessingState({
            currentPhaseIndex: currentPhaseIndex + 1,
            progress: 0,
          });
          return 0;
        }
        
        // Stop at maxProgress (99% for last phase, 100% for others)
        if (newProgress >= maxProgress) {
          if (!isLastPhase) {
            // Phase complete - celebrate!
            void celebratePhaseComplete(phase);
            setCurrentPhaseIndex((p) => p + 1);
            
            // Update localStorage
            updateProcessingState({
              currentPhaseIndex: currentPhaseIndex + 1,
              progress: 0,
            });
            
            return 0;
          }
          return maxProgress; // Stay at 99% on last phase
        }
        
        // Update localStorage periodically
        if (Math.floor(newProgress) % 10 === 0) {
          updateProcessingState({
            progress: newProgress,
          });
        }
        
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhaseIndex, onComplete, celebratePhaseComplete, isProcessingComplete]);

  // Rotate tips within current phase
  useEffect(() => {
    if (!tipsArray.length) return;

    setCurrentTipIndex(0);

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tipsArray.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(interval);
  }, [currentPhaseIndex, tipsArray.length]);

  // Rotate encouragement messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(
        (prev) => (prev + 1) % encouragementMessages.length
      );
    }, 8000); // Change message every 8 seconds

    return () => clearInterval(interval);
  }, [encouragementMessages.length]);

  // Save initial state to localStorage
  useEffect(() => {
    saveProcessingState({
      contentName,
      contentType,
      currentPhaseIndex,
      progress,
      startedAt: Date.now(),
      url,
    });
  }, [contentName, contentType, currentPhaseIndex, progress, url]);

  const phaseLabel = t(currentPhase.labelKey);
  const progressPercent = Math.round(progress);

  return (
    <Card className="w-full border-2 border-primary/20">
      <CardContent className="pt-6">
        {/* Header with content name */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="relative z-10">{currentPhase.icon}</div>
            <div className="absolute inset-0 -inset-1 bg-primary/20 rounded-full animate-ping" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg">{phaseLabel}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {t("processing", { name: contentName })}
            </p>
          </div>
        </div>

        {/* Progress bar with percentage */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground truncate flex-1">
              {currentTip}
            </span>
            <span className="font-medium flex-shrink-0">{progressPercent}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 transition-all duration-300 ease-linear"
            aria-label={`${phaseLabel}: ${progressPercent}% complete`}
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Phase indicators */}
        <div className="flex justify-between items-center mb-4 gap-1">
          {PROCESSING_PHASES.slice(0, -1).map((phase, idx) => (
            <div key={phase.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <div
                className={cn(
                  "size-7 sm:size-8 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                  idx < currentPhaseIndex
                    ? "bg-success text-success-foreground"
                    : idx === currentPhaseIndex
                    ? "bg-primary text-primary-foreground animate-pulse"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {idx < currentPhaseIndex ? (
                  <Check className="size-3 sm:size-4" />
                ) : (
                  phase.icon
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-center leading-tight truncate w-full px-0.5">
                {t(phase.labelKey).split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Encouragement message */}
        <div className="text-center py-3 px-4 bg-primary/5 rounded-lg">
          <p className="text-xs sm:text-sm font-medium text-primary">
            {currentMessage}
          </p>
        </div>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {phaseLabel} - {currentTip}
        </div>
      </CardContent>
    </Card>
  );
}

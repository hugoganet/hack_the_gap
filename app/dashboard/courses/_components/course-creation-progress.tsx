"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  FileText,
  Brain,
  Network,
  CheckCircle2,
  Database,
  Check,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

type ProcessingPhase = {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  estimatedSeconds: number;
  tipsKey: string;
};

const PROCESSING_PHASES: ProcessingPhase[] = [
  {
    id: "analyzing",
    labelKey: "phases.analyzing",
    icon: <FileText className="size-3 sm:size-4" />,
    estimatedSeconds: 30,
    tipsKey: "tips.analyzing",
  },
  {
    id: "extracting",
    labelKey: "phases.extracting",
    icon: <Brain className="size-3 sm:size-4" />,
    estimatedSeconds: 90,
    tipsKey: "tips.extracting",
  },
  {
    id: "structuring",
    labelKey: "phases.structuring",
    icon: <Network className="size-3 sm:size-4" />,
    estimatedSeconds: 40,
    tipsKey: "tips.structuring",
  },
  {
    id: "validating",
    labelKey: "phases.validating",
    icon: <CheckCircle2 className="size-3 sm:size-4" />,
    estimatedSeconds: 30,
    tipsKey: "tips.validating",
  },
  {
    id: "saving",
    labelKey: "phases.saving",
    icon: <Database className="size-3 sm:size-4" />,
    estimatedSeconds: 30,
    tipsKey: "tips.saving",
  },
  {
    id: "complete",
    labelKey: "phases.complete",
    icon: <Sparkles className="size-3 sm:size-4 text-success" />,
    estimatedSeconds: 0,
    tipsKey: "",
  },
];

type CourseCreationProgressProps = {
  courseName: string;
  subjectName: string;
  isProcessingComplete?: boolean;
  onComplete?: () => void;
};

export function CourseCreationProgress({
  courseName,
  subjectName,
  isProcessingComplete = false,
  onComplete,
}: CourseCreationProgressProps): React.ReactElement {
  const t = useTranslations("dashboard.courseCreation");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [hasCompletedPhases, setHasCompletedPhases] = useState(false);

  const currentPhase = PROCESSING_PHASES[currentPhaseIndex];
  const isLastPhase = currentPhaseIndex === PROCESSING_PHASES.length - 2;

  // Get tips array for current phase
  const getTips = (): string[] => {
    if (!currentPhase.tipsKey) return [];
    const tips = t.raw(currentPhase.tipsKey);
    return Array.isArray(tips) ? tips : [];
  };

  const tips = getTips();
  const currentTip = tips[currentTipIndex] || "";

  // Get encouragement messages
  const getEncouragementMessages = (): string[] => {
    const messages = t.raw("encouragement");
    return Array.isArray(messages) ? messages : [];
  };

  const encouragementMessages = getEncouragementMessages();
  const currentMessage = encouragementMessages[currentMessageIndex] || "";

  // Celebrate phase completion
  const celebratePhaseComplete = (phase: ProcessingPhase): void => {
    // Lazy load confetti (fire and forget)
    void (async () => {
      try {
        const confettiModule = await import("canvas-confetti");
        const confetti = confettiModule.default;
        void confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#8b5cf6"],
        });
      } catch (error) {
        console.error("Failed to load confetti:", error);
      }
    })();

    // Success toast with phase-specific message
    const celebrationKey = `celebrations.${phase.id}`;
    const message = t(celebrationKey);
    
    toast.success(message, {
      duration: 2000,
    });
  };

  // Simulate progress through phases
  useEffect(() => {
    if (currentPhaseIndex >= PROCESSING_PHASES.length - 1) {
      if (!hasCompletedPhases) {
        setHasCompletedPhases(true);
        onComplete?.();
      }
      return;
    }

    const phase = PROCESSING_PHASES[currentPhaseIndex];
    const incrementPerSecond = 100 / phase.estimatedSeconds;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + incrementPerSecond;

        // If we're on the last phase and haven't received API completion, stop at 99%
        if (isLastPhase && !isProcessingComplete && newProgress >= 99) {
          return 99;
        }

        if (newProgress >= 100) {
          // Phase complete - celebrate!
          void celebratePhaseComplete(phase);
          setCurrentPhaseIndex((p) => p + 1);
          return 0;
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhaseIndex, isProcessingComplete, isLastPhase, hasCompletedPhases, onComplete]);

  // When API signals completion on last phase, allow progress to reach 100%
  useEffect(() => {
    if (isLastPhase && isProcessingComplete && progress >= 99) {
      setProgress(100);
      // Trigger phase completion after a brief moment
      const timer = setTimeout(() => {
        void celebratePhaseComplete(currentPhase);
        setCurrentPhaseIndex((p) => p + 1);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isProcessingComplete, isLastPhase, progress, currentPhase]);

  // Rotate tips within current phase
  useEffect(() => {
    if (!tips.length) return;

    setCurrentTipIndex(0);

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPhaseIndex, tips.length]);

  // Rotate encouragement messages
  useEffect(() => {
    if (!encouragementMessages.length) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % encouragementMessages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [encouragementMessages.length]);

  return (
    <Card className="w-full border-2 border-primary/20">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="relative flex-shrink-0">
            <div className="size-10 sm:size-12 rounded-full bg-primary/10 flex items-center justify-center">
              {currentPhase.icon}
            </div>
            <div className="absolute -inset-1 bg-primary/20 rounded-full animate-ping" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-1">
              {t(currentPhase.labelKey)}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("creating")}: <span className="font-medium">{courseName}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {t("subject")}: <span className="font-medium">{subjectName}</span>
            </p>
          </div>
        </div>

        {/* Progress bar with tip and percentage */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground truncate flex-1">{currentTip}</span>
            <span className="font-medium flex-shrink-0">{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2 transition-all duration-300 ease-linear"
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
        {currentMessage && (
          <div className="text-center py-3 px-4 bg-primary/5 rounded-lg">
            <p className="text-xs sm:text-sm font-medium text-primary">
              {currentMessage}
            </p>
          </div>
        )}

        {/* Accessibility - Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {t(currentPhase.labelKey)} - {currentTip} - {Math.round(progress)}% {t("complete")}
        </div>
      </CardContent>
    </Card>
  );
}

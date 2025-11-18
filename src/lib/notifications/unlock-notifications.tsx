/**
 * Unlock notification utilities
 * Client-side toast notifications for flashcard unlocks, milestones, and streaks
 */

import { toast } from "sonner";

export type UnlockNotification = {
  flashcardId: string;
  question: string;
  conceptText: string;
  source: string;
};

/**
 * Show unlock notification when flashcards are unlocked
 */
export function showUnlockNotification(unlocked: UnlockNotification[]) {
  if (unlocked.length === 0) return;

  const count = unlocked.length;
  const concepts = unlocked.map((u) => u.conceptText).join(", ");

  toast.success(
    <div className="flex items-start gap-3">
      <span className="text-2xl">🎉</span>
      <div className="flex-1">
        <p className="font-semibold">
          Unlocked {count} answer{count > 1 ? "s" : ""}!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {concepts}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          From: {unlocked[0]?.source}
        </p>
      </div>
    </div>,
    {
      duration: 5000,
      action: {
        label: "Review now",
        onClick: () => {
          window.location.href = "/dashboard/review";
        },
      },
    }
  );
}

/**
 * Show milestone notification when user reaches unlock milestones
 */
export function showMilestoneNotification(milestone: 10 | 50 | 100) {
  const messages = {
    10: "🎯 First 10 unlocks!",
    50: "🚀 50 unlocks milestone!",
    100: "🏆 100 unlocks achieved!",
  };

  const descriptions = {
    10: "You're building momentum!",
    50: "Halfway to mastery!",
    100: "You're a learning champion!",
  };

  toast.success(
    <div className="flex items-start gap-3">
      <span className="text-2xl">
        {milestone === 10 ? "🎯" : milestone === 50 ? "🚀" : "🏆"}
      </span>
      <div>
        <p className="font-semibold">{messages[milestone]}</p>
        <p className="text-sm text-muted-foreground">{descriptions[milestone]}</p>
      </div>
    </div>,
    { duration: 7000 }
  );
}

/**
 * Show streak notification for 3+ day streaks
 */
export function showStreakNotification(streak: number) {
  if (streak < 3) return;

  const messages = {
    3: "Getting started!",
    7: "One week strong!",
    14: "Two weeks of consistency!",
    30: "A full month!",
  };

  const message =
    messages[streak as keyof typeof messages] || "Keep it going!";

  toast.success(
    <div className="flex items-center gap-2">
      <span className="text-2xl">🔥</span>
      <div>
        <p className="font-semibold">{streak}-day streak!</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>,
    { duration: 4000 }
  );
}

/**
 * Show notification when all flashcards are unlocked
 */
export function showAllUnlockedNotification() {
  toast.success(
    <div className="flex items-center gap-2">
      <span className="text-2xl">🎊</span>
      <div>
        <p className="font-semibold">All flashcards unlocked!</p>
        <p className="text-sm text-muted-foreground">
          You've covered all concepts. Time to master them!
        </p>
      </div>
    </div>,
    { duration: 6000 }
  );
}

/**
 * Show notification when user tries to review locked flashcard
 */
export function showLockedFlashcardNotification() {
  toast.info(
    <div className="flex items-center gap-2">
      <span className="text-xl">🔒</span>
      <div>
        <p className="font-semibold">This flashcard is locked</p>
        <p className="text-sm text-muted-foreground">
          Watch content to unlock the answer
        </p>
      </div>
    </div>,
    { duration: 3000 }
  );
}

/**
 * Types for review session feature
 * Based on US-0006 specification
 */

export type DifficultyRating = "easy" | "medium" | "hard";

export type SessionStatus = "in-progress" | "completed" | "abandoned";

/**
 * Review session data
 */
export type ReviewSession = {
  id: string;
  userId: string;
  courseId: string;
  flashcardIds: string[];
  currentCardIndex: number;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date | null;
};

/**
 * Review event (rating a flashcard)
 */
export type ReviewEvent = {
  id: string;
  sessionId: string;
  flashcardId: string;
  difficulty: DifficultyRating;
  timeToRevealMs?: number | null;
  timeToRateMs?: number | null;
  createdAt: Date;
};

/**
 * Flashcard for review session
 */
export type ReviewFlashcard = {
  id: string;
  question: string;
  answer: string;
  sourceTimestamp: string | null;
  conceptName: string;
  category: string | null;
};

/**
 * Current card state in review session
 */
export type ReviewCardState = {
  flashcard: ReviewFlashcard;
  index: number;
  total: number;
  revealed: boolean;
  revealedAt?: number; // timestamp
};

/**
 * Review session summary
 */
export type ReviewSummary = {
  totalReviewed: number;
  hardCount: number;
  mediumCount: number;
  easyCount: number;
  nextReviewSchedule: ReviewScheduleItem[];
};

/**
 * Next review schedule item
 */
export type ReviewScheduleItem = {
  difficulty: DifficultyRating;
  count: number;
  interval: string;
  nextReviewDate: Date;
};

/**
 * Difficulty button configuration
 */
export type DifficultyConfig = {
  difficulty: DifficultyRating;
  label: string;
  sublabel: string;
  interval: string;
  emoji: string;
  colorClass: string;
  hoverClass: string;
};

/**
 * Keyboard shortcut mapping
 */
export const KEYBOARD_SHORTCUTS = {
  reveal: [' ', 'Space'],
  hard: ['1', 'ArrowLeft'],
  medium: ['2', 'ArrowDown'],
  easy: ['3', 'ArrowRight'],
  exit: ['Escape'],
} as const;

/**
 * Difficulty configurations
 */
export const DIFFICULTY_CONFIGS: Record<DifficultyRating, DifficultyConfig> = {
  hard: {
    difficulty: 'hard',
    label: 'Hard',
    sublabel: 'Again',
    interval: '<1 day',
    emoji: '🔴',
    colorClass: 'border-destructive text-destructive',
    hoverClass: 'hover:bg-destructive/10',
  },
  medium: {
    difficulty: 'medium',
    label: 'Medium',
    sublabel: 'Good',
    interval: '3 days',
    emoji: '🟡',
    colorClass: 'border-warning text-warning',
    hoverClass: 'hover:bg-warning/10',
  },
  easy: {
    difficulty: 'easy',
    label: 'Easy',
    sublabel: 'Perfect',
    interval: '1 week',
    emoji: '🟢',
    colorClass: 'border-success text-success',
    hoverClass: 'hover:bg-success/10',
  },
};

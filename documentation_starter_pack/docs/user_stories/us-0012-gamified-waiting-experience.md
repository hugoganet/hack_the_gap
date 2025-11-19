# Feature Spec: US-0012 - Gamified Waiting Experience (Tier 3: Advanced)

Owner: Founder
Status: Draft
Last Updated: 2025-01-18

## Summary

Transform the 3+ minute processing wait into an engaging, educational, and rewarding experience through gamification, AI-generated contextual messages, trivia quizzes, learning facts, and micro-rewards. Turn waiting from a necessary evil into a delightful moment that reinforces the product's learning-focused personality.

**Why now:** Post-MVP enhancement to differentiate from competitors and align with Duolingo-like personality. After implementing progress feedback (US-0010) and background processing (US-0011), this adds the "delight" layer that transforms good UX into exceptional UX.

**Impact:** Increases user engagement during wait time, reinforces learning mindset, creates memorable moments, builds brand affinity, reduces perceived wait time by 70-80%.

## User Stories

- As a Self-Directed Learner, I want to learn something interesting while I wait so that the time feels productive rather than wasted.
- As a Self-Directed Learner, I want to be entertained during processing so that waiting feels less tedious.
- As a Self-Directed Learner, I want to earn rewards for waiting so that I feel acknowledged for my patience.
- As a Self-Directed Learner, I want personalized messages about my content so that the experience feels tailored to me.

## Acceptance Criteria

**Given** content is being processed
**When** the user views the processing screen
**Then** they see gamified elements alongside progress indicators

**Given** processing is in the "analyzing" phase
**When** the user views the screen
**Then** they see AI-generated contextual messages specific to their content:
- "🧬 Diving deep into biology concepts!"
- "🎨 Unpacking art history masterpieces..."
- "⚛️ Breaking down quantum mechanics..."

**Given** the user has been waiting for 45+ seconds
**When** a trivia quiz appears
**Then** they can answer a learning-science question:
- Multiple choice (4 options)
- Instant feedback (correct/incorrect)
- +5 XP reward for correct answers
- Explanation after answering

**Given** the user is viewing the processing screen
**When** rotating "Did You Know?" facts appear
**Then** they see learning-science facts every 15 seconds:
- "Spaced repetition can improve retention by up to 200%! 🧠"
- "Your brain forms stronger memories when you actively recall information 💪"
- (10 total facts)

**Given** processing completes successfully
**When** the final celebration screen appears
**Then** the user sees:
- Confetti animation (enhanced, 100+ particles)
- XP earned summary: "+25 XP for processing content"
- Achievement unlocked (if applicable): "🏆 First Video Processed!"
- Streak counter: "🔥 3 day learning streak"
- Level progress bar: "Level 5 → 6 (80%)"

**Given** the user processes multiple pieces of content
**When** they reach milestones
**Then** they unlock achievements:
- "🎬 Video Novice" (1 video)
- "📚 Content Consumer" (5 videos)
- "🧠 Knowledge Seeker" (10 videos)
- "🚀 Learning Machine" (25 videos)
- "🏆 Master Learner" (50 videos)

**Detailed Acceptance Criteria:**

- [ ] AI-generated contextual messages use GPT-4o-mini (cheap, fast)
- [ ] Messages are content-specific (based on title/subject)
- [ ] Trivia quiz appears after 45 seconds of processing
- [ ] Quiz questions are learning-science focused (not content-specific)
- [ ] 10 pre-written quiz questions with explanations
- [ ] "Did You Know?" facts rotate every 15 seconds
- [ ] 10 pre-written learning facts
- [ ] XP system tracks user progress (stored in database)
- [ ] Achievement system with 5 tiers
- [ ] Streak counter tracks consecutive days of content processing
- [ ] Level system (1-10, exponential XP requirements)
- [ ] Enhanced confetti animation (100+ particles, colors)
- [ ] All text is internationalized (EN/FR)
- [ ] Mobile-responsive design
- [ ] Accessible (ARIA labels, keyboard navigation)

## UX & Flows

```
[Processing starts - US-0010 progress shown]
    ↓
[Phase 1: Fetching (0-10s)]
├─ Standard progress indicators
└─ AI generates contextual message
    ↓
[Phase 2: Analyzing (10-55s)]
├─ AI-generated message appears:
│  "🧬 Diving deep into biology concepts!"
├─ "Did You Know?" fact #1 (15s)
├─ "Did You Know?" fact #2 (30s)
└─ Trivia quiz appears (45s)
    ↓
[Trivia Quiz Card]
┌─────────────────────────────────────┐
│ ⚡ Quick Quiz!                      │
│                                     │
│ Q: Spaced repetition works because: │
│                                     │
│ ○ A) It's easier than cramming     │
│ ○ B) It leverages forgetting curve │
│ ○ C) It saves time                 │
│ ○ D) It's more fun                 │
│                                     │
│ [Skip] ────────────────────────────│
└─────────────────────────────────────┘
    ↓
[User selects answer B]
    ↓
[Correct Answer Feedback]
┌─────────────────────────────────────┐
│ 🎉 Correct! +5 XP                   │
│                                     │
│ Spaced repetition leverages the    │
│ forgetting curve by reviewing      │
│ material just before you forget it.│
│                                     │
│ [Continue] ────────────────────────│
└─────────────────────────────────────┘
    ↓
[Phase 3-5: Matching, Generating, Unlocking]
├─ More "Did You Know?" facts
├─ AI-generated encouragement
└─ Progress continues
    ↓
[Processing Complete]
    ↓
[Enhanced Celebration Screen]
┌─────────────────────────────────────┐
│         🎉 All Done! 🎉             │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Extracted 12 concepts           ││
│ │ Matched 9 to your goals         ││
│ │ Created 9 flashcards            ││
│ │ Unlocked 7 new cards            ││
│ └─────────────────────────────────┘│
│                                     │
│ 🌟 +25 XP earned                    │
│ 🔥 3 day learning streak            │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🏆 Achievement Unlocked!        ││
│ │ "Content Consumer"              ││
│ │ Processed 5 videos              ││
│ └─────────────────────────────────┘│
│                                     │
│ Level 5 ████████████░░░░░░ 80%     │
│ 200 XP to Level 6                   │
│                                     │
│ [Review Flashcards →]               │
└─────────────────────────────────────┘
```

**Mobile-first wireframe (Trivia Quiz):**

```
┌─────────────────────────────────┐
│ ⚡ Quick Quiz!                  │
│                                 │
│ Spaced repetition works         │
│ because:                        │
│                                 │
│ ┌─────────────────────────────┐│
│ │ A) It's easier than cramming││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ B) It leverages forgetting  ││
│ │    curve                    ││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ C) It saves time            ││
│ └─────────────────────────────┘│
│ ┌─────────────────────────────┐│
│ │ D) It's more fun            ││
│ └─────────────────────────────┘│
│                                 │
│ [Skip] ────────────────────────│
└─────────────────────────────────┘
```

**"Did You Know?" Card:**

```
┌─────────────────────────────────┐
│ 💡 Did you know?                │
│                                 │
│ Spaced repetition can improve   │
│ retention by up to 200%! 🧠     │
│                                 │
│ That's why we schedule your     │
│ flashcard reviews optimally.    │
└─────────────────────────────────┘
```

## Scope

**In scope:**

- AI-generated contextual messages (GPT-4o-mini)
- Trivia quiz system (10 pre-written questions)
- "Did You Know?" facts (10 pre-written facts)
- XP system (earn XP for actions)
- Achievement system (5 tiers, 5 achievements)
- Streak counter (consecutive days)
- Level system (1-10 levels)
- Enhanced celebration screen with XP/achievements
- Enhanced confetti animation (100+ particles)
- Database schema for gamification (user_stats, achievements, streaks)
- Internationalization (EN/FR)
- Mobile-responsive design
- Accessible (ARIA, keyboard, screen reader)

**Out of scope:**

- Leaderboards (social comparison)
- Multiplayer features (compete with friends)
- Custom avatars/profiles
- In-app purchases (XP boosters, etc.)
- Daily challenges/quests
- Badges/stickers collection
- Social sharing (share achievements)
- Personalized quiz questions (based on user's content)
- Video/audio rewards
- Animated mascot/character
- Sound effects (optional toggle in settings)

## Technical Design

**Components impacted:**

- `app/dashboard/_components/processing-progress.tsx` (existing - update)
- `app/dashboard/_components/trivia-quiz-card.tsx` (new)
- `app/dashboard/_components/did-you-know-card.tsx` (new)
- `app/dashboard/_components/celebration-screen.tsx` (new)
- `app/dashboard/_components/achievement-toast.tsx` (new)
- `app/actions/process-content.action.ts` (existing - add XP/achievement logic)
- `src/lib/gamification/xp-system.ts` (new)
- `src/lib/gamification/achievement-system.ts` (new)
- `src/lib/gamification/streak-tracker.ts` (new)

**Database Schema Changes:**

```sql
-- Add gamification fields to users table
ALTER TABLE users ADD COLUMN xp INT DEFAULT 0;
ALTER TABLE users ADD COLUMN level INT DEFAULT 1;
ALTER TABLE users ADD COLUMN current_streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN longest_streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN last_activity_date DATE;

-- Create achievements table
CREATE TABLE achievements (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  achievement_type VARCHAR(50) NOT NULL, -- video_novice, content_consumer, etc.
  unlocked_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, achievement_type)
);

-- Create xp_events table (audit log)
CREATE TABLE xp_events (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- content_processed, quiz_correct, etc.
  xp_earned INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create quiz_responses table
CREATE TABLE quiz_responses (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  question_id VARCHAR(50) NOT NULL,
  selected_answer VARCHAR(10) NOT NULL, -- A, B, C, D
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**XP System:**

```typescript
// src/lib/gamification/xp-system.ts
import { prisma } from "@/lib/prisma";

export const XP_REWARDS = {
  CONTENT_PROCESSED: 25,
  QUIZ_CORRECT: 5,
  QUIZ_INCORRECT: 1, // Participation reward
  DAILY_STREAK: 10,
  ACHIEVEMENT_UNLOCKED: 50,
} as const;

export const LEVEL_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  1000, // Level 5
  2000, // Level 6
  4000, // Level 7
  8000, // Level 8
  16000, // Level 9
  32000, // Level 10
];

export async function awardXP(
  userId: string,
  eventType: keyof typeof XP_REWARDS,
  metadata?: Record<string, unknown>
) {
  const xpEarned = XP_REWARDS[eventType];

  // Create XP event
  await prisma.xpEvent.create({
    data: {
      userId,
      eventType,
      xpEarned,
      metadata,
    },
  });

  // Update user's total XP
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpEarned },
    },
    select: { xp: true, level: true },
  });

  // Check for level up
  const newLevel = calculateLevel(user.xp);
  let leveledUp = false;

  if (newLevel > user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
    leveledUp = true;
  }

  return {
    xpEarned,
    totalXP: user.xp,
    level: newLevel,
    leveledUp,
    xpToNextLevel: LEVEL_THRESHOLDS[newLevel] - user.xp,
  };
}

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getProgressToNextLevel(xp: number, level: number) {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
}
```

**Achievement System:**

```typescript
// src/lib/gamification/achievement-system.ts
import { prisma } from "@/lib/prisma";
import { awardXP } from "./xp-system";

export const ACHIEVEMENTS = {
  VIDEO_NOVICE: {
    id: "video_novice",
    name: "Video Novice",
    description: "Process your first video",
    icon: "🎬",
    requirement: 1,
  },
  CONTENT_CONSUMER: {
    id: "content_consumer",
    name: "Content Consumer",
    description: "Process 5 pieces of content",
    icon: "📚",
    requirement: 5,
  },
  KNOWLEDGE_SEEKER: {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    description: "Process 10 pieces of content",
    icon: "🧠",
    requirement: 10,
  },
  LEARNING_MACHINE: {
    id: "learning_machine",
    name: "Learning Machine",
    description: "Process 25 pieces of content",
    icon: "🚀",
    requirement: 25,
  },
  MASTER_LEARNER: {
    id: "master_learner",
    name: "Master Learner",
    description: "Process 50 pieces of content",
    icon: "🏆",
    requirement: 50,
  },
} as const;

export async function checkAchievements(userId: string) {
  // Get user's content processing count
  const contentCount = await prisma.contentJob.count({
    where: {
      userId,
      status: "completed",
    },
  });

  const unlockedAchievements = [];

  // Check each achievement
  for (const achievement of Object.values(ACHIEVEMENTS)) {
    if (contentCount >= achievement.requirement) {
      // Check if already unlocked
      const existing = await prisma.achievement.findUnique({
        where: {
          userId_achievementType: {
            userId,
            achievementType: achievement.id,
          },
        },
      });

      if (!existing) {
        // Unlock achievement
        await prisma.achievement.create({
          data: {
            userId,
            achievementType: achievement.id,
          },
        });

        // Award XP
        await awardXP(userId, "ACHIEVEMENT_UNLOCKED", {
          achievementId: achievement.id,
        });

        unlockedAchievements.push(achievement);
      }
    }
  }

  return unlockedAchievements;
}
```

**Streak Tracker:**

```typescript
// src/lib/gamification/streak-tracker.ts
import { prisma } from "@/lib/prisma";
import { awardXP } from "./xp-system";

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
    },
  });

  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];
  const lastActivity = user.lastActivityDate?.toISOString().split("T")[0];

  let newStreak = user.currentStreak || 0;
  let streakContinued = false;

  if (!lastActivity) {
    // First activity
    newStreak = 1;
  } else if (lastActivity === today) {
    // Already counted today
    return {
      currentStreak: newStreak,
      longestStreak: user.longestStreak || 0,
      streakContinued: false,
    };
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActivity === yesterdayStr) {
      // Streak continues
      newStreak += 1;
      streakContinued = true;

      // Award streak XP
      await awardXP(userId, "DAILY_STREAK", { streak: newStreak });
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak || 0),
      lastActivityDate: new Date(),
    },
  });

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, user.longestStreak || 0),
    streakContinued,
  };
}
```

**AI-Generated Contextual Messages:**

```typescript
// src/lib/gamification/contextual-messages.ts
import { openai } from "@/lib/ai";

export async function generateContextualMessage(
  contentTitle: string,
  contentType: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cheap and fast
      messages: [
        {
          role: "user",
          content: `Generate a short, encouraging message (max 10 words) for a student whose ${contentType} about "${contentTitle}" is being processed. Tone: Duolingo-like (playful, encouraging, emoji-friendly). Include one relevant emoji at the start.`,
        },
      ],
      max_tokens: 20,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "🚀 Processing your content!";
  } catch (error) {
    console.error("Failed to generate contextual message:", error);
    // Fallback to generic message
    return "🚀 Processing your content!";
  }
}
```

**Trivia Quiz Questions:**

```typescript
// src/lib/gamification/trivia-questions.ts
export const TRIVIA_QUESTIONS = [
  {
    id: "q1",
    question: "Spaced repetition works because:",
    options: [
      "It's easier than cramming",
      "It leverages the forgetting curve",
      "It saves time",
      "It's more fun",
    ],
    correctAnswer: 1, // Index of correct option (B)
    explanation:
      "Spaced repetition leverages the forgetting curve by reviewing material just before you forget it, strengthening long-term memory.",
  },
  {
    id: "q2",
    question: "Active recall is more effective than passive reading because:",
    options: [
      "It's faster",
      "It requires less effort",
      "It forces your brain to retrieve information",
      "It's more enjoyable",
    ],
    correctAnswer: 2,
    explanation:
      "Active recall forces your brain to retrieve information from memory, which strengthens neural pathways and improves retention.",
  },
  {
    id: "q3",
    question: "The average person forgets what percentage of new information within 24 hours?",
    options: ["30%", "50%", "70%", "90%"],
    correctAnswer: 2,
    explanation:
      "Research shows that people forget approximately 70% of new information within 24 hours without review. This is why spaced repetition is so important!",
  },
  {
    id: "q4",
    question: "Breaking content into atomic concepts makes learning:",
    options: [
      "More confusing",
      "3x more effective",
      "Slower",
      "Less organized",
    ],
    correctAnswer: 1,
    explanation:
      "Breaking content into atomic concepts (one idea per flashcard) makes learning 3x more effective by reducing cognitive load and improving focus.",
  },
  {
    id: "q5",
    question: "The best time to review a flashcard is:",
    options: [
      "Immediately after learning",
      "Just before you forget it",
      "One week later",
      "Never",
    ],
    correctAnswer: 1,
    explanation:
      "The optimal time to review is just before you forget the information. This is the core principle of spaced repetition algorithms.",
  },
  {
    id: "q6",
    question: "Flashcards work best when they:",
    options: [
      "Test multiple concepts at once",
      "Are very detailed",
      "Focus on one atomic concept",
      "Include long paragraphs",
    ],
    correctAnswer: 2,
    explanation:
      "Flashcards are most effective when they focus on one atomic concept. This reduces cognitive load and improves recall.",
  },
  {
    id: "q7",
    question: "Your brain forms stronger memories when you:",
    options: [
      "Read passively",
      "Highlight text",
      "Actively recall information",
      "Listen to music",
    ],
    correctAnswer: 2,
    explanation:
      "Active recall (retrieving information from memory) creates stronger neural pathways than passive reading or highlighting.",
  },
  {
    id: "q8",
    question: "The 'forgetting curve' was discovered by:",
    options: [
      "Albert Einstein",
      "Hermann Ebbinghaus",
      "Sigmund Freud",
      "Ivan Pavlov",
    ],
    correctAnswer: 1,
    explanation:
      "Hermann Ebbinghaus discovered the forgetting curve in 1885, showing how information is lost over time without reinforcement.",
  },
  {
    id: "q9",
    question: "Spaced repetition can improve retention by up to:",
    options: ["50%", "100%", "200%", "500%"],
    correctAnswer: 2,
    explanation:
      "Studies show that spaced repetition can improve retention by up to 200% compared to massed practice (cramming).",
  },
  {
    id: "q10",
    question: "The best way to learn is to:",
    options: [
      "Read once and hope for the best",
      "Cram the night before",
      "Review at increasing intervals",
      "Never review",
    ],
    correctAnswer: 2,
    explanation:
      "Reviewing at increasing intervals (spaced repetition) is the most effective learning strategy, backed by decades of research.",
  },
];
```

**"Did You Know?" Facts:**

```typescript
// src/lib/gamification/learning-facts.ts
export const LEARNING_FACTS = [
  "Spaced repetition can improve retention by up to 200%! 🧠",
  "Your brain forms stronger memories when you actively recall information 💪",
  "Breaking content into atomic concepts makes learning 3x more effective 🎯",
  "The average person forgets 70% of new information within 24 hours 📉",
  "Flashcards work because they leverage active recall and spaced repetition ✨",
  "The 'forgetting curve' was discovered by Hermann Ebbinghaus in 1885 📚",
  "Active recall is 50% more effective than passive reading 🚀",
  "Your brain needs 7-9 hours of sleep to consolidate memories 😴",
  "Testing yourself is one of the most effective learning strategies 📝",
  "Interleaving (mixing topics) improves long-term retention by 40% 🔄",
];
```

**New Component: TriviaQuizCard**

```typescript
// app/dashboard/_components/trivia-quiz-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";

type TriviaQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type TriviaQuizCardProps = {
  question: TriviaQuestion;
  onAnswer: (isCorrect: boolean) => void;
  onSkip: () => void;
};

export function TriviaQuizCard({ question, onAnswer, onSkip }: TriviaQuizCardProps) {
  const t = useTranslations("dashboard.processing.trivia");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === question.correctAnswer;
    
    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    onAnswer(isCorrect);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Card className="mt-4 border-primary/20">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="size-4 text-amber-500" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">{question.question}</p>

        <div className="space-y-2">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full justify-start text-left h-auto py-3 px-4",
                showResult && index === question.correctAnswer && "border-green-500 bg-green-50 dark:bg-green-950/20",
                showResult && index === selectedAnswer && index !== question.correctAnswer && "border-red-500 bg-red-50 dark:bg-red-950/20"
              )}
              onClick={() => handleSelectAnswer(index)}
              disabled={showResult}
            >
              <span className="mr-2 font-semibold">
                {String.fromCharCode(65 + index)})
              </span>
              <span className="flex-1">{option}</span>
              {showResult && index === question.correctAnswer && (
                <Check className="size-4 text-green-600 ml-2" />
              )}
              {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                <X className="size-4 text-red-600 ml-2" />
              )}
            </Button>
          ))}
        </div>

        {showResult && (
          <div className={cn(
            "p-3 rounded-lg",
            isCorrect ? "bg-green-50 dark:bg-green-950/20" : "bg-amber-50 dark:bg-amber-950/20"
          )}>
            <p className={cn(
              "text-sm font-medium mb-1",
              isCorrect ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"
            )}>
              {isCorrect ? "🎉 Correct! +5 XP" : "💡 Not quite, but +1 XP for trying!"}
            </p>
            <p className="text-sm text-muted-foreground">
              {question.explanation}
            </p>
          </div>
        )}

        {!showResult && (
          <Button variant="ghost" size="sm" onClick={onSkip} className="w-full">
            {t("skip")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

**New Component: DidYouKnowCard**

```typescript
// app/dashboard/_components/did-you-know-card.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

type DidYouKnowCardProps = {
  fact: string;
};

export function DidYouKnowCard({ fact }: DidYouKnowCardProps) {
  const t = useTranslations("dashboard.processing.facts");

  return (
    <Card className="mt-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <Car

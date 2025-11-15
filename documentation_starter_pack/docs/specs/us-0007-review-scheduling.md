# Feature Spec: US-0007 - Review Scheduling

Owner: Founder
Status: Draft
Last Updated: 2025-11-14

## Summary

Schedule flashcard reviews based on spaced repetition principles using difficulty ratings. This is the retention engine - ensuring concepts move from short-term to long-term memory through optimal review timing.

**Why now:** Core to the value proposition. Without proper scheduling, the system is just flashcards with no retention optimization.

## User Stories

- As a Motivated Struggler, I want flashcards scheduled for optimal review intervals so that I retain concepts long-term without wasting time on over-reviewing easy material.

## Acceptance Criteria

**Given** a user rates a flashcard as "Easy"
**When** the review is recorded
**Then** the next review is scheduled 3 days from now

**Given** a user rates a flashcard as "Medium"
**When** the review is recorded
**Then** the next review is scheduled 1 day from now

**Given** a user rates a flashcard as "Hard"
**When** the review is recorded
**Then** the next review is scheduled tomorrow (same time)

**Given** a user reviews a card for the second+ time
**When** they rate it as "Easy"
**Then** the interval doubles from the previous interval (simple progressive spacing)

**Detailed Acceptance Criteria:**

- [ ] Scheduling uses fixed intervals for MVP (not adaptive SM-2 algorithm)
- [ ] Intervals: Hard=1d, Medium=1d, Easy=3d (first review)
- [ ] Subsequent reviews: multiply previous interval by 2 if "Easy", reset to 1d if "Hard"
- [ ] Next review time stored in `flashcards.next_review_at`
- [ ] User can see next review date after completing session
- [ ] Cards due "today" include anything with `next_review_at <= now()`
- [ ] Scheduling works correctly across timezones (store UTC, display local)

## UX & Flows

**User sees scheduling after review:**

```
[Review Complete Screen]
✅ Review Complete!

You reviewed 3 concepts

Next review schedule:
• 1 card tomorrow (9:00 AM)
  - "Categorical Imperative" (Hard)

• 2 cards in 3 days (9:00 AM)
  - "Deontological Ethics" (Easy)
  - "Moral Law" (Easy)

[Button: Done →]
```

**Dashboard shows upcoming reviews:**

```
[Dashboard - Today's Reviews]

📚 Reviews due today: 0
📅 Reviews due tomorrow: 1
📅 Reviews due this week: 2
```

**Backend scheduling flow:**

```
[User rates card: "Easy"]
    ↓
[Calculate next interval]
  - First review? → 3 days
  - Repeat review? → 2x previous interval
    ↓
[Set next_review_at = now() + interval]
    ↓
[Update flashcard.next_review_at]
    ↓
[Return next review date to UI]
```

## Scope

**In scope:**

- Fixed interval scheduling (simple, predictable)
- Three intervals based on difficulty (Hard=1d, Medium=1d, Easy=3d)
- Interval doubling for repeat "Easy" reviews
- Timezone-aware scheduling (store UTC, display local)
- Query for "due today" flashcards
- Display next review schedule after session

**Out of scope:**

- Adaptive spaced repetition (SM-2, Anki algorithm) - post-MVP
- Custom intervals per user - post-MVP
- "Lapsed" card detection (cards not reviewed for long time) - post-MVP
- Review time optimization (ML-based optimal intervals) - post-MVP
- Manual rescheduling by user - post-MVP
- Notifications/reminders for due reviews - post-MVP

## Technical Design

**Components impacted:**

- `SchedulingService.ts` (new service)
- `FlashcardService.ts` (update next_review_at)
- `Dashboard.tsx` (show upcoming reviews)

**Scheduling Algorithm:**

```typescript
interface SchedulingConfig {
  firstReviewIntervals: {
    hard: number; // days
    medium: number;
    easy: number;
  };
  repeatMultiplier: number; // For easy reviews
}

const SCHEDULING_CONFIG: SchedulingConfig = {
  firstReviewIntervals: {
    hard: 1,    // 1 day
    medium: 1,  // 1 day
    easy: 3     // 3 days
  },
  repeatMultiplier: 2 // Double interval for each "easy" rating
};

function calculateNextReview(
  flashcard: Flashcard,
  difficulty: 'easy' | 'medium' | 'hard'
): Date {
  const now = new Date();
  let intervalDays: number;

  // First review?
  if (flashcard.timesReviewed === 0) {
    intervalDays = SCHEDULING_CONFIG.firstReviewIntervals[difficulty];
  } else {
    // Repeat review
    if (difficulty === 'easy') {
      // Double the previous interval
      const previousInterval = calculatePreviousInterval(flashcard);
      intervalDays = previousInterval * SCHEDULING_CONFIG.repeatMultiplier;
    } else if (difficulty === 'medium') {
      // Keep same interval
      intervalDays = calculatePreviousInterval(flashcard);
    } else {
      // Hard: reset to 1 day
      intervalDays = 1;
    }
  }

  // Cap maximum interval at 30 days for MVP
  intervalDays = Math.min(intervalDays, 30);

  return addDays(now, intervalDays);
}

function calculatePreviousInterval(flashcard: Flashcard): number {
  if (!flashcard.lastReviewedAt || !flashcard.nextReviewAt) {
    return 1; // Default to 1 day if no history
  }

  const diffMs = flashcard.nextReviewAt.getTime() - flashcard.lastReviewedAt.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 1);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

**Querying Due Reviews:**

```typescript
async function getDueFlashcards(userId: string): Promise<Flashcard[]> {
  const now = new Date();

  return db.flashcards.findMany({
    where: {
      userId,
      nextReviewAt: {
        lte: now // Less than or equal to now
      }
    },
    orderBy: {
      nextReviewAt: 'asc' // Oldest due cards first
    }
  });
}

async function getUpcomingReviews(
  userId: string,
  days: number = 7
): Promise<{ date: string; count: number }[]> {
  const now = new Date();
  const endDate = addDays(now, days);

  const flashcards = await db.flashcards.findMany({
    where: {
      userId,
      nextReviewAt: {
        gte: now,
        lte: endDate
      }
    },
    select: {
      nextReviewAt: true
    }
  });

  // Group by date
  const byDate = groupBy(flashcards, f =>
    f.nextReviewAt.toISOString().split('T')[0]
  );

  return Object.entries(byDate).map(([date, cards]) => ({
    date,
    count: cards.length
  }));
}
```

**Data Model Updates:**

```sql
-- Already defined in US-0005, highlighted relevant fields:
CREATE TABLE flashcards (
  id VARCHAR(50) PRIMARY KEY,
  -- ... other fields
  times_reviewed INT DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  next_review_at TIMESTAMP, -- KEY FIELD for scheduling
  -- ... other fields
  INDEX idx_user_next_review (user_id, next_review_at) -- Optimize due queries
);

-- Track scheduling history for analytics
CREATE TABLE review_schedule_history (
  id VARCHAR(50) PRIMARY KEY,
  flashcard_id VARCHAR(50) NOT NULL,
  review_event_id VARCHAR(50) NOT NULL,
  difficulty VARCHAR(10) NOT NULL,
  previous_interval_days INT,
  new_interval_days INT,
  previous_review_at TIMESTAMP,
  next_review_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (flashcard_id) REFERENCES flashcards(id),
  FOREIGN KEY (review_event_id) REFERENCES review_events(id)
);
```

**API Contracts:**

```typescript
// GET /api/reviews/due
Response: {
  dueToday: [
    { id: "fc-1", question: "What is...", conceptName: "..." }
  ],
  dueTomorrow: 3,
  dueThisWeek: 7
}

// GET /api/reviews/schedule/upcoming
Response: {
  schedule: [
    { date: "2025-11-15", count: 1 },
    { date: "2025-11-17", count: 2 }
  ]
}

// POST /api/reviews/:sessionId/rate (extended from US-0006)
Request: {
  flashcardId: "fc-1",
  difficulty: "easy"
}
Response: {
  nextReviewAt: "2025-11-17T10:00:00Z",
  intervalDays: 3,
  nextCard: {...} | null
}
```

**Timezone Handling:**

```typescript
// Store all dates in UTC
function scheduleNextReview(difficulty: string): Date {
  const now = new Date(); // Always UTC on server
  return calculateNextReview(flashcard, difficulty);
}

// Display in user's local timezone (client-side)
function formatNextReview(utcDate: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }).format(utcDate);
}
```

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Intervals too aggressive (users forget)** | Medium | High | Start conservative (1d/3d), adjust post-MVP based on retention data |
| **Intervals too conservative (over-review)** | Low | Medium | Track review burden (avg cards/day), adjust if >20/day |
| **Timezone bugs (reviews scheduled wrong time)** | Low | Medium | Store UTC, test with multiple timezones |
| **Interval doubling grows too fast** | Low | Low | Cap at 30 days for MVP, implement better algorithm post-MVP |

**Testing Strategy:**

```typescript
// Unit tests for scheduling logic
describe('Review Scheduling', () => {
  test('First "Easy" review schedules 3 days later', () => {
    const flashcard = createFlashcard({ timesReviewed: 0 });
    const nextReview = calculateNextReview(flashcard, 'easy');
    expect(nextReview).toBe(addDays(new Date(), 3));
  });

  test('Repeat "Easy" review doubles interval', () => {
    const flashcard = createFlashcard({
      timesReviewed: 1,
      lastReviewedAt: new Date('2025-11-10'),
      nextReviewAt: new Date('2025-11-13') // 3 day interval
    });
    const nextReview = calculateNextReview(flashcard, 'easy');
    const expectedDate = addDays(new Date(), 6); // 3 * 2 = 6 days
    expect(nextReview).toBeCloseTo(expectedDate);
  });

  test('"Hard" rating resets to 1 day', () => {
    const flashcard = createFlashcard({
      timesReviewed: 5,
      lastReviewedAt: new Date('2025-11-01'),
      nextReviewAt: new Date('2025-11-15') // Long interval
    });
    const nextReview = calculateNextReview(flashcard, 'hard');
    expect(nextReview).toBe(addDays(new Date(), 1));
  });
});
```

## Rollout

**Migration/feature flags:**

- No migration needed (new feature)
- Feature flag: `spaced_repetition_enabled`

**Metrics:**

- Average interval length by difficulty
- Review completion rate (% due reviews actually completed)
- Interval distribution (histogram of review intervals)
- Cards per user per day (review burden)
- Retention rate by interval (do longer intervals harm retention?)

**Post-launch checklist:**

- [ ] Verify scheduling works correctly for all difficulty ratings
- [ ] Test timezone handling (schedule reviews in UTC, display local)
- [ ] Monitor average cards/user/day (should be <10 for MVP)
- [ ] Track if users actually return for scheduled reviews
- [ ] Validate interval doubling doesn't grow too fast

**Post-MVP improvements:**

- Implement SM-2 or Anki's algorithm (adaptive intervals)
- Add "lapsed" card detection (cards overdue by >7 days)
- Custom intervals per user (preferences)
- Notifications/reminders for due reviews
- Manual rescheduling by user
- ML-based optimal intervals (personalized to user retention)

## ADR Dependencies

This feature requires architectural decisions on:

- **ADR-0008**: Spaced repetition algorithm selection (fixed intervals vs SM-2 vs custom)
- **ADR-0009**: Timezone handling strategy for scheduled reviews

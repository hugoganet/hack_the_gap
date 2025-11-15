# Feature Spec: US-0006 - First Review Session

Owner: Founder
Status: Draft
Last Updated: 2025-11-14

## Summary

Enable students to review generated flashcards immediately after video processing. This is the first active learning moment - transitioning from passive content consumption to active recall.

**Why now:** Critical for demonstrating the full pipeline in the hackathon demo. Students must be able to complete a review session end-to-end.

## User Stories

- As a Motivated Struggler, I want to review flashcards immediately after processing a video so that I can start encoding concepts into long-term memory while they're fresh.

## Acceptance Criteria

**Given** flashcards have been generated
**When** user clicks "Start Review"
**Then** they enter a flashcard review interface showing one card at a time

**Given** a flashcard is displayed
**When** user reveals the answer
**Then** they can mark it as "Easy," "Medium," or "Hard"

**Given** user completes the review session
**When** all flashcards are reviewed
**Then** system schedules next reviews based on difficulty ratings and shows completion summary

**Detailed Acceptance Criteria:**

- [ ] Review interface is mobile-friendly (large tap targets)
- [ ] Cards show one at a time (no multi-card view for MVP)
- [ ] User can reveal answer before rating
- [ ] Three rating buttons: "Hard" (red), "Medium" (yellow), "Easy" (green)
- [ ] Progress indicator shows "Card X of Y"
- [ ] Completion screen shows: "3 cards reviewed, next review in 1 day"
- [ ] User can exit review mid-session (progress is saved)
- [ ] Keyboard shortcuts work (space = reveal, 1/2/3 = difficulty)

## UX & Flows

```
[Flashcard Preview Screen]
  "3 cards ready for review"
  [Button: Start Review →]
    ↓
[Review Interface - Card 1/3]
┌─────────────────────────────────┐
│ Question:                        │
│ What is the Categorical         │
│ Imperative?                     │
│                                 │
│ [Button: Show Answer ▾]         │
└─────────────────────────────────┘

(User clicks Show Answer)

┌─────────────────────────────────┐
│ Question:                        │
│ What is the Categorical         │
│ Imperative?                     │
│                                 │
│ Answer:                         │
│ Kant's principle that one       │
│ should act only according to    │
│ maxims that could become        │
│ universal laws.                 │
│                                 │
│ How well did you know this?     │
│ [Hard 🔴] [Medium 🟡] [Easy 🟢] │
└─────────────────────────────────┘

(User selects difficulty, next card appears)

[After all cards reviewed]
┌─────────────────────────────────┐
│ ✅ Review Complete!              │
│                                 │
│ You reviewed 3 concepts          │
│                                 │
│ Next review:                    │
│ • 1 card tomorrow (Hard)        │
│ • 2 cards in 3 days (Easy)      │
│                                 │
│ [Done →]                        │
└─────────────────────────────────┘
```

**Mobile-first design:**

- Full-screen cards
- Large, thumb-friendly buttons
- Swipe gestures (optional: swipe up = reveal, left/right = difficulty)
- Clear visual feedback on button press

## Scope

**In scope:**

- Single-card view (one at a time)
- Show question → reveal answer → rate difficulty
- Three difficulty ratings (Hard, Medium, Easy)
- Progress indicator (X of Y cards)
- Completion summary screen
- Mid-session exit with progress save
- Keyboard shortcuts for desktop users

**Out of scope:**

- Multiple review modes (flashcards, cloze, multiple choice) - post-MVP
- Card editing during review - post-MVP
- Skip/delete cards - post-MVP
- Audio playback of question/answer - post-MVP
- Undo last rating - post-MVP
- Review statistics during session (time per card, accuracy) - post-MVP
- Collaborative review (study with friends) - post-MVP

## Technical Design

**Components impacted:**

- `ReviewSession.tsx` (new component)
- `FlashcardView.tsx` (card display component)
- `ReviewService.ts` (backend session management)
- Database: `review_sessions`, `review_events` tables

**Session Management:**

```typescript
interface ReviewSession {
  id: string;
  userId: string;
  courseId: string;
  flashcardIds: string[];
  currentCardIndex: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
}

interface ReviewEvent {
  id: string;
  sessionId: string;
  flashcardId: string;
  revealed: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeToReveal?: number; // seconds
  timeToRate?: number; // seconds
  createdAt: Date;
}

async function startReviewSession(
  userId: string,
  flashcardIds: string[]
): Promise<ReviewSession> {
  const session = {
    id: generateId(),
    userId,
    courseId: await getCourseIdFromFlashcards(flashcardIds),
    flashcardIds,
    currentCardIndex: 0,
    status: 'in-progress',
    startedAt: new Date()
  };

  await db.reviewSessions.create(session);
  return session;
}

async function recordReviewEvent(
  sessionId: string,
  flashcardId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<void> {
  // Record the review event
  await db.reviewEvents.create({
    id: generateId(),
    sessionId,
    flashcardId,
    revealed: true,
    difficulty,
    createdAt: new Date()
  });

  // Update flashcard statistics
  await db.flashcards.update(flashcardId, {
    timesReviewed: { increment: 1 },
    timesCorrect: difficulty === 'easy' ? { increment: 1 } : undefined,
    lastReviewedAt: new Date(),
    nextReviewAt: calculateNextReview(flashcardId, difficulty)
  });
}
```

**Data Model:**

```sql
CREATE TABLE review_sessions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  flashcard_count INT NOT NULL,
  current_card_index INT DEFAULT 0,
  status VARCHAR(20) NOT NULL, -- in-progress, completed, abandoned
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  INDEX idx_user_status (user_id, status)
);

CREATE TABLE review_events (
  id VARCHAR(50) PRIMARY KEY,
  session_id VARCHAR(50) NOT NULL,
  flashcard_id VARCHAR(50) NOT NULL,
  difficulty VARCHAR(10), -- easy, medium, hard
  time_to_reveal_ms INT,
  time_to_rate_ms INT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (session_id) REFERENCES review_sessions(id),
  FOREIGN KEY (flashcard_id) REFERENCES flashcards(id),
  INDEX idx_session (session_id),
  INDEX idx_flashcard (flashcard_id)
);
```

**API Contracts:**

```typescript
// POST /api/reviews/start
Request: {
  flashcardIds: ["fc-1", "fc-2", "fc-3"]
}
Response: {
  sessionId: "session-123",
  totalCards: 3,
  firstCard: {
    id: "fc-1",
    question: "What is...",
    conceptName: "Categorical Imperative"
  }
}

// POST /api/reviews/:sessionId/rate
Request: {
  flashcardId: "fc-1",
  difficulty: "medium",
  timeToReveal: 5000, // ms
  timeToRate: 8000 // ms
}
Response: {
  nextCard: {
    id: "fc-2",
    question: "How does..."
  } | null, // null if session complete
  progress: {
    current: 2,
    total: 3
  }
}

// POST /api/reviews/:sessionId/complete
Response: {
  summary: {
    totalReviewed: 3,
    hardCards: 1,
    mediumCards: 1,
    easyCards: 1,
    nextReviewSchedule: [
      { flashcardId: "fc-1", nextReview: "2025-11-15T10:00:00Z", interval: "1 day" },
      { flashcardId: "fc-2", nextReview: "2025-11-17T10:00:00Z", interval: "3 days" }
    ]
  }
}
```

**Keyboard Shortcuts:**

```typescript
const KEYBOARD_SHORTCUTS = {
  ' ': 'reveal', // Spacebar
  '1': 'hard',
  '2': 'medium',
  '3': 'easy',
  'ArrowLeft': 'hard',
  'ArrowDown': 'medium',
  'ArrowRight': 'easy',
  'Escape': 'exit'
};
```

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **User confusion on difficulty rating** | Medium | Medium | Add tooltips: "Hard=review tomorrow, Medium=3 days, Easy=1 week" |
| **Accidentally clicking wrong difficulty** | Low | Low | Add undo feature post-MVP, accept minor errors for MVP |
| **Session state lost on page refresh** | Low | Medium | Auto-save progress after each card rating |
| **Review feels too slow/tedious** | Medium | High | Optimize animations, make buttons fast-responding |

## Rollout

**Migration/feature flags:**

- No migration needed
- Feature flag: `review_sessions_enabled`

**Metrics:**

- Session completion rate (% sessions finished vs abandoned)
- Average time per card (reveal + rate)
- Difficulty distribution (% hard/medium/easy ratings)
- Average session length
- Mid-session abandonment rate

**Post-launch checklist:**

- [ ] Test review flow on mobile (iOS and Android)
- [ ] Verify keyboard shortcuts work on desktop
- [ ] Test mid-session exit and resume
- [ ] Check completion summary shows correct next review dates
- [ ] Monitor session abandonment rate

**Post-MVP improvements:**

- Undo last rating
- Skip/delete cards during review
- Audio playback of cards
- Multiple review modes (typing answers, multiple choice)
- Review statistics (avg time per card, accuracy trends)
- Collaborative review sessions

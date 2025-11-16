# Review Session Feature

This feature implements spaced repetition review sessions for flashcards, based on US-0006 specification.

## Overview

The review session feature provides a focused, full-screen learning experience where students can review flashcards using active recall and spaced repetition principles.

## Architecture

### Core Components

**Service Layer (`review-session-service.ts`)**
- `getFlashcardsForReview()` - Fetches flashcards for a course
- `createReviewSession()` - Initializes a new review session
- `recordReviewEvent()` - Records user ratings and updates flashcard statistics
- `calculateNextReviewDate()` - Implements spaced repetition intervals
- `getReviewSummary()` - Generates session completion summary

**Server Actions (`app/actions/review-session.action.ts`)**
- `startReviewSessionAction()` - Starts a new review session
- `rateFlashcardAction()` - Records a flashcard rating
- `completeReviewSessionAction()` - Completes session and returns summary
- `abandonReviewSessionAction()` - Handles early exit

**UI Components (`src/components/reviews/`)**
- `ReviewCard` - Main flashcard display with question/answer reveal
- `DifficultyButton` - Color-coded difficulty rating buttons
- `ProgressBar` - Visual progress indicator
- `CompletionScreen` - Session summary and next review schedule

**Page (`app/orgs/[orgSlug]/(navigation)/courses/[courseId]/review/page.tsx`)**
- Full-screen review interface
- Keyboard shortcuts support
- Progress tracking
- Session state management

## User Flow

1. **Start Review**
   - User clicks "Start Review Session" button on course page
   - System fetches all flashcards for the course
   - Creates new review session in database

2. **Review Cards**
   - Show question
   - User clicks "Show Answer" (or presses Space)
   - Show answer with 3 difficulty buttons
   - User rates difficulty (or presses 1/2/3)
   - System records rating and updates flashcard
   - Auto-advance to next card

3. **Complete Session**
   - After last card, show completion screen
   - Display summary statistics
   - Show next review schedule
   - Return to course page

## Spaced Repetition Intervals

Based on difficulty rating:
- **Hard (🔴)**: Review tomorrow (1 day)
- **Medium (🟡)**: Review in 3 days
- **Easy (🟢)**: Review in 1 week (7 days)

## Keyboard Shortcuts

- **Space**: Reveal answer
- **1 / ←**: Rate as Hard
- **2 / ↓**: Rate as Medium
- **3 / →**: Rate as Easy
- **Esc**: Exit review session

## Database Schema

### ReviewSession
```prisma
model ReviewSession {
  id               String        @id @default(uuid())
  userId           String
  courseId         String
  flashcardCount   Int
  currentCardIndex Int           @default(0)
  status           String        // "in-progress" | "completed" | "abandoned"
  startedAt        DateTime      @default(now())
  completedAt      DateTime?
  events           ReviewEvent[]
}
```

### ReviewEvent
```prisma
model ReviewEvent {
  id             String    @id @default(uuid())
  sessionId      String
  flashcardId    String
  difficulty     String    // "easy" | "medium" | "hard"
  timeToRevealMs Int?
  timeToRateMs   Int?
  createdAt      DateTime  @default(now())
}
```

### Flashcard (updated fields)
```prisma
model Flashcard {
  timesReviewed   Int       @default(0)
  timesCorrect    Int       @default(0)
  lastReviewedAt  DateTime?
  nextReviewAt    DateTime?
}
```

## Design System

### Colors
- **Hard**: Destructive variant (red)
- **Medium**: Warning variant (yellow)
- **Easy**: Success variant (green)

### Layout
- Full-screen on review page (no sidebar)
- Progress bar at top
- Large centered card (max-width: 2xl)
- Footer with keyboard hints

### Mobile Optimization
- Large tap targets (80px+ height)
- Full-width buttons on mobile
- Responsive card sizing
- Touch-friendly spacing

## Future Enhancements (Post-MVP)

- [ ] Swipe gestures for mobile
- [ ] Review statistics dashboard
- [ ] Custom review schedules
- [ ] Review reminders/notifications
- [ ] Bulk review mode
- [ ] Review history timeline
- [ ] Performance analytics
- [ ] Adaptive difficulty adjustment

## Testing

### Manual Testing Checklist
- [ ] Start review session with flashcards
- [ ] Navigate through all cards
- [ ] Test keyboard shortcuts
- [ ] Test difficulty ratings
- [ ] Complete full session
- [ ] Exit early (abandon)
- [ ] Check next review dates
- [ ] Verify statistics update
- [ ] Test on mobile device

### Edge Cases
- [ ] No flashcards available
- [ ] Single flashcard
- [ ] Network error during rating
- [ ] Browser refresh during session
- [ ] Multiple tabs open

## Performance Considerations

- Session state managed client-side (React state)
- Server actions for database updates only
- Optimistic UI updates where possible
- Minimal re-renders during review
- Efficient keyboard event handling

## Security

- User authentication required
- Course enrollment verification
- Session ownership validation
- Rate limiting on actions
- Input validation with Zod

## Monitoring

Key metrics to track:
- Sessions started vs completed
- Average session duration
- Cards reviewed per session
- Difficulty distribution
- Accuracy rates over time
- Drop-off points

## Related Features

- **US-0005**: Flashcard Generation
- **US-0007**: Review Scheduling (future)
- **US-0008**: Progress Tracking (future)

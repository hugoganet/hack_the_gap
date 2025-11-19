# Technical Guide: Onboarding Progress Indicator & Milestone Celebrations

**Date:** 2025-01-XX  
**Purpose:** Explain the technical implementation approach for onboarding progress tracking  
**Audience:** Developer implementing the feature  
**Status:** Conceptual Guide (No Code)

---

## Overview

You want to add an **onboarding progress indicator** that shows users their setup progress (e.g., "1/3 steps complete") and **milestone celebrations** (confetti when they complete key actions). This guide explains the high-level technical approach based on your existing codebase.

---

## Key Question: Do You Need a New Database Table?

**Short Answer: NO** ✅

**Why:** You can derive onboarding progress from **existing data** in your database. You already have all the information you need:

1. **Has user created a course?** → Query `user_courses` table
2. **Has user uploaded content?** → Query `video_jobs` (ContentJob) table
3. **Has user reviewed flashcards?** → Query `review_sessions` or `review_events` table

**When you WOULD need a table:**
- If you want to track **dismissal state** (user clicked "Don't show this again")
- If you want to track **custom milestones** beyond what's in the database
- If you want to track **tutorial completion** (e.g., "Watched intro video")
- If you want **historical tracking** (when each milestone was completed)

**For your use case:** Start without a new table. Add one later if needed.

---

## Technical Approach: Three Layers

### Layer 1: **Data Layer** (Server-Side Queries)

**Location:** Server Components or API Routes

**What it does:** Queries the database to determine onboarding state

**Example Logic:**

```typescript
// Conceptual pseudocode (not actual code)

async function getOnboardingProgress(userId: string) {
  // Step 1: Has user created a course?
  const courseCount = await prisma.userCourse.count({
    where: { userId }
  });
  const hasCreatedCourse = courseCount > 0;

  // Step 2: Has user uploaded content?
  const contentCount = await prisma.contentJob.count({
    where: { 
      userId,
      status: 'completed' // or 'processing'
    }
  });
  const hasUploadedContent = contentCount > 0;

  // Step 3: Has user reviewed flashcards?
  const reviewCount = await prisma.reviewSession.count({
    where: { 
      userId,
      status: 'completed'
    }
  });
  const hasReviewedFlashcards = reviewCount > 0;

  // Calculate progress
  const steps = [
    { id: 'course', completed: hasCreatedCourse, label: 'Create a course' },
    { id: 'content', completed: hasUploadedContent, label: 'Add content' },
    { id: 'review', completed: hasReviewedFlashcards, label: 'Review flashcards' }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;
  const isComplete = completedCount === totalCount;

  return {
    steps,
    completedCount,
    totalCount,
    isComplete,
    currentStep: steps.find(s => !s.completed) // Next incomplete step
  };
}
```

**Where to call this:**
- In `app/dashboard/page.tsx` (Learn page) - Server Component
- Or create a new API route: `/api/user/onboarding-progress`

**Caching consideration:**
- Use Next.js `cache()` or `unstable_cache()` to avoid repeated queries
- Or use React Query on client side with stale-while-revalidate

---

### Layer 2: **Component Layer** (UI Display)

**Location:** React Components

**What it does:** Displays the progress indicator and handles celebrations

**Component Structure:**

```
<OnboardingProgressBanner>
  ├── Progress indicator (e.g., "1/3 steps complete")
  ├── Step checklist
  │   ├── ✓ Create a course (completed)
  │   ├── → Add content (current)
  │   └── ☐ Review flashcards (locked)
  └── Celebration trigger (when step completes)
```

**Two Implementation Options:**

**Option A: Server Component** (Simpler, your current pattern)
```typescript
// app/dashboard/_components/onboarding-progress.tsx
// Server Component - fetches data directly

export async function OnboardingProgress({ userId }: { userId: string }) {
  const progress = await getOnboardingProgress(userId);
  
  if (progress.isComplete) {
    return null; // Or show "Setup complete!" badge
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started with Recall</CardTitle>
        <CardDescription>
          {progress.completedCount}/{progress.totalCount} steps complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        {progress.steps.map(step => (
          <StepItem key={step.id} step={step} />
        ))}
      </CardContent>
    </Card>
  );
}
```

**Option B: Client Component with API** (More interactive)
```typescript
// app/dashboard/_components/onboarding-progress.tsx
// Client Component - fetches via API, can show celebrations

"use client";

export function OnboardingProgress({ userId }: { userId: string }) {
  const { data: progress } = useSWR(
    `/api/user/onboarding-progress`,
    fetcher
  );

  // Detect when a step completes (compare with previous state)
  useEffect(() => {
    if (progress?.completedCount > previousCount) {
      showCelebration(); // Trigger confetti
    }
  }, [progress]);

  // ... render UI
}
```

**Where to place it:**
- Top of `app/dashboard/page.tsx` (Learn page)
- Above Content Inbox
- Dismissible after completion (store in localStorage)

---

### Layer 3: **Celebration Layer** (Animations & Feedback)

**Location:** Client-side JavaScript

**What it does:** Shows confetti, toasts, or modals when milestones are reached

**You already have this pattern!** Look at:
- `app/dashboard/_components/processing-progress.tsx` - Uses confetti
- `app/dashboard/courses/_components/course-creation-progress.tsx` - Celebration messages

**Reuse the same approach:**

```typescript
// Conceptual example (not actual code)

import confetti from 'canvas-confetti';

function showMilestoneCelebration(milestone: string) {
  // Confetti animation (you already have this)
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  // Toast notification
  toast.success("🎉 Milestone Unlocked!", {
    description: getMilestoneMessage(milestone),
    duration: 5000
  });

  // Optional: Show modal with stats
  // setShowMilestoneModal(true);
}

function getMilestoneMessage(milestone: string) {
  const messages = {
    'first_course': "You created your first course! Now add some content.",
    'first_content': "Content processed! Flashcards are unlocking.",
    'first_review': "First review complete! Come back tomorrow to strengthen your memory."
  };
  return messages[milestone];
}
```

**When to trigger:**
1. **After course creation** - In `CreateCourseDialog` success callback
2. **After content processing** - In `ContentInbox` after `processContent()` succeeds
3. **After first review** - In review session completion

---

## Implementation Steps (High-Level)

### Phase 1: Basic Progress Indicator (1-2 hours)

1. **Create data fetching function**
   - File: `app/dashboard/get-onboarding-progress.ts`
   - Query `user_courses`, `video_jobs`, `review_sessions`
   - Return progress object

2. **Create progress component**
   - File: `app/dashboard/_components/onboarding-progress.tsx`
   - Server Component (simpler for MVP)
   - Display checklist with icons (✓, →, ☐)

3. **Add to Learn page**
   - File: `app/dashboard/page.tsx`
   - Place above Content Inbox
   - Pass `userId` prop

4. **Add translations**
   - File: `messages/en.json` and `messages/fr.json`
   - Keys: `dashboard.onboarding.steps.*`

### Phase 2: Milestone Celebrations (2-3 hours)

1. **Add celebration triggers**
   - In `CreateCourseDialog`: After successful course creation
   - In `ContentInbox`: After successful content processing
   - In review session: After first completion

2. **Reuse confetti pattern**
   - Copy from `processing-progress.tsx`
   - Add toast notifications with `sonner`

3. **Add celebration messages**
   - File: `messages/en.json`
   - Keys: `dashboard.onboarding.celebrations.*`

### Phase 3: Persistence (Optional, 1-2 hours)

**If you want to track dismissal or show "New!" badges:**

1. **Add localStorage for dismissal**
   ```typescript
   // Store in browser
   localStorage.setItem('onboarding-dismissed', 'true');
   
   // Check on render
   const isDismissed = localStorage.getItem('onboarding-dismissed') === 'true';
   ```

2. **Or add database table** (only if needed)
   ```prisma
   model UserOnboarding {
     userId              String   @id
     user                User     @relation(...)
     
     // Milestone timestamps
     firstCourseAt       DateTime?
     firstContentAt      DateTime?
     firstReviewAt       DateTime?
     
     // UI state
     progressDismissed   Boolean  @default(false)
     tutorialCompleted   Boolean  @default(false)
     
     createdAt           DateTime @default(now())
     updatedAt           DateTime @updatedAt
   }
   ```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Action (e.g., creates course)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Database Update (user_courses table)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Page Refresh or Router.refresh()                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Server Component Re-renders                                 │
│ - Queries database                                          │
│ - Calculates progress (1/3 → 2/3)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ UI Updates                                                  │
│ - Progress indicator shows "2/3 complete"                   │
│ - Checkmark appears next to "Create course"                 │
│ - Next step highlighted                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Celebration Trigger (Client-side)                          │
│ - Confetti animation                                        │
│ - Toast notification                                        │
│ - Optional modal                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Technical Decisions

### 1. Server Component vs Client Component?

**Recommendation: Start with Server Component**

**Pros:**
- ✅ Simpler (no API route needed)
- ✅ Faster initial render (no loading state)
- ✅ Matches your current pattern (see `review-queue.tsx`)
- ✅ Automatic revalidation with `router.refresh()`

**Cons:**
- ❌ Can't show real-time celebrations without page refresh
- ❌ Can't use client-side state (localStorage for dismissal)

**Solution:** Hybrid approach
- Server Component for progress display
- Client Component wrapper for celebrations
- Similar to how you handle `ProcessingProgress`

### 2. When to Show Progress Indicator?

**Option A: Always show until complete**
- Simple, clear
- May feel repetitive for returning users

**Option B: Show only when incomplete**
- Cleaner for returning users
- May hide important context

**Option C: Show with dismissal option**
- Best of both worlds
- Requires localStorage or database flag

**Recommendation: Option C** (show with dismissal)

### 3. How to Detect Milestone Completion?

**Option A: Compare on every render**
```typescript
// Client Component
const previousProgress = usePrevious(progress);
if (progress.completedCount > previousProgress?.completedCount) {
  showCelebration();
}
```

**Option B: Trigger in action callbacks**
```typescript
// In CreateCourseDialog
const onSubmit = async (data) => {
  await createCourse(data);
  showCelebration('first_course'); // Explicit trigger
  router.refresh();
};
```

**Recommendation: Option B** (explicit triggers)
- More predictable
- Easier to debug
- Matches your current pattern (see `ContentInbox` success handling)

---

## Example: Minimal Implementation

Here's the simplest possible implementation:

### Step 1: Data Fetching (Server-side)

```typescript
// app/dashboard/get-onboarding-progress.ts

export async function getOnboardingProgress(userId: string) {
  const [courseCount, contentCount, reviewCount] = await Promise.all([
    prisma.userCourse.count({ where: { userId } }),
    prisma.contentJob.count({ where: { userId, status: 'completed' } }),
    prisma.reviewSession.count({ where: { userId, status: 'completed' } })
  ]);

  return {
    hasCreatedCourse: courseCount > 0,
    hasUploadedContent: contentCount > 0,
    hasReviewedFlashcards: reviewCount > 0,
    completedCount: [courseCount > 0, contentCount > 0, reviewCount > 0].filter(Boolean).length
  };
}
```

### Step 2: Component (Server Component)

```typescript
// app/dashboard/_components/onboarding-progress.tsx

export async function OnboardingProgress({ userId }: { userId: string }) {
  const progress = await getOnboardingProgress(userId);
  
  if (progress.completedCount === 3) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started: {progress.completedCount}/3 complete</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <StepItem completed={progress.hasCreatedCourse} label="Create a course" />
          <StepItem completed={progress.hasUploadedContent} label="Add content" />
          <StepItem completed={progress.hasReviewedFlashcards} label="Review flashcards" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Add to Page

```typescript
// app/dashboard/page.tsx

export default async function LearnPage() {
  const user = await getRequiredUser();

  return (
    <Layout>
      <LayoutHeader>...</LayoutHeader>
      <LayoutContent>
        {/* NEW: Add progress indicator */}
        <OnboardingProgress userId={user.id} />
        
        {/* Existing components */}
        <QuickStats userId={user.id} />
        <ContentInbox />
        <ReviewQueue userId={user.id} />
      </LayoutContent>
    </Layout>
  );
}
```

### Step 4: Add Celebrations

```typescript
// In CreateCourseDialog, after successful creation:

toast.success("🎉 First course created!", {
  description: "Now add some content to unlock flashcards"
});

confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});

router.refresh(); // Re-fetch progress
```

---

## Performance Considerations

### 1. Query Optimization

**Current approach:** 3 separate queries
```typescript
await prisma.userCourse.count({ where: { userId } });
await prisma.contentJob.count({ where: { userId } });
await prisma.reviewSession.count({ where: { userId } });
```

**Optimized approach:** Single query with aggregation
```typescript
// Use raw SQL or Prisma aggregation
const stats = await prisma.$queryRaw`
  SELECT 
    (SELECT COUNT(*) FROM user_courses WHERE userId = ${userId}) as courses,
    (SELECT COUNT(*) FROM video_jobs WHERE userId = ${userId} AND status = 'completed') as content,
    (SELECT COUNT(*) FROM review_sessions WHERE userId = ${userId} AND status = 'completed') as reviews
`;
```

**Or:** Cache the result
```typescript
import { unstable_cache } from 'next/cache';

const getOnboardingProgress = unstable_cache(
  async (userId: string) => {
    // ... queries
  },
  ['onboarding-progress'],
  { revalidate: 60 } // Cache for 60 seconds
);
```

### 2. Avoid Over-Fetching

**Don't do this:**
```typescript
// BAD: Fetches all courses just to count
const courses = await prisma.userCourse.findMany({ where: { userId } });
const hasCreatedCourse = courses.length > 0;
```

**Do this:**
```typescript
// GOOD: Just counts
const courseCount = await prisma.userCourse.count({ where: { userId } });
const hasCreatedCourse = courseCount > 0;
```

### 3. Conditional Rendering

**Don't render if complete:**
```typescript
if (progress.completedCount === 3) {
  return null; // Or return completion badge
}
```

---

## Testing Strategy

### 1. Manual Testing Checklist

- [ ] New user sees "0/3 complete"
- [ ] After creating course, shows "1/3 complete" with checkmark
- [ ] After uploading content, shows "2/3 complete"
- [ ] After first review, shows "3/3 complete" or hides
- [ ] Confetti appears at each milestone
- [ ] Toast notifications show correct messages
- [ ] Progress persists across page refreshes
- [ ] Works on mobile (responsive design)

### 2. Edge Cases

- [ ] User with existing courses (should show correct progress)
- [ ] User who uploaded content before creating course (handle gracefully)
- [ ] Multiple courses (count > 0 is sufficient)
- [ ] Failed content processing (don't count as completed)
- [ ] Incomplete review sessions (don't count as completed)

### 3. Performance Testing

- [ ] Page load time doesn't increase significantly
- [ ] Database queries are indexed (check `@@index` in schema)
- [ ] No N+1 query problems

---

## Future Enhancements

### Phase 4: Advanced Features (Optional)

1. **Personalized Tips**
   - Show contextual help based on current step
   - "Stuck? Here's how to create your first course"

2. **Progress History**
   - Track when each milestone was completed
   - Show "You completed this 3 days ago"
   - Requires database table

3. **Gamification**
   - Badges for milestones
   - Leaderboard (if multi-user)
   - Streak tracking (already have in `user_stats`)

4. **Tutorial Mode**
   - Interactive walkthrough
   - Highlight UI elements
   - Use library like `react-joyride`

5. **Smart Suggestions**
   - "Based on your course, try watching this video"
   - "You're 70% through your syllabus"
   - Requires AI/recommendation engine

---

## Summary

**Do you need a new table?** NO (for basic implementation)

**What you need:**
1. ✅ Query existing tables (`user_courses`, `video_jobs`, `review_sessions`)
2. ✅ Create Server Component to display progress
3. ✅ Reuse existing confetti pattern for celebrations
4. ✅ Add translations for new UI text
5. ✅ Trigger celebrations in action callbacks

**Implementation time:**
- Basic progress indicator: 1-2 hours
- Milestone celebrations: 2-3 hours
- Polish & testing: 1-2 hours
- **Total: 4-7 hours**

**Key files to create/modify:**
- `app/dashboard/get-onboarding-progress.ts` (NEW)
- `app/dashboard/_components/onboarding-progress.tsx` (NEW)
- `app/dashboard/page.tsx` (MODIFY - add component)
- `app/dashboard/courses/_components/create-course-dialog.tsx` (MODIFY - add celebration)
- `app/dashboard/_components/content-inbox.tsx` (MODIFY - add celebration)
- `messages/en.json` and `messages/fr.json` (MODIFY - add translations)

**No database migration needed** for basic implementation!

---

**Next Step:** Start with Phase 1 (basic progress indicator) and test with real users before adding celebrations.

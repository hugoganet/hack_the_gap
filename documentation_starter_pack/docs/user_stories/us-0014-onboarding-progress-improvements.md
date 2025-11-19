# US-0014: Onboarding Progress Improvements

**Status:** 📋 TODO  
**Priority:** P1 (UX Enhancement)  
**Estimate:** 4-6h  
**Created:** 2025-01-XX  
**Updated:** 2025-01-XX

---

## Story

**ID:** US-0014  
**Persona:** Self-Directed Learner (First-Time User)  
**Title:** As a first-time user, I want to see my setup progress, receive encouragement when I complete steps, understand the page I'm on, and get contextual help so that I feel guided through the onboarding process.

---

## Context

This story focuses on **quick wins** to improve the first-time user experience without major architectural changes. These improvements help users understand their progress and feel supported during onboarding.

**Current Issues:**
- No visible progress indicator showing setup completion
- No celebrations when users complete key milestones
- "Learn" page name is ambiguous (suggests immediate action vs. hub)
- No contextual help for key UI elements

**Scope:**
- Add setup progress indicator
- Add milestone celebrations (reuse existing confetti pattern)
- Rename "Learn" → "Dashboard"
- Add contextual tooltips

---

## Acceptance Criteria

### AC1: Setup Progress Indicator

**Given** a new user lands on the dashboard  
**When** they have not completed all setup steps  
**Then** they see a progress indicator showing:
- Current progress: "1/3 steps complete"
- Three steps with status indicators:
  - ✓ Create a course (completed)
  - → Add content (current)
  - ☐ Review flashcards (upcoming)

**And** the progress indicator:
- Is displayed at the top of the dashboard page
- Shows completed steps with green checkmark (✓)
- Shows current step with arrow (→) and primary color
- Shows upcoming steps as empty checkbox (☐)
- Disappears after all 3 steps are complete
- Is mobile-responsive (works on 320px+ screens)

**Technical Implementation:**
- Query existing tables to derive progress (no new database table needed):
  - `user_courses` table → has created course?
  - `video_jobs` table → has uploaded content?
  - `review_sessions` table → has reviewed flashcards?
- Server Component (no client-side state needed)
- File: `app/dashboard/_components/onboarding-progress.tsx` (NEW)
- File: `app/dashboard/get-onboarding-progress.ts` (NEW)

---

### AC2: Milestone Celebrations

**Given** a user completes a setup step  
**When** the action succeeds  
**Then** the system celebrates with:

**First Course Created:**
- Confetti animation (reuse existing pattern from `processing-progress.tsx`)
- Toast notification: "🎉 First course created!"
- Description: "Now add some content to unlock flashcards"
- Duration: 5 seconds

**First Content Processed:**
- Confetti animation
- Toast notification: "✅ Content processed successfully!"
- Description: "Extracted X concepts, matched Y to your goals"
- Duration: 5 seconds

**First Review Completed:**
- Confetti animation
- Toast notification: "🎉 You completed your first review!"
- Description: "Come back tomorrow to strengthen your memory"
- Duration: 5 seconds

**And** celebrations:
- Use existing `canvas-confetti` library (already installed)
- Use existing `sonner` toast library (already installed)
- Trigger in action callbacks (not on page load)
- Are internationalized (EN/FR)

**Technical Implementation:**
- Update `app/dashboard/courses/_components/create-course-dialog.tsx` (add celebration after success)
- Update `app/dashboard/_components/content-inbox.tsx` (add celebration after processing)
- Update review session completion (add celebration)
- Reuse confetti pattern from `app/dashboard/_components/processing-progress.tsx`

---

### AC3: Page Naming Clarity

**Given** the current "Learn" page in navigation  
**When** users view the sidebar or page title  
**Then** it displays **"Dashboard"** instead of "Learn"

**Rationale:**
- "Learn" suggests immediate action (confusing when setup is required)
- "Dashboard" suggests a hub/overview (more accurate)
- Aligns with common SaaS patterns

**And** the change applies to:
- Sidebar navigation link
- Page title (`<LayoutTitle>`)
- Browser tab title
- Breadcrumbs (if any)

**Technical Implementation:**
- Update `app/dashboard/page.tsx` (change title)
- Update `messages/en.json` and `messages/fr.json` (update translations)
- Update sidebar navigation in `app/dashboard/_navigation/` (if applicable)

---

### AC4: Contextual Tooltips

**Given** a user views key UI elements  
**When** they hover over or click help icons (?)  
**Then** they see contextual tooltips:

**Content Inbox (?):**
```
Recall matches content to YOUR learning goals.
Create a course first so we know what to teach you.
```

**Course Creation (?):**
```
A learning goal is your syllabus, course outline,
or any material you want to master.
```

**Flashcard Unlock (?):**
```
Answers unlock when we find a strong match (≥70%)
between content and your learning goals.
```

**And** tooltips:
- Appear on hover (desktop) or tap (mobile)
- Are brief (1-2 sentences max)
- Use clear, non-technical language
- Are accessible (ARIA labels, keyboard navigation)
- Are internationalized (EN/FR)
- Use existing tooltip component (shadcn/ui)

**Technical Implementation:**
- Add (?) icon next to key labels
- Use `@/components/ui/tooltip` component (already available)
- Add tooltip content to `messages/en.json` and `messages/fr.json`
- Files to update:
  - `app/dashboard/_components/content-inbox.tsx`
  - `app/dashboard/courses/_components/create-course-dialog.tsx`
  - Flashcard display components

---

## Technical Implementation

### 1. Setup Progress Indicator

**New File:** `app/dashboard/get-onboarding-progress.ts`

```typescript
import { prisma } from "@/lib/prisma";

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
    completedCount: [courseCount > 0, contentCount > 0, reviewCount > 0].filter(Boolean).length,
    totalCount: 3
  };
}
```

**New File:** `app/dashboard/_components/onboarding-progress.tsx`

```typescript
// Server Component
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Check, ArrowRight, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOnboardingProgress } from "../get-onboarding-progress";
import { getTranslations } from "next-intl/server";

export async function OnboardingProgress({ userId }: { userId: string }) {
  const t = await getTranslations("dashboard.onboarding");
  const progress = await getOnboardingProgress(userId);
  
  if (progress.completedCount === 3) return null; // All steps complete

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("progress", { completed: progress.completedCount, total: progress.totalCount })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <StepItem 
            completed={progress.hasCreatedCourse} 
            label={t("steps.createCourse")}
            isCurrent={!progress.hasCreatedCourse}
          />
          <StepItem 
            completed={progress.hasUploadedContent} 
            label={t("steps.addContent")}
            isCurrent={progress.hasCreatedCourse && !progress.hasUploadedContent}
          />
          <StepItem 
            completed={progress.hasReviewedFlashcards} 
            label={t("steps.reviewFlashcards")}
            isCurrent={progress.hasUploadedContent && !progress.hasReviewedFlashcards}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StepItem({ completed, label, isCurrent }: { 
  completed: boolean; 
  label: string; 
  isCurrent: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <Check className="size-5 text-green-500" />
      ) : isCurrent ? (
        <ArrowRight className="size-5 text-primary" />
      ) : (
        <Square className="size-5 text-muted-foreground" />
      )}
      <span className={cn(
        "text-sm",
        completed && "text-muted-foreground line-through",
        isCurrent && "font-medium text-primary"
      )}>
        {label}
      </span>
    </div>
  );
}
```

**Update:** `app/dashboard/page.tsx`

```typescript
import { OnboardingProgress } from "./_components/onboarding-progress";

export default async function DashboardPage() {
  const user = await getRequiredUser();
  
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>{t("title")}</LayoutTitle> {/* "Dashboard" instead of "Learn" */}
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-6">
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

### 2. Milestone Celebrations

**Update:** `app/dashboard/courses/_components/create-course-dialog.tsx`

```typescript
import confetti from "canvas-confetti";
import { toast } from "sonner";

const onSubmit = async (data) => {
  // ... existing logic
  
  if (result.success) {
    // NEW: Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    toast.success(t("celebrations.firstCourse.title"), {
      description: t("celebrations.firstCourse.description"),
      duration: 5000
    });
    
    // Existing: Navigate and refresh
    router.push(`/dashboard/courses/${course.id}`);
    router.refresh();
  }
};
```

**Update:** `app/dashboard/_components/content-inbox.tsx`

```typescript
// After successful processing
if (result.success) {
  // NEW: Celebration
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  toast.success(t("celebrations.firstContent.title"), {
    description: t("celebrations.firstContent.description", { 
      concepts: result.data?.processedConceptsCount || 0 
    }),
    duration: 5000
  });
  
  // ... existing logic
}
```

### 3. Internationalization

**Add to:** `messages/en.json`

```json
{
  "dashboard": {
    "title": "Dashboard",
    "subtitle": "Your daily learning hub",
    "onboarding": {
      "title": "Get Started with Recall",
      "progress": "{completed}/{total} steps complete",
      "steps": {
        "createCourse": "Create a course (Define your learning goals)",
        "addContent": "Add content (Upload videos, PDFs, or articles)",
        "reviewFlashcards": "Review flashcards (Build long-term memory)"
      },
      "celebrations": {
        "firstCourse": {
          "title": "🎉 First course created!",
          "description": "Now add some content to unlock flashcards"
        },
        "firstContent": {
          "title": "✅ Content processed successfully!",
          "description": "Extracted {concepts} concepts"
        },
        "firstReview": {
          "title": "🎉 You completed your first review!",
          "description": "Come back tomorrow to strengthen your memory"
        }
      },
      "tooltips": {
        "contentInbox": "Recall matches content to YOUR learning goals. Create a course first so we know what to teach you.",
        "courseCreation": "A learning goal is your syllabus, course outline, or any material you want to master.",
        "flashcardUnlock": "Answers unlock when we find a strong match (≥70%) between content and your learning goals."
      }
    }
  }
}
```

**Add to:** `messages/fr.json`

```json
{
  "dashboard": {
    "title": "Tableau de bord",
    "subtitle": "Votre hub d'apprentissage quotidien",
    "onboarding": {
      "title": "Commencez avec Recall",
      "progress": "{completed}/{total} étapes terminées",
      "steps": {
        "createCourse": "Créer un cours (Définir vos objectifs d'apprentissage)",
        "addContent": "Ajouter du contenu (Télécharger des vidéos, PDFs ou articles)",
        "reviewFlashcards": "Réviser les flashcards (Construire la mémoire à long terme)"
      },
      "celebrations": {
        "firstCourse": {
          "title": "🎉 Premier cours créé !",
          "description": "Maintenant ajoutez du contenu pour débloquer des flashcards"
        },
        "firstContent": {
          "title": "✅ Contenu traité avec succès !",
          "description": "Extrait {concepts} concepts"
        },
        "firstReview": {
          "title": "🎉 Vous avez terminé votre première révision !",
          "description": "Revenez demain pour renforcer votre mémoire"
        }
      },
      "tooltips": {
        "contentInbox": "Recall associe le contenu à VOS objectifs d'apprentissage. Créez d'abord un cours pour que nous sachions quoi vous enseigner.",
        "courseCreation": "Un objectif d'apprentissage est votre programme, plan de cours ou tout matériel que vous souhaitez maîtriser.",
        "flashcardUnlock": "Les réponses se débloquent lorsque nous trouvons une forte correspondance (≥70%) entre le contenu et vos objectifs d'apprentissage."
      }
    }
  }
}
```

---

## Testing Requirements

### Unit Tests
- [ ] `getOnboardingProgress()` returns correct progress for different user states
- [ ] Progress indicator shows correct step status (completed/current/upcoming)
- [ ] Celebration triggers fire at correct moments

### Integration Tests
- [ ] New user sees progress indicator with "0/3 complete"
- [ ] After creating course, progress shows "1/3 complete"
- [ ] After uploading content, progress shows "2/3 complete"
- [ ] After first review, progress shows "3/3 complete" then disappears
- [ ] Confetti and toast appear after each milestone

### E2E Tests
- [ ] User journey: Land on dashboard → see progress → create course → see celebration → upload content → see celebration → review → see celebration → progress disappears
- [ ] Page title shows "Dashboard" not "Learn"
- [ ] Tooltips appear on hover/click
- [ ] Mobile responsive (320px+ screens)

---

## Performance Requirements

- **Progress Calculation**: < 100ms (3 database queries)
- **Page Load**: < 2s (p95) with progress indicator
- **Celebration Animations**: 60fps (smooth confetti)
- **No Layout Shift**: Progress indicator pre-allocated space

---

## Success Criteria

### Definition of Done
- [ ] Setup progress indicator implemented and visible
- [ ] Milestone celebrations trigger at correct moments
- [ ] "Learn" page renamed to "Dashboard"
- [ ] Contextual tooltips added to key UI elements
- [ ] All text internationalized (EN/FR)
- [ ] Mobile-responsive design
- [ ] Accessible (ARIA, keyboard, screen reader)
- [ ] All acceptance criteria pass
- [ ] Unit, integration, and E2E tests pass

### User Validation
- [ ] 3 test users find progress indicator helpful
- [ ] Users understand they're making progress through setup
- [ ] Celebrations feel rewarding (not annoying)
- [ ] Tooltips provide useful context
- [ ] "Dashboard" name is clearer than "Learn"

---

## Dependencies

### Existing Components (Reuse)
- ✅ `canvas-confetti` library (already installed)
- ✅ `sonner` toast library (already installed)
- ✅ `@/components/ui/tooltip` component (shadcn/ui)
- ✅ Confetti pattern from `app/dashboard/_components/processing-progress.tsx`
- ✅ Prisma models (User, UserCourse, ContentJob, ReviewSession)

### New Components (To Build)
- [ ] `app/dashboard/get-onboarding-progress.ts` (data fetching)
- [ ] `app/dashboard/_components/onboarding-progress.tsx` (progress indicator)

### Files to Update
- [ ] `app/dashboard/page.tsx` (add progress indicator, rename title)
- [ ] `app/dashboard/courses/_components/create-course-dialog.tsx` (add celebration)
- [ ] `app/dashboard/_components/content-inbox.tsx` (add celebration, add tooltip)
- [ ] `messages/en.json` (add translations)
- [ ] `messages/fr.json` (add translations)

---

## Notes

- **No Database Changes**: All progress is derived from existing data
- **Reuse Patterns**: Leverage existing confetti and toast patterns
- **Mobile-First**: Design for mobile (320px+) then scale up
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Progress calculation must be fast (<100ms)
- **Internationalization**: ALL text must be in message files

---

## Related Stories

- **US-0001a**: Add Learning Goal via AI Conversation (Prerequisite)
- **US-0010**: Processing Progress Feedback (Similar celebration pattern)
- **US-0013**: Full Onboarding Mental Model Fix (Comprehensive solution)

---

## Changelog

- **2025-01-XX**: Initial creation (focused on 4 quick wins)

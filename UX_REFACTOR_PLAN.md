# UX Refactor Plan: Dashboard Simplification

## Executive Summary

**Goal:** Merge Dashboard + My Learning into unified "Learn" page, reducing 3-page navigation to 2 pages.

**Impact:** Faster time-to-action, reduced cognitive load, clearer user journey.

**Timeline:** 14 hours over 5 days.

**Recent Update (Nov 2025):** My Learning page now includes gamification via `UnlockProgress` component showing unlock stats, streaks, and mastery progress. This component will be preserved and migrated to the new Learn page.

---

## Product Vision Analysis

**Hack the Gap** = AI-powered Zettelkasten for students. Core workflow:
1. Drop content (YouTube, TikTok, PDFs, articles)
2. AI extracts concepts → matches to course syllabi
3. Concepts become flashcards
4. Spaced repetition review sessions

**Philosophy:** Transform passive consumption → active retention.

---

## Current Architecture Problems

### 3-Page Structure Issues

| Page | Route | Purpose | Current State | Problems |
|------|-------|---------|---------------|----------|
| **Dashboard** | `/dashboard` | Metrics overview | 4 metric cards + subscribers chart | ❌ No actions, just stats<br>❌ Subscribers chart irrelevant<br>❌ Redundant with My Learning |
| **My Learning** | `/dashboard/users` | Content processing + reviews + gamification | Content inbox + review queue + unlock progress (NEW) | ❌ Vague name<br>❌ Buried in navigation (3rd position)<br>❌ Most important but hidden<br>✅ Has gamification (unlock stats, streaks) |
| **Courses** | `/dashboard/courses` | Course library | Course grid with welcome message | ❌ Duplicate review entry points<br>❌ Overlaps with My Learning |

**Core Issue:** Users must decide "Where do I go to review?" vs "Where do I add content?" → Decision fatigue.

**Recent Addition:** My Learning now includes gamification via `UnlockProgress` component showing:
- Total concepts (locked/unlocked/mastered)
- Unlock rate and progress bars
- Current streak and longest streak
- Milestone badges

---

## Proposed Architecture

### 2-Page Structure

#### **Page 1: "Learn"** (`/dashboard`)
**Purpose:** Daily action hub

**Sections:**
1. **Quick Stats** (inline): X concepts • Y courses • Z sessions
2. **Content Inbox**: Drag-and-drop URL/PDF processing
3. **Review Queue**: Cards due today, grouped by course
4. **Unlock Progress** (gamification): Locked/unlocked/mastered stats, streaks, progress bars
5. **Recent Activity**: Last processed content + review sessions (optional)

**Why:** Single entry point for daily workflow (input → review → track progress).

**Note:** Unlock Progress component already exists in My Learning and should be migrated as-is.

#### **Page 2: "Courses"** (`/dashboard/courses`)
**Purpose:** Organization & exploration

**Sections:**
1. **Course Grid**: Progress bars, concept counts
2. **Filters**: All / In Progress / Completed
3. **Search**: By name or code
4. **Sort**: Recent / Progress / Name

**Why:** Reference library for deep dives, separate from daily actions.

---

## Implementation Plan

### Phase 1: Quick Wins (1 hour)

**2.1 Update Navigation**
```typescript
// app/dashboard/_navigation/app-navigation.links.ts
{
  href: "/dashboard",        // Changed from /dashboard/users
  label: "Learn",            // Changed from "My Learning"
  labelKey: "links.learn",
}
```

**2.2 Remove Subscribers Chart**
```typescript
// app/dashboard/page.tsx
// DELETE: import { SubscribersChart } from "./subscribers-charts";
// DELETE: <SubscribersChart />
```

**2.3 Simplify Metrics**
```typescript
// app/dashboard/information-cards.tsx
// CHANGE: 4 cards → 3 cards (remove "Flashcards Created")
// CHANGE: flex layout → grid layout (md:grid-cols-3)
```

---

### Phase 2: Major Refactor (4 hours)

**3.1 Create New Learn Page**

**File Structure:**
```
app/dashboard/
├── page.tsx                          # NEW: Learn page (replaces old Dashboard)
├── _components/
│   ├── quick-stats.tsx              # NEW: Inline metrics
│   ├── content-inbox.tsx            # MIGRATED from users/client-org.tsx
│   ├── review-queue.tsx             # MIGRATED from users/cards-to-review-today.tsx
│   └── recent-activity.tsx          # NEW: Activity feed
```

**New Learn Page:**
```typescript
// app/dashboard/page.tsx
export default async function LearnPage() {
  const user = await getRequiredUser();
  const t = await getTranslations("dashboard.learn");

  // Fetch user unlock stats for gamification
  const stats = await prisma.userStats.findUnique({
    where: { userId: user.id },
  });

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>{t("welcome", { name: user.name })}</LayoutTitle>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </LayoutHeader>

      <LayoutContent className="flex flex-col gap-6">
        <QuickStats userId={user.id} />
        <ContentInbox />
        <ReviewQueue userId={user.id} />
        
        {/* Gamification - Unlock Progress */}
        {stats && (
          <UnlockProgress
            stats={{
              totalUnlocks: stats.totalUnlocks,
              totalLocked: stats.totalLocked,
              totalMastered: stats.totalMastered,
              unlockRate: stats.unlockRate,
              currentStreak: stats.currentStreak,
              longestStreak: stats.longestStreak,
            }}
          />
        )}
        
        {/* Optional: Recent Activity */}
        <RecentActivity userId={user.id} />
      </LayoutContent>
    </Layout>
  );
}
```

**3.1.1 QuickStats Component**
```typescript
// app/dashboard/_components/quick-stats.tsx
export async function QuickStats({ userId }: { userId: string }) {
  const stats = await getDashboardStats(userId);
  
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Brain className="size-4" />
        <span>{stats.totalConcepts} concepts</span>
      </div>
      <div className="flex items-center gap-2">
        <BookOpen className="size-4" />
        <span>{stats.activeCourses} courses</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="size-4" />
        <span>{stats.completedSessions} sessions</span>
      </div>
    </div>
  );
}
```

**3.1.2 ContentInbox Component**
```typescript
// app/dashboard/_components/content-inbox.tsx
// COPY from: app/dashboard/users/client-org.tsx
// RENAME: ClientOrg → ContentInbox
// UPDATE translations: "dashboard.users.inbox" → "dashboard.learn.inbox"
```

**3.1.3 ReviewQueue Component**
```typescript
// app/dashboard/_components/review-queue.tsx
// COPY from: app/dashboard/users/cards-to-review-today.tsx
// RENAME: CardsToReviewToday → ReviewQueue
// UPDATE translations: "dashboard.users.reviewsToday" → "dashboard.learn.reviewQueue"
```

**3.1.4 UnlockProgress Component**
```typescript
// app/dashboard/_components/unlock-progress.tsx
// COPY from: src/components/dashboard/unlock-progress.tsx
// NO CHANGES NEEDED - component is already well-structured

// Component displays 4 cards + 1 streak card:
// 1. Total Concepts (with progress bar showing unlock %)
// 2. Locked (orange) - concepts not yet unlocked
// 3. Unlocked (blue) - concepts ready to review
// 4. Mastered (green) - concepts fully learned
// 5. Unlock Streak (2-column card) - current streak + longest streak with fire badge

// Data source: UserStats model in Prisma
// Fields: totalUnlocks, totalLocked, totalMastered, unlockRate, currentStreak, longestStreak
```

**3.1.5 RecentActivity Component (Optional - Can be added later)**
```typescript
// app/dashboard/_components/recent-activity.tsx
// NOTE: This is optional and can be added in a future iteration
// The gamification component (UnlockProgress) already provides good engagement

export async function RecentActivity({ userId }: { userId: string }) {
  // Fetch last 3 content jobs
  const recentJobs = await prisma.contentJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { concepts: { select: { id: true } } },
  });

  // Fetch last 3 review sessions
  const recentSessions = await prisma.reviewSession.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 3,
    include: { course: { select: { name: true } } },
  });

  if (recentJobs.length === 0 && recentSessions.length === 0) {
    return null; // Don't show if no activity
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display jobs and sessions with icons */}
      </CardContent>
    </Card>
  );
}
```

**3.2 Redirect Old Route**
```typescript
// app/dashboard/users/page.tsx (REPLACE ENTIRE FILE)
import { redirect } from "next/navigation";

export default function UsersPageRedirect() {
  redirect("/dashboard");
}
```

**3.3 Update Translations**
```json
// messages/en.json
{
  "sidebar": {
    "links": {
      "learn": "Learn",
      "courses": "Courses"
    }
  },
  "dashboard": {
    "learn": {
      "welcome": "Welcome back, {name}!",
      "subtitle": "Your daily learning hub",
      "inbox": {
        "title": "Add Content",
        "description": "Drop a URL or file to process content",
        // ... (copy from dashboard.users.inbox)
      },
      "reviewQueue": {
        "title": "Review Today",
        "description": "Review your flashcards to strengthen your memory",
        // ... (copy from dashboard.users.reviewsToday)
      },
      "recentActivity": {
        "title": "Recent Activity",
        "empty": "No recent activity"
      }
    }
  }
}
```

---

### Phase 3: Courses Refinement (3 hours)

**4.1 Remove Duplicate Review Entry Points**
```typescript
// app/dashboard/courses/[courseId]/course-flashcards-view.tsx
// DELETE: handleStartReview function
// DELETE: <Button onClick={handleStartReview}>Start Review Session</Button>
// ADD: <Link href="/dashboard"><Button variant="outline">Go to Learn page</Button></Link>
```

**4.2 Simplify Course Creation**
```typescript
// app/dashboard/courses/_components/create-course-dialog.tsx
const formSchema = z.object({
  subjectId: z.string().min(1),
  name: z.string().min(3),
  learningGoal: z.string().optional(), // ← Changed from required
});

// Add "(Optional)" indicator in UI
<FormLabel>
  {t("fields.learningGoal.label")}
  <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
</FormLabel>
```

**4.3 Add Course Filtering**
```typescript
// app/dashboard/courses/page.tsx
export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "in-progress" | "completed">("all");
  const [sort, setSort] = useState<"recent" | "progress" | "name">("recent");

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search filter
    if (searchQuery) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filter === "in-progress") {
      result = result.filter(c => c.learnedCount > 0 && c.learnedCount < c.syllabusConcepts.length);
    } else if (filter === "completed") {
      result = result.filter(c => c.learnedCount >= c.syllabusConcepts.length);
    }

    // Sort
    if (sort === "recent") {
      result.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
    } else if (sort === "progress") {
      result.sort((a, b) => (b.learnedCount / b.syllabusConcepts.length) - (a.learnedCount / a.syllabusConcepts.length));
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [courses, searchQuery, filter, sort]);

  return (
    <Layout>
      {/* Search input */}
      <Input placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      
      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sort dropdown */}
      <Select value={sort} onValueChange={setSort}>
        <SelectItem value="recent">Recently Added</SelectItem>
        <SelectItem value="progress">Progress</SelectItem>
        <SelectItem value="name">Name</SelectItem>
      </Select>

      <CoursesList courses={filteredCourses} />
    </Layout>
  );
}
```

---

### Phase 4: Cleanup (1.5 hours)

**5.1 Delete Deprecated Files**
```bash
# Files to DELETE:
app/dashboard/information-cards.tsx
app/dashboard/subscribers-charts.tsx
app/dashboard/users/client-org.tsx
app/dashboard/users/cards-to-review-today.tsx
app/dashboard/users/course-selection-card.tsx
app/dashboard/users/donuts-chart.tsx
app/dashboard/users/users-chart.tsx

# Files to KEEP:
app/dashboard/users/add-course-dialog.tsx        # Still used
app/dashboard/users/match-results-dialog.tsx     # Still used
app/dashboard/users/page.tsx                     # Redirect only
```

**5.2 Update Internal Links**
```bash
# Search for hardcoded links
grep -r "/dashboard/users" app/
grep -r "dashboard/users" src/

# Update all references to /dashboard
```

**5.3 Update Documentation**
```markdown
# CHANGELOG.md
## [2.1.0] - 2025-11-18

### Changed
- Merged Dashboard and My Learning into unified "Learn" page
- Renamed "My Learning" → "Learn" in navigation
- Simplified dashboard metrics (4 cards → 3 inline stats)
- Made course syllabus optional during creation
- Added course filtering and search

### Removed
- Subscribers chart from dashboard
- Duplicate review entry points from course detail pages

### Added
- Recent Activity section on Learn page
- Course filtering (All, In Progress, Completed)
- Course search and sorting

### Migration
- `/dashboard/users` now redirects to `/dashboard`
```

---

### Phase 5: Testing (2.5 hours)

**6.1 Manual Testing Checklist**

**Learn Page:**
- [ ] Page loads without errors
- [ ] Quick stats display correct numbers
- [ ] Content inbox drag-and-drop works
- [ ] URL processing works (YouTube, TikTok, articles, PDFs)
- [ ] Match results dialog appears
- [ ] Review queue shows correct courses
- [ ] Review queue links work
- [ ] Unlock progress displays (locked/unlocked/mastered stats)
- [ ] Streak counter displays correctly
- [ ] Progress bars animate correctly
- [ ] Recent activity displays (if implemented)
- [ ] Responsive on mobile

**Courses Page:**
- [ ] Course grid displays
- [ ] Search filters courses
- [ ] Filter tabs work
- [ ] Sort dropdown works
- [ ] Course creation works without syllabus
- [ ] Course detail page loads
- [ ] "Go to Learn page" button works

**Navigation:**
- [ ] Sidebar shows "Learn" first
- [ ] `/dashboard/users` redirects to `/dashboard`
- [ ] All links work

**6.2 Automated Tests**
```bash
pnpm test:ci          # Unit tests
pnpm test:e2e:ci      # E2E tests
pnpm ts               # TypeScript check
pnpm lint:ci          # Linting
pnpm build            # Build check
```

---

### Phase 6: Deployment (1 hour)

**7.1 Pre-Deployment**
- [ ] All tests pass
- [ ] TypeScript compiles
- [ ] Build succeeds
- [ ] Translations complete (EN + FR)

**7.2 Deploy**
```bash
git add .
git commit -m "feat: merge Dashboard and My Learning into unified Learn page"
git push origin main
# Vercel auto-deploys
```

**7.3 Post-Deployment**
- [ ] Verify `/dashboard` loads
- [ ] Verify `/dashboard/users` redirects
- [ ] Test content processing
- [ ] Test review flow
- [ ] Monitor error rates

---

## File Changes Summary

### New Files
```
app/dashboard/_components/quick-stats.tsx
app/dashboard/_components/content-inbox.tsx
app/dashboard/_components/review-queue.tsx
app/dashboard/_components/unlock-progress.tsx    # Copied from src/components/dashboard/
app/dashboard/_components/recent-activity.tsx    # Optional
```

### Modified Files
```
app/dashboard/page.tsx                                    # Complete rewrite
app/dashboard/_navigation/app-navigation.links.ts         # Update labels
app/dashboard/courses/page.tsx                            # Add filtering
app/dashboard/courses/[courseId]/course-flashcards-view.tsx  # Remove review button
app/dashboard/courses/_components/create-course-dialog.tsx   # Make syllabus optional
app/dashboard/users/page.tsx                              # Redirect only
messages/en.json                                          # Add dashboard.learn
messages/fr.json                                          # Add dashboard.learn
```

### Deleted Files
```
app/dashboard/information-cards.tsx
app/dashboard/subscribers-charts.tsx
app/dashboard/users/client-org.tsx
app/dashboard/users/cards-to-review-today.tsx
app/dashboard/users/course-selection-card.tsx
app/dashboard/users/donuts-chart.tsx
app/dashboard/users/users-chart.tsx
```

---

## Success Criteria

### Functional
- ✅ Learn page displays all sections
- ✅ Content processing works
- ✅ Review queue works
- ✅ Courses filtering works
- ✅ Old route redirects
- ✅ Translations work

### Non-Functional
- ✅ No error rate increase
- ✅ Page load < 2 seconds
- ✅ All tests pass
- ✅ TypeScript compiles
- ✅ Build succeeds

### UX
- ✅ Users land on action page
- ✅ Clear daily workflow
- ✅ Reduced navigation (2 pages vs 3)
- ✅ Mobile responsive

---

## Timeline

| Phase | Time | Priority |
|-------|------|----------|
| Quick Wins | 1h | High |
| Major Refactor | 4h | High |
| Courses Refinement | 3h | Medium |
| Cleanup | 1.5h | Medium |
| Testing | 2.5h | High |
| Deployment | 1h | High |
| **Total** | **14h** | |

**Schedule:** 5 days (3h/day average)

---

## Rollback Plan

```bash
# Quick rollback
git revert HEAD
git push origin main

# Partial rollback
git checkout HEAD~1 -- app/dashboard/page.tsx
git commit -m "revert: rollback Learn page"
git push origin main
```

---

## Key Decisions

1. **Merge Dashboard + My Learning** → Single action hub
2. **Keep Courses separate** → Different mental model (organization vs action)
3. **Remove subscribers chart** → Irrelevant to learning
4. **Make syllabus optional** → Lower barrier to entry
5. **Remove duplicate review buttons** → Single source of truth (Learn page)
6. **Add filtering to Courses** → Better organization as library grows
7. **Preserve gamification** → UnlockProgress component provides engagement and motivation

---

## Next Steps After Completion

1. Monitor user feedback (2 weeks)
2. Analyze usage metrics (time on page, engagement)
3. Add onboarding tour for new users
4. ~~Consider gamification (streaks, achievements)~~ ✅ Already implemented via UnlockProgress
5. Explore customizable dashboard widgets
6. Consider adding milestone celebrations (10/50/100 unlocks)
7. Add social features (share streaks, compare progress)

---

## Current State (As of Review)

**What's Already Built:**
- ✅ Dashboard page with 4 metric cards + subscribers chart
- ✅ My Learning page with content inbox + review queue + **gamification (UnlockProgress)**
- ✅ Courses page with course grid
- ✅ UnlockProgress component showing locked/unlocked/mastered stats and streaks
- ✅ UserStats model in database tracking unlock progress

**What Needs to Change:**
- ❌ Merge Dashboard + My Learning → Learn page
- ❌ Remove subscribers chart
- ❌ Update navigation labels
- ❌ Add course filtering
- ❌ Simplify course creation

**Key Preservation:**
- 🔒 **Must preserve:** UnlockProgress component (gamification)
- 🔒 **Must preserve:** Content inbox functionality
- 🔒 **Must preserve:** Review queue functionality
- 🔒 **Must preserve:** UserStats database model

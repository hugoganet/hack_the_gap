# Feature Spec: US-0008 - Progress Dashboard

Owner: Founder
Status: Draft
Last Updated: 2025-11-14

## Summary

Display student progress toward course mastery with a simple, motivating dashboard showing concepts learned vs total syllabus requirements.

**Why now:** Critical for demo - students need to SEE that watching videos translates to course coverage. This is the "magic moment" visualization.

## User Stories

- As a Motivated Struggler, I want to see my progress toward course mastery so that I stay motivated and understand which concepts I've covered vs what's remaining.

## Acceptance Criteria

**Given** a user has selected a course
**When** they view the dashboard
**Then** they see "X/Y concepts for [Course Name]" prominently displayed

**Given** a user has processed videos and matched concepts
**When** they view the dashboard
**Then** matched concepts (confidence ≥80%) count toward "learned" progress

**Given** a user has reviewed flashcards
**When** they view the dashboard
**Then** concepts with at least one review show as "in progress," concepts with 3+ easy ratings show as "mastered"

**Detailed Acceptance Criteria:**
- [ ] Progress counter shows: "12/30 concepts learned (40%)"
- [ ] Visual progress bar (e.g., 40% filled)
- [ ] Three progress states: Not Started, In Progress, Mastered
- [ ] Dashboard updates in real-time after video processing
- [ ] Mobile-friendly layout (large text, clear visuals)
- [ ] Clicking progress shows concept list (learned vs gaps)
- [ ] Dashboard loads in <2 seconds

## UX & Flows

```
[Dashboard - Philosophy 101]

┌─────────────────────────────────┐
│ Your Progress                   │
│                                 │
│ Philosophy 101                  │
│ 12 / 30 concepts (40%)          │
│                                 │
│ ███████████░░░░░░░░░░░░░░░      │
│                                 │
│ Breakdown:                      │
│ ✅ Mastered: 8 concepts         │
│ 📚 In Progress: 4 concepts      │
│ ❌ Not Started: 18 concepts     │
│                                 │
│ [View Details →]                │
└─────────────────────────────────┘

[Quick Actions]
📹 Process new video
📚 Review due cards (3)
📊 View gaps
```

**Detailed progress view:**

```
[Progress Details]

✅ Mastered (8)
- Categorical Imperative
- Deontological Ethics
- Hypothetical Imperative
- ...

📚 In Progress (4)
- Moral Law (reviewed 1x)
- Practical Reason (reviewed 2x)
- ...

❌ Not Started (18)
- Transcendental Idealism
- Synthetic A Priori
- ...
```

## Scope

**In scope:**
- Overall progress counter (X/Y concepts)
- Visual progress bar
- Three progress states (Mastered, In Progress, Not Started)
- Breakdown by state
- Concept list view (grouped by state)
- Real-time updates after video processing

**Out of scope:**
- Historical progress tracking (progress over time graph) - post-MVP
- Per-topic/category progress breakdown - post-MVP
- Comparison with other students (leaderboard) - post-MVP
- Progress export (PDF report) - post-MVP
- Goal setting ("Master 5 concepts this week") - post-MVP
- Streak tracking ("7 day streak") - post-MVP

## Technical Design

**Components impacted:**
- `ProgressDashboard.tsx` (new component)
- `ProgressService.ts` (backend calculations)
- `ConceptList.tsx` (grouped concept display)

**Progress Calculation Logic:**

```typescript
interface ProgressStats {
  courseId: string;
  courseName: string;
  totalConcepts: number;
  masteredCount: number;
  inProgressCount: number;
  notStartedCount: number;
  percentComplete: number;
}

enum ConceptProgressState {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  MASTERED = 'mastered'
}

async function calculateProgress(
  userId: string,
  courseId: string
): Promise<ProgressStats> {
  // Get all syllabus concepts for this course
  const syllabusConcepts = await db.syllabusConcepts.findMany({
    where: { syllabusId: courseId }
  });

  // Get all user's flashcards for this course with review stats
  const flashcards = await db.flashcards.findMany({
    where: {
      userId,
      concept: {
        match: {
          syllabusConcept: {
            syllabusId: courseId
          }
        }
      }
    },
    include: {
      concept: {
        include: {
          match: {
            include: {
              syllabusConcept: true
            }
          }
        }
      }
    }
  });

  // Calculate state for each syllabus concept
  const conceptStates = new Map<string, ConceptProgressState>();

  for (const syllabusConcept of syllabusConcepts) {
    const relatedFlashcard = flashcards.find(
      fc => fc.concept.match.syllabusConceptId === syllabusConcept.id
    );

    if (!relatedFlashcard) {
      conceptStates.set(syllabusConcept.id, ConceptProgressState.NOT_STARTED);
    } else if (isMastered(relatedFlashcard)) {
      conceptStates.set(syllabusConcept.id, ConceptProgressState.MASTERED);
    } else {
      conceptStates.set(syllabusConcept.id, ConceptProgressState.IN_PROGRESS);
    }
  }

  // Count by state
  const masteredCount = Array.from(conceptStates.values()).filter(
    s => s === ConceptProgressState.MASTERED
  ).length;
  const inProgressCount = Array.from(conceptStates.values()).filter(
    s => s === ConceptProgressState.IN_PROGRESS
  ).length;
  const notStartedCount = Array.from(conceptStates.values()).filter(
    s => s === ConceptProgressState.NOT_STARTED
  ).length;

  return {
    courseId,
    courseName: await getCourseName(courseId),
    totalConcepts: syllabusConcepts.length,
    masteredCount,
    inProgressCount,
    notStartedCount,
    percentComplete: Math.round((masteredCount / syllabusConcepts.length) * 100)
  };
}

function isMastered(flashcard: Flashcard): boolean {
  // Simple MVP logic: 3+ reviews with easy rating = mastered
  // Or: reviewed 5+ times total regardless of difficulty
  return (
    flashcard.timesCorrect >= 3 ||
    (flashcard.timesReviewed >= 5 && flashcard.timesCorrect / flashcard.timesReviewed > 0.6)
  );
}
```

**Data Model:**

```sql
-- No new tables needed, but add materialized view for performance

CREATE MATERIALIZED VIEW user_progress AS
SELECT
  u.id AS user_id,
  c.id AS course_id,
  c.name AS course_name,
  COUNT(DISTINCT sc.id) AS total_concepts,
  COUNT(DISTINCT CASE WHEN f.times_correct >= 3 THEN sc.id END) AS mastered_count,
  COUNT(DISTINCT CASE WHEN f.times_reviewed > 0 AND f.times_correct < 3 THEN sc.id END) AS in_progress_count
FROM users u
CROSS JOIN courses c
LEFT JOIN syllabi s ON c.syllabus_id = s.id
LEFT JOIN syllabus_concepts sc ON s.id = sc.syllabus_id
LEFT JOIN concept_matches cm ON sc.id = cm.syllabus_concept_id
LEFT JOIN concepts con ON cm.extracted_concept_id = con.id
LEFT JOIN flashcards f ON con.id = f.concept_id AND f.user_id = u.id
GROUP BY u.id, c.id, c.name;

-- Refresh materialized view after review sessions
CREATE INDEX idx_user_progress ON user_progress(user_id, course_id);
```

**API Contracts:**

```typescript
// GET /api/progress/:courseId
Response: {
  courseId: "phil-101",
  courseName: "Philosophy 101",
  totalConcepts: 30,
  masteredCount: 8,
  inProgressCount: 4,
  notStartedCount: 18,
  percentComplete: 27 // (8/30 * 100)
}

// GET /api/progress/:courseId/details
Response: {
  mastered: [
    { id: "sc-1", name: "Categorical Imperative", reviewCount: 5 },
    // ...
  ],
  inProgress: [
    { id: "sc-2", name: "Moral Law", reviewCount: 1 },
    // ...
  ],
  notStarted: [
    { id: "sc-3", name: "Transcendental Idealism", reviewCount: 0 },
    // ...
  ]
}
```

**Frontend Component:**

```typescript
function ProgressDashboard({ courseId }: { courseId: string }) {
  const { data: progress, isLoading } = useQuery(
    ['progress', courseId],
    () => fetchProgress(courseId)
  );

  if (isLoading) return <Spinner />;

  const progressPercent = progress.percentComplete;

  return (
    <div className="progress-dashboard">
      <h2>{progress.courseName}</h2>
      <div className="progress-counter">
        <span className="large-number">
          {progress.masteredCount} / {progress.totalConcepts}
        </span>
        <span className="label">concepts ({progressPercent}%)</span>
      </div>

      <ProgressBar percent={progressPercent} />

      <div className="breakdown">
        <StatItem
          icon="✅"
          label="Mastered"
          count={progress.masteredCount}
          color="green"
        />
        <StatItem
          icon="📚"
          label="In Progress"
          count={progress.inProgressCount}
          color="yellow"
        />
        <StatItem
          icon="❌"
          label="Not Started"
          count={progress.notStartedCount}
          color="gray"
        />
      </div>

      <Link to={`/progress/${courseId}/details`}>
        View Details →
      </Link>
    </div>
  );
}
```

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Progress calculation is slow** | Medium | Medium | Use materialized view, cache results, refresh async |
| **"Mastered" criteria feels arbitrary** | Low | Low | Document criteria clearly, iterate post-MVP based on feedback |
| **Students confused by "In Progress" vs "Not Started"** | Low | Low | Add tooltips explaining states |
| **Progress doesn't update immediately** | Low | Medium | Invalidate cache after video processing/reviews |

## Rollout

**Migration/feature flags:**
- No migration needed
- Feature flag: `progress_dashboard_enabled`

**Metrics:**
- Dashboard load time (target: <2s)
- Average progress per user after 1 week
- Progress distribution (histogram of completion %)
- Click-through rate to detailed progress view

**Post-launch checklist:**
- [ ] Verify progress updates after video processing
- [ ] Verify progress updates after review sessions
- [ ] Test with 0% progress (new user)
- [ ] Test with 100% progress (all concepts mastered)
- [ ] Mobile responsiveness check

**Post-MVP improvements:**
- Historical progress graph (progress over time)
- Per-topic/category breakdown
- Goal setting and tracking
- Streak tracking ("7 day review streak")
- Comparison with class average (if professor dashboard exists)
- Progress export (PDF report for studying)

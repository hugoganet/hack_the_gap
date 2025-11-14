# Feature Spec: US-0009 - Gap Analysis

Owner: Founder
Status: Draft
Last Updated: 2025-11-14

## Summary

Show students which required syllabus concepts they haven't learned yet, enabling targeted learning to fill gaps before exams.

**Why now:** Key differentiator for demo - students can see exactly which concepts they're missing vs what the professor requires. This is the "aha moment" that makes concept matching valuable.

## User Stories

- As a Motivated Struggler, I want to see which syllabus concepts I haven't learned yet so that I know exactly what to study before the exam.

## Acceptance Criteria

**Given** a user has processed some videos but not covered all syllabus concepts
**When** they click "View Gaps" on the dashboard
**Then** they see a list of unmatched syllabus concepts with names and descriptions

**Given** the gap analysis shows unmatched concepts
**When** displayed to the user
**Then** concepts are grouped by category (if available) for easier navigation

**Given** a user views their gaps
**When** they want to address a gap
**Then** they can see a placeholder for "Suggested Resources" (not functional for MVP, just UI)

**Detailed Acceptance Criteria:**
- [ ] Gap list shows only syllabus concepts with zero matches
- [ ] Each gap shows: concept name, description, category (if available)
- [ ] Gaps are sorted by importance (core concepts first, if tagged)
- [ ] Mobile-friendly list view (clear, scannable)
- [ ] Empty state if no gaps: "🎉 You've covered all course concepts!"
- [ ] Gap count shown on dashboard: "18 concepts remaining"
- [ ] Load time <2 seconds

## UX & Flows

```
[Dashboard]
Progress: 12/30 concepts
[Button: View Gaps →]
    ↓
[Gap Analysis Screen]

┌─────────────────────────────────┐
│ Concepts You Haven't Learned    │
│                                 │
│ 18 concepts remaining           │
│                                 │
│ Ethics (5 concepts)             │
│ ❌ Hypothetical Imperative      │
│    Conditional moral rules      │
│                                 │
│ ❌ Good Will                    │
│    Kant's concept of pure       │
│    moral motivation             │
│                                 │
│ Epistemology (8 concepts)       │
│ ❌ Transcendental Idealism      │
│    Kant's theory that space/    │
│    time are mental constructs   │
│                                 │
│ ...                             │
│                                 │
│ [Suggested: Find videos ↗]     │
│ (Post-MVP feature)              │
└─────────────────────────────────┘
```

**Empty state (all concepts covered):**

```
[Gap Analysis Screen]

┌─────────────────────────────────┐
│ 🎉 Congratulations!              │
│                                 │
│ You've covered all 30 concepts  │
│ required for Philosophy 101!    │
│                                 │
│ Keep reviewing to maintain      │
│ mastery.                        │
│                                 │
│ [Back to Dashboard]             │
└─────────────────────────────────┘
```

## Scope

**In scope:**
- List all unmatched syllabus concepts
- Group by category (if available)
- Sort by importance (core concepts first)
- Show concept name + description
- Empty state for 100% coverage
- Mobile-friendly list view

**Out of scope:**
- Recommended resources/videos for gaps (post-MVP)
- AI-generated study plan for filling gaps (post-MVP)
- "Add to study queue" action (post-MVP)
- Historical gap tracking (which gaps were filled when) (post-MVP)
- Export gaps as checklist (post-MVP)
- Share gaps with professor/tutor (post-MVP)

## Technical Design

**Components impacted:**
- `GapAnalysis.tsx` (new component)
- `GapService.ts` (backend queries)
- `ConceptList.tsx` (reusable list component)

**Gap Calculation Logic:**

```typescript
interface GapAnalysis {
  courseId: string;
  courseName: string;
  totalGaps: number;
  gapsByCategory: {
    category: string;
    concepts: SyllabusConcept[];
  }[];
}

async function calculateGaps(
  userId: string,
  courseId: string
): Promise<GapAnalysis> {
  // Get all syllabus concepts
  const syllabusConcepts = await db.syllabusConcepts.findMany({
    where: { syllabusId: courseId },
    orderBy: [
      { importance: 'desc' }, // Core concepts first
      { category: 'asc' },
      { name: 'asc' }
    ]
  });

  // Get all matched concepts for this user
  const matchedConceptIds = await db.conceptMatches.findMany({
    where: {
      confidence: { gte: 0.8 }, // Only high-confidence matches
      extractedConcept: {
        videoJob: {
          userId
        }
      },
      syllabusConcept: {
        syllabusId: courseId
      }
    },
    select: {
      syllabusConceptId: true
    }
  }).then(matches => matches.map(m => m.syllabusConceptId));

  // Filter to unmatched concepts (gaps)
  const gaps = syllabusConcepts.filter(
    sc => !matchedConceptIds.includes(sc.id)
  );

  // Group by category
  const gapsByCategory = groupBy(gaps, c => c.category || 'Uncategorized');

  return {
    courseId,
    courseName: await getCourseName(courseId),
    totalGaps: gaps.length,
    gapsByCategory: Object.entries(gapsByCategory).map(([category, concepts]) => ({
      category,
      concepts
    }))
  };
}
```

**Data Model:**

```sql
-- Use existing tables, no new tables needed

-- Query for gaps:
SELECT sc.*
FROM syllabus_concepts sc
LEFT JOIN concept_matches cm ON sc.id = cm.syllabus_concept_id
  AND cm.confidence >= 0.8
  AND cm.extracted_concept_id IN (
    SELECT c.id
    FROM concepts c
    JOIN video_jobs vj ON c.video_job_id = vj.id
    WHERE vj.user_id = :userId
  )
WHERE sc.syllabus_id = :courseId
  AND cm.id IS NULL -- No match exists
ORDER BY sc.importance DESC, sc.category ASC, sc.name ASC;
```

**API Contracts:**

```typescript
// GET /api/gaps/:courseId
Response: {
  courseId: "phil-101",
  courseName: "Philosophy 101",
  totalGaps: 18,
  gapsByCategory: [
    {
      category: "Ethics",
      concepts: [
        {
          id: "sc-15",
          name: "Hypothetical Imperative",
          description: "Conditional moral rules based on desired outcomes",
          importance: 2
        },
        // ...
      ]
    },
    {
      category: "Epistemology",
      concepts: [...]
    }
  ]
}

// GET /api/gaps/:courseId/summary
Response: {
  totalGaps: 18,
  byCategoryCount: {
    "Ethics": 5,
    "Epistemology": 8,
    "Metaphysics": 5
  }
}
```

**Frontend Component:**

```typescript
function GapAnalysis({ courseId }: { courseId: string }) {
  const { data: gaps, isLoading } = useQuery(
    ['gaps', courseId],
    () => fetchGaps(courseId)
  );

  if (isLoading) return <Spinner />;

  if (gaps.totalGaps === 0) {
    return (
      <EmptyState
        icon="🎉"
        title="Congratulations!"
        message="You've covered all concepts required for this course!"
      />
    );
  }

  return (
    <div className="gap-analysis">
      <h2>Concepts You Haven't Learned</h2>
      <p className="gap-count">{gaps.totalGaps} concepts remaining</p>

      {gaps.gapsByCategory.map(({ category, concepts }) => (
        <div key={category} className="category-section">
          <h3>
            {category} ({concepts.length} concepts)
          </h3>
          <ul className="concept-list">
            {concepts.map(concept => (
              <li key={concept.id} className="concept-item">
                <span className="icon">❌</span>
                <div className="concept-details">
                  <h4>{concept.name}</h4>
                  <p>{concept.description}</p>
                  {concept.importance === 3 && (
                    <span className="badge core">Core Concept</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="suggested-action">
        <p>💡 Suggested: Find videos covering these concepts</p>
        <button disabled>Find Resources (Coming Soon)</button>
      </div>
    </div>
  );
}
```

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Gap list feels overwhelming (18 concepts)** | Medium | Medium | Group by category, show progress encouragement |
| **Students don't know how to fill gaps** | High | High | Add "Suggested Resources" placeholder for post-MVP |
| **Categories are poorly defined** | Medium | Low | Pre-process syllabi to ensure good categorization |
| **Query performance degrades with many users** | Low | Medium | Index syllabus_concept_id, cache results |

**Testing Strategy:**

```typescript
// Test gap calculation logic
describe('Gap Analysis', () => {
  test('Shows all syllabus concepts when user has no matches', async () => {
    const gaps = await calculateGaps(newUserId, 'phil-101');
    expect(gaps.totalGaps).toBe(30); // All concepts are gaps
  });

  test('Excludes matched concepts from gaps', async () => {
    // User has matched 12 concepts
    await createMatches(userId, ['sc-1', 'sc-2', ..., 'sc-12']);
    const gaps = await calculateGaps(userId, 'phil-101');
    expect(gaps.totalGaps).toBe(18); // 30 - 12 = 18
  });

  test('Only counts high-confidence matches (≥80%)', async () => {
    await createMatch(userId, 'sc-1', { confidence: 0.9 }); // Counts
    await createMatch(userId, 'sc-2', { confidence: 0.7 }); // Doesn't count
    const gaps = await calculateGaps(userId, 'phil-101');
    expect(gaps.totalGaps).toBe(29); // Only sc-1 is matched
  });

  test('Groups gaps by category', async () => {
    const gaps = await calculateGaps(userId, 'phil-101');
    const categories = gaps.gapsByCategory.map(g => g.category);
    expect(categories).toContain('Ethics');
    expect(categories).toContain('Epistemology');
  });
});
```

## Rollout

**Migration/feature flags:**
- No migration needed
- Feature flag: `gap_analysis_enabled`

**Metrics:**
- Gap analysis view rate (% users who view gaps)
- Average gaps per user
- Gap reduction rate (gaps filled per week)
- Click-through to "Find Resources" (even if disabled, track intent)

**Post-launch checklist:**
- [ ] Verify gaps update after video processing
- [ ] Test with 0 gaps (100% coverage)
- [ ] Test with all gaps (new user)
- [ ] Verify categories display correctly
- [ ] Mobile responsiveness check

**Post-MVP improvements:**
- Recommended resources for each gap (YouTube search integration)
- AI-generated study plan ("Learn X before Y")
- "Add to study queue" action
- Historical gap tracking (see which gaps were filled when)
- Export gaps as PDF checklist
- Share gaps with professor/tutor for guidance

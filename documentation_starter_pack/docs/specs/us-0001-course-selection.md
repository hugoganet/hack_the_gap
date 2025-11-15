# Feature Spec: US-0001 - Course Selection

Owner: Founder
Status: Draft
Last Updated: 2025-11-14

## Summary

Enable first-time users to select which course they're studying from a dropdown of pre-loaded courses. This is the entry point for the entire MVP flow - students must select a course before submitting content for processing.

**Why now:** Required for hackathon demo. Students need context (which syllabus to match against) before processing videos.

## User Stories

- As a Motivated Struggler, I want to select my course from a list so that the system knows which syllabus to match my learning content against.

## Acceptance Criteria

**Given** a first-time user opens the app
**When** they land on the home page
**Then** they see a dropdown with 3 pre-loaded courses: "Philosophy 101", "Biology 101", "Economics 101"

**Given** a user selects a course from the dropdown
**When** the selection is saved
**Then** the dashboard shows "0/X concepts for this course" (where X = total syllabus concepts)

**Given** a user has already selected a course
**When** they return to the app
**Then** their previously selected course is remembered and auto-selected

**Detailed Acceptance Criteria:**

- [ ] Dropdown displays 3 courses with clear names (Philosophy 101, Biology 101, Economics 101)
- [ ] Course selection persists in browser localStorage or user session
- [ ] After selection, progress counter shows "0/[total concepts] concepts for this course"
- [ ] User can change course selection (confirmation prompt: "Switching courses will reset progress")
- [ ] Mobile-responsive design (works on phone screens)

## UX & Flows

```
[Landing Page]
    ↓
[Welcome Screen]
"Select your course to get started"
    ↓
[Dropdown: Select Course ▾]
  - Philosophy 101 (30 concepts)
  - Biology 101 (35 concepts)
  - Economics 101 (28 concepts)
    ↓
[Button: Start Learning →]
    ↓
[Dashboard: "0/30 concepts for Philosophy 101"]
```

**Mobile-first wireframe:**

- Large dropdown (easy to tap)
- Course names clearly visible
- Concept count shown for transparency
- Prominent "Start Learning" CTA button

## Scope

**In scope:**

- Dropdown UI component
- 3 pre-loaded courses (hard-coded for MVP)
- Course selection persistence (localStorage)
- Display total concept count per course
- Basic course switching with confirmation

**Out of scope:**

- Manual syllabus upload (post-MVP)
- Multi-course tracking simultaneously (post-MVP)
- Course search/filtering (only 3 courses for MVP)
- Course recommendations based on user major (post-MVP)
- Syllabus preview before selection (post-MVP)

## Technical Design

**Components impacted:**

- `CourseSelector.tsx` (new component)
- `Dashboard.tsx` (consumes selected course)
- `AppContext.tsx` (stores selected course state)

**API contracts:**

```typescript
// GET /api/courses
Response: {
  courses: [
    {
      id: "phil-101",
      name: "Philosophy 101",
      totalConcepts: 30,
      syllabusId: "syllabus-phil-101"
    },
    // ... other courses
  ]
}

// POST /api/user/select-course
Request: {
  courseId: "phil-101"
}
Response: {
  success: true,
  course: { id, name, totalConcepts },
  userProgress: { learnedConcepts: 0, totalConcepts: 30 }
}
```

**Data model changes:**

```sql
-- Courses table (pre-populated for MVP)
CREATE TABLE courses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  syllabus_id VARCHAR(50) NOT NULL,
  total_concepts INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User course selection
CREATE TABLE user_courses (
  user_id VARCHAR(50),
  course_id VARCHAR(50),
  selected_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);
```

**State management:**

```typescript
interface AppState {
  selectedCourse: {
    id: string;
    name: string;
    totalConcepts: number;
  } | null;
  userProgress: {
    learnedConcepts: number;
    totalConcepts: number;
  };
}
```

**Risks:**

- **Low complexity**: Straightforward dropdown, minimal risk
- **Dependency**: All other features depend on course being selected first
- **Persistence**: If localStorage is cleared, user loses selection (acceptable for MVP)

## Rollout

**Migration/feature flags:**

- No migration needed (new feature)
- No feature flag required for MVP

**Metrics:**

- Course selection rate (% users who select a course within 30s of landing)
- Course distribution (which courses are most popular)
- Course switching rate (do users change courses frequently?)

**Post-launch checklist:**

- [ ] Verify 3 courses appear in dropdown
- [ ] Test course selection persistence after page refresh
- [ ] Verify progress counter updates correctly
- [ ] Test course switching confirmation flow
- [ ] Mobile responsiveness on iOS/Android

**Post-MVP improvements:**

- Add manual syllabus upload
- Support multiple active courses per user
- Add course search for larger catalog
- Show syllabus preview before selection

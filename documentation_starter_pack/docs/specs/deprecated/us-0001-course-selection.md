# Feature Spec: US-0001 - Course Selection

**⚠️ DEPRECATED (2025-11-17)**

**Reason**: Major product pivot from institution-centric to student-centric approach. Students now upload their own syllabi instead of selecting from pre-loaded courses.

**Replaced by**: NEW US-0001 - Syllabus Upload & Goal Definition (see `us-0001-syllabus-upload.md`)

**Original Status**: ✅ Implemented (Updated 2025-11-16 - Simplified hierarchy)  
**Deprecated**: 2025-11-17  
**Original Owner**: Founder

---

## ARCHIVED CONTENT BELOW

This spec is kept for historical reference only. The feature described below has been removed from the product.

---

## Summary

Enable first-time users to select which course they're studying from a list of pre-loaded courses. This is the entry point for the entire MVP flow - students must select a course before submitting content for processing.

**Implementation:** Hybrid search dialog with progressive selection (Subject → Course). Calendar-based organization (Year/Semester) removed in 2025-11-16 migration.

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

**Updated Flow (2025-11-16):**

```
[Course Selection Card - 2x2 Grid]
    ↓
[Click "Add Course" Button]
    ↓
[Hybrid Search Dialog Opens]
    ↓
Option 1: Quick Search
  - Type course name
  - Instant filtering
  - Select from results
    ↓
Option 2: Progressive Selection
  - Step 1: Select Subject (Philosophy, Biology, Economics)
  - Step 2: Select Course from filtered list
    ↓
[Course Added to Active Courses]
    ↓
[Dashboard: "0/30 concepts for Philosophy 101"]
```

**Implemented UI:**

- 2x2 grid layout (desktop), 1 column (mobile)
- Hybrid search: Type-ahead + progressive selection
- Breadcrumb navigation with back button
- Empty slots with dashed borders
- Course names with line-clamp-3 (no truncation issues)
- Toast notifications for success/errors

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

**API contracts (Updated 2025-11-16):**

```typescript
// GET /api/courses
Response: {
  courses: [
    {
      id: string,
      code: string,
      name: string,
      subjectId: string,
      subject: { id: string, name: string },
      conceptCount: number
      // year and semester fields REMOVED
    }
  ]
}

// GET /api/subjects
Response: {
  subjects: [
    { id: string, name: string }
  ]
}

// POST /api/user/courses
Request: {
  courseId: string
}
Response: {
  success: true,
  course: { id, code, name, subject },
  userProgress: { learnedCount: number }
}

// GET /api/user/courses
Response: {
  courses: [
    {
      course: { id, code, name, subject },
      isActive: boolean,
      learnedCount: number
    }
  ]
}
```

**Removed APIs (2025-11-16):**
- `GET /api/years` - No longer needed
- `GET /api/semesters` - No longer needed

**Data model changes (Updated 2025-11-16):**

```sql
-- Courses table (simplified - no year/semester)
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  ue_number VARCHAR(50),
  syllabus_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User course enrollment
CREATE TABLE user_courses (
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL,
  learned_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);
```

**Removed (2025-11-16):**
- `academic_years` table
- `semesters` table
- `courses.year_id` field
- `courses.semester_id` field

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

- **Low complexity**: Straightforward selection, minimal risk
- **Dependency**: All other features depend on course being selected first
- **Breaking change (2025-11-16)**: Removed year/semester - simplified but required migration
- **No UI for knowledge tree**: Tree structure exists but no management UI yet

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
- ✅ Support multiple active courses per user (implemented)
- ✅ Add course search for larger catalog (hybrid search implemented)
- Show syllabus preview before selection
- **New (2025-11-16):** Build knowledge tree management UI
- **New (2025-11-16):** Implement KnowledgeNode CRUD APIs
- **New (2025-11-16):** Add tree-based navigation for concepts

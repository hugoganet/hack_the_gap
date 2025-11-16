# Frontend and Code Touchpoints: Detailed Change Plan

Objective: Remove AcademicYear and Semester usage across UI and APIs, and introduce a Subject-centric KnowledgeNode tree (CRUD APIs plus optional UI). This document enumerates exact files to change, the nature of edits, and example code snippets or diffs where appropriate.

Scope decisions:
- Tree only, strict hierarchy
- Unique slug per subject (when present)
- No soft delete in v1
- Counts computed on read (no closure table in v1)

Repository impact map:
- API: remove years/semesters routes; add knowledge node routes; adjust course APIs
- UI: dialogs and course pages (remove year/semester selection and display); optional tree manager UI
- Scripts: seed and ingest
- Prompts: documented separately in prompts-changes.md
- Prisma: schema changes documented in prisma-diff.prisma.md; migration steps in README

================================================================
1) API Changes

1.1 Remove legacy time-based endpoints
- Delete file: app/api/semesters/route.ts
- Delete file: app/api/years/route.ts

Notes: These become 404 after removal—ensure UI does not call them.

1.2 Update course APIs to drop year/semester
- Files:
  - app/api/courses/route.ts
  - app/api/user/courses/route.ts

Edits:
- Remove fields yearId and semesterId from selections/serializations.
- Remove includes for .year and .semester.

Example (pseudo-diff):
- before:
  select: {
    id: true,
    subjectId: true,
    yearId: true,
    semesterId: true,
    year: { select: { name: true } },
    semester: { select: { number: true } },
    subject: { select: { id: true, name: true } },
  }
- after:
  select: {
    id: true,
    subjectId: true,
    subject: { select: { id: true, name: true } },
  }

Return shapes: ensure frontends relying on year/semester fields do not break. If needed, gate those UIs or add a fallback text (e.g., omit those chips).

1.3 Add KnowledgeNode API suite
New routes (Next.js app router):
- app/api/subjects/[subjectId]/nodes/route.ts
  - GET: list children (query parentId nullable)
  - POST: create node (name, slug?, parentId?, order?, metadata?)
- app/api/subjects/[subjectId]/nodes/tree/route.ts
  - GET: subtree with optional depth and parentId; use recursive CTE for performance
- app/api/subjects/[subjectId]/nodes/[nodeId]/route.ts
  - PATCH: rename, reparent (cycle check), reorder, slug, metadata
  - DELETE: delete empty node (error if children or attachments exist)
- app/api/subjects/[subjectId]/nodes/[nodeId]/concepts/route.ts
  - POST: attach syllabusConceptIds[]
- app/api/subjects/[subjectId]/nodes/[nodeId]/concepts/[syllabusConceptId]/route.ts
  - DELETE: detach mapping

Common patterns:
- Auth: getUser(); 401 if missing.
- Subject authorization: enforce same checks used in course APIs.
- Validation: zod schema per endpoint; respond 400 on invalid payload.

Reference contract: see docs/migrations/knowledge-tree/api-specs.md  
SQL helpers: see docs/migrations/knowledge-tree/sql-recipes.md

================================================================
2) UI Changes

2.1 Add-course dialogs: remove year/semester steps

Files:
- app/dashboard/users/add-course-dialog.tsx
- app/orgs/[orgSlug]/(navigation)/users/add-course-dialog.tsx

Edits:
- Remove local types:
  - type AcademicYear
  - type Semester
- Remove state:
  - selectedYear, setSelectedYear
  - selectedSemester, setSelectedSemester
  - years, setYears
  - semesters, setSemesters
- Remove handlers:
  - handleYearSelect
  - handleSemesterSelect
- Remove steps and CommandGroup lists that present years and semesters.
- Ensure Subject selection remains and course creation proceeds with subject only.

Optional enhancement (phase 2):
- If the dialog also needs to attach SyllabusConcepts to a KnowledgeNode later, add an optional KnowledgeNode picker (non-blocking for v1). This would call:
  - GET /api/subjects/:subjectId/nodes?parentId=null (roots)
  - Drill-down via fetching children lazily
  - Maintain a breadcrumb locally

Minimal v1: Subject-only course creation.

2.2 Course flashcards views: drop year/semester display

Files:
- app/dashboard/courses/[courseId]/course-flashcards-view.tsx
- app/orgs/[orgSlug]/(navigation)/courses/[courseId]/course-flashcards-view.tsx

Edits:
- Remove UI fragments like:
  {course.semester &amp;&amp; <span>• Semester {course.semester.number}</span>}
  {course.year &amp;&amp; <span>• {course.year.name}</span>}
- Keep subject display:
  - {course.subject?.name}

Optional future:
- If KnowledgeNode breadcrumbs are available (post attachment of concepts), render the breadcrumb path fetched via a nodes API (or show only Subject for now).

2.3 Optional new Subject Knowledge Tree Manager UI (phase 2)

Not required for migration acceptance, but recommended to validate the hierarchy model:
- Page under dashboard or subject route:
  - List root nodes; expand/collapse children
  - Inline create/rename
  - Drag/drop reparent (use PATCH to reparent, with cycle check)
  - Sibling reordering via order field
  - Show concept counts (computed on read; see SQL recipes)
- Lazy load children and debounce operations.
- Keep design minimalistic: similar to file explorer UI.

================================================================
3) Scripts

3.1 prisma/seed.ts
- Remove creation of AcademicYear and Semester
- Remove maps keyed by year level and semester number
- Seed Subjects as before
- Seed Courses with subjectId only; do not attempt year/semester linkage
- Optional: seed minimal KnowledgeNodes for demo (e.g., Philosophy → Epistemology/Ethics/Metaphysics) to showcase API/UI

3.2 scripts/ingest-generated-courses.ts
- Remove upsert/find for AcademicYear and Semester
- Drop yearId and semesterId from function inputs and from prisma.course.upsert
- Keep: subjectId, code, name, ueNumber?, syllabusUrl?
- If the script referenced semester for filtering, remove that logic

Example (pseudo-diff):
- before create/update:
  { name, subjectId, yearId: yearId ?? null, semesterId: semesterId ?? null, ueNumber, syllabusUrl }
- after:
  { name, subjectId, ueNumber, syllabusUrl }

================================================================
4) Types and Generated Client

- src/generated/prisma/* will be regenerated by prisma generate post-migration.
- UI components with local types for year/semester must delete or refactor those types.

================================================================
5) Tests

5.1 Unit/Integration
- Update any tests asserting presence of year/semester on course payloads
- Add tests for KnowledgeNode handlers (CRUD validations, cycle prevention, delete policy)

5.2 E2E
- Dialog flow tests:
  - Remove steps for year/semester
  - Select Subject → Create Course → Verify course appears
- Course page tests:
  - Verify subject name renders
  - No assumptions about semester/year chips

================================================================
6) Example Snippets

6.1 Remove year/semester display
- before:
  <div className="text-sm text-muted-foreground">
    {course.year &amp;&amp; <span>• {course.year.name}</span>}
    {course.semester &amp;&amp; <span>• Semester {course.semester.number}</span>}
  </div>
- after:
  <div className="text-sm text-muted-foreground">
    {course.subject &amp;&amp; <span>• {course.subject.name}</span>}
  </div>

6.2 Subject-only course create payload
- Ensure API consumer sends only subjectId (no yearId/semesterId)

================================================================
7) Rollout Order

Recommended order to minimize breakage:
1. Prepare migration branch: blackboxai/knowledge-tree-migration
2. Prisma: implement schema changes; migrate; generate client (backend compile)
3. Delete legacy /years and /semesters routes (API)
4. Update course APIs to drop year/semester fields
5. Update UI dialogs and course views to not reference semesters/years
6. Seed/ingest scripts update
7. (Optional) Implement KnowledgeNode APIs (phase can be parallel) and basic UI to validate
8. Update tests (unit/integration/e2e)
9. Prompt changes (prompts-changes.md) once backend ignores time-based metadata

================================================================
8) Acceptance (Frontend)

- No frontend references to AcademicYear/Semester exist
- Add-course dialogs create courses with Subject only
- Course pages render without errors and show Subject name
- No calls to /api/semesters or /api/years
- All type checks pass after schema regeneration

See:
- docs/migrations/knowledge-tree/README.md (global plan)
- docs/migrations/knowledge-tree/api-specs.md (endpoint contracts)
- docs/migrations/knowledge-tree/sql-recipes.md (CTEs and write patterns)
- docs/migrations/knowledge-tree/prompts-changes.md (prompt edits)

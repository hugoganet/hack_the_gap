# Knowledge Tree Migration — Engineer Tasks Checklist

Branch: blackboxai/knowledge-tree-migration  
Scope: Remove AcademicYear/Semester, add KnowledgeNode + NodeSyllabusConcept, update API/UI/scripts/prompts/tests.  
Decisions: Tree-only, unique slug per subject, no soft delete v1, counts computed on read.

Reference docs:
- README: docs/migrations/knowledge-tree/README.md
- Prisma target schema: docs/migrations/knowledge-tree/prisma-diff.prisma.md
- API contracts: docs/migrations/knowledge-tree/api-specs.md
- SQL patterns: docs/migrations/knowledge-tree/sql-recipes.md
- Frontend changes: docs/migrations/knowledge-tree/frontend-changes.md
- Prompts changes: docs/migrations/knowledge-tree/prompts-changes.md

============================================================
0) Prep

- [ ] Create branch: blackboxai/knowledge-tree-migration
- [ ] Ensure DATABASE_URL is set and local DB ready

Commands:
- git checkout -b blackboxai/knowledge-tree-migration

============================================================
1) Prisma Schema

- [ ] Edit prisma/schema/schema.prisma:
  - [ ] Remove models: AcademicYear, Semester
  - [ ] Course: remove fields yearId, semesterId and relations/indexes
  - [ ] Add models: KnowledgeNode, NodeSyllabusConcept (see prisma-diff.prisma.md)
  - [ ] Add @@unique([subjectId, slug]) to KnowledgeNode (slug unique per subject)
  - [ ] Indexes: (subjectId, parentId, order), (parentId), (subjectId)
- [ ] Run migration and generate client

Commands:
- npx prisma migrate dev --name knowledge-tree_init
- npx prisma generate

Sanity:
- [ ] Fix any TS types and imports caused by Prisma client changes
- [ ] Verify schema in generated client

============================================================
2) API: Remove time-based endpoints

- [ ] Delete file: app/api/semesters/route.ts
- [ ] Delete file: app/api/years/route.ts

Sanity:
- [ ] Ensure no UI calls to these endpoints remain

============================================================
3) API: Update course endpoints (remove year/semester)

- [ ] app/api/courses/route.ts
  - [ ] Remove selects/returns for yearId, semesterId
  - [ ] Remove includes for .year and .semester
  - [ ] Keep subject selection
- [ ] app/api/user/courses/route.ts
  - [ ] Same changes as above

Sanity:
- [ ] Test requests return without year/semester
- [ ] UI still renders course lists

============================================================
4) API: Add KnowledgeNode endpoints

Paths:
- [ ] app/api/subjects/[subjectId]/nodes/route.ts
  - [ ] GET: list children ?parentId=null|uuid
  - [ ] POST: create node (name, slug?, parentId?, order?, metadata?)
- [ ] app/api/subjects/[subjectId]/nodes/tree/route.ts
  - [ ] GET: subtree with optional depth and parentId (use recursive CTE from sql-recipes.md)
- [ ] app/api/subjects/[subjectId]/nodes/[nodeId]/route.ts
  - [ ] PATCH: rename, reparent (cycle check), reorder, slug, metadata
  - [ ] DELETE: only when no children and no attachments
- [ ] app/api/subjects/[subjectId]/nodes/[nodeId]/concepts/route.ts
  - [ ] POST: attach syllabusConceptIds[]
- [ ] app/api/subjects/[subjectId]/nodes/[nodeId]/concepts/[syllabusConceptId]/route.ts
  - [ ] DELETE: detach mapping

Validation & security:
- [ ] Use getUser(), return 401 if not authenticated
- [ ] Check subject access (reuse org/subject authorization logic)
- [ ] Zod payload validation
- [ ] Cycle prevention (see sql-recipes.md)
- [ ] Slug uniqueness per subject (optional but enforced by DB)

============================================================
5) Frontend: Remove year/semester usage

- [ ] app/dashboard/users/add-course-dialog.tsx
  - [ ] Remove types: AcademicYear, Semester
  - [ ] Remove state/handlers: years/semesters, selectedYear/selectedSemester, handlers
  - [ ] Remove steps rendering years/semesters
  - [ ] Ensure Subject-only creation works
- [ ] app/orgs/[orgSlug]/(navigation)/users/add-course-dialog.tsx
  - [ ] Same as above
- [ ] app/dashboard/courses/[courseId]/course-flashcards-view.tsx
  - [ ] Remove display of course.year / course.semester
  - [ ] Keep subject display (course.subject.name)
- [ ] app/orgs/[orgSlug]/(navigation)/courses/[courseId]/course-flashcards-view.tsx
  - [ ] Same as above

Optional (phase 2):
- [ ] Subject Tree Manager UI for KnowledgeNodes (explorer-like)
- [ ] Node breadcrumb rendering (after concepts are attached)

============================================================
6) Scripts/Seeding

- [ ] prisma/seed.ts:
  - [ ] Remove creation of AcademicYear/Semester
  - [ ] Remove mapping by level and number
  - [ ] Keep Subjects
  - [ ] Create Courses with subjectId only
  - [ ] Optional: seed minimal KnowledgeNodes for demo
- [ ] scripts/ingest-generated-courses.ts:
  - [ ] Remove AcademicYear/Semester upserts/lookups
  - [ ] Drop yearId/semesterId from input and prisma.course.upsert
  - [ ] Keep subjectId, code, name, ueNumber?, syllabusUrl?

============================================================
7) Prompts (master-prompts)

- [ ] src/master-prompts/syllabus-concept-extraction-prompt.md
  - [ ] Remove Academic Year & Semester sections and validation
  - [ ] Update Primary Objective to exclude year/semester
  - [ ] Optionally add “proposedCategoryPath” guidance (keep backward-compatible)
- [ ] src/master-prompts/flashcard-generation-prompt.md
  - [ ] Update “Context Integration” to include optional nodePath (input)
  - [ ] Guidance: tailor phrasing if nodePath present
  - [ ] No change to output schema

Reference: docs/migrations/knowledge-tree/prompts-changes.md

============================================================
8) Tests

- [ ] Unit tests:
  - [ ] KnowledgeNode CRUD
  - [ ] Cycle prevention on reparent
  - [ ] Delete policy (only empty nodes)
  - [ ] Concept attach/detach
- [ ] Integration tests:
  - [ ] Seed & ingestion run with subject-only courses
  - [ ] APIs: list children, create node, subtree, reparent, attach/detach
- [ ] E2E tests:
  - [ ] Add-course dialog flow without year/semester
  - [ ] Course page rendering without year/semester
  - [ ] (Optional) Node manager interactions (if implemented)

Reference: docs/migrations/knowledge-tree/test-plan.md (to be followed)

============================================================
9) Docs / Changelog

- [ ] Add summary to CHANGELOG.md
- [ ] Ensure docs under docs/migrations/knowledge-tree are kept in repo

============================================================
10) Rollback Plan

- [ ] If needed, revert branch blackboxai/knowledge-tree-migration
- [ ] npx prisma migrate reset (for local/test only)
- [ ] Restore old API/seed/scripts and prompts from main

============================================================
11) Acceptance Criteria Verification

- [ ] Prisma schema contains KnowledgeNode and NodeSyllabusConcept
- [ ] AcademicYear and Semester removed; Course has no yearId/semesterId
- [ ] Prisma generates; TS typecheck passes
- [ ] Legacy /api/years and /api/semesters removed
- [ ] Course endpoints unaffected by removed fields
- [ ] UI dialogs/pages no longer reference year/semester
- [ ] Seed/ingest do not rely on year/semester
- [ ] Prompt files updated per guide
- [ ] Unit/integration/E2E tests updated and passing

============================================================
Appendix: Useful Commands

- Prisma:
  - npx prisma migrate dev --name knowledge-tree_init
  - npx prisma generate
  - npx prisma studio
- Quality:
  - pnpm typecheck
  - pnpm test
  - pnpm run lint
- E2E:
  - pnpm e2e (if configured)

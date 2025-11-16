# Knowledge Tree Migration — Main Guide

Purpose: High-level plan to remove AcademicYear/Semester and introduce a flexible, tree-only knowledge hierarchy under Subject. This guide summarizes the migration and links to all detailed documents required by the implementing engineer.

Status: Design package only. No runtime code has been changed yet.

Decisions:
- Hierarchy type: Tree-only (no DAG/multiple parents)
- Slug: Unique per Subject (enforced by composite unique [subjectId, slug])
- Soft delete: Out-of-scope for v1 (keep model minimal)
- Counts: Computed on read with recursive CTEs (closure table optional in v2)

Repository location for all docs:
- docs/migrations/knowledge-tree/

----------------------------------------------------------------
1) Executive Summary

This migration:
- Removes AcademicYear and Semester from the data model and all dependent API/UI flows.
- Keeps Course bound only to Subject.
- Introduces a flexible Subject knowledge hierarchy using KnowledgeNode (adjacency list) that supports arbitrary depth and reorganization with minimal UX.
- Enables attaching atomic concepts (SyllabusConcepts) to nodes via a junction table (NodeSyllabusConcept), letting you cluster and drill down into precise zones of knowledge.

The result is a Subject-centric, non-rigid structure suitable for reorganizing broad domains like Philosophy into meaningful branches, with deepest nodes holding the atomic concepts.

----------------------------------------------------------------
2) Impact Overview (What changes)

Database/Prisma:
- Remove models: AcademicYear, Semester.
- Alter Course: drop yearId and semesterId.
- Add:
  - KnowledgeNode: per-Subject tree (parentId, order, optional slug unique per Subject).
  - NodeSyllabusConcept: attach SyllabusConcepts to any node.

APIs:
- Remove legacy endpoints:
  - GET /api/semesters
  - GET /api/years
- Update course APIs to no longer return year/semester fields.
- Add KnowledgeNode APIs:
  - List children / subtree (bounded depth)
  - Create / Update (rename/reparent/reorder/slug/metadata)
  - Delete (only empty nodes)
  - Attach/Detach SyllabusConcepts
  - Enforce auth, subject scoping, and cycle prevention

Frontend:
- Remove all AcademicYear/Semester selection and display from:
  - Add-course dialogs (dashboard and org routes)
  - Course flashcards views
- Optional phase 2: Minimal tree manager UI per Subject (explorer-like) to manage nodes and review counts.

Scripts:
- prisma/seed.ts and scripts/ingest-generated-courses.ts:
  - Remove AcademicYear/Semester creation/upserts.
  - Keep Subject and Course (subject-only).
  - Optional: seed a basic KnowledgeNode skeleton for demo.

Master Prompts (critical):
- Remove all references to Academic Year/Semester from:
  - src/master-prompts/syllabus-concept-extraction-prompt.md
  - src/master-prompts/flashcard-generation-prompt.md
- Add optional taxonomy guidance (proposed category paths) and optional nodePath context for flashcards.

Tests:
- Update unit/integration/E2E to cover the new KnowledgeNode endpoints and clean up references to years/semesters in UIs and APIs.

----------------------------------------------------------------
3) Migration Deliverables (Where to find details)

- Target Prisma schema (documentation schema):
  - docs/migrations/knowledge-tree/prisma-diff.prisma.md
- API specifications for KnowledgeNodes and course adjustments:
  - docs/migrations/knowledge-tree/api-specs.md
- SQL and Prisma recipes (recursive CTEs, cycle checks, ordering, counts):
  - docs/migrations/knowledge-tree/sql-recipes.md
- Frontend change map (exact files and edits):
  - docs/migrations/knowledge-tree/frontend-changes.md
- Master prompts migration notes (exact replacement blocks):
  - docs/migrations/knowledge-tree/prompts-changes.md
- Engineer tasks checklist (step-by-step execution plan):
  - docs/migrations/knowledge-tree/tasks-checklist.md
- Test plan (if/when you want automated coverage):
  - docs/migrations/knowledge-tree/test-plan.md
- High-level overview document (this file):
  - docs/migrations/knowledge-tree/MAIN_MIGRATION_GUIDE.md

----------------------------------------------------------------
4) Schema Summary (Target)

Remove:
- model AcademicYear
- model Semester

Alter:
- model Course: remove yearId and semesterId fields and relations.

Add:
- model KnowledgeNode
  - id (uuid), subjectId (fk → Subject), parentId (self fk), name, slug?, order, metadata?, createdAt/updatedAt
  - @@unique([subjectId, slug]) for unique slugs per Subject
  - Indexes: (subjectId, parentId, order), (subjectId), (parentId)
- model NodeSyllabusConcept
  - nodeId (fk → KnowledgeNode), syllabusConceptId (fk → SyllabusConcept), addedByUserId?, createdAt
  - @@id([nodeId, syllabusConceptId]), indexes on nodeId, syllabusConceptId

Note: SyllabusConcepts stay per Course; the junction allows attaching any concept to any node.

Full schema reference:
- docs/migrations/knowledge-tree/prisma-diff.prisma.md

----------------------------------------------------------------
5) API Summary (New and Changed)

Remove:
- app/api/semesters/route.ts
- app/api/years/route.ts

Change:
- app/api/courses/route.ts and app/api/user/courses/route.ts:
  - Remove yearId, semesterId, and nested year/semester payloads
  - Keep subject and course core fields

Add (KnowledgeNode suite, secured with getUser + subject/org checks):
- GET /api/subjects/:subjectId/nodes?parentId=null|uuid  → list children
- GET /api/subjects/:subjectId/nodes/tree?parentId=…&depth=int|full  → subtree (depth-limited recommended)
- POST /api/subjects/:subjectId/nodes  → create node (name, slug?, parentId?, order?, metadata?)
- PATCH /api/subjects/:subjectId/nodes/:nodeId  → rename, reparent (cycle check), reorder, slug, metadata
- DELETE /api/subjects/:subjectId/nodes/:nodeId  → delete only if node has no children/attachments
- POST /api/subjects/:subjectId/nodes/:nodeId/concepts  → attach syllabusConceptIds[]
- DELETE /api/subjects/:subjectId/nodes/:nodeId/concepts/:syllabusConceptId  → detach

API contract details:
- docs/migrations/knowledge-tree/api-specs.md

----------------------------------------------------------------
6) Frontend Summary (What to change)

Remove year/semester from:
- app/dashboard/users/add-course-dialog.tsx
- app/orgs/[orgSlug]/(navigation)/users/add-course-dialog.tsx
- app/dashboard/courses/[courseId]/course-flashcards-view.tsx
- app/orgs/[orgSlug]/(navigation)/courses/[courseId]/course-flashcards-view.tsx

Keep:
- Subject selection and display

Optional (phase 2):
- Subject Tree Manager UI to create/rename/reparent/delete-empty nodes and view counts.

Frontend change details:
- docs/migrations/knowledge-tree/frontend-changes.md

----------------------------------------------------------------
7) Prompts Summary (What to update)

Syllabus concept extraction:
- Remove Academic Year/Semester metadata and validations
- Keep Subject and Course metadata
- Optional: add proposedCategoryPath to guide hierarchy

Flashcard generation:
- Keep academicLevel (1-6) as a general difficulty proxy
- Add optional nodePath in course context and bias phrasing to that subdomain when provided

Exact replacement blocks:
- docs/migrations/knowledge-tree/prompts-changes.md

----------------------------------------------------------------
8) Execution Plan (Minimal steps)

Use the Engineer Tasks Checklist (canonical list):
- docs/migrations/knowledge-tree/tasks-checklist.md

Quick outline:
1) Branch: blackboxai/knowledge-tree-migration
2) Prisma: implement schema (remove Year/Semester; add KnowledgeNode/NodeSyllabusConcept; update Course)
3) Migrate and generate client
4) Remove legacy year/semester APIs; adjust course APIs
5) Update dialogs and course views to drop year/semester
6) Update seed/ingest scripts
7) Update master prompts
8) Regenerate client, typecheck, run tests as desired

----------------------------------------------------------------
9) SQL Recipes (CTEs and validations)

- Subtree and breadcrumb recursive CTEs
- Cycle prevention before reparent
- Child ordering with integer gaps
- Concept count in subtree (computed on read)

Reference:
- docs/migrations/knowledge-tree/sql-recipes.md

----------------------------------------------------------------
10) Acceptance Criteria

- Database: KnowledgeNode + NodeSyllabusConcept present; AcademicYear/Semester removed; Course has no yearId/semesterId
- APIs: /api/years and /api/semesters removed; course endpoints adjusted; KnowledgeNode endpoints implemented and secured
- UI: Add-course dialogs work with Subject only; course pages render without year/semester
- Scripts: Seed/ingest run without year/semester
- Prompts: No calendar-based instructions; taxonomy guidance available
- Types/tests: Prisma generate succeeds; codebase compiles; tests updated where applicable

----------------------------------------------------------------
11) Rollback Plan

- Revert branch blackboxai/knowledge-tree-migration
- prisma migrate reset (for local/test), or rollback the specific migration
- Restore deleted APIs, script logic, and prompt text from main

----------------------------------------------------------------
12) Command Quick Reference

- Prisma:
  - npx prisma migrate dev --name knowledge-tree_init
  - npx prisma generate
  - npx prisma studio
- Quality:
  - pnpm typecheck
  - pnpm test
  - pnpm run lint

----------------------------------------------------------------
13) Notes and Risks

- Prisma Language Server warnings:
  - Keep documentation schemas as .md (prisma-diff.prisma.md) to avoid duplicate model errors in IDEs.
- Performance:
  - Adjacency list with recursive CTEs is sufficient for v1.
  - For very large hierarchies, consider closure table (NodeClosure) in v2.
- UX Simplicity:
  - Prefer minimal UI with lazy loading and simple drag/drop. Avoid complex controls in v1.
- Data Integrity:
  - Enforce cycle prevention on reparent
  - Restrict delete to empty nodes (no children, no attachments)

----------------------------------------------------------------
14) Document Index (Give this file to the engineer)

Primary guide (this file):
- docs/migrations/knowledge-tree/MAIN_MIGRATION_GUIDE.md

All supporting docs:
- Schema (target): docs/migrations/knowledge-tree/prisma-diff.prisma.md
- API specs: docs/migrations/knowledge-tree/api-specs.md
- SQL recipes: docs/migrations/knowledge-tree/sql-recipes.md
- Frontend change map: docs/migrations/knowledge-tree/frontend-changes.md
- Prompt edits: docs/migrations/knowledge-tree/prompts-changes.md
- Tasks checklist: docs/migrations/knowledge-tree/tasks-checklist.md
- Test plan: docs/migrations/knowledge-tree/test-plan.md

Hand this Main Guide to the software engineer along with the folder path. It links to everything needed to execute the migration end-to-end.

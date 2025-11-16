# Knowledge Tree Migration: Remove AcademicYear/Semester, Introduce Flexible Subject Hierarchy

Status: Design package for execution  
Decision: Tree-only hierarchy; unique slug per subject; no soft-delete in v1; compute counts on read (closure table optional follow-up)

## 1) Executive Summary

This migration removes the AcademicYear and Semester tables and decouples Course from academic calendar constructs. It introduces a flexible, arbitrarily deep hierarchy (tree) per Subject using KnowledgeNode and attaches atomic concepts (SyllabusConcepts) to any node. The UX shifts from rigid year/semester selection to a minimalistic knowledge taxonomy tree that supports reorganizing broad subjects (e.g., Philosophy) into smaller, meaningful branches. This package contains the full plan, schema, API design, frontend checklists, prompt changes, SQL recipes, test plan, and an execution checklist for a software engineer to implement.

## 2) Goals and Non-Goals

Goals:
- Remove AcademicYear and Semester from schema and all dependent code paths.
- Update Course to rely only on Subject (no yearId/semesterId).
- Add KnowledgeNode (tree under Subject) and NodeSyllabusConcept junction to attach atomic concepts to nodes.
- Provide new API for managing the tree and attaching concepts.
- Update prompts to remove semester/year dependence and align with taxonomy.
- Update UI flows to remove year/semester and optionally use KnowledgeNode tree.
- Provide end-to-end migration instructions including tests.

Non-Goals:
- Storing materialized counts or using closure tables in v1 (optional v2).
- Supporting DAG (multiple parents) — strictly tree-only v1.
- Implementing soft delete — excluded in v1 to keep minimalistic.

## 3) Current Architecture Snapshot (Impact Surface)

Database (Prisma + Postgres):
- Subject, AcademicYear, Semester, Course, SyllabusConcept, Concept, ConceptMatch, Flashcard, ReviewSession, etc.
- Course: subjectId (required), yearId? (optional), semesterId? (optional).

API routes referring to year/semester:
- app/api/semesters/route.ts (GET list)
- app/api/years/route.ts (GET list)
- app/api/courses/route.ts (includes year and semester fields)
- app/api/user/courses/route.ts (includes year and semester fields)

UI components referencing year/semester:
- app/dashboard/users/add-course-dialog.tsx
- app/orgs/[orgSlug]/(navigation)/users/add-course-dialog.tsx
- app/dashboard/courses/[courseId]/course-flashcards-view.tsx
- app/orgs/[orgSlug]/(navigation)/courses/[courseId]/course-flashcards-view.tsx

Scripts/seed:
- prisma/seed.ts (creates AcademicYear/Semester and wires courses)
- scripts/ingest-generated-courses.ts (upserts AcademicYear/Semester and sets Course.yearId/semesterId)

Master prompts (critical):
- src/master-prompts/syllabus-concept-extraction-prompt.md: references Semester/Academic year
- src/master-prompts/flashcard-generation-prompt.md: subject domain references

Generated Prisma client:
- src/generated/prisma/* (will be regenerated)

Tests/e2e:
- Likely reference year/semester flows in dialogs and displays (must adjust types and expectations).

## 4) Target Architecture

Tree-only hierarchy per Subject:
- KnowledgeNode is an adjacency-list model with parentId (nullable), allowing arbitrary depth.
- NodeSyllabusConcept attaches Course-level SyllabusConcepts to arbitrary nodes in the tree.

Atomic items remain:
- SyllabusConcept is the atomic concept entity (per Course).
- Concept (from video/jobs) and ConceptMatch remain as-is.

### 4.1 Prisma Model Definitions (Diff-Oriented)

Remove these models entirely:
- AcademicYear
- Semester

Alter Course: drop yearId and semesterId

Add:
- KnowledgeNode: hierarchy per subject with unique slug per subject, sibling order, metadata JSON
- NodeSyllabusConcept: many-to-many attachments between nodes and SyllabusConcepts

Proposed Prisma definitions:

```prisma
// Removed models:
// model AcademicYear { ... }  // deleted
// model Semester { ... }      // deleted

model Subject {
  id        String        @id @default(uuid())
  name      String        @unique
  createdAt DateTime      @default(now())
  courses   Course[]
  nodes     KnowledgeNode[]

  @@index([name])
  @@map("subjects")
}

model Course {
  id               String            @id @default(uuid())
  code             String            @unique
  name             String
  subjectId        String
  ueNumber         String?
  syllabusUrl      String?
  createdAt        DateTime          @default(now())
  subject          Subject           @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  reviewSessions   ReviewSession[]
  syllabusConcepts SyllabusConcept[]
  enrollments      UserCourse[]

  @@index([subjectId])
  @@map("courses")
}

model KnowledgeNode {
  id         String          @id @default(uuid())
  subjectId  String
  parentId   String?
  name       String
  slug       String?         // unique per subject when present
  order      Int             @default(0) // for sibling ordering
  metadata   Json?
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  subject    Subject         @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  parent     KnowledgeNode?  @relation("NodeToParent", fields: [parentId], references: [id])
  children   KnowledgeNode[] @relation("NodeToParent")
  concepts   NodeSyllabusConcept[]

  @@index([subjectId, parentId, order])
  @@index([subjectId])
  @@index([parentId])
  @@unique([subjectId, slug]) // enforces unique slug within a subject
  @@map("knowledge_nodes")
}

model NodeSyllabusConcept {
  nodeId           String
  syllabusConceptId String
  addedByUserId    String?
  createdAt        DateTime @default(now())

  node             KnowledgeNode   @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  syllabusConcept  SyllabusConcept @relation(fields: [syllabusConceptId], references: [id], onDelete: Cascade)

  @@id([nodeId, syllabusConceptId])
  @@index([nodeId])
  @@index([syllabusConceptId])
  @@map("node_syllabus_concepts")
}
```

Notes:
- slug is optional to allow drafts, but when set must be unique within a subject via @@unique([subjectId, slug]).
- No soft delete in v1: keep the model simple and lean.
- Counts computed on read (see SQL recipes). Closure table optional v2.

### 4.2 Indexing

- KnowledgeNode: (subjectId, parentId, order), (parentId), (subjectId), unique composite (subjectId, slug).
- NodeSyllabusConcept: (nodeId), (syllabusConceptId).
- Course: keep (subjectId).

## 5) API Design (New + Changes)

Remove entirely:
- GET /api/semesters
- GET /api/years

Update:
- GET /api/courses and GET /api/user/courses: remove yearId, semesterId fields and any nested year/semester objects.

Add KnowledgeNode API (all secured with existing auth)
- List children
  - GET /api/subjects/:subjectId/nodes?parentId=null|{uuid}
  - Response: { nodes: KnowledgeNode[] }
- Get subtree (optional depth)
  - GET /api/subjects/:subjectId/nodes/tree?parentId=null|{uuid}&amp;depth={int|full}
  - Response: nested tree JSON (beware large payloads; consider limiting depth)
- Create node
  - POST /api/subjects/:subjectId/nodes
  - Body: { parentId?: string | null, name: string, slug?: string, order?: number, metadata?: Record<string,unknown> }
  - Response: { node }
- Update node (rename/reparent/reorder/slug/metadata)
  - PATCH /api/subjects/:subjectId/nodes/:nodeId
  - Body: { name?: string, parentId?: string | null, order?: number, slug?: string | null, metadata?: Record<string,unknown> }
  - Constraints: prevent cycles (see SQL recipes)
  - Response: { node }
- Delete node
  - DELETE /api/subjects/:subjectId/nodes/:nodeId
  - Policy: v1 allow hard delete only if node has no children and no attachments; otherwise 400
  - Response: { ok: true }
- Attach concepts
  - POST /api/subjects/:subjectId/nodes/:nodeId/concepts
  - Body: { syllabusConceptIds: string[] }
  - Response: { attached: number }
- Detach concept
  - DELETE /api/subjects/:subjectId/nodes/:nodeId/concepts/:syllabusConceptId
  - Response: { ok: true }

Responses (shape example):
```json
{
  "node": {
    "id": "uuid",
    "subjectId": "uuid",
    "parentId": null,
    "name": "Epistemology",
    "slug": "epistemology",
    "order": 10,
    "metadata": null,
    "createdAt": "2025-11-15T10:10:10.000Z",
    "updatedAt": "2025-11-15T10:10:10.000Z"
  }
}
```

Errors:
- 400 on validation (duplicate slug in subject, cycle detected, delete non-empty node)
- 401 on auth
- 403 if subject access not allowed
- 404 if subject/node not found

## 6) Frontend Changes

Remove academic year/semester flows from dialogs and displays.

6.1 Add-course dialogs:
- app/dashboard/users/add-course-dialog.tsx
- app/orgs/[orgSlug]/(navigation)/users/add-course-dialog.tsx
Changes:
- Remove types AcademicYear, Semester and associated state.
- Remove steps and handlers for year and semester selection.
- Course creation uses Subject only (keep existing subject step).
- Optional: add KnowledgeNode picker to suggest initial node for concept attachments (non-blocking in v1).

6.2 Course flashcards view:
- app/dashboard/courses/[courseId]/course-flashcards-view.tsx
- app/orgs/[orgSlug]/(navigation)/courses/[courseId]/course-flashcards-view.tsx
Changes:
- Remove rendering of course.year / course.semester.
- If available, render a KnowledgeNode breadcrumb for attached SyllabusConcepts (optional in v1; can fallback to Subject name only).

6.3 New (optional) Knowledge Tree Manager UI (can be phase 2)
- Subject-level page to manage KnowledgeNodes:
  - List roots, expand/collapse children
  - Inline create/rename
  - Drag/drop reparent (optimistic UI)
  - Sibling reordering
  - Concept counts (computed on read)
- Lazy load children; avoid full-tree render for large subjects.

## 7) Scripts and Seed Updates

7.1 prisma/seed.ts:
- Remove creation of AcademicYear and Semester.
- Seed Subjects (unchanged).
- Seed Courses with subjectId only (no year/semester mapping).
- Optionally seed a basic KnowledgeNode skeleton for demo subjects.

7.2 scripts/ingest-generated-courses.ts:
- Remove upsert/find for AcademicYear and Semester.
- Update input signatures to drop yearId, semesterId.
- Upsert Course with: code, name, subjectId, ueNumber?, syllabusUrl?.

## 8) Master Prompts (Critical)

8.1 Replace semester/year guidance with knowledge taxonomy hints.

File: src/master-prompts/syllabus-concept-extraction-prompt.md  
Edits (example replacement block):

```
- Input Metadata Previously Required:
- 1. Course Metadata: Subject, academic year, semester, course details
+ Input Metadata:
+ 1. Course Metadata: Subject and course details (ignore academic year and semester)
  2. Concepts Array: 20-35 atomic, testable concepts with categorization

- Subject Validation:
+ Subject Validation:
  - [ ] Subject name is a standard academic discipline
  - [ ] Name is properly capitalized

- Semester Validation:
-  - [ ] Semester number is integer 1-6
-  - [ ] Matches course level appropriately
+ Knowledge Taxonomy (Optional but Recommended):
+  - For each concept, propose a category path under the Subject (e.g., ["Philosophy", "Epistemology", "Sources of Knowledge"]).
+  - Paths should be coherent and reusable. If uncertain, cluster concepts into 2-4 broad categories with clear names.

Guidance Update:
- Remove references such as "Fall Semester, Sophomore Year", "Semester 1-6".
- Emphasize atomicity and clarity of concepts.
- Encourage grouping by meaningful knowledge branches, not time-based structures.
```

8.2 Update flashcard-generation-prompt.md

Edits (example replacement block):

```
- 4. Subject Domain: Determines appropriate question style
+ 4. Subject Domain & Optional Node Context:
+    Use the Subject domain to tailor difficulty and terminology.
+    If a KnowledgeNode path is available for the concept, bias examples and phrasing to that subdomain's scope.

Subject-Specific Considerations:
- (unchanged)
+ If Node path is provided (e.g., Philosophy → Epistemology → Skepticism), keep questions scoped and avoid jumping to distant subfields.
```

Ensure any examples referencing semesters/years are removed or reframed.

## 9) SQL Recipes (Adjacency List + Recursive CTEs)

9.1 Fetch children:
```sql
SELECT *
FROM knowledge_nodes
WHERE subject_id = $1 AND ((parent_id IS NULL AND $2::uuid IS NULL) OR parent_id = $2)
ORDER BY "order" ASC, name ASC;
```

9.2 Breadcrumb (ancestors root→node):
```sql
WITH RECURSIVE ancestors AS (
  SELECT id, parent_id, name, slug, 0 AS depth
  FROM knowledge_nodes
  WHERE id = $1
  UNION ALL
  SELECT kn.id, kn.parent_id, kn.name, kn.slug, a.depth + 1
  FROM knowledge_nodes kn
  JOIN ancestors a ON kn.id = a.parent_id
)
SELECT id, name, slug
FROM ancestors
ORDER BY depth DESC;
```

9.3 Subtree (descendants including self):
```sql
WITH RECURSIVE subtree AS (
  SELECT id, parent_id, name, slug, 0 AS depth
  FROM knowledge_nodes
  WHERE id = $1
  UNION ALL
  SELECT kn.id, kn.parent_id, kn.name, kn.slug, s.depth + 1
  FROM knowledge_nodes kn
  JOIN subtree s ON kn.parent_id = s.id
)
SELECT * FROM subtree;
```

9.4 Cycle prevention on reparent:
```sql
-- check that $new_parent_id is not in the subtree of $node_id
WITH RECURSIVE subtree AS (
  SELECT id
  FROM knowledge_nodes
  WHERE id = $1 -- node_id
  UNION ALL
  SELECT kn.id
  FROM knowledge_nodes kn
  JOIN subtree s ON kn.parent_id = s.id
)
SELECT EXISTS (
  SELECT 1 FROM subtree WHERE id = $2 -- new_parent_id
) AS new_parent_in_subtree;
-- reject if true
```

9.5 Aggregate count of attached concepts in subtree (compute on read):
```sql
WITH RECURSIVE subtree AS (
  SELECT id FROM knowledge_nodes WHERE id = $1
  UNION ALL
  SELECT kn.id
  FROM knowledge_nodes kn
  JOIN subtree s ON kn.parent_id = s.id
)
SELECT COUNT(DISTINCT nsc.syllabus_concept_id) AS concept_count
FROM subtree st
LEFT JOIN node_syllabus_concepts nsc ON nsc.node_id = st.id;
```

## 10) Implementation Steps (Engineer Checklist)

Branching:
- Create branch: blackboxai/knowledge-tree-migration

Database & Prisma:
- Edit prisma/schema/schema.prisma:
  - Remove AcademicYear and Semester
  - Update Course (drop yearId, semesterId)
  - Add KnowledgeNode, NodeSyllabusConcept
  - Add indexes/unique as defined
- Run:
  - npx prisma migrate dev --name knowledge-tree_init
  - npx prisma generate

API:
- Delete app/api/semesters/route.ts and app/api/years/route.ts
- Update app/api/courses/route.ts and app/api/user/courses/route.ts to drop year/semester fields/includes
- Add new routes:
  - app/api/subjects/[subjectId]/nodes/route.ts (GET list, POST create)
  - app/api/subjects/[subjectId]/nodes/tree/route.ts (GET subtree)
  - app/api/subjects/[subjectId]/nodes/[nodeId]/route.ts (PATCH update, DELETE delete)
  - app/api/subjects/[subjectId]/nodes/[nodeId]/concepts/route.ts (POST attach)
  - app/api/subjects/[subjectId]/nodes/[nodeId]/concepts/[syllabusConceptId]/route.ts (DELETE detach)
- Reuse getUser and existing auth patterns.

Frontend:
- app/dashboard/users/add-course-dialog.tsx: remove year/semester types/state/steps
- app/orgs/[orgSlug]/(navigation)/users/add-course-dialog.tsx: same changes
- app/dashboard/courses/[courseId]/course-flashcards-view.tsx: remove semester/year display; optional node breadcrumb
- app/orgs/[orgSlug]/(navigation)/courses/[courseId]/course-flashcards-view.tsx: same
- Optional: Add subject tree manager UI in phase 2

Scripts/Seed:
- prisma/seed.ts: remove year/semester seeding; adjust course creation
- scripts/ingest-generated-courses.ts: drop AcademicYear/Semester logic and parameters

Master Prompts:
- Update src/master-prompts/syllabus-concept-extraction-prompt.md as specified
- Update src/master-prompts/flashcard-generation-prompt.md as specified

Generated Client:
- Ensure src/generated/prisma/* regenerated by prisma generate

Tests:
- Update unit tests referencing year/semester types and displays
- Update e2e flows for add-course dialog and course view displays

Docs:
- Update README/CHANGELOG with migration summary

## 11) Test Plan

Unit:
- KnowledgeNode CRUD:
  - Create child under subject, sibling ordering respected
  - Rename, reorder, reparent (no cycles)
  - Delete empty node; reject delete when children or attachments exist
- NodeSyllabusConcept:
  - Attach single/multiple; ignore duplicates gracefully
  - Detach removes mapping
- API contracts:
  - Nodes list/subtree endpoints enforce subject scoping and auth
  - Validation errors on duplicate slug (within subject), invalid parent, cycle

Integration:
- Seed/ingest run without year/semester paths
- Course APIs return expected shape without yearId/semesterId

E2E:
- Add-course dialog runs without year/semester; selects Subject and creates course
- Course view renders without semester/year; renders Subject name (and optional breadcrumb once attached)
- KnowledgeNode endpoints exercised via simple UI or API tests

Performance:
- Child listing and breadcrumb queries execute within acceptable time on sample dataset
- Subtree fetch with bounded depth behaves well

## 12) Acceptance Criteria

- Schema contains KnowledgeNode and NodeSyllabusConcept; AcademicYear and Semester are removed; Course has no yearId/semesterId.
- Prisma client compiles; typecheck passes.
- API routes for years/semesters removed; new KnowledgeNode endpoints implemented with auth.
- UI add-course dialogs no longer mention year/semester and still create courses successfully.
- Course views render without year/semester.
- Seed and ingestion scripts run without year/semester logic.
- Master prompts contain no semester/year requirements and include taxonomy guidance.
- Unit/integration/e2e tests updated and passing.

## 13) Rollback Plan

- Revert branch blackboxai/knowledge-tree-migration.
- npx prisma migrate reset (if test env).
- Restore deleted API/seed/scripts and prompt references from main.

## 14) Open Questions and Decisions

- Tree vs DAG: Tree only (decision).
- Unique slug: Unique per subject via @@unique([subjectId, slug]) (decision).
- Soft delete: Not in v1 (inferred from minimalistic project approach).
- Counts: Compute on read using SQL with recursive CTE; consider closure table/materialized path in v2 if needed (inferred).

## 15) Example Payloads

Create node:
```http
POST /api/subjects/6b3d.../nodes
Content-Type: application/json

{
  "parentId": null,
  "name": "Epistemology",
  "slug": "epistemology",
  "order": 10
}
```

Attach concepts:
```http
POST /api/subjects/6b3d.../nodes/0f2c.../concepts
Content-Type: application/json

{
  "syllabusConceptIds": ["a1b2...", "c3d4..."]
}
```

## 16) Future Enhancements (Optional v2)

- Closure table NodeClosure for O(1)-ish ancestor/descendant queries and counts.
- Materialized path (or Postgres ltree) if very large hierarchies emerge.
- Soft delete (deletedAt) with filtered queries.
- Node-level access control if required.

## 17) Execution Commands (Summary)

- Update Prisma models as defined
- Run:
  - npx prisma migrate dev --name knowledge-tree_init
  - npx prisma generate
- Update/delete API routes as listed
- Update UI components and prompts
- Run tests:
  - pnpm test
  - pnpm typecheck
  - pnpm e2e (if configured)

---
This document is the context package for the implementing engineer. It includes the target schema, API specs, frontend changes, prompt edits, SQL recipes, tests, and a detailed checklist to execute the migration safely in a dedicated branch without ambiguity.

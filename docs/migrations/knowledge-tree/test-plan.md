# Knowledge Tree Migration — Test Plan

Scope: Validate removal of AcademicYear/Semester, addition of KnowledgeNode + NodeSyllabusConcept, API rewiring, UI removal of legacy flows, scripts updates, and prompt refactors. Ensure type-safety, functional correctness, and performance of key operations.

References:
- README: docs/migrations/knowledge-tree/README.md
- Prisma target schema: docs/migrations/knowledge-tree/prisma-diff.prisma.md
- API contracts: docs/migrations/knowledge-tree/api-specs.md
- SQL patterns: docs/migrations/knowledge-tree/sql-recipes.md
- Frontend changes: docs/migrations/knowledge-tree/frontend-changes.md
- Prompts changes: docs/migrations/knowledge-tree/prompts-changes.md
- Engineer checklist: docs/migrations/knowledge-tree/tasks-checklist.md

Environments:
- Local dev with Postgres (DATABASE_URL)
- CI (optional, if configured)

============================================================
0) Pre-checks

- [ ] Prisma: npx prisma migrate dev --name knowledge-tree_init (applied)
- [ ] npx prisma generate completed successfully
- [ ] pnpm typecheck passes
- [ ] pnpm test runs baseline suite
- [ ] Dev server starts: pnpm dev

============================================================
1) Unit Tests

A) KnowledgeNode CRUD
- [ ] Create root node
  - Input: { subjectId, parentId: null, name: "Epistemology", slug: "epistemology" }
  - Expect: 201, node persisted; unique (subjectId, slug) enforced
- [ ] Create child node
  - Input: parentId = root.id
  - Expect: child persisted with parentId
- [ ] Sibling ordering default
  - Create multiple siblings without specifying order
  - Expect: order values to increase with gaps (e.g., +10)
- [ ] Rename node
  - PATCH name; expect updated name
- [ ] Slug set/clear
  - PATCH slug to a new kebab-case value; expect unique within subject
  - PATCH slug to null; expect nullable allowed if schema permits

B) Reparent and Cycle Prevention
- [ ] Reparent within same subject
  - Move child under new parent; expect parentId updated
- [ ] Cross-subject parenting
  - Attempt reparent to a node from a different subject; expect 400/403
- [ ] Cycle prevention
  - Attempt to set new parent to a descendant; expect 400 (cycle detected)

C) Delete Policy
- [ ] Delete empty node
  - Node without children/attachments; expect success
- [ ] Reject delete with children
  - Expect 400 with message
- [ ] Reject delete with attachments
  - Attach a concept; expect 400

D) NodeSyllabusConcept
- [ ] Attach multiple concepts (upsert)
  - Send duplicates; expect idempotent behavior (no errors)
- [ ] Detach a concept
  - Expect mapping removed
- [ ] Attach invalid concept id
  - Expect 404 or 400 (depending on handler policy)

E) Read Recipes
- [ ] List children by parentId
  - Ensure order by (order asc, name asc)
- [ ] Breadcrumb to root
  - Validate recursive CTE returns correct sequence
- [ ] Subtree depth-limited
  - Validate depth filter works; avoid full-tree payload

============================================================
2) Integration Tests

A) API Routes
- [ ] /api/semesters and /api/years return 404 (routes removed)
- [ ] /api/courses (updated shape)
  - Ensure fields yearId, semesterId absent
  - subject still included
- [ ] /api/user/courses (updated shape)
  - Same assertions as above

B) KnowledgeNode API
- [ ] GET /api/subjects/:subjectId/nodes?parentId=null
  - Return roots; ordered
- [ ] POST /api/subjects/:subjectId/nodes
  - Create node; unique slug enforced
- [ ] GET /api/subjects/:subjectId/nodes/tree?depth=2
  - Returns nested structure with bounded depth
- [ ] PATCH /api/subjects/:subjectId/nodes/:nodeId (reparent)
  - Validate subject check and cycle guard
- [ ] DELETE /api/subjects/:subjectId/nodes/:nodeId
  - Enforce empty-only delete policy
- [ ] POST /api/subjects/:subjectId/nodes/:nodeId/concepts
  - Attach; returns attached count
- [ ] DELETE /api/subjects/:subjectId/nodes/:nodeId/concepts/:syllabusConceptId
  - Detach

C) Auth/Authorization
- [ ] Unauthenticated requests → 401
- [ ] Authenticated without permissions → 403 (reuse subject/org checks)
- [ ] Subject scoping: reject cross-subject operations

============================================================
3) E2E Tests

Preconditions:
- Seed DB with Subjects and some Courses (no year/semester); optionally KnowledgeNodes
- User account exists and can sign in

Flows:
- [ ] Add-course dialog (both locations)
  - app/dashboard/users/add-course-dialog.tsx
  - app/orgs/[orgSlug]/(navigation)/users/add-course-dialog.tsx
  - Expect:
    - No steps for AcademicYear/Semester
    - Subject selection only; course creation succeeds
- [ ] Course page views
  - app/dashboard/courses/[courseId]/course-flashcards-view.tsx
  - app/orgs/[orgSlug]/(navigation)/courses/[courseId]/course-flashcards-view.tsx
  - Expect:
    - No references to course.year or course.semester
    - Subject name visible
- [ ] (Optional phase 2) Knowledge tree manager
  - Create node, rename, reparent (drag/drop), delete empty
  - Verify concept counts appear (computed on read)

============================================================
4) Performance Tests

- [ ] List children query timing
  - Populate subject with 200+ nodes in a single parent
  - Ensure response time is acceptable (<150ms local)
- [ ] Breadcrumb CTE timing
  - Deep chain of 10-20 levels; retrieve breadcrumb; acceptable latency
- [ ] Subtree depth=2 timing
  - Tree of ~1000 nodes unevenly distributed; depth-limited returns <300ms local

============================================================
5) Regression Tests

- [ ] Enrollment flows unaffected by removed year/semester fields
  - UserCourse creation remains valid (subjectId still present on course)
- [ ] Flashcard generation flow (unchanged schema)
  - Verify flashcards can still be generated from ConceptMatch
- [ ] Review sessions unaffected
  - Creating review sessions continues to work

============================================================
6) Prompts Validation (Manual QA)

- [ ] src/master-prompts/syllabus-concept-extraction-prompt.md
  - No references to Academic Year/Semester (removed)
  - Primary Objective no longer lists year/semester
  - If enabling optional proposedCategoryPath, ensure backend ignores unknown fields or gate rollout
- [ ] src/master-prompts/flashcard-generation-prompt.md
  - Context Integration mentions optional nodePath in course
  - Examples updated (at least one with nodePath phrasing)

============================================================
7) Tooling and Type Safety

- [ ] Prisma client regenerated; no duplicate model errors (ensure no extra .prisma files in generated paths)
- [ ] TypeScript typecheck passes: pnpm typecheck
- [ ] Lint passes: pnpm run lint

Note: The earlier docs/migrations/knowledge-tree/prisma-diff.prisma file caused Prisma Language Server duplicate model warnings. That file has been removed and replaced with docs-only prisma-diff.prisma.md.

============================================================
8) Test Data Seeding

- [ ] Update prisma/seed.ts to create Subjects and Courses without year/semester
- [ ] Optionally seed a simple tree for a Subject:
  - Philosophy → Epistemology, Ethics, Metaphysics
  - Attach 1-2 SyllabusConcepts to each node for API tests

============================================================
9) Acceptance Checklist

- [ ] All unit tests green
- [ ] Integration tests validate API contracts
- [ ] E2E flows pass without references to years/semesters
- [ ] Performance within acceptable bounds for adjacency list with CTEs
- [ ] Prompts updated and linted for content
- [ ] Documentation in docs/migrations/knowledge-tree is complete and current

============================================================
10) Example Test Snippets

A) Cycle prevention (jest + Prisma raw):
```ts
const [{ parent_in_subtree }] = await prisma.$queryRawUnsafe<{ parent_in_subtree: boolean }[]>(\`
WITH RECURSIVE subtree AS (
  SELECT id FROM knowledge_nodes WHERE id = $1
  UNION ALL
  SELECT kn.id FROM knowledge_nodes kn JOIN subtree s ON kn.parent_id = s.id
)
SELECT EXISTS (SELECT 1 FROM subtree WHERE id = $2) AS parent_in_subtree;
\`, nodeId, newParentId);
expect(parent_in_subtree).toBe(false);
```

B) Delete policy:
```ts
await expect(apiDeleteNode(nodeWithChildrenId)).rejects.toThrow(/children|attachments/i);
```

C) Child ordering with gaps:
```ts
const siblings = await prisma.knowledgeNode.findMany({ where: { subjectId, parentId }, orderBy: [{ order: 'asc' }] });
for (let i = 1; i < siblings.length; i++) {
  expect(siblings[i].order).toBeGreaterThan(siblings[i-1].order);
}
```

============================================================

Execution order recommendation:
1. Run unit tests (fast feedback)
2. Run integration tests (API shape correctness)
3. Run E2E (user flows)
4. Run performance tests (targeted queries)
5. Validate prompts (manual review)

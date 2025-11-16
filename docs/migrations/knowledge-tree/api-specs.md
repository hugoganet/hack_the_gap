# Knowledge Tree API Specifications

Scope: Introduce KnowledgeNode CRUD and concept attachment APIs; remove legacy year/semester APIs; adjust course APIs to drop year/semester fields.

Auth: Reuse existing getUser() and subject/org permission checks. All endpoints require authenticated user.

Base Path: /api/subjects/:subjectId/nodes

Common validations:
- subjectId is a valid Subject the user can access.
- nodeId belongs to subjectId when present.
- Slug must be unique per subject (when provided).
- On reparent, prevent cycles and cross-subject parenting.

Error codes:
- 400: validation errors (duplicate slug, cycle, delete non-empty, parent mismatch)
- 401: unauthenticated
- 403: unauthorized for subject/org
- 404: resource not found (subject/node)

Dates serialized as ISO strings.

------------------------------------------------------------
1) List Children
GET /api/subjects/:subjectId/nodes?parentId={uuid|null}

Query params:
- parentId: uuid or literal "null" (omit or "null" for roots)

Response 200:
{
  "nodes": [
    {
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
  ]
}

Notes:
- Ordered by (order asc, name asc)
- Consider pagination if sibling count is large (not required v1)

------------------------------------------------------------
2) Get Subtree (bounded depth)
GET /api/subjects/:subjectId/nodes/tree?parentId={uuid|null}&depth={int|full}

Query params:
- parentId: uuid or "null" (defaults to null)
- depth: integer >= 1; or "full" to return entire subtree (use with caution)

Response 200:
{
  "tree": [
    {
      "node": { ...KnowledgeNode },
      "children": [
        { "node": { ... }, "children": [ ... ] }
      ]
    }
  ]
}

Notes:
- If depth not provided, default to 2.
- Avoid full tree for large subjects; recommend clients use lazy loading.

------------------------------------------------------------
3) Create Node
POST /api/subjects/:subjectId/nodes

Body:
{
  "parentId": "uuid" | null,
  "name": "string",
  "slug": "string | null",
  "order": 10,                    // optional
  "metadata": { ... }             // optional JSON
}

Validations:
- name: required, 1..200 chars
- slug: optional; if provided, kebab-case; unique within subject
- parentId: must be null or a node within same subject
- order: optional; if missing, set to (max sibling order + 10)

Response 201:
{ "node": { ...KnowledgeNode } }

Errors:
- 400 duplicate slug, invalid parent

------------------------------------------------------------
4) Update Node (rename, reparent, reorder, slug, metadata)
PATCH /api/subjects/:subjectId/nodes/:nodeId

Body (any subset):
{
  "name": "string",
  "parentId": "uuid" | null,
  "order": 20,
  "slug": "string|null",
  "metadata": { ... }
}

Validations:
- Slug uniqueness within subject (if provided, including null to clear).
- Cycle prevention on reparent using recursive CTE.
- Cross-subject parenting not allowed.
- order: integer.

Response 200:
{ "node": { ...KnowledgeNode } }

Errors:
- 400: cycle detected; duplicate slug; invalid parent
- 404: node not found

------------------------------------------------------------
5) Delete Node
DELETE /api/subjects/:subjectId/nodes/:nodeId

Policy v1:
- Hard delete allowed only when node has no children and no attached concepts.

Response 200:
{ "ok": true }

Errors:
- 400: node has children or attachments
- 404: node not found

------------------------------------------------------------
6) Attach Concepts
POST /api/subjects/:subjectId/nodes/:nodeId/concepts

Body:
{
  "syllabusConceptIds": ["uuid", "uuid", ...]
}

Behavior:
- Upsert NodeSyllabusConcept per id; ignore duplicates.

Response 200:
{ "attached": 3 }

Errors:
- 400: empty array, concept not found, concepts not in same subject's courses (optional stricter check)
- 404: node not found

------------------------------------------------------------
7) Detach Concept
DELETE /api/subjects/:subjectId/nodes/:nodeId/concepts/:syllabusConceptId

Response 200:
{ "ok": true }

Errors:
- 404: mapping not found

------------------------------------------------------------
8) Course APIs (adjustments)

Remove legacy AcademicYear/Semester:
- DELETE: app/api/semesters/route.ts
- DELETE: app/api/years/route.ts

Update course listing endpoints:
- app/api/courses/route.ts
- app/api/user/courses/route.ts

Changes:
- Drop fields: yearId, semesterId
- Drop nested: course.year, course.semester
- Keep: subjectId and subject info

Example response changes in app/api/courses/route.ts:
- Before:
  {
    "course": {
      "id": "...",
      "subjectId": "...",
      "yearId": "...",
      "semesterId": "...",
      "semester": { "number": ... },
      "year": { "name": ... }
    }
  }
- After:
  {
    "course": {
      "id": "...",
      "subjectId": "...",
      "subject": { "id": "...", "name": "..." }
    }
  }

Optional future enhancement:
- Provide a derived breadcrumb from KnowledgeNode via a separate endpoint if the UI needs it for display.

------------------------------------------------------------
9) Security and Access Control

- Use getUser() for auth, return 401 if not logged in.
- Authorize access to subject:
  - If subjects are scoped by org, reuse existing org checks (see course creation/access path).
- For create/update/delete:
  - Enforce edit permissions at subject scope (role/owner/admin).

------------------------------------------------------------
10) Validation & Error Mapping

400 Bad Request examples:
- slug already exists for subject
- parentId cross-subject or non-existent
- reparent creates a cycle
- delete non-empty node
- attach concepts: invalid id list or not found

401 Unauthorized: unauthenticated user

403 Forbidden: subject not accessible by user

404 Not Found: subject or node missing

------------------------------------------------------------
11) Implementation Outline (Next.js App Routes)

- app/api/subjects/[subjectId]/nodes/route.ts
  - GET (list children): parses parentId, returns nodes
  - POST (create): validates, computes default order, returns node

- app/api/subjects/[subjectId]/nodes/tree/route.ts
  - GET: parses depth and parentId, uses recursive CTE via prisma.$queryRaw

- app/api/subjects/[subjectId]/nodes/[nodeId]/route.ts
  - PATCH: rename/reparent/reorder/slug/metadata with validations
  - DELETE: enforce empty node policy

- app/api/subjects/[subjectId]/nodes/[nodeId]/concepts/route.ts
  - POST: attach array of SyllabusConcept ids

- app/api/subjects/[subjectId]/nodes/[nodeId]/concepts/[syllabusConceptId]/route.ts
  - DELETE: detach

Common utilities:
- auth/permissions: reuse getUser and subject/org checks
- validation: zod schemas for payloads
- cycle check: recursive CTE (see sql-recipes.md)
- slug normalization utility

------------------------------------------------------------
12) Rate Limiting / Observability

- Optional: apply existing rate limiter middleware to POST/PATCH/DELETE
- Log reparent and delete events with userId and node ids
- Consider analytics on node counts and depths per subject

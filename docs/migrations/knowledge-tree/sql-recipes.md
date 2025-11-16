# SQL and Prisma Recipes for Knowledge Tree (Adjacency List)

This document provides concrete SQL (PostgreSQL) and Prisma client patterns to implement and operate the tree-only hierarchy under Subject using KnowledgeNode and NodeSyllabusConcept. It also includes validation guards (cycle prevention), ordering, and concept attachment patterns.

Assumptions:
- Tables:
  - knowledge_nodes(id, subject_id, parent_id, name, slug, order, metadata, created_at, updated_at)
  - node_syllabus_concepts(node_id, syllabus_concept_id, added_by_user_id, created_at)
- Prisma models as in prisma-diff.prisma (doc-only spec)

Note: This plan computes counts on read via recursive CTEs. A closure table optimization (NodeClosure) can be added in v2 if needed.

## 1) Index DDL (ensure performance)

```sql
-- KnowledgeNode useful indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_subject_parent_order
  ON knowledge_nodes(subject_id, parent_id, "order");
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_parent
  ON knowledge_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_subject
  ON knowledge_nodes(subject_id);

-- Enforce unique slug within subject (already enforced in Prisma via @@unique([subjectId, slug]))
-- CREATE UNIQUE INDEX ux_knowledge_nodes_subject_slug
--   ON knowledge_nodes(subject_id, slug) WHERE slug IS NOT NULL;

-- Attachments
CREATE INDEX IF NOT EXISTS idx_node_syllabus_concepts_node
  ON node_syllabus_concepts(node_id);
CREATE INDEX IF NOT EXISTS idx_node_syllabus_concepts_concept
  ON node_syllabus_concepts(syllabus_concept_id);
```

## 2) Core Read Queries

### 2.1 List children of a parent

```sql
SELECT id, subject_id, parent_id, name, slug, "order", metadata, created_at, updated_at
FROM knowledge_nodes
WHERE subject_id = $1
  AND ( (parent_id IS NULL AND $2::uuid IS NULL) OR parent_id = $2 )
ORDER BY "order" ASC, name ASC;
-- $1 = subjectId, $2 = parentId (nullable)
```

Prisma:
```ts
const nodes = await prisma.knowledgeNode.findMany({
  where: { subjectId, parentId },
  orderBy: [{ order: "asc" }, { name: "asc" }],
});
```

### 2.2 Ancestor breadcrumb (root → node)

```sql
WITH RECURSIVE ancestors AS (
  SELECT id, parent_id, name, slug, 0 as depth
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
-- $1 = nodeId
```

Prisma (raw):
```ts
const breadcrumb = await prisma.$queryRawUnsafe<any[]>(`
WITH RECURSIVE ancestors AS (
  SELECT id, parent_id, name, slug, 0 as depth
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
`, nodeId);
```

### 2.3 Subtree (descendants including self)

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
-- $1 = nodeId
```

### 2.4 Subtree limited depth (for pagination/lazy rendering)

```sql
WITH RECURSIVE subtree AS (
  SELECT id, parent_id, name, slug, 0 AS depth
  FROM knowledge_nodes
  WHERE id = $1
  UNION ALL
  SELECT kn.id, kn.parent_id, kn.name, kn.slug, s.depth + 1
  FROM knowledge_nodes kn
  JOIN subtree s ON kn.parent_id = s.id
  WHERE s.depth + 1 <= $2
)
SELECT * FROM subtree;
-- $1 = nodeId, $2 = maxDepth (e.g., 2)
```

## 3) Validation and Write Patterns

### 3.1 Cycle prevention before reparent

Ensure the new parent is not a descendant of the node being moved.

```sql
WITH RECURSIVE subtree AS (
  SELECT id
  FROM knowledge_nodes
  WHERE id = $1  -- node_id
  UNION ALL
  SELECT kn.id
  FROM knowledge_nodes kn
  JOIN subtree s ON kn.parent_id = s.id
)
SELECT EXISTS (
  SELECT 1 FROM subtree WHERE id = $2  -- new_parent_id
) AS parent_in_subtree;
```

If `parent_in_subtree = true`, reject with 400.

Prisma (raw):
```ts
const [{ parent_in_subtree }] = await prisma.$queryRawUnsafe<{ parent_in_subtree: boolean }[]>(`
WITH RECURSIVE subtree AS (
  SELECT id FROM knowledge_nodes WHERE id = $1
  UNION ALL
  SELECT kn.id FROM knowledge_nodes kn JOIN subtree s ON kn.parent_id = s.id
)
SELECT EXISTS (SELECT 1 FROM subtree WHERE id = $2) AS parent_in_subtree;
`, nodeId, newParentId);

if (parent_in_subtree) throw new Error("Cycle detected");
```

### 3.2 Reparent transaction pattern

- Validate subject consistency (node, new parent belong to the same subject).
- Validate cycle prevention.
- Update parentId (and optionally order).

```ts
await prisma.$transaction(async (tx) => {
  const node = await tx.knowledgeNode.findUniqueOrThrow({ where: { id: nodeId } });
  const parent = newParentId
    ? await tx.knowledgeNode.findUniqueOrThrow({ where: { id: newParentId } })
    : null;
  if (parent && parent.subjectId !== node.subjectId) {
    throw new Error("Cross-subject parenting not allowed");
  }

  const [{ parent_in_subtree }] = await tx.$queryRawUnsafe<{ parent_in_subtree: boolean }[]>(`
  WITH RECURSIVE subtree AS (
    SELECT id FROM knowledge_nodes WHERE id = $1
    UNION ALL
    SELECT kn.id FROM knowledge_nodes kn JOIN subtree s ON kn.parent_id = s.id
  )
  SELECT EXISTS (SELECT 1 FROM subtree WHERE id = $2) AS parent_in_subtree;
  `, nodeId, newParentId);

  if (parent_in_subtree) throw new Error("Cycle detected");

  await tx.knowledgeNode.update({
    where: { id: nodeId },
    data: { parentId: newParentId ?? null, order: newOrder ?? 0 },
  });
});
```

### 3.3 Sibling ordering

Use an integer order field. When inserting a new sibling, set `order = (MAX(order) + 10)` to reduce re-numbering.

```sql
SELECT COALESCE(MAX("order"), 0) AS max_order
FROM knowledge_nodes
WHERE subject_id = $1 AND ((parent_id IS NULL AND $2::uuid IS NULL) OR parent_id = $2);
```

Insert with `order = max_order + 10`.

For reorder (drag/drop), update a range of siblings in a single transaction. Keep gaps to minimize writes.

### 3.4 Slug uniqueness per subject

Prisma schema enforces `@@unique([subjectId, slug])`. For optional slugs, ensure nulls are allowed and uniqueness only applies when present.

On rename that changes slug:
- Normalize slug (kebab-case)
- Check availability by querying `findFirst` with same subjectId and slug
- Update node

### 3.5 Create node with optional parent

```ts
const siblingsMax = await prisma.knowledgeNode.aggregate({
  _max: { order: true },
  where: { subjectId, parentId: parentId ?? null },
});
const order = (siblingsMax._max.order ?? 0) + 10;

const node = await prisma.knowledgeNode.create({
  data: {
    subjectId,
    parentId: parentId ?? null,
    name,
    slug: slug ?? null,
    order,
    metadata: metadata ?? undefined,
  },
});
```

### 3.6 Delete constraints

v1 policy: allow delete only if node has no children and no attachments.

```ts
await prisma.$transaction(async (tx) => {
  const childrenCount = await tx.knowledgeNode.count({ where: { parentId: nodeId } });
  if (childrenCount > 0) throw new Error("Cannot delete: node has children");

  const attachCount = await tx.nodeSyllabusConcept.count({ where: { nodeId } });
  if (attachCount > 0) throw new Error("Cannot delete: node has attached concepts");

  await tx.knowledgeNode.delete({ where: { id: nodeId } });
});
```

## 4) Concept Attachment

### 4.1 Attach multiple concepts (ignore duplicates)

```ts
await prisma.$transaction(async (tx) => {
  const values = syllabusConceptIds.map((sid) => ({
    nodeId,
    syllabusConceptId: sid,
    addedByUserId: userId ?? null,
  }));

  for (const v of values) {
    await tx.nodeSyllabusConcept.upsert({
      where: { nodeId_syllabusConceptId: { nodeId: v.nodeId, syllabusConceptId: v.syllabusConceptId } },
      update: {},
      create: v,
    });
  }
});
```

### 4.2 Detach a concept

```ts
await prisma.nodeSyllabusConcept.delete({
  where: { nodeId_syllabusConceptId: { nodeId, syllabusConceptId } },
});
```

### 4.3 Count attached concepts in subtree (computed on read)

```sql
WITH RECURSIVE subtree AS (
  SELECT id FROM knowledge_nodes WHERE id = $1
  UNION ALL
  SELECT kn.id FROM knowledge_nodes kn JOIN subtree s ON kn.parent_id = s.id
)
SELECT COUNT(DISTINCT nsc.syllabus_concept_id) AS concept_count
FROM subtree st
LEFT JOIN node_syllabus_concepts nsc ON nsc.node_id = st.id;
-- $1 = rootNodeId
```

For counts per child in one query, group by node_id:
```sql
WITH children AS (
  SELECT id FROM knowledge_nodes WHERE parent_id = $1
),
subtree AS (
  SELECT id as root_id, id
  FROM children
  UNION ALL
  SELECT s.root_id, kn.id
  FROM knowledge_nodes kn
  JOIN subtree s ON kn.parent_id = s.id
)
SELECT root_id as node_id, COUNT(DISTINCT nsc.syllabus_concept_id) AS concept_count
FROM subtree st
LEFT JOIN node_syllabus_concepts nsc ON nsc.node_id = st.id
GROUP BY root_id;
-- $1 = parentId
```

## 5) Authorization Patterns

- Ensure all operations validate the Subject boundary:
  - The node’s subjectId must match the route subjectId.
  - On reparent, new parent’s subjectId must match node’s subjectId.

- Use existing `getUser()` auth and subject-level authorization checks (reuse patterns from courses endpoints).

## 6) Error Mapping

- 400 Bad Request:
  - Duplicate slug within subject
  - Cycle detected on reparent
  - Delete node with children or attachments
  - Parent not found, or cross-subject parenting

- 401 Unauthorized: unauthenticated user

- 403 Forbidden: user not permitted for the subject’s org/space

- 404 Not Found: subject or node not found

## 7) Optional v2: Closure Table Sketch

If read performance of subtree/ancestor queries becomes critical:

```
model NodeClosure {
  ancestorId   String
  descendantId String
  depth        Int

  ancestor KnowledgeNode @relation("ClosureAncestor", fields: [ancestorId], references: [id], onDelete: Cascade)
  descendant KnowledgeNode @relation("ClosureDescendant", fields: [descendantId], references: [id], onDelete: Cascade)

  @@id([ancestorId, descendantId])
  @@index([ancestorId])
  @@index([descendantId])
  @@map("node_closure")
}
```

Maintenance:
- On create node P with parent U:
  - Insert (P,P,0)
  - For each (A,U,d) in closure: insert (A,P,d+1)
- On reparent: remove closure rows for old ancestor links; insert new ancestor links (requires transaction and careful updates)
- Reads become trivial:
  - Subtree: rows where ancestorId = root
  - Ancestors: rows where descendantId = node

## 8) Known IDE Note

Having multiple .prisma files in the workspace and/or generated Prisma schema under `src/generated/prisma/schema.prisma` may cause the Prisma Language Server to report duplicate model/generator errors. This is expected for documentation artifacts. Recommendation: keep documentation schema as `.md` or `.prisma.txt` to silence IDE diagnostics, or disable Prisma validation for non-active schema files.

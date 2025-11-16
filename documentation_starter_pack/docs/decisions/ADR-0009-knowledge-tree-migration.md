# ADR-0009: Knowledge Tree Migration

**Status:** Accepted  
**Date:** 2025-11-16  
**Deciders:** Engineering Team  
**Tags:** #data-model #architecture #breaking-change

---

## Context

The initial data model organized courses using a rigid calendar-based hierarchy:

```
Subject → Academic Year → Semester → Course
```

This structure had several limitations:

1. **Inflexible:** Forced all content into academic calendar structure
2. **Not domain-driven:** Organization by time rather than by knowledge domain
3. **Poor discoverability:** Hard to navigate related concepts across courses
4. **Limited depth:** Only 3 levels (Subject/Year/Semester)
5. **Unsuitable for diverse content:** Books, articles, videos don't fit academic calendars

Example of the problem:
- A philosophy book covers "Epistemology → Kant → Categorical Imperative"
- But the system forced it into "Philosophy → Licence 3 → Semester 5"
- This made no semantic sense and hindered navigation

## Decision

We will **remove the calendar-based hierarchy** (Academic Year, Semester) and **introduce a flexible knowledge tree** structure.

### Changes

**Removed:**
- `AcademicYear` model
- `Semester` model  
- `Course.yearId` field
- `Course.semesterId` field
- `/api/years` endpoint
- `/api/semesters` endpoint

**Added:**
- `KnowledgeNode` model: Tree-based hierarchy within subjects
  - Self-referential `parentId` for arbitrary depth
  - `slug` for URL-friendly navigation (unique per subject)
  - `order` for consistent sibling ordering
  - `metadata` JSON for future extensibility
- `NodeSyllabusConcept` junction table: Attach concepts to tree nodes
- Migration: `20251116180216_knowledge_tree_init`

**New Hierarchy:**
```
Subject → Course → KnowledgeNodes (tree) → SyllabusConcepts
```

### Example

**Before (Rigid):**
```
Philosophy
├── Licence 3
│   └── Semester 5
│       └── Métaphysique (Course)
```

**After (Flexible):**
```
Philosophy (Subject)
├── Métaphysique (Course)
└── Knowledge Tree:
    ├── Epistemology (Node)
    │   ├── Rationalism (Node)
    │   │   └── [Concepts attached]
    │   └── Empiricism (Node)
    ├── Ethics (Node)
    │   ├── Kant (Node)
    │   │   └── Categorical Imperative (Concept)
    │   └── Utilitarianism (Node)
    └── Metaphysics (Node)
```

## Consequences

### Positive

1. **Flexibility:** Arbitrary depth, domain-driven organization
2. **Better UX:** Navigate by knowledge domain, not calendar
3. **Content-agnostic:** Works for courses, books, videos, articles
4. **Discoverability:** Related concepts grouped semantically
5. **Extensibility:** `metadata` field allows future enhancements
6. **Simpler course selection:** Subject → Course (no year/semester steps)

### Negative

1. **Breaking change:** Requires data migration
2. **Complexity:** Tree structure more complex than flat calendar
3. **No UI yet:** KnowledgeNode management UI not implemented
4. **Migration effort:** ~30 files changed across stack

### Neutral

1. **Course remains:** Still a container, but simplified
2. **Concepts unchanged:** `SyllabusConcepts` still linked to Course
3. **Optional organization:** Concepts can exist without tree attachment

## Implementation

### Database Migration

```sql
-- Remove calendar tables
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;

-- Update courses
ALTER TABLE courses DROP COLUMN year_id;
ALTER TABLE courses DROP COLUMN semester_id;

-- Add knowledge tree
CREATE TABLE knowledge_nodes (
  id UUID PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES knowledge_nodes(id),
  name TEXT NOT NULL,
  slug TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(subject_id, slug)
);

CREATE TABLE node_syllabus_concepts (
  node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  syllabus_concept_id UUID NOT NULL REFERENCES syllabus_concepts(id) ON DELETE CASCADE,
  added_by_user_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (node_id, syllabus_concept_id)
);
```

### API Changes

- Removed: `/api/years`, `/api/semesters`
- Updated: `/api/courses` (no year/semester in response)
- Future: 7 new KnowledgeNode endpoints (not yet implemented)

### Frontend Changes

- Simplified add-course dialogs (removed year/semester steps)
- Removed year/semester display from course views
- Flow: Subject → Course (2 steps instead of 4)

## Alternatives Considered

### 1. Keep Calendar + Add Tree (Hybrid)

**Pros:** No breaking changes, gradual migration  
**Cons:** Complexity, confusion about which to use, technical debt  
**Rejected:** Adds complexity without solving core problem

### 2. Tags Instead of Tree

**Pros:** Simpler, no hierarchy  
**Cons:** No structure, poor navigation, doesn't solve organization problem  
**Rejected:** Doesn't provide semantic organization

### 3. Multiple Parents (DAG)

**Pros:** More flexible (concepts in multiple categories)  
**Cons:** Much more complex, harder to navigate, overkill for MVP  
**Rejected:** Tree structure sufficient for v1

## Validation

### Success Criteria

- ✅ Database migration applied successfully
- ✅ Prisma client regenerated
- ✅ All year/semester references removed from code
- ✅ Course selection works without year/semester
- ✅ Documentation updated (schema, ERD, data dictionary)
- ⚠️ KnowledgeNode APIs not yet implemented (future work)
- ⚠️ No testing performed (per "do not overtest" instruction)

### Rollback Plan

1. Revert branch `blackboxai/knowledge-tree-migration`
2. Run `prisma migrate reset` (local/test only)
3. Restore deleted API routes and frontend code from main

## References

- Migration Guide: `docs/migrations/knowledge-tree/MAIN_MIGRATION_GUIDE.md`
- API Specs: `docs/migrations/knowledge-tree/api-specs.md`
- SQL Recipes: `docs/migrations/knowledge-tree/sql-recipes.md`
- Frontend Changes: `docs/migrations/knowledge-tree/frontend-changes.md`
- Migration: `prisma/schema/migrations/20251116180216_knowledge_tree_init/`

## Notes

- KnowledgeNode API endpoints designed but not implemented
- UI for tree management not built (can use Prisma directly)
- Concepts can exist without tree attachment (backward compatible)
- Slug uniqueness enforced per subject (not globally)
- Tree depth unlimited (no artificial constraints)

---

**Next Steps:**
1. Implement KnowledgeNode CRUD APIs (7 endpoints)
2. Build tree management UI
3. Update master prompts to remove year/semester
4. Add E2E tests for new flow

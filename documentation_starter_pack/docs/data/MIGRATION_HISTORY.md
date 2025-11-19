# Migration History

This document tracks all database schema migrations chronologically, including their purpose, impact, and rollback procedures.

## Migration Format

Each migration entry includes:
- **Migration ID:** Timestamp-based identifier
- **Date:** When the migration was created
- **Related ADR:** Link to architectural decision record (if applicable)
- **Changes:** Detailed list of schema changes
- **Impact:** How this affects the application
- **Rollback:** SQL commands to reverse the migration

---

## 2025-11-18: Flashcard Unlock System

**Migration:** `20251118075121_add_flashcard_unlock_system`  
**Related ADR:** [ADR-0018: Flashcard Unlock Threshold](../decisions/ADR-0018-flashcard-unlock-threshold.md)

**Changes:**
- Added `unlock_events` table to track when flashcards are unlocked
- Added `user_stats` table to track user progress metrics
- Added unlock-related fields to `flashcards` table:
  - `is_unlocked` (BOOLEAN)
  - `unlocked_at` (TIMESTAMP)
  - `unlock_confidence` (DECIMAL)
  - `unlock_source_id` (UUID, references content_jobs)

**Impact:**
- Enables confirm-to-unlock flashcard feature
- Tracks user progress and unlock history
- Allows analytics on unlock patterns
- Supports 70% confidence threshold for unlocks

**Rollback:**
```sql
-- Drop new tables
DROP TABLE IF EXISTS unlock_events CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;

-- Remove unlock fields from flashcards
ALTER TABLE flashcards 
  DROP COLUMN IF EXISTS is_unlocked,
  DROP COLUMN IF EXISTS unlocked_at,
  DROP COLUMN IF EXISTS unlock_confidence,
  DROP COLUMN IF EXISTS unlock_source_id;
```

---

## 2025-11-18: Language Support

**Migration:** `20251118050709_add_language_support`  
**Related ADR:** [ADR-0017: Multilingual Embeddings Strategy](../decisions/ADR-0017-multilingual-embeddings-strategy.md)

**Changes:**
- Added `language` field (VARCHAR(10)) to:
  - `concepts` table
  - `syllabus_concepts` table
  - `flashcards` table
- Added `embedding_model` field (VARCHAR(100)) to track model version
- Set default language to 'en' for existing records

**Impact:**
- Enables multilingual content processing (EN/FR + 100+ languages)
- Supports cross-lingual concept matching
- Tracks which embedding model was used for each concept
- Allows filtering and analytics by language

**Rollback:**
```sql
-- Remove language fields
ALTER TABLE concepts DROP COLUMN IF EXISTS language;
ALTER TABLE syllabus_concepts DROP COLUMN IF EXISTS language;
ALTER TABLE flashcards DROP COLUMN IF EXISTS language;

-- Remove embedding model tracking
ALTER TABLE concepts DROP COLUMN IF EXISTS embedding_model;
```

---

## 2025-11-16: Knowledge Tree Migration

**Migration:** `20251116_knowledge_tree_migration`  
**Related ADR:** [ADR-0009: Knowledge Tree Migration](../decisions/ADR-0009-knowledge-tree-migration.md)

**Changes:**
- Added `knowledge_nodes` table for hierarchical structure
- Added `node_type` enum (SUBJECT, COURSE, DIRECTORY, CONCEPT)
- Added `parent_id` for tree relationships
- Added `path` field for materialized path queries
- Migrated existing `syllabus_concepts` to new structure

**Impact:**
- Enables hierarchical knowledge organization
- Supports Subject → Course → Subdirectories → Atomic Concepts structure
- Allows efficient tree traversal queries
- Maintains backward compatibility with syllabus_concepts

**Rollback:**
```sql
-- Drop knowledge tree tables
DROP TABLE IF EXISTS knowledge_nodes CASCADE;
DROP TYPE IF EXISTS node_type CASCADE;

-- Restore original syllabus_concepts structure
-- (Existing syllabus_concepts table remains unchanged)
```

---

## 2025-11-16: Remove Academic Year/Semester Structure

**Migration:** `20251116_remove_academic_structure`  
**Related ADR:** [ADR-0020: Product Pivot to Student-Centric](../decisions/ADR-0020-product-pivot-to-student-centric.md)

**Changes:**
- Dropped `academic_years` table
- Dropped `semesters` table
- Removed `year_id` field from `courses` table
- Removed `semester_id` field from `courses` table
- Simplified course structure to Subject → Course only

**Impact:**
- Removed geographic/institutional constraints
- Simplified course selection UX
- Enabled global flexibility (not tied to French UE system)
- Breaking change: Existing year/semester data lost

**Rollback:**
```sql
-- Recreate academic structure tables
CREATE TABLE academic_years (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE semesters (
  id UUID PRIMARY KEY,
  year_id UUID NOT NULL REFERENCES academic_years(id),
  name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add fields back to courses
ALTER TABLE courses 
  ADD COLUMN year_id UUID REFERENCES academic_years(id),
  ADD COLUMN semester_id UUID REFERENCES semesters(id);
```

**Note:** Rollback will restore structure but not data. Manual data migration required.

---

## 2025-11-16: Content Type Architecture

**Migration:** `20251116_content_type_architecture`  
**Related ADR:** [ADR-0016: Content Type Architecture](../decisions/ADR-0016-content-type-architecture.md)

**Changes:**
- Renamed `video_jobs` table to `content_jobs`
- Added `content_type` enum (VIDEO, PDF, ARTICLE, PODCAST)
- Added `content_metadata` JSONB field for type-specific data
- Added `file_name`, `file_size`, `page_count` fields for PDFs
- Migrated existing video jobs to new structure

**Impact:**
- Unified processing pipeline for all content types
- Supports YouTube, TikTok, PDFs, articles, podcasts
- Polymorphic schema reduces code duplication
- Backward compatible with existing video processing

**Rollback:**
```sql
-- Rename back to video_jobs
ALTER TABLE content_jobs RENAME TO video_jobs;

-- Remove new fields
ALTER TABLE video_jobs 
  DROP COLUMN IF EXISTS content_type,
  DROP COLUMN IF EXISTS content_metadata,
  DROP COLUMN IF EXISTS file_name,
  DROP COLUMN IF EXISTS file_size,
  DROP COLUMN IF EXISTS page_count;

-- Drop content type enum
DROP TYPE IF EXISTS content_type CASCADE;
```

---

## 2025-11-15: Internationalization Support

**Migration:** `20251115_add_i18n_support`  
**Related ADR:** [ADR-0015: Internationalization Strategy](../decisions/ADR-0015-internationalization-strategy.md)

**Changes:**
- Added `locale` field (VARCHAR(10)) to `users` table
- Added `preferred_language` field to user preferences
- Set default locale to 'en'

**Impact:**
- Enables per-user language preferences
- Supports EN/FR bilingual interface
- Allows future expansion to more languages

**Rollback:**
```sql
-- Remove i18n fields
ALTER TABLE users 
  DROP COLUMN IF EXISTS locale,
  DROP COLUMN IF EXISTS preferred_language;
```

---

## 2025-11-14: Initial Schema

**Migration:** `20251114_initial_schema`  
**Related ADR:** Multiple (see architecture.md)

**Changes:**
- Created all base tables:
  - `users`, `sessions` (Better-Auth)
  - `subjects`, `courses`
  - `syllabus_concepts`
  - `video_jobs`, `extracted_concepts`
  - `concept_matches`
  - `flashcards`, `review_sessions`
- Set up foreign key relationships
- Added indexes for performance

**Impact:**
- Established core data model
- Enabled MVP functionality
- Foundation for all future migrations

**Rollback:**
```sql
-- Drop all tables (destructive!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

**Warning:** This rollback destroys all data. Only use in development.

---

## Migration Best Practices

### Before Running Migrations

1. **Backup database:** Always create a backup before running migrations in production
2. **Test in staging:** Run migrations in staging environment first
3. **Review SQL:** Manually review generated SQL for correctness
4. **Check dependencies:** Ensure all dependent services are compatible

### Running Migrations

```bash
# Development
npx prisma migrate dev --name descriptive_name

# Production
npx prisma migrate deploy
```

### After Running Migrations

1. **Verify schema:** Check that all changes applied correctly
2. **Test application:** Run E2E tests to ensure compatibility
3. **Monitor performance:** Watch for slow queries or index issues
4. **Document changes:** Update this file with migration details

### Rollback Procedure

1. **Stop application:** Prevent new writes during rollback
2. **Restore backup:** If available, restore from pre-migration backup
3. **Run rollback SQL:** Execute rollback commands from this document
4. **Verify data integrity:** Check that data is consistent
5. **Restart application:** Resume normal operations

### Emergency Rollback

If a migration causes critical issues:

```bash
# 1. Stop the application
pm2 stop all  # or equivalent

# 2. Connect to database
psql $DATABASE_URL

# 3. Run rollback SQL from this document
\i rollback_script.sql

# 4. Verify schema
\dt  # List tables
\d table_name  # Describe table

# 5. Restart application with previous version
git checkout previous_tag
npm install
npm run build
pm2 start all
```

---

## Related Documents

- [Data Dictionary](./data_dictionary.yml) - Field definitions and constraints
- [ERD](./erd.md) - Entity relationship diagram
- [Schema](../../prisma/schema/) - Prisma schema files
- [ADRs](../decisions/) - Architectural decision records

---

**Document Created:** 2025-11-19  
**Last Updated:** 2025-11-19  
**Maintainer:** Documentation Team

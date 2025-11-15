# docs/data/ — Data documentation

Purpose

This directory contains the minimal set of data-focused documentation and artifacts you should copy into every new project. It helps AI and humans understand data shapes, contracts, privacy requirements, and provides small sample records for testing and examples.

Files (starter)

- `data_dictionary.yml` — human-readable data dictionary describing tables/records and columns.
- `schema.yml` — canonical JSON-Schema / YAML schema for the primary record(s).
- `sample_records.jsonl` — a small sample dataset (one JSON object per line) for examples and testing.
- `contracts.md` — event/message contract definitions and versioning rules.
- `privacy.md` — privacy/PII mapping and retention policy guidance.

How AI should use these files

- Always load `docs/data/README.md` alongside `docs/context.md` at session start when discussing data changes.
- Use `data_dictionary.yml` to answer questions about field meanings, types, and constraints.
- Use `schema.yml` to validate sample data and generate data migration SQL or validation logic.
- Use `sample_records.jsonl` as concrete examples for generating tests and running quick local validations.
- When proposing schema or contract changes, ask AI to produce a spec patch, a migration plan, and a corresponding ADR when necessary.

Notes

- Do NOT include real production PII in `sample_records.jsonl`. Use synthetic or anonymized examples only.
- Keep schemas machine-readable and small; add richer docs and examples in the app repo as needed.

Example quick prompt (copy-paste)

"Load docs/context.md and docs/data/README.md plus all files in docs/data/. Identify any schema mismatches between the feature spec at docs/specs/feature-*.md and the declared schema in docs/data/schema.yml. If changes are needed, propose a minimal schema.yml patch and a migration checklist."

## Entity Relationship Diagram

- See `./erd.md` for the current ERD (Mermaid). Keep this updated when entities or relationships change.

## Migration Checklist - Hackathon MVP

**Pre-Hackathon (Thursday/Friday):**

- [ ] Create 13 base tables in order:
  - Reference tables: `users`, `subjects`, `academic_years`, `semesters`
  - Course structure: `courses`, `user_courses`, `syllabus_concepts`
  - Processing pipeline: `video_jobs`, `concepts`, `concept_matches`
  - Learning system: `flashcards`, `review_sessions`, `review_events`
- [ ] Add indexes on all foreign keys
- [ ] Seed reference data:
  - 3 subjects (Philosophy, Biology, Economics)
  - 6 academic_years (Licence 1-3, Master 1-2, Doctorat)
  - 6 semesters (1-6)
- [ ] **Process 3 real syllabus PDFs** to extract concepts:
  - LU1PH51F - Métaphysique (Licence 3, Semester 5, UE 1) → extracts ~20 concepts
  - BIOL2001 - Cell Biology (Licence 2, Semester 1) → extracts ~25 concepts
  - ECON1101 - Intro to Microeconomics (Licence 1, Semester 1) → extracts ~18 concepts
- [ ] Seed `courses` table with processed course metadata
- [ ] Seed `syllabus_concepts` with AI-extracted concepts from syllabi
- [ ] Validate sample data from `sample_records.jsonl` loads correctly
- [ ] Test foreign key constraints and ON DELETE CASCADE

**During Hackathon:**

- [ ] Monitor `video_jobs` for stuck processing (status='processing' >5min)
- [ ] Verify `user_courses.learned_count` increments after concept matching
- [ ] Check `flashcards.next_review_at` schedules correctly

**Skip for MVP:**

- ❌ Retention policies (keep all data)
- ❌ Soft deletes (hard delete only)
- ❌ Data archiving
- ❌ Materialized views

## ADRs to Draft

**Required:**

- **ADR-0010**: Database choice (PostgreSQL via Supabase recommended)
- **ADR-0011**: Normalized course structure (subjects/years/semesters vs denormalized)

**Optional (Post-MVP):**

- **ADR-0012**: Hard vs soft deletes
- **ADR-0013**: Event retention policy

## Key Schema Points

✅ **Dynamic concept counts**: Total concepts per course = `COUNT(syllabus_concepts WHERE course_id = X)`
✅ **Syllabus-driven**: Concept counts emerge from PDF processing, not hardcoded
✅ **French UE structure**: Courses belong to subject/year/semester
✅ **Dashboard formula**: Progress = `user_courses.learned_count / COUNT(syllabus_concepts)`

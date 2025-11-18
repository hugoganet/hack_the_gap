# Context Bundle

This is the single entry point for reconstructing project context. AI tools and humans should start here.

## Project Snapshot

- Name: Recall (formerly "hack the gap")
- Summary: AI-powered Zettelkasten that auto-converts students' passive content consumption into active long-term retention via concept extraction and spaced repetition, matching content to their own learning goals
- Stage: Implementation (Core pipeline complete, i18n + PDF upload added, flashcard unlock system complete, syllabus upload in progress)
- Last updated: 2025-11-18 (Landing page transparency + build config updates)
- **Major Pivot (2025-11-17)**: Shifted from institution-centric (pre-loaded courses) to student-centric (user-uploaded syllabi). Students now upload their own learning goals instead of selecting from pre-populated courses.

## Core Documents

- Vision: ./vision.md
- Architecture: ./architecture.md
- Tech Stack: ./tech_stack.md
- Roadmap: ./roadmap.md
- Tasks: ./tasks.md
- Decisions (ADRs): ./decisions/
- Specs: ./specs/ (9 user stories: US-0001 to US-0009)
- Change log: ./CHANGELOG.md
- Data docs: ./data/ (schema, ERD, dictionary, samples)

## How to Use with AI

- Load this file and all linked docs as context for the AI session.
- Use the system prompt in `../prompts/ai_system_prompt.md`.
- After a session, log it in `./ai_sessions/` and reference this context bundle version.

- For reconstructing or backfilling documentation in an existing repo, run `../prompts/doc_backfill_existing_project_prompt.md` so the AI (or an AI-assisted human session) can identify missing docs, surface uncertainties, and propose actionable patch snippets.

## First-time flow (new projects)

Run prompts in this order to establish a solid foundation:

1. Product Vision → `../prompts/product_vision_prompt.md` ✅ DONE
2. User Stories → `../prompts/user_stories_prompt.md` ✅ DONE (9 stories)
3. Tech Stack → `../prompts/tech_stack_prompt.md` ✅ DONE
4. Data Schemas → `../prompts/data_schema_prompt.md` ✅ DONE

Then record ADRs and Specs as needed under `./decisions/` and `./specs/`.

## Current Focus

- **Current Phase:** Implementation - Core pipeline complete, flashcard unlock system complete, syllabus upload in progress
- **High-level goal:** Build 48-hour hackathon MVP proving that auto-generated Zettelkasten from passive content consumption improves student retention
- **Key risks:** Syllabus upload friction, concept matching accuracy (<50% = lost trust), retention validation in 4 days
- **Next milestone:** Complete syllabus upload feature (NEW US-0001), progress dashboard (US-0008), gap analysis (US-0009)
- **Recent achievement:** Flashcard unlock system complete (gamified learning with locked/unlocked states)

## Tech Stack Summary

- **Frontend:** Next.js 15.5 (React 19) + Tailwind CSS 4.1 + shadcn/ui
- **Backend:** Next.js API Routes + Server Actions (monolith)
- **Database:** Supabase (PostgreSQL) + Prisma 6.14
- **Auth:** Better-Auth 1.3 (boilerplate integrated)
- **AI:** OpenAI (GPT-4 + Embeddings) via Vercel AI SDK
- **i18n:** next-intl 4.5.3 (EN/FR bilingual support)
- **PDF Processing:** pdf-parse 2.4.5 (text extraction)
- **Hosting:** Vercel
- **Testing:** Vitest + Playwright

See `./tech_stack.md` for complete details.

## Data Schema Status

✅ **COMPLETE** - 14 tables defined and synchronized (updated 2025-11-18):

- Reference tables: `users`, `subjects`
- Course structure: `courses`, `user_courses`, `syllabus_concepts`, `knowledge_nodes`, `node_syllabus_concepts`
- Processing pipeline: `content_jobs` (formerly `video_jobs`), `concepts`, `concept_matches`
- Learning system: `flashcards`, `review_sessions`, `review_events`, `unlock_events`, `user_stats`

**Recent Changes:**
- 2025-11-18: Added `unlock_events` and `user_stats` tables for flashcard unlock system
- 2025-11-18: Updated `flashcards` table with unlock fields (state, unlockedAt, unlockedBy, unlockProgress, hints)
- 2025-11-18: `VideoJob` → `ContentJob` with `ContentType` enum (youtube, tiktok, pdf, url, podcast)
- 2025-11-16: Removed `academic_years` and `semesters`, added `knowledge_nodes` for flexible hierarchy

See `./data/` for:

- `schema.yml` - JSON Schema definitions
- `data_dictionary.yml` - Field descriptions
- `erd.md` - Entity relationship diagram
- `sample_records.jsonl` - Example data
- `README.md` - Migration checklist

## User Stories Status

✅ **Core pipeline stories (US-0002 to US-0007) COMPLETE**:

- ~~US-0001: Course Selection~~ **DEPRECATED** - Replaced with syllabus upload
- **NEW US-0001: Syllabus Upload** 🚧 IN PROGRESS - Student uploads syllabus or defines goals with AI
- US-0002: Video URL Submission ✅ **IMPLEMENTED**
- US-0003: Concept Extraction ✅ **IMPLEMENTED**
- US-0004: Concept-to-Syllabus Matching ✅ **IMPLEMENTED**
- US-0005: Flashcard Generation ✅ **IMPLEMENTED**
- US-0006: First Review Session ✅ **IMPLEMENTED**
- US-0007: Review Scheduling ✅ **IMPLEMENTED**
- US-0008: Progress Dashboard 🚧 TODO
- US-0009: Gap Analysis 🚧 TODO
- ~~US-0012: Admin Pre-load Syllabi~~ **DEPRECATED** - No longer needed (students upload their own)

**Implementation Progress:** 6/9 core stories complete (US-0002 through US-0007)

See `./specs/` for detailed specifications.

## Recent Decisions

- **2025-11-18**: **Build Configuration for CI/CD** - Ignore ESLint/TypeScript errors during Vercel builds to prioritize deployment velocity (errors caught via pre-commit hooks)
- **2025-11-18**: **Landing Page Transparency** - Added ReviewsAlert component to disclose fictional testimonials, improving trust and compliance
- **2025-11-18**: **Flashcard Unlock System** - Gamified learning with locked flashcards (question-only) that unlock at 70% confidence matches
- **2025-11-18**: **Multilingual Embeddings** - Upgraded to text-embedding-3-large for cross-lingual semantic matching (100+ languages, ~95% similarity for equivalent concepts)
- **2025-11-18**: **Language Support** - Added language fields to concepts, syllabus_concepts, flashcards for bilingual flashcard generation
- **2025-11-18**: **Comprehensive i18n** - Added next-intl 4.5.3 for EN/FR bilingual support across entire app (300+ translation keys)
- **2025-11-18**: **Content Pipeline Refactor** - VideoJob → ContentJob with ContentType enum (youtube, tiktok, pdf, url, podcast)
- **2025-11-18**: **PDF Upload Feature** - Added pdf-parse 2.4.5 for text extraction, file upload endpoint, unified content processor
- **2025-11-18**: **Design System Overhaul** - Martian Grotesk font, warm orange/amber color palette
- **2025-11-18**: **Site Branding** - Renamed from "hack the gap" to "Recall"
- **2025-11-18**: **UI Enhancements** - Node detail pages, subdirectories display, improved navigation, language selector in user dropdown
- **2025-11-17**: **MAJOR PIVOT** - Shifted from institution-centric to student-centric approach. Students now upload their own syllabi instead of selecting from pre-loaded courses. Removed academic year/semester structure for global flexibility.
- **2025-11-17**: Deprecated US-0001 (Course Selection) and US-0012 (Admin Pre-load Syllabi)
- **2025-11-17**: New US-0001: Student syllabus upload (PDF/text) or AI conversation to define learning goals
- **2025-11-16**: Core pipeline complete - US-0002 through US-0007 implemented and working
- **2025-11-16**: ADR-0008: AI-assisted documentation update workflow formalized (diff-to-patch approach)
- **2025-11-16**: US-0004 implemented - Hybrid matching (0.6 × embeddings + 0.4 × LLM), automatic triggering, 33 tests passing
- **2025-11-16**: ADR-0005: OpenAI embeddings (text-embedding-3-small) for semantic similarity
- **2025-11-16**: ADR-0006: Hybrid matching algorithm balances speed (embeddings) with accuracy (LLM)
- **2025-11-16**: ADR-0007: Confidence thresholds calibrated (≥0.80 HIGH, ≥0.60 MEDIUM)
- **2025-11-16**: Simplified data schema - Removed academic_years and semesters tables for global flexibility
- **2025-11-14**: Tech stack finalized - Next.js 15.5, Supabase, Prisma, Better-Auth, OpenAI
- **2025-11-14**: Architecture documented - Monolith approach, synchronous processing for MVP
- **2025-11-13**: Product vision defined - Zettelkasten as backend engine, simple UX for students
- **2025-11-13**: MVP scope - 48h hackathon, accept 20-30% error rate, YouTube only
- **2025-11-13**: Validation criteria - 70%+ concept extraction accuracy, 80%+ retention after 24h (vs 20% baseline)

## Recent Sessions

- See `./ai_sessions/`. Latest: 2025-11-17 (Documentation update - major pivot to student-centric approach)
- **2025-11-17**: Documentation overhaul session (reflect pivot from institution-centric to student-centric)
- **2025-11-16**: US-0004 implementation session (concept-to-syllabus matching with automatic triggering)
- **2025-11-16**: Core pipeline completion (US-0002 through US-0007)
- **2025-11-14**: Documentation update session (tech stack, architecture, data schema sync)
- **2025-11-13**: Product Vision Definition session

## ADRs to Draft

**Completed:**
- ✅ **ADR-0005**: Embedding provider selection (OpenAI text-embedding-3-small)
- ✅ **ADR-0006**: Hybrid matching algorithm (0.6 × embeddings + 0.4 × LLM reasoning)
- ✅ **ADR-0007**: Confidence threshold calibration (≥0.80 HIGH, ≥0.60 MEDIUM, <0.60 rejected)

**Completed:**
- ✅ **ADR-0015**: Internationalization strategy (next-intl, locale routing, message catalogs)
- ✅ **ADR-0016**: Content type architecture (unified processor, polymorphic schema, ContentJob model)
- ✅ **ADR-0018**: Unlock threshold decision (70% confidence for flashcard unlocks)

**Priority ADRs needed:**
- **ADR-0010**: Database choice (Supabase PostgreSQL) - rationale, alternatives
- **ADR-0011**: Auth provider (Better-Auth vs Auth.js vs Clerk)
- **ADR-0012**: Monolith architecture (Next.js full-stack vs separate backend)
- **ADR-0013**: AI provider (OpenAI vs Anthropic vs local models)
- **ADR-0014**: Synchronous processing for MVP (vs async queue)
- **ADR-0017**: Multilingual embeddings strategy (text-embedding-3-large, cross-lingual matching) - TODO

## Pre-Hackathon Checklist

**Before starting implementation:**

- [x] Test concept extraction on 20 videos (validate 70%+ accuracy) ✅ DONE
- [ ] Recruit 3 beta test students
- [ ] Test syllabus upload with 5 different formats (PDF, Word, text, images, handwritten)
- [x] Set up OpenAI API account and test quota ✅ DONE
- [x] Configure Supabase project and run migrations ✅ DONE
- [x] Deploy boilerplate to Vercel (verify deployment works) ✅ DONE

**Implementation priority:**

1. ~~US-0012: Admin pre-load syllabi~~ **DEPRECATED**
2. **NEW US-0001: Student syllabus upload** 🚧 IN PROGRESS
3. ~~US-0001: Course selection UI~~ **DEPRECATED**
4. US-0002: Video URL submission ✅ DONE
5. US-0003: Concept extraction ✅ DONE
6. US-0004: Concept matching ✅ DONE
7. US-0005: Flashcard generation ✅ DONE
8. US-0006: First review session ✅ DONE
9. US-0007: Review scheduling ✅ DONE
10. US-0008: Progress dashboard 🚧 TODO
11. US-0009: Gap analysis 🚧 TODO

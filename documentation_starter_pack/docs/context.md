# Context Bundle

This is the single entry point for reconstructing project context. AI tools and humans should start here.

## Project Snapshot

- Name: hack the gap (temporary - name TBD)
- Summary: AI-powered Zettelkasten that auto-converts students' passive content consumption into active long-term retention via concept extraction and spaced repetition
- Stage: Implementation (Core matching pipeline complete)
- Last updated: 2025-11-16

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

- **Current Phase:** Implementation - Core matching pipeline complete (US-0002 ✓, US-0003 ✓, US-0004 ✓)
- **High-level goal:** Build 48-hour hackathon MVP proving that auto-generated Zettelkasten from passive content consumption improves student retention
- **Key risks:** Concept matching accuracy (<50% = lost trust), retention validation in 4 days, AI extraction quality from varied YouTube content
- **Next milestone:** Complete flashcard generation (US-0005) and review system (US-0006, US-0007)
- **Recent achievement:** Automatic concept-to-syllabus matching with hybrid algorithm (embeddings + LLM)

## Tech Stack Summary

- **Frontend:** Next.js 15.5 (React 19) + Tailwind CSS 4.1 + shadcn/ui
- **Backend:** Next.js API Routes + Server Actions (monolith)
- **Database:** Supabase (PostgreSQL) + Prisma 6.14
- **Auth:** Better-Auth 1.3 (boilerplate integrated)
- **AI:** OpenAI (GPT-4 + Embeddings) via Vercel AI SDK
- **Hosting:** Vercel
- **Testing:** Vitest + Playwright

See `./tech_stack.md` for complete details.

## Data Schema Status

✅ **COMPLETE** - 13 tables defined and synchronized:

- Reference tables: `users`, `subjects`, `academic_years`, `semesters`
- Course structure: `courses`, `user_courses`, `syllabus_concepts`
- Processing pipeline: `video_jobs`, `concepts`, `concept_matches`
- Learning system: `flashcards`, `review_sessions`, `review_events`

See `./data/` for:

- `schema.yml` - JSON Schema definitions
- `data_dictionary.yml` - Field descriptions
- `erd.md` - Entity relationship diagram
- `sample_records.jsonl` - Example data
- `README.md` - Migration checklist

## User Stories Status

✅ **9 MVP stories documented** (US-0001 to US-0009):

- US-0001: Course Selection ✅ Spec complete
- US-0002: Video URL Submission ✅ **IMPLEMENTED** - Transcript fetching complete
- US-0003: Concept Extraction ⚠️ HIGHEST RISK - ✅ **IMPLEMENTED** - AI extraction working
- US-0004: Concept-to-Syllabus Matching ⚠️ HIGHEST VALUE - ✅ **IMPLEMENTED** (Pending E2E testing)
- US-0005: Flashcard Generation ✅ Spec complete
- US-0006: First Review Session ✅ Spec complete
- US-0007: Review Scheduling ✅ Spec complete
- US-0008: Progress Dashboard ✅ Spec complete
- US-0009: Gap Analysis ✅ Spec complete

**Implementation Progress:** 3/9 core stories complete (US-0002, US-0003, US-0004)

See `./specs/` for detailed specifications.

## Recent Decisions

- **2025-11-16**: ADR-0008: AI-assisted documentation update workflow formalized (diff-to-patch approach)
- **2025-11-16**: US-0004 implemented - Hybrid matching (0.6 × embeddings + 0.4 × LLM), automatic triggering, 33 tests passing
- **2025-11-16**: ADR-0005: OpenAI embeddings (text-embedding-3-small) for semantic similarity
- **2025-11-16**: ADR-0006: Hybrid matching algorithm balances speed (embeddings) with accuracy (LLM)
- **2025-11-16**: ADR-0007: Confidence thresholds calibrated (≥0.80 HIGH, ≥0.60 MEDIUM)
- **2025-11-14**: Data schema completed - 13 tables, normalized structure, French UE system support
- **2025-11-14**: Tech stack finalized - Next.js 15.5, Supabase, Prisma, Better-Auth, OpenAI
- **2025-11-14**: Architecture documented - Monolith approach, synchronous processing for MVP
- **2025-11-13**: Product vision defined - Zettelkasten as backend engine, simple UX for students
- **2025-11-13**: MVP scope - 48h hackathon, accept 20-30% error rate, YouTube only, 3 pre-populated syllabi
- **2025-11-13**: Validation criteria - 70%+ concept extraction accuracy, 80%+ retention after 24h (vs 20% baseline)

## Recent Sessions

- See `./ai_sessions/`. Latest: 2025-11-13-session-002.md (Product Vision Definition)
- **2025-11-16**: US-0004 implementation session (concept-to-syllabus matching with automatic triggering)
- **2025-11-14**: Documentation update session (tech stack, architecture, data schema sync)

## ADRs to Draft

**Completed:**
- ✅ **ADR-0005**: Embedding provider selection (OpenAI text-embedding-3-small)
- ✅ **ADR-0006**: Hybrid matching algorithm (0.6 × embeddings + 0.4 × LLM reasoning)
- ✅ **ADR-0007**: Confidence threshold calibration (≥0.80 HIGH, ≥0.60 MEDIUM, <0.60 rejected)

**Priority ADRs needed:**
- **ADR-0010**: Database choice (Supabase PostgreSQL) - rationale, alternatives
- **ADR-0011**: Auth provider (Better-Auth vs Auth.js vs Clerk)
- **ADR-0012**: Monolith architecture (Next.js full-stack vs separate backend)
- **ADR-0013**: AI provider (OpenAI vs Anthropic vs local models)
- **ADR-0014**: Synchronous processing for MVP (vs async queue)

## Pre-Hackathon Checklist

**Before starting implementation:**

- [ ] Test concept extraction on 20 videos (validate 70%+ accuracy)
- [ ] Recruit 3 beta test students
- [ ] Pre-download 5 public course syllabi
- [ ] Set up OpenAI API account and test quota
- [ ] Configure Supabase project and run migrations
- [ ] Deploy boilerplate to Vercel (verify deployment works)

**Implementation priority:**

1. US-0012: Admin pre-load syllabi (seed data)
2. US-0001: Course selection UI
3. US-0002: Video URL submission
4. US-0003: Concept extraction ⚠️ CRITICAL PATH
5. US-0004: Concept matching ⚠️ CRITICAL PATH
6. US-0005-0009: Review system + dashboard

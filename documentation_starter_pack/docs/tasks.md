# Tasks

A lightweight, single-file kanban. Move items across sections and link to specs/ADRs.

## Inbox

- [ ] Create ADR-0010: Database choice (Supabase PostgreSQL)
- [ ] Create ADR-0015: Internationalization strategy (next-intl)
- [ ] Create ADR-0016: Content type architecture (unified processor)
- [ ] Set up monitoring/observability (Sentry)
- [ ] Configure email templates (Resend + React Email)
- [ ] Complete NEW US-0001: Student syllabus upload (PDF/text + AI conversation)
- [ ] Implement US-0008: Progress dashboard
- [ ] Implement US-0009: Gap analysis

## Backlog

### Prompt + Schema Update (Planned 2025-11-17)
- [ ] Update hierarchical extraction prompt to include inline flashcards and bilingual EN/FR blocks
- [ ] Extend createKnowledgeStructure to write concepts + concept_localizations + flashcards + flashcard_localizations in one transaction
- [ ] Add minimal validation enforcing required locales for concept_text, question, answer
- [ ] Design migrations for new tables and map syllabus_concepts → concepts
- [ ] Feature flag rollout plan and migration/backfill scripts


### Pre-Hackathon Validation (Priority: P0)

- [ ] Test concept extraction on 20 videos → validate 70%+ accuracy (US-0003)
- [ ] Recruit 3 beta test students for hackathon testing
- [ ] Pre-download 5 public course syllabi (Philosophy, Biology, Economics, Psychology, History)
- [ ] Set up OpenAI API account and verify quota limits
- [ ] Configure Supabase project (create database, set up connection)
- [ ] Run Prisma migrations on Supabase
- [ ] Deploy boilerplate to Vercel (verify deployment pipeline works)
- [ ] Test Better-Auth integration (signin/signup flows)

### MVP Implementation - Core Pipeline (COMPLETE)

- [x] ~~US-0012: Admin pre-load syllabi~~ **DEPRECATED** (2025-11-17 pivot to student-centric)
- [x] ~~US-0001: Course selection UI~~ **DEPRECATED** (2025-11-17 pivot to student-centric)
- [x] US-0002: Video URL submission ✅ 2025-11-15 → See `docs/specs/us-0002-video-url-submission.md`
- [x] US-0003: Concept extraction ✅ 2025-11-16 → See `docs/specs/us-0003-concept-extraction.md`
- [x] US-0004: Concept-to-goal matching ✅ 2025-11-16 → See `docs/specs/us-0004-concept-to-syllabus-matching.md`
- [x] Flashcard Unlock System ✅ 2025-11-18
  - ✅ Database schema: unlock_events, user_stats tables, flashcards unlock fields
  - ✅ Migration: 20251118075121_add_flashcard_unlock_system
  - ✅ Unlock service: Answer generation from matched content (357 lines)
  - ✅ Notification system: Toast notifications for unlocks (143 lines)
  - ✅ API routes: GET /api/flashcards, GET /api/user/stats
  - ✅ Dashboard components: unlock-progress, content-recommendations
  - ✅ UI components: flashcard-card, flashcard-list with locked/unlocked states
  - ✅ Integration: Wired into concept matching pipeline
  - ✅ Testing guide: FLASHCARD_UNLOCK_TESTING_GUIDE.md (509 lines)
  - ✅ UX planning: UX_REFACTOR_PLAN.md (580 lines)
  - ✅ Threshold: 70% confidence for unlock (ADR-0018)

### MVP Implementation - Review System (COMPLETE)

- [x] US-0005: Flashcard generation ✅ 2025-11-16 → See `docs/specs/us-0005-flashcard-generation.md`
- [x] US-0006: First review session ✅ 2025-11-16 → See `docs/specs/us-0006-first-review-session.md`
- [x] US-0007: Review scheduling ✅ 2025-11-16 → See `docs/specs/us-0007-review-scheduling.md`

### MVP Implementation - Dashboard (IN PROGRESS)

- [ ] NEW US-0001: Student syllabus upload 🚧 IN PROGRESS
  - [ ] US-0001a: Add learning goal via AI conversation
  - [ ] US-0001b: Add learning goal via document upload (PDF/text)
- [ ] US-0008: Progress dashboard 🚧 TODO → See `docs/specs/us-0008-progress-dashboard.md`
- [ ] US-0009: Gap analysis 🚧 TODO → See `docs/specs/us-0009-gap-analysis.md`

### Testing & Polish

- [ ] E2E test: Full pipeline (video → concepts → flashcards → review)
- [ ] Mobile responsiveness testing (iOS + Android)
- [ ] Performance testing (video processing <60s)
- [ ] Error handling (invalid URLs, API failures, timeouts)
- [ ] Demo script preparation

## WIP (limit: 3)

- [x] Document tech stack → `docs/tech_stack.md` ✅ DONE 2025-11-14
- [x] Document architecture → `docs/architecture.md` ✅ DONE 2025-11-14
- [x] Update context bundle → `docs/context.md` ✅ DONE 2025-11-14

## Blocked

- [ ] None currently

## Done

### Documentation (2025-11-18)

- [x] Phase 1 Documentation Remediation ✅ 2025-11-18
  - Product name finalized as "Recall"
  - Created GLOSSARY.md with canonical terminology
  - Created 7 ADRs (ADR-0011 through ADR-0020)
  - Updated architecture.md (removed admin/founder)
  - Updated context.md and project.yaml
  - Updated vision.md (persona, scope, differentiators)
  - Updated tech_stack.md (Claude + OpenAI hybrid, completed ADRs)
  - Updated tasks.md (removed deprecated items)

### ADRs Created (2025-11-18)

- [x] ADR-0011: Auth provider selection (Better-Auth) ✅ 2025-11-18
- [x] ADR-0012: Monolith architecture ✅ 2025-11-18
- [x] ADR-0013: AI provider selection (Claude + OpenAI hybrid) ✅ 2025-11-18
- [x] ADR-0014: Synchronous processing for MVP ✅ 2025-11-18
- [x] ADR-0017: Multilingual embeddings strategy ✅ 2025-11-18
- [x] ADR-0018: Flashcard unlock threshold (70% confidence) ✅ 2025-11-18
- [x] ADR-0019: Build error suppression for CI/CD ✅ 2025-11-18
- [x] ADR-0020: Product pivot to student-centric ✅ 2025-11-18

### Implementation (2025-11-18)

- [x] Flashcard Unlock System ✅ 2025-11-18
  - Database schema: unlock_events, user_stats tables
  - Unlock service with answer generation
  - Notification system with toast notifications
  - API routes for flashcards and user stats
  - Dashboard components for unlock progress
  - UI components with locked/unlocked states
  - 70% confidence threshold (ADR-0018)

### Implementation (2025-11-16)

- [x] ~~US-0001: Course selection feature~~ **DEPRECATED** (2025-11-17 pivot)
- [x] US-0003: Concept extraction ✅ 2025-11-16
- [x] US-0004: Concept-to-goal matching ✅ 2025-11-16
- [x] US-0005: Flashcard generation ✅ 2025-11-16
- [x] US-0006: First review session ✅ 2025-11-16
- [x] US-0007: Review scheduling ✅ 2025-11-16

### Implementation (2025-11-15)

- [x] US-0002 Phase 1: Transcript storage implementation ✅ 2025-11-15
  - Database schema updated (transcript field added)
  - SocialKit API integration for YouTube transcripts
  - Content inbox UI with drag-and-drop functionality
  - Server action with user authentication
  - Two-phase processing architecture established

### Documentation (2025-11-13 - 2025-11-14)

- [x] Product vision defined → `docs/vision.md` ✅ 2025-11-13
- [x] User stories created (9 stories) → `docs/specs/` ✅ 2025-11-13
- [x] Data schema designed → `docs/data/` ✅ 2025-11-14
- [x] Prisma schema created → `prisma/schema/schema.prisma` ✅ 2025-11-14
- [x] ERD documented → `docs/data/erd.md` ✅ 2025-11-14
- [x] Data dictionary created → `docs/data/data_dictionary.yml` ✅ 2025-11-14
- [x] Sample records prepared → `docs/data/sample_records.jsonl` ✅ 2025-11-14
- [x] Tech stack documented → `docs/tech_stack.md` ✅ 2025-11-14
- [x] Architecture documented → `docs/architecture.md` ✅ 2025-11-14
- [x] Context bundle updated → `docs/context.md` ✅ 2025-11-14

### Boilerplate Setup (Pre-2025-11-13)

- [x] Next.js 15.5 boilerplate configured
- [x] Better-Auth integrated
- [x] Prisma ORM set up
- [x] shadcn/ui components installed
- [x] Tailwind CSS configured
- [x] Testing framework set up (Vitest + Playwright)

## Sprint Notes

**Current Sprint:** Pre-Hackathon Preparation  
**Dates:** 2025-11-14 to 2025-11-17 (4 days before hackathon)  
**Goals:**

1. Complete pre-hackathon validation checklist
2. Verify all infrastructure is ready (Supabase, OpenAI, Vercel)
3. Test concept extraction accuracy on real videos
4. Recruit beta testers

**Next Sprint:** Hackathon MVP (48 hours)  
**Dates:** TBD (hackathon weekend)  
**Goals:**

1. Implement core pipeline (US-0001 to US-0004) - Day 1-2
2. Implement review system (US-0005 to US-0007) - Day 2-3
3. Implement dashboard (US-0008 to US-0009) - Day 3-4
4. Polish and demo preparation - Day 4

**Risks:**

- ⚠️ **HIGH**: Concept extraction accuracy <70% → Mitigation: Test early, iterate on prompts
- ⚠️ **HIGH**: Concept matching accuracy <68% → Mitigation: Test with diverse content, adjust thresholds
- ⚠️ **MEDIUM**: OpenAI API rate limits during demo → Mitigation: Pre-process backup videos, cache results
- ⚠️ **MEDIUM**: Video processing takes >60s → Mitigation: Optimize prompts, use GPT-3.5 for non-critical tasks
- ⚠️ **LOW**: Supabase connection issues → Mitigation: Connection pooling, fallback to direct Postgres

**Critical Path:**
US-0003 (Concept Extraction) → US-0004 (Concept Matching) → Everything else depends on these working

**Estimated Effort:**

- Pre-hackathon validation: 8-12 hours
- Core pipeline (US-0001 to US-0004): 20-24 hours
- Review system (US-0005 to US-0007): 12-16 hours
- Dashboard (US-0008 to US-0009): 8-10 hours
- Testing & polish: 4-6 hours
- **Total:** ~52-68 hours (fits in 48h with parallelization + pre-work)

# Tasks

A lightweight, single-file kanban. Move items across sections and link to specs/ADRs.

## Inbox

- [ ] Create ADR-0010: Database choice (Supabase PostgreSQL)
- [ ] Create ADR-0011: Auth provider (Better-Auth)
- [ ] Create ADR-0012: Monolith architecture
- [ ] Create ADR-0013: AI provider (OpenAI)
- [ ] Create ADR-0014: Synchronous processing for MVP
- [ ] Set up monitoring/observability (Sentry)
- [ ] Configure email templates (Resend + React Email)

## Backlog

### Pre-Hackathon Validation (Priority: P0)

- [ ] Test concept extraction on 20 videos → validate 70%+ accuracy (US-0003)
- [ ] Recruit 3 beta test students for hackathon testing
- [ ] Pre-download 5 public course syllabi (Philosophy, Biology, Economics, Psychology, History)
- [ ] Set up OpenAI API account and verify quota limits
- [ ] Configure Supabase project (create database, set up connection)
- [ ] Run Prisma migrations on Supabase
- [ ] Deploy boilerplate to Vercel (verify deployment pipeline works)
- [ ] Test Better-Auth integration (signin/signup flows)

### MVP Implementation - Core Pipeline

- [ ] US-0012: Admin pre-load syllabi (seed data script) → See `docs/specs/`
- [x] US-0001: Course selection UI ✅ 2025-11-16 → See `docs/specs/us-0001-course-selection.md`
  - ✅ CourseSelectionCard component (2x2 grid with "Add Course" button)
  - ✅ AddCourseDialog component (hybrid search: quick search + progressive selection)
  - ✅ 5 API routes: /api/courses, /api/user/courses, /api/subjects, /api/years, /api/semesters
  - ✅ Mobile-responsive design with text truncation
  - ✅ Breadcrumb navigation and loading states
- [x] US-0002: Video URL submission (Phase 1: Transcript Storage) ✅ 2025-11-15 → See `docs/specs/us-0002-video-url-submission.md`
  - ✅ Database: Added `transcript` field to `VideoJob` model
  - ✅ Backend: Implemented `processContent` server action with SocialKit API
  - ✅ Frontend: Transformed organization card into content inbox with drag-and-drop
  - ✅ Authentication: Added user authentication requirement
  - ⏳ Phase 2 TODO: AI concept extraction from stored transcripts
- [ ] US-0003: Concept extraction ⚠️ CRITICAL → See `docs/specs/us-0003-concept-extraction.md`
- [ ] US-0004: Concept-to-syllabus matching ⚠️ CRITICAL → See `docs/specs/us-0004-concept-to-syllabus-matching.md`

### MVP Implementation - Review System

- [ ] US-0005: Flashcard generation → See `docs/specs/us-0005-flashcard-generation.md`
- [ ] US-0006: First review session → See `docs/specs/us-0006-first-review-session.md`
- [ ] US-0007: Review scheduling → See `docs/specs/us-0007-review-scheduling.md`

### MVP Implementation - Dashboard

- [ ] US-0008: Progress dashboard → See `docs/specs/us-0008-progress-dashboard.md`
- [ ] US-0009: Gap analysis → See `docs/specs/us-0009-gap-analysis.md`

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

### Implementation (2025-11-16)

- [x] US-0001: Course selection feature ✅ 2025-11-16
  - CourseSelectionCard component with 2x2 grid layout
  - AddCourseDialog with hybrid UX (search + progressive selection)
  - 5 new API routes for course management
  - Mobile-responsive design with text truncation
  - Bug fixes: course filtering, text wrapping

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

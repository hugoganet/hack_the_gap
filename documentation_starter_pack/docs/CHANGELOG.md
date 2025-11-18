tger# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog. Summarize changes, link to PRs/specs.

## [Unreleased]

### Added - Unreleased

- **Unified Content Processor + PDF Upload** (2025-11-18) 📄
  - **Database Schema**: Migrated `VideoJob` → `ContentJob` with `ContentType` enum (youtube, tiktok, pdf, url, podcast)
    - Migration: `20251118035542_unified_content_processor`
    - Added content-type specific fields: fileName, fileSize, pageCount
    - Backward compatible: table still named `video_jobs`, column `transcript` maps to `extractedText`
  - **PDF Processing**: Full text extraction using pdf-parse library
    - URL-based: Auto-detect PDF URLs and extract text
    - File upload: Drag & drop + click to browse (max 10MB)
    - API endpoint: `/api/upload-pdf` for file uploads
    - Server action: `process-uploaded-pdf.action.ts`
  - **Architecture**: Created `/src/features/content-extraction/` module
    - `video-extractor.ts`: YouTube & TikTok (refactored from existing)
    - `pdf-extractor.ts`: PDF text extraction (new)
    - `url-extractor.ts`: Article extraction (placeholder)
    - `podcast-extractor.ts`: Podcast transcription (placeholder)
    - `index.ts`: Unified interface with auto content-type detection
  - **UI Updates**: Enhanced content inbox with file upload
    - Drag & drop zone with visual feedback
    - Click to upload with file picker
    - Real-time progress indicators ("Uploading...", "Extracting concepts...")
    - File validation (type, size)
  - **Pipeline**: All content types (videos, PDFs) flow through same AI pipeline
    - Text extraction → Concept extraction → Course matching → Flashcard generation
  - **Code Updates**: Updated all references from `VideoJob` to `ContentJob`
    - Actions: process-content, match-concepts, generate-flashcards
    - API routes: flashcards/preview, concept-matches/feedback
    - Components: cards-to-review-today, dashboard-stats
    - Features: flashcard-generator, concept-matcher
  - **Docs**: Created `UPLOAD_FEATURE.md` and `/src/features/content-extraction/README.md`

- Validation & Planning (2025-11-17)
  - Validated hierarchical extraction output against quality gates (structure + atomicity + completeness) with excellent metrics (confidence=0.87, treeDepth=5, totalAtomicConcepts=55).
  - Decision recorded to extend prompt + schema to support inline flashcard generation and bilingual concepts/flashcards.
  - See ADR-0010: documentation_starter_pack/docs/decisions/ADR-0010-inline-flashcards-and-bilingual-concepts.md
  - Session log: documentation_starter_pack/docs/ai_sessions/2025-11-17-session-005-validation-and-next-steps.md

- **Knowledge Tree Migration** (2025-11-16) 🌳
  - **Database Schema Changes** (`prisma/schema/schema.prisma`)
    - Added `KnowledgeNode` model: Flexible tree-based hierarchy within subjects
      - Fields: id, subjectId, parentId (self-referential), name, slug (unique per subject), order, metadata, timestamps
      - Indexes: (subjectId, parentId, order), (subjectId), (parentId)
      - Unique constraint: (subjectId, slug)
    - Added `NodeSyllabusConcept` junction table: Links syllabus concepts to knowledge tree nodes
      - Composite PK: (nodeId, syllabusConceptId)
      - Optional: addedByUserId for tracking
    - Removed `AcademicYear` model (rigid calendar structure)
    - Removed `Semester` model (rigid calendar structure)
    - Updated `Course` model: Removed yearId and semesterId fields
    - Updated `Subject` model: Added nodes relation to KnowledgeNode
    - Migration: `20251116180216_knowledge_tree_init`
  - **API Changes**
    - Deleted `/api/years/route.ts` (no longer needed)
    - Deleted `/api/semesters/route.ts` (no longer needed)
    - Updated `/api/courses/route.ts`: Removed year/semester includes and fields from responses
    - Updated `/api/user/courses/route.ts`: Removed year/semester includes and fields from GET/POST
  - **Frontend Simplification**
    - Updated `app/dashboard/users/add-course-dialog.tsx`: Removed year/semester selection steps
    - Updated `app/orgs/[orgSlug]/(navigation)/users/add-course-dialog.tsx`: Removed year/semester selection steps
    - Updated course flashcards views: Removed year/semester display from both dashboard and org routes
    - Updated course detail pages: Removed year/semester includes
    - Simplified course selection flow: Subject → Course (no more Year/Semester intermediary steps)
  - **Scripts & Data**
    - Updated `prisma/seed.ts`: Removed AcademicYear/Semester seeding logic
    - Updated `scripts/ingest-generated-courses.ts`: Removed year/semester handling
  - **Documentation**
    - Created comprehensive migration guide: `docs/migrations/knowledge-tree/MAIN_MIGRATION_GUIDE.md`
    - Added supporting docs: API specs, SQL recipes, frontend changes, task checklist, test plan
    - Updated `docs/data/schema.yml`: Removed academic_years/semesters, added knowledge_nodes/node_syllabus_concepts
    - Updated `docs/data/data_dictionary.yml`: Updated field definitions for new models
    - Updated `docs/data/erd.md`: Updated ERD with new relationships and migration notes
  - **Architecture Decision**
    - Rationale: Calendar-based organization (Year/Semester) was too rigid for diverse content types
    - New approach: Flexible, domain-driven knowledge tree (e.g., Philosophy → Epistemology → Kant → Categorical Imperative)
    - Benefits: Arbitrary depth, subject-centric organization, better concept discovery
    - Hierarchy: Subject → Course → KnowledgeNodes (tree) → SyllabusConcepts

- **AI Documentation Workflow** (ADR-0008)
  - Created ADR-0008 documenting AI-assisted documentation update workflow
  - Formalized diff-to-patch approach for maintaining documentation
  - Documented mapping matrix (change types → affected docs)
  - Established validation checklist and safety guidelines
  - Updated `docs/decisions/README.md` with complete ADR index

- **Course Selection Feature (US-0001)** ✅ IMPLEMENTED
  - **UI Components** (`app/orgs/[orgSlug]/(navigation)/users/`)
    - `course-selection-card.tsx`: 2x2 grid card interface with "Add Course" button and active course slots
    - `add-course-dialog.tsx`: Hybrid search dialog (command palette + progressive selection)
  - **API Routes** (`app/api/`)
    - `GET /api/courses`: Fetch all available courses with relationships (subject, year, semester, concept count)
    - `GET /api/user/courses`: Fetch user's active courses with progress
    - `POST /api/user/courses`: Add course to user's active courses
    - `GET /api/subjects`: Fetch all subjects ordered alphabetically
    - `GET /api/years`: Fetch all academic years ordered by level
    - `GET /api/semesters`: Fetch all semesters ordered by number
  - **UX Design**
    - Hybrid approach: Quick search (type-ahead) + progressive selection (Subject → Year → Semester → Course)
    - Mobile-first: 2x2 grid on desktop, 1 column on mobile
    - Text truncation: Course names truncate with line-clamp-3, wrap properly
    - Clean design: Course codes removed from display, focus on course names only
  - **Features**
    - Breadcrumb navigation with back button in progressive selection
    - Loading states and success feedback (toast notifications)
    - Auto-refresh after adding course
    - Empty slots with dashed borders (no text)
    - Responsive design with proper overflow handling

- **Concept-to-Syllabus Matching Feature (US-0004)** ⚠️ HIGHEST VALUE ✅ COMPLETE
  - **Matching System** (`src/features/matching/`)
    - `config.ts`: Thresholds (HIGH=0.80, MEDIUM=0.60), blend weights (0.6 sim + 0.4 LLM), concurrency limits
    - `ai-reasoning.ts`: LLM-based concept verification (Blackbox/OpenAI fallback)
    - `concept-matcher.ts`: Hybrid two-stage orchestrator (embeddings + LLM reasoning)
    - `write-concept-matches.ts`: Idempotent database writer with batch operations
    - `README.md`: Technical architecture documentation
  - **Embeddings Service** (`src/lib/ai/embeddings.ts`)
    - OpenAI text-embedding-3-small integration
    - Batch embedding generation with Float32Array conversion
    - Cosine similarity helper function
  - **Server Action** (`app/actions/match-concepts.action.ts`)
    - Authentication & authorization (user ownership + course enrollment validation)
    - Status tracking (matching → matched/matching_failed)
    - Comprehensive [Matching] console logging
    - Toast-ready response format with detailed metrics
  - **Automatic Triggering** (Modified `app/actions/process-content.action.ts`)
    - Auto-match after concept extraction completes
    - Smart logic: 0 courses (skip), 1 course (auto-match), N courses (parallel match to all)
    - Graceful error handling (doesn't break video processing)
    - Detailed [Auto-Match] console logging
    - Fetches match details for celebration dialog (highMatches, mediumMatches)
    - Smart categorization: "exact" matches promoted to High Confidence even if <80%
  - **Interactive Match Review UI** (`app/orgs/[orgSlug]/(navigation)/users/`)
    - `match-results-dialog.tsx`: Celebration dialog with expandable match sections
    - High Confidence section: Shows ≥80% confidence OR "exact" match type
    - Partial Matches section: Shows 60-79% confidence (excluding "exact" types)
    - Each match displays: extracted concept → matched concept, rationale, confidence %, match type
    - Feedback buttons: 👍 (confirm) / 👎 (reject) with optimistic UI updates
    - Responsive design with scrollable sections for many matches
  - **Feedback API** (`app/api/concept-matches/[matchId]/feedback/`)
    - PATCH endpoint for user feedback ("correct" or "incorrect")
    - User ownership validation
    - Database persistence of feedback
    - Next.js 15 compatible (awaits dynamic params)
  - **Comprehensive Testing** (`__tests__/matching/`)
    - 27 unit tests: similarity, blending, thresholds, edge cases
    - 6 integration tests: DB operations, batch processing, idempotency
    - All 33 tests passing ✓
    - Manual testing: Dialog opens, sections expand, feedback works, API functional
  - **Architectural Decisions**
    - ADR-0005: OpenAI embeddings (text-embedding-3-small) for semantic similarity
    - ADR-0006: Hybrid matching algorithm (0.6 × embeddings + 0.4 × LLM reasoning)
    - ADR-0007: Confidence thresholds (≥0.80 HIGH, ≥0.60 MEDIUM, <0.60 rejected)
    - Smart categorization: "exact" match type overrides confidence threshold for better UX

- **Transcript Storage Feature (Phase 1 - US-0002)**
  - Database: Added `transcript` field to `VideoJob` model (TEXT type)
  - Backend: Implemented `processContent` server action with SocialKit API integration
  - Frontend: Transformed organization card into content inbox with drag-and-drop UI
  - Authentication: Added user authentication requirement for content processing
  - API Integration: SocialKit YouTube transcript API (`/youtube/transcript` endpoint)
  - Documentation: Created `TRANSCRIPT_STORAGE_IMPLEMENTATION.md` with implementation details

- Pre-hackathon validation checklist in `docs/tasks.md`
- ADR placeholders for key architectural decisions (ADR-0010 to ADR-0014)
- Sprint planning with effort estimates and risk assessment

### Changed - Unreleased

- **US-0001 Status:** ✅ Implemented and functional (Course selection with hybrid UX)
- **US-0004 Status:** ✅ Complete with interactive review UI and feedback system
- **Video Processing Pipeline:** Now includes automatic concept-to-syllabus matching after extraction with celebration dialog
- **ConceptMatch Schema:** Added `matchType`, `rationale`, and `userFeedback` fields for explainability and learning
- **Content Inbox UX:** Removed course selection requirement - auto-matches to all active courses
- **Celebration Dialog:** Interactive expandable sections for reviewing matches with optional feedback
- **US-0002 Progress:** Video URL submission now fetches and stores transcripts (Phase 1 complete)
- **UI Transformation:** Users page organization card replaced with modern inbox interface
- **Data Flow:** Implemented two-phase processing (fetch transcript → AI processing → auto-match)
- Updated project stage from "discovery" to "pre-implementation"
- Refined implementation priority order based on critical path analysis

### Fixed - Unreleased

- Float32Array type conversion in embeddings service (number[] → Float32Array[])
- ESLint optional chaining warnings in YouTube video ID extraction
- Corrected SocialKit API response structure handling (transcript is string, not array)
- Fixed Prisma client cache issue requiring dev server restart after schema changes
- Corrected user story count (9 stories, not 12) in documentation
- Smart categorization logic: "exact" matches now appear in High Confidence even if confidence <80%
- Next.js 15 compatibility: Dynamic route params properly awaited in feedback API
- TypeScript errors in client components (proper null checks and type guards)

## [0.2.0] - 2025-11-14

### Added - 0.2.0

- **Tech Stack Documentation** (`docs/tech_stack.md`)
  - Complete stack overview: Next.js 15.5, Supabase, Prisma 6.14, Better-Auth 1.3, OpenAI
  - Detailed rationale, tradeoffs, and risks for each technology choice
  - Architecture diagrams (C4 model: system context + container)
  - Key architectural decisions documented
  - Environment variables reference
  - Dependencies and versions list

- **Architecture Documentation** (`docs/architecture.md`)
  - System context and boundaries
  - C4 diagrams (system context + container + component architecture)
  - Data flow sequence diagram for video processing pipeline
  - API contracts and interfaces
  - Operational concerns (deployment, observability, security, performance)
  - Scalability considerations and limits

- **Data Schema** (`docs/data/`)
  - 13 tables designed and documented
  - JSON Schema definitions (`schema.yml`)
  - Data dictionary with field descriptions (`data_dictionary.yml`)
  - Entity relationship diagram (`erd.md`)
  - Sample records for testing (`sample_records.jsonl`)
  - Privacy and PII mapping (`privacy.md`)
  - Migration checklist (`README.md`)

- **Prisma Schema** (`prisma/schema/`)
  - Domain models synchronized with documentation (13 tables)
  - Better-Auth integration (`better-auth.prisma`)
  - Indexes optimized for query performance
  - Foreign key relationships with cascade deletes

- **Task Management** (`docs/tasks.md`)
  - Pre-hackathon validation checklist (8 tasks)
  - MVP implementation backlog (9 user stories)
  - Sprint planning with dates, goals, and risks
  - Effort estimates (52-68 hours total)
  - Critical path identified (US-0003 → US-0004)

### Changed - 0.2.0

- **Context Bundle** (`docs/context.md`)
  - Updated project stage to "pre-implementation"
  - Added tech stack summary
  - Added data schema status (13 tables complete)
  - Added user stories status (9 specs complete)
  - Updated recent decisions with 2025-11-14 entries
  - Added pre-hackathon checklist
  - Added implementation priority order

- **User Stories** (`docs/user_stories/README.md`)
  - Fixed story count (9 stories, not 12)
  - All 9 MVP stories have complete specifications

### Fixed - 0.2.0

- Synchronized Prisma schema with documented data model
- Corrected user story count discrepancy in documentation
- Updated last modified dates across documentation

## [0.1.0] - 2025-11-13

### Added - 0.1.0

- Initial documentation starter pack
- Product vision document (`docs/vision.md`)
  - One-liner thesis
  - Problem & opportunity analysis
  - Target personas (Motivated Struggler, Power User)
  - Value proposition and differentiators
  - MVP scope and success criteria
  - Risks and assumptions

- User Stories (`docs/specs/`)
  - US-0001: Course Selection
  - US-0002: Video URL Submission
  - US-0003: Concept Extraction (HIGHEST RISK)
  - US-0004: Concept-to-Syllabus Matching (HIGHEST VALUE)
  - US-0005: Flashcard Generation
  - US-0006: First Review Session
  - US-0007: Review Scheduling
  - US-0008: Progress Dashboard
  - US-0009: Gap Analysis

- Project metadata (`project.yaml`)
  - Project name, summary, owner
  - Stage, tags, conventions
  - Hackathon context and constraints

- AI session logs (`docs/ai_sessions/`)
  - 2025-11-13-session-002.md: Product Vision Definition

### Changed - 0.1.0

- Established documentation structure and conventions
- Defined naming patterns for sessions, ADRs, specs, user stories

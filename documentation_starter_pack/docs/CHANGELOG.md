# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog. Summarize changes, link to PRs/specs.

## [Unreleased]

### Added - Unreleased

- Pre-hackathon validation checklist in `docs/tasks.md`
- ADR placeholders for key architectural decisions (ADR-0010 to ADR-0014)
- Sprint planning with effort estimates and risk assessment

### Changed - Unreleased

- Updated project stage from "discovery" to "pre-implementation"
- Refined implementation priority order based on critical path analysis

### Fixed - Unreleased

- Corrected user story count (9 stories, not 12) in documentation

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

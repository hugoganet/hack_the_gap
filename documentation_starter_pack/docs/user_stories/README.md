# User Stories

Purpose

Central place for concise, testable user stories that drive specs, acceptance criteria, and implementation. Store stories here so an AI (or a human) can quickly browse product capabilities, priorities, and link to specs/ADRs.

How to use

- Write stories as small, independent units (INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable).
- Group stories by feature/epic using headings.
- For each story include: priority, estimate (T-shirt or points), acceptance criteria, and links to spec/ADR/tasks.
- Use the template below when creating new stories. Use `scripts/new_spec.sh` to generate a feature spec and link it here.

Template (copy/paste)

```md
### [Feature or Epic] — Short title

- ID: US-0001
- Persona: {persona}
- Title: As a {persona}, I want {capability} so that {benefit}.
- Priority: P0 | P1 | P2
- Estimate: S | M | L | 1 | 2 | 3
- Acceptance Criteria:
  - [ ] AC1: ... (observable, testable)
  - [ ] AC2: ...
- Notes / Constraints: ...
- Spec: docs/specs/feature-...md
- Tasks: docs/tasks.md#...

```

Examples

## Uploads — Upload files to user dashboard

- ID: US-0001
- Persona: Registered user
- Title: As a registered user, I want to upload a file up to 10MB so that I can access it later from my dashboard.
- Priority: P0
- Estimate: M
- Acceptance Criteria:
  - [ ] AC1: The user can select a file and submit an upload request.
  - [ ] AC2: The server returns a 201 on success with metadata (id, url, size, type).
  - [ ] AC3: The UI shows a success message and lists the uploaded file in the dashboard.
  - [ ] AC4: Unsupported types or files >10MB return a clear error message.
- Notes / Constraints: Limit types to PNG/JPG/PDF. Use feature flag `uploads_v1` for rollout.
- Spec: docs/specs/feature-uploads-v1.md
- Tasks: link tasks or add checklist in `docs/tasks.md` under Backlog

## Uploads — View uploads

- ID: US-0002
- Persona: Registered user
- Title: As a registered user, I want to see my uploaded files in a paginated list so that I can manage them.
- Priority: P1
- Estimate: S
- Acceptance Criteria:
  - [ ] AC1: The dashboard lists files (filename, size, created_at) paginated by 20.
  - [ ] AC2: Each row has a download link and a delete action behind confirmation.
- Spec: docs/specs/feature-uploads-v1.md

Guidance for AI-driven work

- When starting a session, have the AI load this directory's README and ask it to:
  - Summarize which stories are highest priority and why.
  - For a selected story, draft a feature spec (use `docs/templates/feature_spec.md`) and produce acceptance test cases.
  - Suggest tasks and break the story into subtasks, creating entries in `docs/tasks.md` or a new spec.

- When a story's acceptance criteria are satisfied, update the story with a `Done` timestamp and link to the PR/implementation artifact.

Mapping stories → specs → ADRs → tasks

- Stories are the source of truth for product behaviour.
- If a story requires architectural or trade-off decisions, create an ADR and link it from the story.
- Larger stories should become specs; small stories can be implemented directly with linked tasks.

ID conventions

- Start IDs with `US-0001` and increment. Keep IDs stable once referenced by tests/PRs.

Automation tips

- Use AI to convert a selected story into:
  - a draft spec (`docs/templates/feature_spec.md`)
  - a test-plan snippet (`docs/templates/test_plan.md`)
  - a checklist of tasks to add to `docs/tasks.md`

Search & discoverability

- Keep one index file (this README) and add new stories under feature headings. Use exact naming in titles so AI can reliably locate a story by ID or short title.

---

## MVP User Stories (48-Hour Hackathon)

### Core Pipeline - Learning Goals Setup

#### US-0001: Syllabus Upload & Goal Definition (NEW - Replaces old Course Selection)

- ID: US-0001
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want to upload my syllabus or define my learning goals with AI assistance so that the system knows what concepts I need to master.
- Priority: P0
- Estimate: 6h
- Status: 🚧 IN PROGRESS
- Acceptance Criteria:
  - [ ] Student can upload syllabus (PDF, Word, text, or image)
  - [ ] AI extracts 20-50 atomic concepts from syllabus using existing prompt
  - [ ] Alternative: Student can have AI conversation to define learning goals
  - [ ] Concepts are stored and linked to student's learning profile
  - [ ] Dashboard shows "0/X concepts" after upload
  - [ ] Student can upload multiple syllabi for different subjects
  - [ ] Works for any educational system worldwide (not limited to specific curriculum)
- Notes: This replaces the old US-0001 (Course Selection). Uses existing `syllabus-concept-extraction-prompt.md` but triggered by student upload instead of admin.
- Spec: [us-0001-syllabus-upload.md](../specs/us-0001-syllabus-upload.md) (TODO: Create new spec)

#### ~~US-0001: Course Selection~~ **DEPRECATED (2025-11-17)**

- **Reason**: Shifted from institution-centric (pre-loaded courses) to student-centric (user-uploaded syllabi)
- **Replaced by**: NEW US-0001 (Syllabus Upload & Goal Definition)
- Old spec archived: [us-0001-course-selection.md](../specs/us-0001-course-selection.md)

### Core Pipeline - Content Processing
=======

#### US-0002: Video URL Submission ✅ IMPLEMENTED

- ID: US-0002
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want to paste a YouTube video URL so that the system can extract concepts from content I'm already consuming.
- Priority: P0
- Estimate: 3h
- Status: ✅ IMPLEMENTED
- Acceptance Criteria:
  - [x] Accepts valid YouTube URLs (youtube.com/watch, youtu.be, youtube.com/embed)
  - [x] Shows processing status with estimated time
  - [x] Validates URL format and shows errors for invalid URLs
  - [x] Completes processing within 60 seconds
- Spec: [us-0002-video-url-submission.md](../specs/us-0002-video-url-submission.md)

#### US-0003: Concept Extraction ✅ IMPLEMENTED

- ID: US-0003
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want the system to automatically extract atomic concepts from videos so that I don't have to manually take notes.
- Priority: P0
- Estimate: 8h
- Status: ✅ IMPLEMENTED
- Acceptance Criteria:
  - [x] Extracts 3-10 atomic concepts per video
  - [x] Each concept has: name, definition, timestamp, confidence score
  - [x] Processing completes within 30 seconds
  - [x] 70%+ extraction accuracy verified on test videos
- Notes: Tested on 20 videos before implementation. Core thesis validated.
- Spec: [us-0003-concept-extraction.md](../specs/us-0003-concept-extraction.md)

#### US-0004: Concept-to-Goal Matching ✅ IMPLEMENTED

- ID: US-0004
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want to know which concepts from my video match my learning goals so that I can see if I'm covering what I need to learn.
- Priority: P0
- Estimate: 6h
- Status: ✅ IMPLEMENTED
- Acceptance Criteria:
  - [x] Matches extracted concepts to learning goals with confidence scores
  - [x] ≥80% confidence shows as "Matched" (green)
  - [x] 60-79% shows as "Partial Match" (yellow, requires confirmation)
  - [x] <60% shows as "No Match" (gray)
  - [x] 68%+ matching accuracy on test data
  - [x] Hybrid algorithm: 0.6 × embeddings + 0.4 × LLM reasoning
  - [x] Automatic triggering after concept extraction
- Notes: Core differentiator. Hybrid matching algorithm with 33 tests passing.
- Spec: [us-0004-concept-to-syllabus-matching.md](../specs/us-0004-concept-to-syllabus-matching.md)

#### US-0005: Flashcard Generation ✅ IMPLEMENTED

- ID: US-0005
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want auto-generated flashcards from matched concepts so that I can review and retain what I've learned.
- Priority: P0
- Estimate: 4h
- Status: ✅ IMPLEMENTED
- Acceptance Criteria:
  - [x] Generates 1 flashcard per matched concept (confidence ≥80%)
  - [x] Questions use active recall format (not yes/no)
  - [x] Answers are concise (1-3 sentences)
  - [x] Flashcards include source video timestamp
- Spec: [us-0005-flashcard-generation.md](../specs/us-0005-flashcard-generation.md)

### Review & Retention

#### US-0006: First Review Session ✅ IMPLEMENTED

- ID: US-0006
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want to review flashcards immediately after processing a video so that I can start encoding concepts into long-term memory.
- Priority: P0
- Estimate: 5h
- Status: ✅ IMPLEMENTED
- Acceptance Criteria:
  - [x] Shows one flashcard at a time with question → reveal answer flow
  - [x] User rates each card as Easy, Medium, or Hard
  - [x] Progress indicator shows "Card X of Y"
  - [x] Completion summary shows next review schedule
  - [x] Works on mobile (large tap targets)
- Spec: [us-0006-first-review-session.md](../specs/us-0006-first-review-session.md)

#### US-0007: Review Scheduling ✅ IMPLEMENTED

- ID: US-0007
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want flashcards scheduled for optimal review intervals so that I retain concepts long-term.
- Priority: P0
- Estimate: 4h
- Status: ✅ IMPLEMENTED
- Acceptance Criteria:
  - [x] Hard = 1 day, Medium = 1 day, Easy = 3 days (first review)
  - [x] Repeat "Easy" reviews double the interval
  - [x] Next review date stored and displayed
  - [x] Timezone-aware scheduling (store UTC, display local)
- Notes: Using simple fixed intervals for MVP, not adaptive SM-2 algorithm
- Spec: [us-0007-review-scheduling.md](../specs/us-0007-review-scheduling.md)

### Progress & Analytics

#### US-0008: Progress Dashboard 🚧 TODO

- ID: US-0008
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want to see my progress toward my learning goals so that I stay motivated.
- Priority: P1
- Estimate: 3h
- Status: 🚧 TODO
- Acceptance Criteria:
  - [ ] Shows "X/Y concepts for [Learning Goal]" prominently
  - [ ] Visual progress bar
  - [ ] Breakdown: Mastered, In Progress, Not Started
  - [ ] Updates in real-time after video processing
  - [ ] Works for multiple syllabi/learning goals
- Notes: This is the "magic moment" visualization. Updated to support multiple learning goals instead of single course.
- Spec: [us-0008-progress-dashboard.md](../specs/us-0008-progress-dashboard.md)

#### US-0009: Gap Analysis 🚧 TODO

- ID: US-0009
- Persona: Self-Directed Learner
- Title: As a self-directed learner, I want to see which learning goal concepts I haven't covered yet so that I know exactly what to study next.
- Priority: P1
- Estimate: 2h
- Status: 🚧 TODO
- Acceptance Criteria:
  - [ ] Lists all unmatched learning goal concepts
  - [ ] Groups by category (if available)
  - [ ] Shows concept name + description
  - [ ] Empty state if no gaps: "🎉 You've covered all concepts!"
  - [ ] Works for multiple syllabi/learning goals
- Notes: Key differentiator - shows exactly what's missing. Updated to support multiple learning goals.
- Spec: [us-0009-gap-analysis.md](../specs/us-0009-gap-analysis.md)

### ~~Admin/Setup~~ **DEPRECATED**

#### ~~US-0012: Admin Pre-load Syllabi~~ **DEPRECATED (2025-11-17)**

- **Reason**: Students now upload their own syllabi. No admin pre-loading needed.
- **Replaced by**: NEW US-0001 (Syllabus Upload & Goal Definition)
- Old notes: Manual process for MVP - pre-populate before hackathon (NO LONGER NEEDED)

## Next-Stage User Stories (Post-Hackathon)

### Content Sources

- **US-0014**: Manual syllabus upload (PDF parsing)
- **US-0015**: Multiple content sources (TikTok, articles, PDFs)

### User Control

- **US-0016**: Edit flashcards (fix AI-generated content)
- **US-0017**: Delete irrelevant concepts
- **US-0024**: Concept tagging for organization

### Advanced Features

- **US-0018**: Daily review notifications
- **US-0019**: Prerequisite detection (learn X before Y)
- **US-0020**: Knowledge graph visualization
- **US-0021**: Export to Obsidian
- **US-0023**: Advanced spaced repetition (SM-2 algorithm)

### B2B Features

- **US-0022**: Professor dashboard (class-wide progress)
- **US-0025**: Collaborative syllabi (community contributions)

---

## Critical Path for Hackathon Demo (UPDATED 2025-11-17)

**Day 1 (Friday):**

- ~~US-0012: Pre-load syllabi~~ **DEPRECATED**
- NEW US-0001: Syllabus upload feature 🚧 IN PROGRESS
- ~~US-0001: Course selection~~ **DEPRECATED**
- US-0002: Video URL input ✅ DONE

**Day 2 (Saturday) - CORE:**

- US-0003: Concept extraction ✅ DONE
- US-0004: Concept matching ✅ DONE
- Validate 70%+ accuracy on test videos ✅ DONE

**Day 3 (Sunday):**

- US-0005: Flashcard generation ✅ DONE
- US-0006: Review interface ✅ DONE
- US-0007: Review scheduling ✅ DONE

**Day 4 (Monday AM):**

- US-0008: Progress dashboard 🚧 TODO
- US-0009: Gap analysis 🚧 TODO
- Polish and test demo flow

**Total estimated effort:** ~48-60 hours (core pipeline complete, dashboard remaining)

**Implementation Status:** 6/9 core stories complete (US-0002 through US-0007). Syllabus upload (NEW US-0001) in progress. Dashboard features (US-0008, US-0009) remaining.

---

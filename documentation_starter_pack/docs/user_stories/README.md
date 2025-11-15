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

### Core Pipeline - Video Processing

#### US-0001: Course Selection
- ID: US-0001
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want to select my course from a list so that the system knows which syllabus to match my learning content against.
- Priority: P0
- Estimate: 2h
- Acceptance Criteria:
  - [ ] Dropdown displays 3 courses (Philosophy 101, Biology 101, Economics 101)
  - [ ] Course selection persists across sessions
  - [ ] Dashboard shows "0/X concepts for this course" after selection
  - [ ] User can change course with confirmation
- Spec: [us-0001-course-selection.md](../specs/us-0001-course-selection.md)

#### US-0002: Video URL Submission
- ID: US-0002
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want to paste a YouTube video URL so that the system can extract concepts from content I'm already consuming.
- Priority: P0
- Estimate: 3h
- Acceptance Criteria:
  - [ ] Accepts valid YouTube URLs (youtube.com/watch, youtu.be, youtube.com/embed)
  - [ ] Shows processing status with estimated time
  - [ ] Validates URL format and shows errors for invalid URLs
  - [ ] Completes processing within 60 seconds
- Spec: [us-0002-video-url-submission.md](../specs/us-0002-video-url-submission.md)

#### US-0003: Concept Extraction ⚠️ HIGHEST RISK
- ID: US-0003
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want the system to automatically extract atomic concepts from videos so that I don't have to manually take notes.
- Priority: P0
- Estimate: 8h
- Acceptance Criteria:
  - [ ] Extracts 3-10 atomic concepts per video
  - [ ] Each concept has: name, definition, timestamp, confidence score
  - [ ] Processing completes within 30 seconds
  - [ ] 70%+ extraction accuracy verified on test videos
- Notes: Test on 20 videos BEFORE hackathon. This is the core thesis.
- Spec: [us-0003-concept-extraction.md](../specs/us-0003-concept-extraction.md)

#### US-0004: Concept-to-Syllabus Matching ⚠️ HIGHEST VALUE
- ID: US-0004
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want to know which concepts from my video match my course requirements so that I can see if I'm covering what my professor expects.
- Priority: P0
- Estimate: 6h
- Acceptance Criteria:
  - [ ] Matches extracted concepts to syllabus with confidence scores
  - [ ] ≥80% confidence shows as "Matched" (green)
  - [ ] 60-79% shows as "Partial Match" (yellow, requires confirmation)
  - [ ] <60% shows as "No Match" (gray)
  - [ ] 68%+ matching accuracy on test data
- Notes: Core differentiator. Without this, it's just another flashcard app.
- Spec: [us-0004-concept-to-syllabus-matching.md](../specs/us-0004-concept-to-syllabus-matching.md)

#### US-0005: Flashcard Generation
- ID: US-0005
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want auto-generated flashcards from matched concepts so that I can review and retain what I've learned.
- Priority: P0
- Estimate: 4h
- Acceptance Criteria:
  - [ ] Generates 1 flashcard per matched concept (confidence ≥80%)
  - [ ] Questions use active recall format (not yes/no)
  - [ ] Answers are concise (1-3 sentences)
  - [ ] Flashcards include source video timestamp
- Spec: [us-0005-flashcard-generation.md](../specs/us-0005-flashcard-generation.md)

### Review & Retention

#### US-0006: First Review Session
- ID: US-0006
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want to review flashcards immediately after processing a video so that I can start encoding concepts into long-term memory.
- Priority: P0
- Estimate: 5h
- Acceptance Criteria:
  - [ ] Shows one flashcard at a time with question → reveal answer flow
  - [ ] User rates each card as Easy, Medium, or Hard
  - [ ] Progress indicator shows "Card X of Y"
  - [ ] Completion summary shows next review schedule
  - [ ] Works on mobile (large tap targets)
- Spec: [us-0006-first-review-session.md](../specs/us-0006-first-review-session.md)

#### US-0007: Review Scheduling
- ID: US-0007
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want flashcards scheduled for optimal review intervals so that I retain concepts long-term.
- Priority: P0
- Estimate: 4h
- Acceptance Criteria:
  - [ ] Hard = 1 day, Medium = 1 day, Easy = 3 days (first review)
  - [ ] Repeat "Easy" reviews double the interval
  - [ ] Next review date stored and displayed
  - [ ] Timezone-aware scheduling (store UTC, display local)
- Notes: Use simple fixed intervals for MVP, not adaptive SM-2 algorithm
- Spec: [us-0007-review-scheduling.md](../specs/us-0007-review-scheduling.md)

### Progress & Analytics

#### US-0008: Progress Dashboard
- ID: US-0008
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want to see my progress toward course mastery so that I stay motivated.
- Priority: P1
- Estimate: 3h
- Acceptance Criteria:
  - [ ] Shows "X/Y concepts for [Course]" prominently
  - [ ] Visual progress bar
  - [ ] Breakdown: Mastered, In Progress, Not Started
  - [ ] Updates in real-time after video processing
- Notes: This is the "magic moment" visualization
- Spec: [us-0008-progress-dashboard.md](../specs/us-0008-progress-dashboard.md)

#### US-0009: Gap Analysis
- ID: US-0009
- Persona: Motivated Struggler
- Title: As a Motivated Struggler, I want to see which syllabus concepts I haven't learned yet so that I know exactly what to study before the exam.
- Priority: P1
- Estimate: 2h
- Acceptance Criteria:
  - [ ] Lists all unmatched syllabus concepts
  - [ ] Groups by category (if available)
  - [ ] Shows concept name + description
  - [ ] Empty state if no gaps: "🎉 You've covered all concepts!"
- Notes: Key differentiator - shows exactly what's missing
- Spec: [us-0009-gap-analysis.md](../specs/us-0009-gap-analysis.md)

### Admin/Setup

#### US-0012: Admin Pre-load Syllabi
- ID: US-0012
- Persona: Admin/Founder
- Title: As an admin, I need 3 course syllabi ready before demo so that students can select courses.
- Priority: P0
- Estimate: 4h
- Acceptance Criteria:
  - [ ] 3 syllabi parsed into required concepts
  - [ ] Each syllabus has 25-35 concepts
  - [ ] Syllabi available in course dropdown
- Notes: Manual process for MVP - pre-populate before hackathon

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

## Critical Path for Hackathon Demo

**Day 1 (Friday):**
- US-0012: Pre-load syllabi
- US-0001: Course selection
- US-0002: Video URL input

**Day 2 (Saturday) - CORE:**
- US-0003: Concept extraction ⚠️ HIGHEST RISK
- US-0004: Concept matching ⚠️ HIGHEST VALUE
- Validate 70%+ accuracy on test videos

**Day 3 (Sunday):**
- US-0005: Flashcard generation
- US-0006: Review interface
- US-0007: Review scheduling

**Day 4 (Monday AM):**
- US-0008: Progress dashboard
- US-0009: Gap analysis
- Polish and test demo flow

**Total estimated effort:** ~52-68 hours (parallelizable with pre-work)

**Note:** Only 9 MVP user stories documented (US-0001 to US-0009). US-0010, US-0011, US-0012 mentioned in original planning but not yet specified. US-0012 (Admin pre-load syllabi) is referenced in implementation plan but spec not yet created.

---

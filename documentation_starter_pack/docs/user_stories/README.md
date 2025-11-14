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

If you'd like, I can:

- Pre-populate this directory with the rest of the high-level user stories derived from `docs/vision.md` (I can infer personas from `vision.md`).
- Implement an AI command snippet you can paste into a chat to ask the AI to create specs from the selected story.

Tell me which you prefer and I will proceed.

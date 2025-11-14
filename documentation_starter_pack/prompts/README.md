# prompts/

Purpose

This directory holds reusable prompts meant for AI-assisted work on the project. Each file is intended to be loaded into your AI session (as the system or first assistant message) so the AI understands the project's conventions and expected behaviour.

Files

- `ai_system_prompt.md` — the main system prompt to set the AI's role, rules, and how it should behave when collaborating with the solo founder. Always load this as the system message at the start of an AI session.
- `ai_update_instructions.md` — practical instructions for asking the AI to propose edits, draft ADRs, create specs, and record session artifacts.
- `product_vision_prompt.md` — guides creation of the MVP vision: one-liner, 3–5 sentence summary, full description, and ICP.
- `user_stories_prompt.md` — produces MVP user stories and next-stage stories with context/trigger/outcome/success, following repo conventions.
- `tech_stack_prompt.md` — selects and justifies the tech stack with tradeoffs, risks, and an architecture overview; outputs `docs/tech_stack.md`.
- `data_schema_prompt.md` — defines entities, ERD, machine-readable schemas, dictionary, sample data, and migration/ADR notes.
- `ai_doc_update_prompt.md` — updates docs based on a commit/PR diff; outputs minimal patches for specs, architecture, data, ADRs, tasks, and changelog.

- `doc_backfill_existing_project_prompt.md` — guide for using AI (or a human-guided AI session) to inspect an existing codebase and produce a documentation backfill: identify missing docs, surface uncertainties, and propose actionable patch snippets and a prioritized plan for filling gaps.

How to use

1. Start a session by having the AI read `docs/context.md` and then load `prompts/ai_system_prompt.md` as the system prompt.
2. Use `prompts/ai_update_instructions.md` as a checklist during interactions to ensure outputs are actionable and documented (Summary, Decisions, Actions, Artifacts).
3. First-time flow (run these prompts in order):

- `product_vision_prompt.md`
- `user_stories_prompt.md`
- `tech_stack_prompt.md`
- `data_schema_prompt.md`

Onboarding / Backfill flow (existing projects):

- `doc_backfill_existing_project_prompt.md` — run this to generate a docs skeleton, surface TODOs, and produce candidate patches to bring documentation up to date.

4. Maintenance flow (on PRs/commits):

- Run `ai_doc_update_prompt.md` to generate doc patches based on the diff.
- Then run your verification/linter prompt to validate structure and cross-links.

5. Ask the AI to output edits as small patch snippets or a markdown diff so you can paste them into files or use scripts to apply them.

Best practices for AI consistency

- Keep these prompts minimal, explicit, and stable. Small changes to the system prompt should be intentional and versioned.
- Reference `docs/context.md` in the system prompt so the AI always starts from the canonical context bundle.
- Prefer short, deterministic instructions for doc edits (e.g., "Insert the following block under '## Key Decisions' in docs/architecture.md").
- When the AI proposes a decision affecting architecture, instruct it to draft an ADR using `docs/templates/ADR.md` and place it under `docs/decisions/`.

Versioning and change control

- If you edit any prompt, note the change in `docs/CHANGELOG.md` and record an AI session describing why the prompt changed.
- Use the prompts directory as part of the repo so new clones immediately have the same AI behaviour.

Notes

These prompts are small but powerful. Treat them as part of the product: changes can materially alter AI output and the project's documentation quality.

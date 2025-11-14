# AI Update Instructions

When collaborating with AI, use these steps to keep the docs in sync.

## Before Session

- Open `docs/context.md` and let AI read linked files.
- Paste or reference `prompts/ai_system_prompt.md` as the system message.
- For PRs/commits: provide the commit range and diff to the AI and run `prompts/ai_doc_update_prompt.md` to auto-generate doc patches before verification.

## During Session

- Ask AI to propose changes to specific docs (vision, architecture, tasks, specs) as patches/snippets.
- If a decision emerges, ask AI to draft an ADR using `docs/templates/ADR.md`.
- If a feature is shaping up, ask AI to draft a spec using `docs/templates/feature_spec.md`.

## After Session

- Run a session log: `make new-session title="<title>"`.
- Paste the session summary, decisions, actions, and artifacts using `docs/templates/session.md`.
- Move action items into `docs/tasks.md`.
- If this was a PR/commit docs update, attach the generated patches to the PR (or apply locally), then run your verification/linter pass.

## Automation Ideas (optional)

- Use a simple script to append AI session logs and open TODOs.
- In CI, collect a diff artifact (similar to `scripts/collect_diff_for_ai.sh`) and attach it to the PR so you can run the updater prompt manually in your editor.

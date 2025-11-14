# scripts/

Purpose

This folder contains small, cross-repo helper scripts designed to speed common documentation tasks and keep naming conventions consistent. They are zsh scripts intended to be run from the repository root.

Files

- `new_session.sh` — create a new AI session log in `docs/ai_sessions/` based on `docs/templates/session.md`. It names files using `YYYY-MM-DD-session-###.md` and will increment the index for the day.
- `new_adr.sh` — create a new ADR file in `docs/decisions/` using the `docs/templates/ADR.md` template. ADRs are named `ADR-XXXX-title-kebab-case.md` where `XXXX` is a 4-digit sequence.
- `new_spec.sh` — create a new feature spec in `docs/specs/` using `docs/templates/feature_spec.md`.
- `new_story.sh` — create a new user story file in `docs/user_stories/` and add an index entry in `docs/user_stories/README.md`.
- `collect_diff_for_ai.sh` — generate an AI-friendly diff payload from a commit range and save it under `docs/ai_sessions/auto-diff-*.md`. Use this as input to `prompts/ai_doc_update_prompt.md`.

Usage examples

Run from the repository root (zsh):

```bash
# create a new session file titled "Kickoff"
./scripts/new_session.sh "Kickoff"

# or via Makefile
make new-session title="Kickoff"

# create an ADR
./scripts/new_adr.sh "Choose auth provider"
make new-adr title="Choose auth provider"

# create a feature spec
./scripts/new_spec.sh "Uploads v1"
make new-spec title="Uploads v1"
# create a new story file (file-per-story)
./scripts/new_story.sh "Uploads" "Allow user uploads up to 10MB" "Registered user" P0 M
make new-story feature="Uploads" title="Allow user uploads up to 10MB" persona="Registered user" priority=P0 estimate=M
```

promote a story to a spec (creates spec stub and links it):

```bash
./scripts/promote_story.sh US-0001 "Uploads v1"
make promote-story id=US-0001 title="Uploads v1"

# collect a diff for the AI Doc Updater
./scripts/collect_diff_for_ai.sh               # last commit (HEAD~1..HEAD)
./scripts/collect_diff_for_ai.sh origin/main...HEAD
make docs-update range="origin/main...HEAD"

# run the AI Doc Updater manually with your editor's AI (no keys required)
# 1) Generate the diff (see above)
# 2) Open the generated docs/ai_sessions/auto-diff-*.md
# 3) In Copilot/Claude Chat, load prompts/ai_doc_update_prompt.md and paste the diff payload
# 4) Apply the returned patch blocks
```

Notes & safety

- These scripts are executable (`chmod +x scripts/*.sh`). They are safe: they only create files and will not overwrite existing files accidentally.
- A Husky `post-commit` hook runs `collect_diff_for_ai.sh` automatically for the last commit and writes an `auto-diff-*.md` file under `docs/ai_sessions/` for you to load with the updater prompt.
- There is no automated API call in this repo. Use your editor's AI (Copilot/Claude) interactively with the generated auto-diff file and `prompts/ai_doc_update_prompt.md`.
- `new_session.sh` and others use simple, POSIX-compatible commands and are written for zsh/bash on macOS and Linux.
- If you modify templates in `docs/templates/`, the scripts will use the updated templates.
- If you want the scripts to commit created files automatically, you can extend them to commit using `git` and a bot token — but be careful with token scope and automation loops.

Customization

- You can set the `MODEL` environment variable before running `new_session.sh` to annotate which AI model was used (the script will inject it into the session metadata):

```bash
MODEL=chatgpt-... ./scripts/new_session.sh "Sync"
```

- The scripts are intentionally small and easy to copy into other repositories.

Troubleshooting

- If a script fails with permission denied, ensure they are executable:

```bash
chmod +x scripts/*.sh
```

- If the script reports template not found, ensure you have the `docs/templates/` files in place.

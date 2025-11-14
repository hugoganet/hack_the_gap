# Project Documentation Starter Pack

A lightweight, AI-first documentation methodology and ready-to-clone starter kit for solo founders. It keeps your product vision, architecture, plans, and AI conversations in one place so any new AI instance (or human) can load full context instantly.

## Quickstart

- Clone this folder into a new repo as `/docs` starter.
- Update `project.yaml` with project metadata.
- Skim `docs/context.md` to see how to keep the “context bundle” current.
- Start your first AI working session: `make new-session title="Kickoff"`.

## Philosophy

- Single source of truth: the docs directory is canonical for product, architecture, decisions, and progress.
- AI as a collaborator: prompts and scripts make it easy to log sessions and update docs.
- Continuity: every session links back to the context bundle and forwards to next steps.
- Reproducibility: any AI can reconstruct context by reading the context bundle and linked docs.

## Structure (high-level)

```text
README.md                 # This file: how to use the kit
project.yaml              # Machine-readable project metadata

/docs/
  context.md              # "Context bundle" index for AI + humans
  vision.md               # Product vision, scope, personas, value
  architecture.md         # System overview, diagrams, interfaces
  tasks.md                # Lightweight kanban (Backlog/WIP/Done)
  roadmap.md              # Time-phased outcomes and key bets
  CHANGELOG.md            # Human-facing change log
  MAINTENANCE.md          # Hygiene & evolution practices
  
  /ai_sessions/           # Logged AI collab sessions
  /decisions/             # ADRs (Architecture Decision Records)
  /specs/                 # Feature/API specs
  /templates/             # Reusable templates (ADR, session, spec)
  /data/                  # Data docs (dictionary, schema, samples)

/prompts/                 # System & update prompts for AI
/scripts/                 # Helper scripts (new session/ADR/spec)
```

## Workflows

- AI sessions
  - Start with `docs/context.md` loaded in your AI chat.
  - Use the system prompt in `prompts/ai_system_prompt.md`.
  - Log each session using `make new-session title="..."`.
  - Summarize, record decisions, and add action items. Link to files changed.

- Decisions (ADRs)
  - When choices shape architecture or scope, write an ADR.
  - Use `make new-adr title="Choose auth provider"`.

- Specs
  - For any non-trivial feature/API, write a spec.
  - Use `make new-spec title="Feature: Uploads v1"`.

## Naming conventions

- AI sessions: `YYYY-MM-DD-session-###.md` (e.g., `2025-10-26-session-001.md`).
- ADRs: `ADR-XXXX-title-kebab-case.md` where `XXXX` is a 4-digit sequence.
- Specs: `feature-title-kebab-case.md`.

## What makes this AI-friendly

- `docs/context.md` is the canonical context entry-point.
- Every session logs links to the exact context used and artifacts produced.
- Prompts guide AI to update docs and propose ADRs when decisions emerge.

See `docs/README.md` and `docs/context.md` for the detailed flow.

## Directory READMEs

For quick onboarding and discoverability, this repository includes README files inside key directories — load these when you want focused guidance:

- `prompts/README.md` — how to use and version the system prompts used for AI sessions.
- `scripts/README.md` — explains the helper scripts, usage examples, and safety notes.

Open those files directly or point your AI to them when starting a focused session.

## Local Markdown lint

Run the linter locally before pushing or opening PRs to catch issues early. Example (uses markdownlint-cli2):

```bash
# install once
npm install -g markdownlint-cli2

# run lint
markdownlint-cli2 '**/*.md' --config .markdownlint.json

# quick autofix (run locally, review changes before committing)
markdownlint-cli2 --fix '**/*.md' --config .markdownlint.json
```

This mirrors the CI workflow so you get the same feedback locally.

## Pre-commit hook (recommended)

To run linters automatically on staged files, install dev deps and enable Husky.


1. Install the recommended dev dependencies once in this repo:

```bash
npm install --save-dev husky lint-staged markdownlint-cli2 prettier eslint
```

1. Activate Husky hooks (runs `husky install`):

```bash
npm run prepare
```

Now every `git commit` will run `lint-staged`, which will:

- fix markdown issues with `markdownlint-cli2 --fix` and run `prettier --write` on staged `.md` files
- run `eslint --fix` and `prettier --write` on staged JS/TS files


Notes:

- If you don't want Prettier to run on MD files remove the `prettier` line from `package.json`'s `lint-staged` config.
- If you already have ESLint/Prettier configuration in your projects, lint-staged will call your configured commands (so this setup composes with your existing rules).

See `package.json` for the exact `lint-staged` configuration added to this starter pack.

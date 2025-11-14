# Context Bundle

This is the single entry point for reconstructing project context. AI tools and humans should start here.

## Project Snapshot

- Name: hack the gap (temporary - name TBD)
- Summary: AI-powered Zettelkasten that auto-converts students' passive content consumption into active long-term retention via concept extraction and spaced repetition
- Stage: discovery (48-hour hackathon MVP)
- Last updated: 2025-11-13

## Core Documents

- Vision: ./vision.md
- Architecture: ./architecture.md
- Roadmap: ./roadmap.md
- Tasks: ./tasks.md
- Decisions (ADRs): ./decisions/
- Specs: ./specs/
- Change log: ./CHANGELOG.md
- Data docs: ./data/

## How to Use with AI

- Load this file and all linked docs as context for the AI session.
- Use the system prompt in `../prompts/ai_system_prompt.md`.
- After a session, log it in `./ai_sessions/` and reference this context bundle version.

- For reconstructing or backfilling documentation in an existing repo, run `../prompts/doc_backfill_existing_project_prompt.md` so the AI (or an AI-assisted human session) can identify missing docs, surface uncertainties, and propose actionable patch snippets.

## First-time flow (new projects)

Run prompts in this order to establish a solid foundation:

1. Product Vision → `../prompts/product_vision_prompt.md`
2. User Stories → `../prompts/user_stories_prompt.md`
3. Tech Stack → `../prompts/tech_stack_prompt.md`
4. Data Schemas → `../prompts/data_schema_prompt.md`

Then record ADRs and Specs as needed under `./decisions/` and `./specs/`.

## Current Focus

- High-level goal: Build 48-hour hackathon MVP proving that auto-generated Zettelkasten from passive content consumption improves student retention
- Key risks: Concept matching accuracy (<50% = lost trust), retention validation in 4 days, AI extraction quality from varied YouTube content
- Next milestone: Pre-hackathon validation (test extraction on 20 videos, recruit 3 beta students, pre-download 5 syllabi)

## Recent Decisions

- See ADRs in `./decisions/`. Highlight the latest:
  - ADR-0001: Chosen architecture style
  - **2025-11-13**: Product vision defined - Zettelkasten as backend engine, simple UX for students
  - **2025-11-13**: MVP scope - 48h hackathon, accept 20-30% error rate, YouTube only, 3 pre-populated syllabi
  - **2025-11-13**: Validation criteria - 70%+ concept extraction accuracy, 80%+ retention after 24h (vs 20% baseline)

## Recent Sessions

- See `./ai_sessions/`. Latest: 2025-11-13-session-002.md (Product Vision Definition)

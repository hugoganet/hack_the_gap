# docs/data/ — Data documentation

Purpose

This directory contains the minimal set of data-focused documentation and artifacts you should copy into every new project. It helps AI and humans understand data shapes, contracts, privacy requirements, and provides small sample records for testing and examples.

Files (starter)

- `data_dictionary.yml` — human-readable data dictionary describing tables/records and columns.
- `schema.yml` — canonical JSON-Schema / YAML schema for the primary record(s).
- `sample_records.jsonl` — a small sample dataset (one JSON object per line) for examples and testing.
- `contracts.md` — event/message contract definitions and versioning rules.
- `privacy.md` — privacy/PII mapping and retention policy guidance.

How AI should use these files

- Always load `docs/data/README.md` alongside `docs/context.md` at session start when discussing data changes.
- Use `data_dictionary.yml` to answer questions about field meanings, types, and constraints.
- Use `schema.yml` to validate sample data and generate data migration SQL or validation logic.
- Use `sample_records.jsonl` as concrete examples for generating tests and running quick local validations.
- When proposing schema or contract changes, ask AI to produce a spec patch, a migration plan, and a corresponding ADR when necessary.

Notes

- Do NOT include real production PII in `sample_records.jsonl`. Use synthetic or anonymized examples only.
- Keep schemas machine-readable and small; add richer docs and examples in the app repo as needed.

Example quick prompt (copy-paste)

"Load docs/context.md and docs/data/README.md plus all files in docs/data/. Identify any schema mismatches between the feature spec at docs/specs/feature-*.md and the declared schema in docs/data/schema.yml. If changes are needed, propose a minimal schema.yml patch and a migration checklist."

## Entity Relationship Diagram

- See `./erd.md` for the current ERD (Mermaid). Keep this updated when entities or relationships change.

## Migration Checklist

- Create or alter base tables and indexes
- Validate sample data against `schema.yml`
- Apply retention policies per `privacy.md`
- Verify foreign keys and constraints before launch
- Backfill and data seeding steps (if applicable)

## ADRs to Draft

- (list data-impacting decisions here, e.g., normalization strategy, soft deletes, event retention)

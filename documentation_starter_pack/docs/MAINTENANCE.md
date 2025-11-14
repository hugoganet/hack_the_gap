# Documentation Maintenance

## Principles

- Update little and often; prefer small diffs over big rewrites.
- Context first: keep `context.md` accurate; link deeply to sources.
- Decisions matter: log ADRs when choices influence architecture or scope.

## Hygiene Routines

- After each AI session: log `ai_sessions/*` and update action items in `tasks.md`.
- Weekly: review `roadmap.md` and `tasks.md` alignment.
- When shipping a feature: add to `CHANGELOG.md` and link to spec.

## Naming

- Sessions: `YYYY-MM-DD-session-###.md`
- ADRs: `ADR-XXXX-title-kebab-case.md`
- Specs: `feature-title-kebab-case.md`

## Quality Bar

- Each doc has a clear purpose and owner (you!).
- Link to source files, PRs, and ADRs whenever possible.
- Keep mermaid diagrams rendering and updated.

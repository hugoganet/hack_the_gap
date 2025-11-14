# Data privacy and PII guidance

This document provides a minimal privacy map and retention guidance for projects using this starter kit. Treat it as an operational checklist, not legal advice. Consult counsel for compliance-critical decisions.

PII mapping (starter)

- email: PII — hashed before sending to analytics; store encrypted at rest.
- display_name: non-sensitive by default, but treat free-text content as potentially sensitive if other PII is present.
- user_id: internal identifier (UUID) — not PII by itself; avoid exposing it publicly.

Retention policy (starter)

- Authentication records (users): retain for 2 years after account deletion unless otherwise required by law.
- Event streams: keep raw events for 90 days; aggregate or purge raw events after that window for analytics.

Anonymization and synthetic data

- Use synthetic or anonymized records in `docs/data/sample_records.jsonl`.
- For downstream analytics, prefer hashed identifiers (salted) rather than raw emails.

Access and discovery

- Limit access to datasets containing PII to team members with clear need-to-know.
- Document datasets containing PII in `docs/data/data_dictionary.yml` with `pii: true` on affected fields.

When making changes

- If schema changes add new PII fields, create an ADR under `docs/decisions/` documenting justification and retention.
- Update `privacy.md` and `data_dictionary.yml` when discovery uncovers new PII.

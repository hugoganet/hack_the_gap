# Data contracts and event/message versioning

This file documents simple rules for message and data contracts used by integrations and event streams.

Contract rule set (starter)

- Semantic versioning: use MAJOR.MINOR.PATCH for schema versions.
  - MAJOR: breaking changes (rename/remove fields, change types)
  - MINOR: additive, backwards-compatible changes (new optional fields)
  - PATCH: fixes to documentation or clarifications only
- Add new optional fields rather than changing or removing fields when possible.
- When you must introduce a breaking change:
  1. Create a new versioned contract (e.g., v2/users.event.json).
  2. Emit both new and legacy events during a migration window if feasible.
  3. Document migration steps and the intended end-of-life date for the old contract.

Message envelope (recommended)

All events/messages should use a simple envelope to aid routing and validation:

```json
{
  "spec_version": "1.0",
  "contract": "com.example.users.event",
  "schema_version": "1.0.0",
  "payload": { }
}
```

Validation and governance

- Keep a single source-of-truth contract file under `docs/data/` or `specs/contracts/`.
- Update the contract and the `docs/decisions/` ADR when making breaking changes.
- Add a lightweight CI check (optional) to run schema validation against `sample_records.jsonl` during PRs.

# ADR-0010 — Inline Flashcard Generation and Bilingual Concepts

Status: Proposed  
Date: 2025-11-17  
Decision Drivers: Faster study readiness, higher content accessibility, reduced post-processing complexity

## Context

We currently extract a hierarchical knowledge structure from a user-provided learning goal:

- AI extraction: `src/lib/ai/hierarchical-extraction.ts` (system prompt: `src/master-prompts/hierarchical-knowledge-extraction-prompt.md`)
- Validation gates: `src/lib/validation/extraction-quality.ts`
- Persistence: `src/lib/db/create-knowledge-structure.ts` (Subject → Course → KnowledgeNodes → SyllabusConcepts → NodeSyllabusConcept → UserCourse)

We validated a real extraction payload (`extracted-knowledge-structure.json`) against the existing quality gates:

- allConceptsAtomic=true, completeHierarchy=true, logicalRelationships=true, noDuplicates=true
- extractionConfidence=0.87, treeDepth=5, totalAtomicConcepts=55
- requiresReview=false, qualityScore=95

Current limitations:

- Flashcards are not created inline at extraction time (requires a separate generation step).
- Concepts and flashcards are monolingual; the product goal requires bilingual support (e.g., English + French) for global accessibility.

## Decision

We will:

1) Extend the extraction output contract and DB transaction to generate flashcards inline for each atomic concept, so study is possible immediately after course creation.

2) Introduce bilingual content as first-class data:
   - Concepts will store canonical identity, with localized representations (EN, FR) in dedicated localization tables.
   - Flashcards created inline will also store localized content (question, answer, hints, explanation) in localization tables.

3) Update the prompt specification to return bilingual content blocks (or a consistent localization payload) per atomic concept, including ready-to-use flashcard candidates.

## Rationale

- Inline flashcards eliminate post-processing steps and reduce user friction.
- Bilingual content broadens accessibility and prepares for international users.
- Keeping canonical rows + localization tables keeps the model normalized and migration-friendly (future locales can be added without schema changes to canonical tables).

## Technical Design (Draft)

### Data Model Sketch

- concepts (canonical)
  - id (uuid)
  - course_id (FK)
  - path (string, unique within course, stable)
  - parent_path (string, for integrity in creation phase)
  - category (enum/string)
  - importance (int)
  - order (int)
  - metadata (json)

- concept_localizations
  - id (uuid)
  - concept_id (FK)
  - locale (string: 'en', 'fr')
  - concept_text (text)
  - metadata (json)

- flashcards (canonical)
  - id (uuid)
  - concept_id (FK)
  - metadata (json)
  - generated_at (timestamp)

- flashcard_localizations
  - id (uuid)
  - flashcard_id (FK)
  - locale (string: 'en', 'fr')
  - question (text)
  - answer (text)
  - hint (text, nullable)
  - explanation (text, nullable)
  - metadata (json)

Notes:
- Existing `syllabus_concepts` can map to `concepts` (migration path).
- `nodeSyllabusConcept` relationships remain but will point to `concepts`.
- Unique slugs for knowledge nodes remain unchanged.

### Prompt Contract Extension (High Level)

For each atomic concept:
- Provide localization blocks:
  - EN: concept_text_en, flashcard: question_en, answer_en, hint_en?, explanation_en?
  - FR: concept_text_fr, flashcard: question_fr, answer_fr, hint_fr?, explanation_fr?
- Maintain `path`, `parentPath`, `order`, `category`, `importance` for integrity.
- Retain quality signals (atomicity, completeHierarchy) as we do today.

### API/Service Changes

- `extractHierarchicalKnowledge`:
  - Return localized content blocks and flashcard candidates.
- `createKnowledgeStructure`:
  - Within the same transaction:
    - Create concepts (canonical)
    - Upsert concept_localizations (EN/FR)
    - Create flashcards (canonical)
    - Upsert flashcard_localizations (EN/FR)
    - Link concepts to nodes and enroll user
- Validation:
  - Reuse existing gates (atomicity, completeness)
  - Add minimal checks that both locales are present for required fields

## Alternatives Considered

- Post-process flashcards after course creation (keeps extraction smaller but adds latency, complexity, and failure points).
- Only localize concepts (not flashcards): reduces effort but degrades study UX for non-English users.
- Store bilingual content as a single JSON blob: faster to implement but complicates querying/indexing and future locale expansion.

## Impact and Trade-offs

- Larger AI response payloads (must ensure parser resilience).
- More complex transaction (additional tables and referential integrity).
- Requires clear migration strategy for existing data.
- UX improves: students can study immediately; international users get native-language content.

## Migration Plan (High Level)

1) Create new tables: concepts, concept_localizations, flashcards, flashcard_localizations.
2) Backfill:
   - Map existing `syllabus_concepts` → `concepts` (canonical).
   - Create `concept_localizations` from existing monolingual text (default locale = 'en' or source language).
   - For courses with existing flashcards, migrate to canonical + localization tables.
3) Update services and routes to write new structure.
4) Gradual rollout: feature flag for inline flashcards + bilingual prompt.

## Testing Strategy

- Unit tests for validation and schema writes (transaction success and rollback).
- API tests for /api/courses with bilingual extraction payloads.
- Data integrity tests:
  - Every localized record has a canonical parent
  - Unique constraints and links preserved
- Performance checks: response parsing, transaction time.

## Open Questions

- Should we store canonical language at the concept/flashcard level to prefer one locale when multiple are present?
- Do we enforce both locales required at creation time or allow partial localization?
- How do we handle locale fallbacks in the UI?

## Decision

Approved to proceed with design refinement and implementation plan. Prompt and schema updates will follow this ADR. A feature flag will gate rollout.

## Consequences

- New migrations and service changes are required.
- Documentation updates required in data dictionary, ERD, specs, and architecture.
- The prompt must be updated and validated with large payload handling.

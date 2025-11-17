# 2025-11-17 — Session 005 — Validation of Hierarchical Extraction + Next Steps

Context bundle loaded:
- Code paths inspected:
  - app/dashboard/courses/_components/create-course-dialog.tsx
  - app/api/courses/route.ts
  - src/lib/ai/hierarchical-extraction.ts
  - src/lib/validation/extraction-quality.ts
  - src/lib/db/create-knowledge-structure.ts
- Prompt file: src/master-prompts/hierarchical-knowledge-extraction-prompt.md
- Test artifact: extracted-knowledge-structure.json

## Summary

- Mapped the exact submit flow:
  - Client form submit → POST /api/courses → AI extraction → quality validation → DB transaction (subject, course, nodes, concepts, user enrollment).
- Validated a real extraction payload programmatically against our quality gates.
- Decision: Stop here to plan DB schema changes and a prompt update enabling:
  1) Inline flashcard generation at the time concepts are extracted.
  2) Bilingual concepts/flashcards for improved accessibility.

## Flow Trace (high-level, code references)

- Client submit: app/dashboard/courses/_components/create-course-dialog.tsx → onSubmit
  - POST /api/courses with { subject, name, learningGoal }.
- API route: app/api/courses/route.ts
  1) getUser()
  2) Input validation
  3) extractHierarchicalKnowledge(...) → src/lib/ai/hierarchical-extraction.ts
     - Loads prompt: src/master-prompts/hierarchical-knowledge-extraction-prompt.md
     - openai("gpt-4o") via ai-sdk streamText
     - parseAIResponse(): strips ```json, JSON.parse, structure checks
  4) validateExtractionQuality(...) → src/lib/validation/extraction-quality.ts
  5) createKnowledgeStructure(prisma, user.id, extraction) → src/lib/db/create-knowledge-structure.ts
     - Subject upsert → Course create → KnowledgeNodes → SyllabusConcepts → NodeSyllabusConcept links → UserCourse enrollment
  6) Response → client navigates to /dashboard/courses/[id]

## Validation Results (programmatic)

Validated file: extracted-knowledge-structure.json

Using: src/lib/validation/extraction-quality.ts

Outcome:
- validateConceptsMatchTree: PASSED
- validateExtractionQuality: PASSED

Key metrics:
- subject: "History"
- course: "Ancient Greek History"
- totalAtomicConcepts: 55
- treeDepth: 5
- extractionConfidence: 0.87
- inputType: "moderate"
- requiresReview: false
- qualityScore: 95

Quality flags:
- allConceptsAtomic: true
- appropriateDepth: true
- completeHierarchy: true
- logicalRelationships: true
- noDuplicates: true

## Decision: Pause and Plan Enhancements

We stop implementation here to design:
1) Database schema adjustments to support:
   - Inline flashcard generation (create flashcards at the same time concepts are extracted).
   - Bilingual concepts and flashcards (store both languages and maintain relationships).
2) Prompt update so the AI returns:
   - Atomic concepts with ready-to-use flashcard candidates.
   - Bilingual fields for concept_text/question/answer (e.g., en + fr), or a consistent localization payload.

Rationale:
- Eliminates a post-processing step for flashcards.
- Ensures every concept can be studied immediately.
- Improves accessibility and product reach with bilingual content from day one.

## Proposed Technical Direction (draft)

- Data model (sketch):
  - concepts (canonical rows)
  - concept_localizations (locale, concept_text, metadata)
  - flashcards (canonical rows, concept_id FK)
  - flashcard_localizations (locale, question, answer, hint?, explanation?)
- API:
  - create-knowledge-structure extended to persist flashcards + localizations transactionally.
- Prompt contract:
  - Extend hierarchical-extraction output to include:
    - For each atomic concept: flashcardCandidate(s) with bilingual localization blocks.
    - Explicit locale tags (e.g., "en", "fr") and stable keys (path-based ID remains).
  - Preserve atomicity and parentPath integrity. 

## Risks & Considerations

- JSON size increase with bilingual/localized blocks.
- Parser robustness: continue stripping code fences and validating structure.
- Transactional complexity: flashcards + localizations create order and foreign keys need careful orchestration.
- Migration and backfill strategy for legacy data.

## Actions

- Draft ADR-0010 to capture the decision for:
  - Bilingual concepts/flashcards
  - Inline flashcard generation during extraction
  - Schema and prompt changes
- Update prompt specification and schema doc once ADR is approved.
- Prepare migration plan + backfill scripts.

## Artifacts

- Input: extracted-knowledge-structure.json (validated)
- Code references: see Flow Trace
- Next: ADR-0010 (to be authored)

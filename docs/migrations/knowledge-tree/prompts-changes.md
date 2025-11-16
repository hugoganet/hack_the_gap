# Master Prompts Migration Guide (Tree-Only Knowledge Hierarchy)

Scope: Remove all Academic Year and Semester dependencies from prompts and align generation with a flexible Subject knowledge hierarchy. Introduce optional taxonomy guidance that can later map to KnowledgeNodes. This document includes exact replacement blocks and diffs for prompt engineers.

Important: These are documentation diffs. Do not edit runtime prompts until application code is ready to ingest the new shapes.

----------------------------------------------------------------
1) Syllabus Concept Extraction Prompt
File: src/master-prompts/syllabus-concept-extraction-prompt.md

Design goals:
- Remove time-based metadata (Academic Year, Semester).
- Keep Subject and Course metadata.
- Maintain Concepts array structure (conceptText, category, importance, order).
- Add optional taxonomy hints: proposedCategoryPath to seed knowledge hierarchy design (non-breaking; can be ignored).
- Update validation and examples accordingly.

A) Header and Primary Objective

Find:
- “Primary Objective” section and metadata bullet:
  1. Course Metadata: Subject, academic year, semester, course details

Replace with:
  1. Course Metadata: Subject and course details (no academic year or semester)
  2. Concepts Array: 20-35 atomic, testable concepts with categorization
  3. Metadata: Extraction quality metrics and notes

B) Remove Academic Year and Semester rules

Find and remove entire sections titled:
- Academic Year (including bullets for French/US systems)
- Semester (including French/US mapping and validation)

C) Replace with Knowledge Taxonomy guidance

Insert after “Rule 5: Category Assignment”:

Knowledge Taxonomy (Optional Guidance):
- In addition to category, you may propose a hierarchical path for each concept that could fit into a subject knowledge tree. Example:
  proposedCategoryPath: ["Philosophy", "Epistemology", "Sources of Knowledge"]
- Only provide this if the syllabus offers clear thematic structure (units, modules). Otherwise omit.

D) Output JSON Schema update

Find the entire JSON schema block and replace with:

{
  "subject": {
    "name": "string (2-50 chars, capitalized, standard academic subject)"
  },
  "course": {
    "code": "string (6-15 chars, official course code)",
    "name": "string (10-200 chars, full course title)",
    "ueNumber": "string | null (format: 'UE 1', 'UE 2', etc. if present)",
    "syllabusUrl": "string | null (URL if provided)"
  },
  "concepts": [
    {
      "conceptText": "string (3-100 chars, atomic concept name)",
      "category": "string | null (2-50 chars, thematic grouping)",
      "importance": "integer | null (1, 2, 3, or null)",
      "order": "integer (sequential, starting from 1)",
      "proposedCategoryPath": "array<string> | null (optional hierarchical path under the Subject)"
    }
  ],
  "metadata": {
    "totalConcepts": "integer (count of concepts array)",
    "categoriesFound": "array of strings (unique categories)",
    "extractionConfidence": "number (0.0-1.0, your confidence score)",
    "notes": "string (observations, caveats, important context)"
  }
}

Notes:
- proposedCategoryPath is optional and can be omitted or null.
- Keep category to preserve compatibility.

E) Pre-Output Validation Checklist

Replace the validation section to remove Academic Year and Semester checks:

Subject Validation:
- [ ] Subject name is a standard academic discipline
- [ ] Name is properly capitalized
- [ ] No abbreviations used

Course Validation:
- [ ] Course code is 6-15 characters
- [ ] Course name is 10-200 characters
- [ ] UE number matches format ^UE \d+$ or is null
- [ ] Syllabus URL is valid URL or null

Concepts Validation:
- [ ] Total concepts: 15-50 (warn if outside range)
- [ ] Each concept has conceptText and sequential order (1..N)
- [ ] conceptText length 3-100; category is 2-50 or null
- [ ] Importance is 1, 2, 3, or null
- [ ] No duplicate conceptText
- [ ] At least 30% concepts have importance = 3

Metadata Validation:
- [ ] totalConcepts matches array length
- [ ] categoriesFound matches unique categories in concepts
- [ ] extractionConfidence is 0.0-1.0
- [ ] notes provides useful context

F) Examples Update

- Remove references to “Academic Year” and “Semester” in example inputs/outputs.
- Keep Subject and Course fields.
- Optionally include proposedCategoryPath examples in concept items when the syllabus clearly implies hierarchy (units/modules).

Example (excerpt):
"concepts": [
  {
    "conceptText": "Transcendental Idealism",
    "category": "Epistemology",
    "importance": 3,
    "order": 8,
    "proposedCategoryPath": ["Philosophy", "Epistemology", "Kant"]
  }
]

----------------------------------------------------------------
2) Flashcard Generation Prompt
File: src/master-prompts/flashcard-generation-prompt.md

Design goals:
- Keep academicLevel (1-6) as a general difficulty proxy (not time-based semester/year).
- Add optional KnowledgeNode context to bias phrasing to a subdomain.
- No change to output JSON; change is to input context and generation guidelines only.

A) Context Integration section

Replace the bullet:
4. Subject Domain: Determines appropriate question style
5. Timestamp: Include for source attribution

With:
4. Subject Domain & Optional Node Context:
   - Use the Subject domain to tailor difficulty and terminology.
   - If a knowledge node path is available (e.g., ["Philosophy", "Epistemology", "Skepticism"]), bias examples and phrasing to that subdomain’s scope.
5. Timestamp: Include for source attribution

B) Input Data Structure

Augment the course section to include optional nodePath (non-breaking; optional):

// Course context
course: {
  code: string,         // e.g., "PHIL301"
  name: string,         // e.g., "Kant's Moral Philosophy"
  subject: string,      // e.g., "Philosophy"
  academicLevel: number,// 1-6 (1=Freshman, 6=PhD)
  nodePath?: string[]   // Optional: e.g., ["Philosophy", "Epistemology", "Skepticism"]
}

C) Generation Rules

Add under “Subject-Specific Considerations”:
- If nodePath is provided, scope the question to that subdomain. Avoid jumping to distant subfields unless relevant to the concept’s definition.

D) Examples

Add an example where nodePath guides phrasing:
"course": {
  "code": "PHIL301",
  "name": "Kant's Moral Philosophy",
  "subject": "Philosophy",
  "academicLevel": 3,
  "nodePath": ["Philosophy", "Epistemology", "Kant"]
}

Question phrasing can reference “In Kantian epistemology...” or keep within that scope.

----------------------------------------------------------------
3) Change Management Notes

- These changes decouple prompts from academic calendar constructs and align them with a subject-centric knowledge hierarchy.
- The syllabus prompt schema change is backward-compatible if the application ignores unknown fields (proposedCategoryPath). If strict parsing is used, gate deployment until the backend accepts the field or omit it initially.
- The flashcard prompt only extends input structure and guidance; output schema remains unchanged.

----------------------------------------------------------------
4) Rollout Strategy

Phase A (Safe):
- Apply “removal” edits (delete Academic Year/Semester sections and validation).
- Keep current concepts schema (without proposedCategoryPath) if backend is strict.
- Update examples to remove semester/year references.

Phase B (Optional Enhancement):
- Add proposedCategoryPath in output schema once backend ingestion is ready to accept/ignore it.
- Start generating nodePath in the context for flashcards once KnowledgeNodes exist.

----------------------------------------------------------------
5) QA Checklist for Prompt Engineers

Syllabus Extraction:
- No mentions of academic year/semester anywhere.
- Examples updated accordingly.
- JSON schema validates without year/semester keys.
- If proposedCategoryPath is present in output, examples include 1-2 items with clear paths.

Flashcard Generation:
- nodePath documented as optional input.
- Generation rules mention nodePath scoping.
- At least one example uses nodePath for phrasing bias.

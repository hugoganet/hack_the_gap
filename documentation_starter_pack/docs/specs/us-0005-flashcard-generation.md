# Feature Spec: US-0005 - Flashcard Generation

Owner: Founder
Status: Draft
Last Updated: 2025-11-14

## Summary

Auto-generate flashcards from matched concepts for spaced repetition review. Each matched concept becomes a question-answer flashcard suitable for retention testing.

**Why now:** Without flashcards, students have no way to review concepts. This converts extracted knowledge into actionable review material.

## User Stories

- As a Motivated Struggler, I want auto-generated flashcards from matched concepts so that I can review and retain what I've learned without manual card creation.

## Acceptance Criteria

**Given** concepts have been matched to the syllabus
**When** flashcard generation runs
**Then** each matched concept (confidence ≥80%) generates exactly 1 flashcard

**Given** a flashcard is generated
**When** stored in the database
**Then** it has: question, answer, concept_id, source_video_id, difficulty_hint

**Given** a user views generated flashcards
**When** they click "Review Concepts"
**Then** they see a list of flashcards with question previews

**Detailed Acceptance Criteria:**

- [ ] Only matched concepts (confidence ≥80%) generate flashcards
- [ ] Questions are clear, testable, and use active recall format
- [ ] Answers include the concept definition plus context from video
- [ ] Flashcards include source link back to video timestamp
- [ ] Generation completes within 10 seconds per video
- [ ] Users can preview all flashcards before starting review
- [ ] Questions avoid yes/no format (require actual recall)

## UX & Flows

```
[Matching complete: 3 concepts matched]
    ↓
[Generating flashcards...]
    ↓
[Flashcard Preview Screen]

Generated 3 flashcards from this video:

📇 Card 1: Categorical Imperative
   Q: What is Kant's Categorical Imperative?
   [Preview answer ▾]

📇 Card 2: Deontological Ethics
   Q: How does deontological ethics differ from consequentialism?
   [Preview answer ▾]

📇 Card 3: Moral Law
   Q: According to Kant, what makes a maxim a universal moral law?
   [Preview answer ▾]

[Button: Start Review (3 cards) →]
[Button: Skip for now]
```

## Scope

**In scope:**

- Auto-generate 1 flashcard per matched concept
- Question-answer format (simple, proven)
- Source attribution (link to video timestamp)
- Difficulty hints (based on concept complexity)
- Preview interface before review
- Skip flashcard generation option (don't force review immediately)

**Out of scope:**

- Multiple flashcard types (cloze deletion, multiple choice) - post-MVP
- User editing of generated flashcards - post-MVP
- Multiple flashcards per concept - post-MVP
- Image/diagram inclusion in flashcards - post-MVP
- Flashcard difficulty adjustment based on performance - post-MVP
- Manual flashcard creation by user - post-MVP

## Technical Design

**Components impacted:**

- `FlashcardGenerator.ts` (new service)
- `AIService.ts` (GPT-4 for question generation)
- `FlashcardPreview.tsx` (UI component)
- Database: `flashcards` table

**Generation Logic:**

```typescript
interface Flashcard {
  id: string;
  conceptId: string;
  question: string;
  answer: string;
  sourceVideoId: string;
  sourceTimestamp: string;
  difficultyHint: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

async function generateFlashcards(
  matches: MatchResult[]
): Promise<Flashcard[]> {
  const flashcards: Flashcard[] = [];

  // Only generate for high-confidence matches
  const confirmedMatches = matches.filter(m => m.confidence >= 0.8);

  for (const match of confirmedMatches) {
    const concept = await getConcept(match.extractedConceptId);
    const syllabusConcept = await getSyllabusConcept(match.syllabusConceptId);

    const flashcard = await generateSingleFlashcard(concept, syllabusConcept);
    flashcards.push(flashcard);
  }

  return flashcards;
}

async function generateSingleFlashcard(
  concept: ExtractedConcept,
  syllabusConcept: SyllabusConcept
): Promise<Flashcard> {
  const prompt = `
Generate a flashcard for spaced repetition learning.

CONCEPT NAME: ${concept.name}
DEFINITION: ${concept.definition}
COURSE CONTEXT: ${syllabusConcept.description}

Create a question that tests understanding and recall (not recognition).

RULES:
- Use "What is...", "How does...", "Why...", "Explain..." question formats
- Avoid yes/no questions
- Question should test the core idea, not trivia
- Answer should be 1-3 sentences (concise but complete)

OUTPUT FORMAT (JSON):
{
  "question": "Clear, testable question",
  "answer": "Concise, accurate answer",
  "difficultyHint": "easy" | "medium" | "hard"
}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content);

  return {
    id: generateId(),
    conceptId: concept.id,
    question: result.question,
    answer: result.answer,
    sourceVideoId: concept.videoJobId,
    sourceTimestamp: concept.timestamp,
    difficultyHint: result.difficultyHint,
    createdAt: new Date()
  };
}
```

**Data Model:**

```sql
CREATE TABLE flashcards (
  id VARCHAR(50) PRIMARY KEY,
  concept_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_video_id VARCHAR(50),
  source_timestamp VARCHAR(10),
  difficulty_hint VARCHAR(10), -- easy, medium, hard
  times_reviewed INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  last_reviewed_at TIMESTAMP,
  next_review_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (concept_id) REFERENCES concepts(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (source_video_id) REFERENCES video_jobs(id),
  INDEX idx_user_next_review (user_id, next_review_at),
  INDEX idx_concept (concept_id)
);
```

**Quality Validation:**

```typescript
function validateFlashcard(flashcard: Flashcard): boolean {
  // Ensure quality before storing
  if (flashcard.question.length < 10) return false;
  if (flashcard.answer.length < 10) return false;
  if (flashcard.question.toLowerCase().startsWith('is ')) return false; // Avoid yes/no
  if (flashcard.answer.split(' ').length > 100) return false; // Too long
  return true;
}
```

**API Contracts:**

```typescript
// POST /api/flashcards/generate
Request: {
  videoJobId: "job-123",
  matchIds: ["match-1", "match-2", "match-3"]
}
Response: {
  flashcards: [
    {
      id: "flashcard-1",
      question: "What is the Categorical Imperative?",
      answer: "Kant's principle that one should...",
      conceptName: "Categorical Imperative",
      difficulty: "medium"
    }
  ]
}

// GET /api/flashcards/preview/:videoJobId
Response: {
  flashcards: [...],
  totalCount: 3,
  readyForReview: true
}
```

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Questions are too vague/generic** | Medium | Medium | Refine prompt with examples of good questions |
| **Answers are too long (>3 sentences)** | Low | Low | Add max length validation, reject if too long |
| **Questions test trivia, not understanding** | Medium | High | Emphasize "test core idea" in prompt |
| **Generation cost >$0.20 per flashcard** | Low | Medium | Monitor API usage, batch requests |
| **Yes/no questions generated** | Low | High | Validate and reject yes/no format questions |

## Rollout

**Migration/feature flags:**

- No migration needed (new feature)
- Feature flag: `flashcard_generation_enabled`

**Metrics:**

- Flashcards generated per video (avg)
- Question quality score (manual review of first 50)
- Generation time per flashcard
- API cost per flashcard
- User skip rate (% users who skip review after generation)

**Post-launch checklist:**

- [ ] Manually review first 30 generated flashcards for quality
- [ ] Verify no yes/no questions are generated
- [ ] Test answer length (should be 1-3 sentences)
- [ ] Check source timestamp links work correctly
- [ ] Monitor generation time (<10s per video)

**Post-MVP improvements:**

- Multiple flashcard types (cloze deletion, multiple choice)
- User editing of flashcards (fix poor generations)
- Image inclusion (screenshots from video)
- Generate multiple flashcards per complex concept
- Difficulty adjustment based on user performance
- Manual flashcard creation (user-added content)

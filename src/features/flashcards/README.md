# Flashcard Generation Feature

## Overview

This feature automatically generates flashcards from matched concepts for spaced repetition review. Each matched concept with high confidence (≥80%) is converted into a question-answer flashcard suitable for retention testing.

**Implementation Status:** ✅ Complete (US-0005)

## Architecture

### Core Components

1. **`flashcard-generator.ts`** - Main service for AI-powered flashcard generation
2. **`flashcard-validator.ts`** - Quality validation and scoring
3. **`types.ts`** - TypeScript type definitions

### API Layer

1. **`app/actions/generate-flashcards.action.ts`** - Server action for flashcard generation
2. **`app/api/flashcards/generate/route.ts`** - REST endpoint for generation
3. **`app/api/flashcards/preview/[videoJobId]/route.ts`** - Preview endpoint

### UI Components

1. **`FlashcardCard`** - Individual flashcard display with show/hide answer
2. **`FlashcardList`** - List view of multiple flashcards
3. **`FlashcardPreview`** - Preview screen with action buttons

## How It Works

### 1. Automatic Generation Flow

```
Video Processing → Concept Extraction → Concept Matching → Flashcard Generation
                                                                    ↓
                                                            Database Storage
```

When concepts are matched to the syllabus (via `matchConceptsAction`), the system automatically:

1. Filters matches with confidence ≥ 0.8 (HIGH threshold)
2. For each high-confidence match:
   - Prepares input data (concept, syllabus, course context)
   - Calls AI (Claude Sonnet 4.5) with master prompt
   - Validates generated flashcard
   - Saves to database if valid
3. Updates video job status to "completed"

### 2. AI Generation

**Model:** Blackbox AI - Claude Sonnet 4.5  
**Temperature:** 0.35 (balanced creativity and consistency)  
**Prompt:** Based on `src/master-prompts/flashcard-generation-prompt.md`

**Input Structure:**
```typescript
{
  extractedConcept: { conceptText, definition, timestamp, confidence },
  syllabusConcept: { conceptText, category, importance },
  course: { code, name, subject, academicLevel },
  video: { id, title, youtubeVideoId },
  match: { confidence, matchType, rationale }
}
```

**Output Structure:**
```typescript
{
  flashcard: {
    question: string,      // 10-200 chars, active recall format
    answer: string,        // 50-400 chars, 1-3 sentences
    sourceTimestamp: string | null,
    difficultyHint: "easy" | "medium" | "hard"
  },
  metadata: {
    questionType: string,
    answerLength: number,
    generationConfidence: number,
    pedagogicalNotes: string,
    qualityFlags: { ... }
  }
}
```

### 3. Quality Validation

Every generated flashcard is validated against:

**Question Rules:**
- ✅ Must start with interrogative word (What, How, Why, etc.)
- ✅ Length: 10-200 characters
- ✅ Must end with question mark
- ❌ No yes/no questions (Is, Are, Do, Does, Can, etc.)
- ❌ No multiple choice format
- ❌ No true/false format

**Answer Rules:**
- ✅ Length: 50-400 characters
- ✅ 1-5 complete sentences
- ✅ Clear and authoritative tone
- ❌ No conversational filler (Well, So, You see)
- ❌ No circular definitions
- ❌ No vague qualifiers (unless essential)

**Quality Flags:**
- `isAtomic` - Tests single concept
- `isTestable` - Has clear correct answer
- `avoidsTriviaPattern` - Tests understanding, not trivia
- `appropriateDifficulty` - Matches concept complexity

### 4. Database Schema

```prisma
model Flashcard {
  id              String        @id @default(uuid())
  conceptMatchId  String        // FK to ConceptMatch
  userId          String        // FK to User
  question        String        // Generated question
  answer          String        // Generated answer
  sourceTimestamp String?       // Video timestamp (HH:MM:SS)
  timesReviewed   Int           @default(0)
  timesCorrect    Int           @default(0)
  lastReviewedAt  DateTime?
  nextReviewAt    DateTime?     // For spaced repetition
  createdAt       DateTime      @default(now())
  
  conceptMatch    ConceptMatch  @relation(...)
  user            User          @relation(...)
  reviewEvents    ReviewEvent[]
}
```

## Usage

### Server-Side

```typescript
import { generateFlashcardsForVideoJob } from "@/features/flashcards";

// Generate flashcards for all high-confidence matches
const summary = await generateFlashcardsForVideoJob(videoJobId, userId);

console.log(`Generated ${summary.successful} flashcards`);
console.log(`Failed: ${summary.failed}, Skipped: ${summary.skipped}`);
```

### Client-Side (React)

```tsx
import { FlashcardPreview } from "@/components/flashcards";

function VideoResultsPage({ videoJobId }) {
  return (
    <FlashcardPreview
      videoJobId={videoJobId}
      onStartReview={() => router.push(`/review/${videoJobId}`)}
      onSkip={() => router.push("/dashboard")}
    />
  );
}
```

### API Endpoints

**Generate Flashcards:**
```bash
POST /api/flashcards/generate
Content-Type: application/json

{
  "videoJobId": "uuid"
}
```

**Preview Flashcards:**
```bash
GET /api/flashcards/preview/:videoJobId
```

Response:
```json
{
  "flashcards": [
    {
      "id": "uuid",
      "question": "What is...",
      "answer": "...",
      "conceptName": "...",
      "category": "...",
      "sourceTimestamp": "00:15:42",
      "timesReviewed": 0,
      "timesCorrect": 0
    }
  ],
  "totalCount": 3,
  "readyForReview": true,
  "videoJobStatus": "completed"
}
```

## Configuration

### Thresholds

```typescript
// Only generate for high-confidence matches
const HIGH_CONFIDENCE_THRESHOLD = 0.8;

// Quality score threshold for saving
const MIN_QUALITY_SCORE = 0.7;
```

### Rate Limiting

- 500ms delay between generations to avoid API rate limits
- Sequential processing (not parallel) for better quality

### Error Handling

- Generation errors don't fail the entire matching process
- Failed flashcards are logged with error details
- Video job status remains "matched" if flashcard generation fails

## Testing

### Manual Testing Checklist

- [ ] Generate flashcards from matched concepts
- [ ] Verify question format (no yes/no questions)
- [ ] Check answer length (50-400 chars)
- [ ] Validate source timestamps
- [ ] Test preview UI
- [ ] Verify database records

### Quality Metrics

Monitor these metrics post-launch:

- **Generation Success Rate:** Target >95%
- **Average Quality Score:** Target >0.85
- **Question Format Compliance:** Target 100%
- **Answer Length:** Target 80% within 100-250 chars
- **User Skip Rate:** Target <5%

## Troubleshooting

### Common Issues

**Issue:** Flashcards not generating
- Check video job status is "matched"
- Verify high-confidence matches exist (≥0.8)
- Check BLACKBOX_API_KEY is set

**Issue:** Low quality flashcards
- Review master prompt in `src/master-prompts/flashcard-generation-prompt.md`
- Check validation rules in `flashcard-validator.ts`
- Monitor generation confidence scores

**Issue:** API rate limiting
- Increase delay between generations (currently 500ms)
- Consider batching requests

## Future Enhancements

Post-MVP improvements (see US-0005 spec):

- [ ] Multiple flashcard types (cloze deletion, multiple choice)
- [ ] User editing of generated flashcards
- [ ] Multiple flashcards per complex concept
- [ ] Image/diagram inclusion
- [ ] Difficulty adjustment based on performance
- [ ] Manual flashcard creation by user

## References

- **Specification:** `documentation_starter_pack/docs/specs/us-0005-flashcard-generation.md`
- **Master Prompt:** `src/master-prompts/flashcard-generation-prompt.md`
- **Matching Config:** `src/features/matching/config.ts`
- **Database Schema:** `prisma/schema/schema.prisma`

## Support

For issues or questions:
1. Check the specification document
2. Review the master prompt
3. Check console logs for detailed error messages
4. Verify database records in `flashcards` table

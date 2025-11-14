# Feature Spec: US-0003 - Concept Extraction

Owner: Founder
Status: Draft
Last Updated: 2025-11-14
**⚠️ HIGHEST RISK STORY - Test before hackathon!**

## Summary

Extract atomic concepts from YouTube video transcripts using AI (GPT-4 or Claude). This is the core intellectual engine of the MVP - breaking down passive content into Zettelkasten-style atomic notes.

**Why now:** This is the entire product thesis. If concept extraction doesn't work at 70%+ accuracy, the MVP has no value. Must be validated before hackathon begins.

**Critical success metric:** 70%+ extraction accuracy (manual verification on 20 test videos)

## User Stories

- As a Motivated Struggler, I want the system to automatically extract atomic concepts from videos I watch so that I don't have to manually take notes or create flashcards.

## Acceptance Criteria

**Given** a YouTube video transcript has been fetched
**When** the AI processes the transcript
**Then** it extracts 3-10 atomic concepts with confidence scores and definitions

**Given** a concept is extracted
**When** stored in the database
**Then** each concept has: name, definition, source_timestamp, confidence_score, atomic_type

**Given** extraction completes
**When** manual verification is performed on test videos
**Then** 70%+ of extracted concepts are accurate and atomic (not compound concepts)

**Detailed Acceptance Criteria:**
- [ ] Extraction completes within 30 seconds per video (API timeout)
- [ ] Each concept is atomic (single idea, not compound)
- [ ] Concepts include definitions suitable for flashcard generation
- [ ] Confidence scores reflect extraction quality (0.0 - 1.0)
- [ ] Source timestamps link concepts back to video moments
- [ ] Handles videos 3-30 minutes long (MVP range)
- [ ] Gracefully handles low-quality transcripts (poor audio, auto-generated captions)
- [ ] Validates against extraction errors (hallucinations, off-topic concepts)

## UX & Flows

**Backend processing flow (not directly visible to user):**

```
[Transcript received]
    ↓
[AI Prompt: Extract concepts]
    ↓
[GPT-4/Claude API call]
    ↓
[Parse JSON response]
    ↓
[Validate concept structure]
    ↓
[Store in concepts table]
    ↓
[Return to matching pipeline]
```

**User sees:**
- "Extracting concepts..." (with spinner)
- "Extracted 4 concepts" (success message)
- List of concepts with confidence scores (in concept review UI)

## Scope

**In scope:**
- AI-based extraction using GPT-4 or Claude API
- Atomic concept identification (per Zettelkasten methodology)
- Confidence scoring for each extracted concept
- Definition generation for flashcard creation
- Timestamp extraction (link concept to video moment)
- Validation against hallucinations (concepts not in video)
- Error handling for API failures, low-quality transcripts

**Out of scope:**
- Fine-tuned models (use prompt engineering only for MVP)
- Multi-language support (English only)
- Image/diagram extraction from video frames (text-only)
- Speaker attribution (who said what)
- Prerequisite relationship detection (post-MVP)
- Manual concept editing during extraction (post-MVP)
- Advanced concept types (definitions, examples, arguments - just "concept" for MVP)

## Technical Design

**Components impacted:**
- `ConceptExtractor.ts` (new service)
- `AIService.ts` (GPT-4/Claude integration)
- `ConceptValidator.ts` (quality checks)
- Database: `concepts` table

**AI Prompt Design:**

```typescript
const EXTRACTION_PROMPT = `
You are an expert educator specializing in the Zettelkasten method. Extract atomic concepts from the following video transcript.

RULES:
1. Each concept must be ATOMIC (single, indivisible idea)
2. Concepts should be suitable for long-term retention (not trivial facts)
3. Include a clear 1-2 sentence definition
4. Assign confidence score (0.0-1.0) based on clarity in transcript
5. Link to approximate timestamp where concept appears

TRANSCRIPT:
{transcript}

COURSE CONTEXT: {courseName}

OUTPUT FORMAT (JSON):
{
  "concepts": [
    {
      "name": "Categorical Imperative",
      "definition": "Kant's ethical principle that one should act only according to maxims that could become universal laws",
      "timestamp": "03:45",
      "confidence": 0.92,
      "rationale": "Clearly explained with examples in the transcript"
    }
  ]
}

Extract 3-10 concepts. Prioritize quality over quantity.
`;
```

**API Integration:**

```typescript
interface ExtractedConcept {
  name: string;
  definition: string;
  timestamp: string; // MM:SS format
  confidence: number; // 0.0 - 1.0
  rationale?: string; // Why this concept was extracted
}

async function extractConcepts(
  transcript: string,
  courseContext: string
): Promise<ExtractedConcept[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "claude-3-opus" via Anthropic API
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: buildExtractionPrompt(transcript, courseContext)
        }
      ],
      temperature: 0.3, // Lower for consistency
      max_tokens: 2000,
      response_format: { type: "json_object" } // Enforce JSON output
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return validateAndCleanConcepts(parsed.concepts);
  } catch (error) {
    throw new ConceptExtractionError(error);
  }
}
```

**Validation Layer:**

```typescript
function validateAndCleanConcepts(concepts: ExtractedConcept[]): ExtractedConcept[] {
  return concepts
    .filter(c => {
      // Remove invalid concepts
      if (!c.name || c.name.length < 3) return false;
      if (!c.definition || c.definition.length < 10) return false;
      if (c.confidence < 0.5) return false; // Minimum confidence threshold
      return true;
    })
    .map(c => ({
      ...c,
      name: cleanConceptName(c.name),
      definition: cleanDefinition(c.definition),
      confidence: Math.min(Math.max(c.confidence, 0), 1) // Clamp 0-1
    }))
    .slice(0, 10); // Max 10 concepts per video for MVP
}

function cleanConceptName(name: string): string {
  // Remove quotes, extra whitespace, trailing punctuation
  return name.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '');
}
```

**Data model:**

```sql
CREATE TABLE concepts (
  id VARCHAR(50) PRIMARY KEY,
  video_job_id VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  definition TEXT NOT NULL,
  timestamp VARCHAR(10), -- MM:SS format
  confidence DECIMAL(3,2), -- 0.00 - 1.00
  rationale TEXT,
  is_matched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (video_job_id) REFERENCES video_jobs(id),
  INDEX idx_video_job (video_job_id),
  INDEX idx_confidence (confidence DESC)
);
```

**Quality Metrics Tracking:**

```sql
-- Track extraction quality for continuous improvement
CREATE TABLE extraction_metrics (
  id VARCHAR(50) PRIMARY KEY,
  video_job_id VARCHAR(50) NOT NULL,
  total_concepts INT,
  avg_confidence DECIMAL(3,2),
  processing_time_ms INT,
  ai_model VARCHAR(50), -- gpt-4, claude-3-opus
  prompt_version VARCHAR(20),
  manual_accuracy DECIMAL(3,2), -- Filled in by human review
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **AI hallucinates concepts not in video** | High | Critical | Add validation step: check concept keywords appear in transcript |
| **Concepts are too broad (not atomic)** | Medium | High | Refine prompt with examples of good/bad concepts |
| **Low confidence scores (<50%)** | Medium | Medium | Set minimum threshold, discard low-confidence extractions |
| **API rate limits during demo** | Low | Critical | Pre-process backup videos, cache results |
| **Extraction cost >$1 per video** | Medium | High | Monitor token usage, optimize prompt length |
| **Inconsistent quality across video types** | High | High | Test with diverse content (lectures, explainers, debates) |

**Testing Plan:**

```typescript
// Pre-hackathon validation (MUST DO Thursday/Friday)
const TEST_VIDEOS = [
  {
    url: "https://youtube.com/watch?v=...", // Kant lecture
    expectedConcepts: ["Categorical Imperative", "Deontological Ethics", "Maxim"],
    course: "phil-101"
  },
  {
    url: "https://youtube.com/watch?v=...", // Cell biology
    expectedConcepts: ["Mitosis", "Chromosomes", "Cell Division"],
    course: "bio-101"
  },
  // ... 18 more test videos across 3 courses
];

async function validateExtractionAccuracy() {
  const results = [];

  for (const test of TEST_VIDEOS) {
    const extracted = await extractConcepts(test.url, test.course);
    const accuracy = calculateAccuracy(extracted, test.expectedConcepts);
    results.push({ url: test.url, accuracy, extracted });
  }

  const avgAccuracy = average(results.map(r => r.accuracy));
  console.log(`Average accuracy: ${avgAccuracy}%`);

  if (avgAccuracy < 70) {
    throw new Error("EXTRACTION QUALITY BELOW THRESHOLD - FIX PROMPTS");
  }

  return results;
}
```

## Rollout

**Pre-hackathon validation (Thursday/Friday):**
- [ ] Test extraction on 20 diverse YouTube videos
- [ ] Manually verify accuracy (count correct concepts / total concepts)
- [ ] If <70% accuracy: iterate on prompts, test again
- [ ] Document which video types work best (CrashCourse, Khan Academy, etc.)
- [ ] Estimate API cost per video

**Hackathon rollout:**
- [ ] Use validated prompt version
- [ ] Pre-process 5 "known good" videos as backups
- [ ] Monitor API responses in real-time during demo
- [ ] Have fallback: if live extraction fails, use pre-processed results

**Metrics:**
- Extraction accuracy (% correct concepts identified)
- Average concepts per video
- Average confidence score
- Processing time (target: <30s)
- API cost per extraction
- Error rate by video type

**Post-launch checklist:**
- [ ] Manual review of first 50 extractions
- [ ] Track user feedback on concept quality
- [ ] Monitor API costs (should be <$0.50 per video)
- [ ] A/B test different prompts for accuracy improvement

**Post-MVP improvements:**
- Fine-tune model on validated concept extractions
- Add prerequisite relationship detection
- Support multiple concept types (definition, example, argument)
- Multi-language extraction
- Image/diagram extraction from video frames
- Interactive concept editing/refinement

## ADR Dependencies

This feature requires architectural decisions on:
- **ADR-0002**: AI provider selection (GPT-4 vs Claude vs hybrid)
- **ADR-0003**: Concept extraction prompt design and versioning
- **ADR-0004**: Quality validation strategy (automated vs manual review)

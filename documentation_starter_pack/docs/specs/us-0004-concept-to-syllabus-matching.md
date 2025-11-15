# Feature Spec: US-0004 - Concept-to-Syllabus Matching

Owner: Founder
Status: Draft
Last Updated: 2025-11-14
**⚠️ HIGHEST VALUE STORY - Core differentiator!**

## Summary

Match extracted concepts from student content (YouTube videos) to required concepts in course syllabi using semantic similarity and AI reasoning. This is the MVP's key differentiator - connecting "what students learn" to "what professors require."

**Why now:** This is what separates the product from "just another flashcard app." Without accurate matching, there's no value proposition.

**Critical success metric:** 68%+ concepts correctly matched to syllabus (target from vision doc)

## User Stories

- As a Motivated Struggler, I want to know which concepts from my video match my course requirements so that I can see if I'm covering what my professor expects.

## Acceptance Criteria

**Given** concepts have been extracted from a video
**When** the matching algorithm runs against the course syllabus
**Then** each extracted concept is matched to 0 or 1 syllabus concepts with a confidence score

**Given** a match has confidence ≥80%
**When** displayed to the user
**Then** it shows as "Matched" with green indicator

**Given** a match has confidence 60-79%
**When** displayed to the user
**Then** it shows as "Partial Match" with yellow indicator and option to confirm/reject

**Given** a match has confidence <60%
**When** displayed to the user
**Then** concept is shown as "Unmatched" with gray indicator

**Detailed Acceptance Criteria:**
- [ ] Matching completes within 20 seconds per video (after extraction)
- [ ] Each match includes: extracted_concept_id, syllabus_concept_id, confidence_score, match_rationale
- [ ] Confidence scores are calibrated (80%+ threshold validated on test data)
- [ ] Users can flag incorrect matches ("This match is wrong" button)
- [ ] System prevents duplicate matches (one extracted concept → one syllabus concept max)
- [ ] Handles edge cases: no matches found, ambiguous matches, identical concept names
- [ ] Matching accuracy: 68%+ verified on 20 test videos

## UX & Flows

**User-facing flow:**

```
[Video processed: 4 concepts extracted]
    ↓
[Matching to Philosophy 101 syllabus...]
    ↓
[Results Screen]

Matched to your syllabus: 3/4 concepts

✅ Categorical Imperative (92% match)
   → Syllabus: "Kant's moral philosophy"
   [View details] [Flag incorrect ⚠️]

✅ Deontological Ethics (85% match)
   → Syllabus: "Duty-based ethical theories"
   [View details] [Flag incorrect ⚠️]

⚠️ Moral Law (67% match - uncertain)
   → Syllabus: "Universal ethical principles"
   Is this correct? [Yes ✓] [No ✗]

❌ Practical Reason (45% - no match)
   Not covered in your syllabus yet.
   [Add to syllabus?]
```

**Backend flow:**

```
[Extracted concepts] + [Syllabus concepts]
    ↓
[Generate embeddings for both sets]
    ↓
[Calculate cosine similarity matrix]
    ↓
[AI reasoning for top candidates (score >60%)]
    ↓
[Assign final confidence scores]
    ↓
[Store matches in database]
```

## Scope

**In scope:**
- Semantic similarity matching (embeddings + cosine similarity)
- AI-enhanced matching for ambiguous cases
- Confidence scoring with calibrated thresholds (≥80%, 60-79%, <60%)
- Three relationship types: Exact Match, Related, Example-of
- User feedback mechanism (flag incorrect matches)
- Match rationale generation (explain why concepts match)
- Prevent duplicate matches

**Out of scope:**
- Prerequisite relationship detection (post-MVP)
- Multi-syllabus matching (student taking multiple courses simultaneously)
- Manual match editing (user can flag, but not manually link concepts)
- Historical match quality tracking per syllabus (post-MVP)
- Confidence score learning/calibration based on feedback (post-MVP)
- Fuzzy matching for typos/variations (rely on semantic similarity)

## Technical Design

**Components impacted:**
- `ConceptMatcher.ts` (new service)
- `EmbeddingService.ts` (OpenAI/Cohere embeddings)
- `AIReasoningService.ts` (GPT-4 for ambiguous matches)
- Database: `concept_matches` table

**Matching Algorithm:**

```typescript
interface MatchResult {
  extractedConceptId: string;
  syllabusConceptId: string | null;
  confidence: number; // 0.0 - 1.0
  matchType: 'exact' | 'related' | 'example-of' | 'no-match';
  rationale: string;
}

async function matchConceptsToSyllabus(
  extractedConcepts: ExtractedConcept[],
  syllabusId: string
): Promise<MatchResult[]> {
  // Step 1: Get syllabus concepts
  const syllabusConcepts = await getSyllabusConcepts(syllabusId);

  // Step 2: Generate embeddings for all concepts
  const extractedEmbeddings = await generateEmbeddings(
    extractedConcepts.map(c => `${c.name}: ${c.definition}`)
  );
  const syllabusEmbeddings = await generateEmbeddings(
    syllabusConcepts.map(c => `${c.name}: ${c.description}`)
  );

  // Step 3: Calculate similarity matrix
  const matches: MatchResult[] = [];

  for (let i = 0; i < extractedConcepts.length; i++) {
    const extractedConcept = extractedConcepts[i];
    const bestMatch = findBestMatch(
      extractedEmbeddings[i],
      syllabusEmbeddings,
      syllabusConcepts
    );

    if (bestMatch.similarity >= 0.6) {
      // Use AI reasoning for ambiguous matches
      const aiEnhanced = await enhanceMatchWithAI(
        extractedConcept,
        bestMatch.syllabusConcept,
        bestMatch.similarity
      );
      matches.push(aiEnhanced);
    } else {
      matches.push({
        extractedConceptId: extractedConcept.id,
        syllabusConceptId: null,
        confidence: bestMatch.similarity,
        matchType: 'no-match',
        rationale: 'No similar concepts found in syllabus'
      });
    }
  }

  return matches;
}

function findBestMatch(
  extractedEmbedding: number[],
  syllabusEmbeddings: number[][],
  syllabusConcepts: SyllabusConcept[]
): { syllabusConcept: SyllabusConcept; similarity: number } {
  let bestMatch = { syllabusConcept: null, similarity: 0 };

  for (let i = 0; i < syllabusEmbeddings.length; i++) {
    const similarity = cosineSimilarity(extractedEmbedding, syllabusEmbeddings[i]);
    if (similarity > bestMatch.similarity) {
      bestMatch = { syllabusConcept: syllabusConcepts[i], similarity };
    }
  }

  return bestMatch;
}
```

**AI-Enhanced Matching for Ambiguous Cases:**

```typescript
async function enhanceMatchWithAI(
  extractedConcept: ExtractedConcept,
  syllabusConcept: SyllabusConcept,
  embeddingSimilarity: number
): Promise<MatchResult> {
  const prompt = `
You are an expert educator. Determine if these two concepts match and explain why.

EXTRACTED CONCEPT (from student's video):
Name: ${extractedConcept.name}
Definition: ${extractedConcept.definition}

SYLLABUS CONCEPT (from course requirements):
Name: ${syllabusConcept.name}
Description: ${syllabusConcept.description}

EMBEDDING SIMILARITY: ${(embeddingSimilarity * 100).toFixed(0)}%

Respond in JSON:
{
  "isMatch": true/false,
  "confidence": 0.0-1.0,
  "matchType": "exact" | "related" | "example-of",
  "rationale": "1-2 sentence explanation"
}

RULES:
- "exact": Same concept, different wording
- "related": Connected concepts in same topic
- "example-of": Extracted is specific example of syllabus concept
- Confidence 0.8+ only if you're very certain
- Confidence 0.6-0.79 for likely matches
- Confidence <0.6 for uncertain/no match
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content);

  return {
    extractedConceptId: extractedConcept.id,
    syllabusConceptId: result.isMatch ? syllabusConcept.id : null,
    confidence: result.confidence,
    matchType: result.matchType,
    rationale: result.rationale
  };
}
```

**Data Model:**

```sql
-- Syllabus concepts (pre-populated for each course)
CREATE TABLE syllabus_concepts (
  id VARCHAR(50) PRIMARY KEY,
  syllabus_id VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100), -- e.g., "Ethics", "Epistemology"
  importance INT DEFAULT 1, -- 1-3 (core, important, supplemental)
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (syllabus_id) REFERENCES syllabi(id),
  INDEX idx_syllabus (syllabus_id)
);

-- Concept matches
CREATE TABLE concept_matches (
  id VARCHAR(50) PRIMARY KEY,
  extracted_concept_id VARCHAR(50) NOT NULL,
  syllabus_concept_id VARCHAR(50),
  confidence DECIMAL(3,2) NOT NULL, -- 0.00 - 1.00
  match_type VARCHAR(20) NOT NULL, -- exact, related, example-of, no-match
  rationale TEXT,
  embedding_similarity DECIMAL(3,2), -- Raw similarity score
  user_feedback VARCHAR(20), -- correct, incorrect, uncertain
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (extracted_concept_id) REFERENCES concepts(id),
  FOREIGN KEY (syllabus_concept_id) REFERENCES syllabus_concepts(id),
  INDEX idx_confidence (confidence DESC),
  INDEX idx_extracted (extracted_concept_id)
);
```

**Confidence Calibration:**

```typescript
// Pre-hackathon: Validate confidence thresholds on test data
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.80,  // "Matched" - show as confirmed
  MEDIUM: 0.60, // "Partial" - ask user to confirm
  LOW: 0.60     // Below this = "No match"
};

function getMatchStatusLabel(confidence: number): string {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'Matched';
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'Partial Match';
  return 'No Match';
}

function getMatchColor(confidence: number): string {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'green';
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'yellow';
  return 'gray';
}
```

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **False positives (matching unrelated concepts)** | Medium | Critical | Use AI reasoning for >60% similarity, allow user feedback |
| **False negatives (missing valid matches)** | High | High | Lower threshold to 60%, show partial matches for confirmation |
| **Confidence scores not calibrated** | High | High | Test on 20 videos pre-hackathon, adjust thresholds |
| **Embedding API costs** | Medium | Medium | Cache embeddings, batch requests |
| **Ambiguous syllabus descriptions** | High | Medium | Pre-process syllabi to add detailed descriptions |
| **Performance (matching takes >30s)** | Low | Medium | Pre-compute syllabus embeddings, parallel processing |

**Testing Strategy:**

```typescript
// Pre-hackathon validation
interface MatchTest {
  video: string;
  extractedConcepts: string[];
  expectedMatches: { extracted: string; syllabus: string }[];
}

const MATCH_TESTS: MatchTest[] = [
  {
    video: "Kant Categorical Imperative lecture",
    extractedConcepts: ["Categorical Imperative", "Deontological Ethics", "Moral Law"],
    expectedMatches: [
      { extracted: "Categorical Imperative", syllabus: "Kant's moral philosophy" },
      { extracted: "Deontological Ethics", syllabus: "Duty-based ethical theories" }
    ]
  },
  // ... 19 more test cases
];

async function validateMatchingAccuracy(): Promise<number> {
  let correctMatches = 0;
  let totalMatches = 0;

  for (const test of MATCH_TESTS) {
    const results = await matchConceptsToSyllabus(test.extractedConcepts, test.syllabusId);
    for (const expected of test.expectedMatches) {
      totalMatches++;
      const actual = results.find(r => r.extractedConceptId === expected.extracted);
      if (actual?.syllabusConceptId === expected.syllabus && actual.confidence >= 0.8) {
        correctMatches++;
      }
    }
  }

  const accuracy = (correctMatches / totalMatches) * 100;
  console.log(`Matching accuracy: ${accuracy.toFixed(1)}%`);

  if (accuracy < 68) {
    throw new Error("MATCHING ACCURACY BELOW TARGET - ADJUST ALGORITHM");
  }

  return accuracy;
}
```

## Rollout

**Pre-hackathon validation (Friday):**
- [ ] Pre-process and embed all 3 syllabus concept sets
- [ ] Run matching on 20 test video extractions
- [ ] Manually verify match accuracy (target: 68%+)
- [ ] Calibrate confidence thresholds based on results
- [ ] Document known failure cases

**Hackathon rollout:**
- [ ] Cache syllabus embeddings (don't recompute during demo)
- [ ] Monitor AI reasoning API calls (cost and latency)
- [ ] Have backup: pre-computed matches for demo videos if live matching fails

**Metrics:**
- Match accuracy (% correct matches)
- Average confidence score
- Distribution of match types (exact, related, example-of, no-match)
- User feedback rate (% matches flagged as incorrect)
- Processing time per match
- API costs per video

**Post-launch checklist:**
- [ ] Review all user-flagged incorrect matches
- [ ] Calculate precision and recall on real user data
- [ ] Monitor confidence score distribution
- [ ] A/B test threshold adjustments
- [ ] Iterate on AI reasoning prompt based on failure cases

**Post-MVP improvements:**
- Prerequisite relationship detection
- Multi-syllabus matching (cross-course concepts)
- Confidence learning (adjust based on user feedback)
- Fuzzy matching for terminology variations
- Context-aware matching (consider course week/topic)
- Batch matching optimization (process multiple videos at once)

## ADR Dependencies

This feature requires architectural decisions on:
- **ADR-0005**: Embedding provider selection (OpenAI vs Cohere vs Sentence Transformers)
- **ADR-0006**: Matching algorithm design (embedding-only vs hybrid with AI reasoning)
- **ADR-0007**: Confidence threshold calibration methodology

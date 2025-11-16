# Concept-to-Syllabus Matching System

This module implements the core differentiator of the platform: matching extracted concepts from student content (YouTube videos) to required concepts in course syllabi using a hybrid two-stage approach combining semantic similarity and AI reasoning.

## Architecture

### Components

1. **Config** (`config.ts`)
   - Matching thresholds (HIGH: 0.8, MEDIUM: 0.6)
   - Shortlist size (TOP_K: 5)
   - Blend weights (Embedding: 0.6, LLM: 0.4)
   - Concurrency limits (3 concurrent LLM calls)

2. **Embeddings Service** (`src/lib/ai/embeddings.ts`)
   - Generates embeddings using OpenAI's `text-embedding-3-small`
   - Builds text representations for concepts and syllabus items
   - Computes cosine similarity between vectors
   - Handles graceful degradation if embeddings unavailable

3. **AI Reasoning Service** (`ai-reasoning.ts`)
   - Uses Blackbox AI (preferred) or OpenAI for LLM reasoning
   - Verifies matches with confidence scores and rationales
   - Returns structured JSON: `{ isMatch, confidence, matchType, rationale }`
   - Match types: "exact", "related", "example-of"

4. **Concept Matcher** (`concept-matcher.ts`)
   - Orchestrates the matching pipeline
   - Fetches concepts and syllabus items from database
   - Generates embeddings in batch
   - Shortlists top-K candidates per concept
   - Calls LLM reasoning for each candidate
   - Blends embedding and LLM scores
   - Returns match results with summary statistics

5. **DB Writer** (`write-concept-matches.ts`)
   - Persists matches to database with idempotency
   - Upserts (creates or updates) ConceptMatch records
   - Batch operations for performance
   - Cleanup utilities for re-matching

6. **Server Action** (`app/actions/match-concepts.action.ts`)
   - Authenticated entrypoint for matching
   - Validates ownership and enrollment
   - Updates video job status through pipeline
   - Returns summary with performance metrics

## Matching Algorithm

### Two-Stage Hybrid Approach

```
Stage 1: Embedding-Based Shortlisting
├─ Generate embeddings for all concepts
├─ Compute cosine similarity matrix
├─ Shortlist top-K candidates (≥ 0.60 similarity)
└─ Early exit if no candidates

Stage 2: LLM Reasoning
├─ For each shortlisted candidate:
│  ├─ Call LLM with concept details
│  ├─ Get confidence, match type, rationale
│  └─ Blend: 0.6 * sim + 0.4 * llm_confidence
├─ Select best candidate by blended score
└─ Accept if blended ≥ 0.60
```

### Confidence Thresholds

- **HIGH (≥ 0.80)**: "Matched" - Automatically accepted, shown with green indicator
- **MEDIUM (0.60-0.79)**: "Partial Match" - Shown with yellow indicator, user can confirm/reject
- **LOW (< 0.60)**: "No Match" - Not stored in database

### Match Types

- **exact**: Same underlying concept, different wording acceptable
- **related**: Connected concepts in the same topic area
- **example-of**: Extracted concept is a specific instance of syllabus concept

## Usage

### Basic Usage

```typescript
import { matchConceptsAction } from "@/app/actions/match-concepts.action";

// In a server component or API route
const result = await matchConceptsAction({
  videoJobId: "uuid-of-video-job",
  courseId: "uuid-of-course",
});

if (result.success) {
  console.log(`Matched ${result.data.high} concepts with high confidence`);
  console.log(`Matched ${result.data.medium} concepts with medium confidence`);
  console.log(`Average confidence: ${result.data.avgConfidence}`);
  console.log(`Duration: ${result.data.durationMs}ms`);
}
```

### Direct Orchestrator Usage

```typescript
import { matchConceptsToSyllabus } from "@/features/matching/concept-matcher";
import { writeConceptMatches } from "@/features/matching/write-concept-matches";

// Run matching
const { results, summary } = await matchConceptsToSyllabus(
  videoJobId,
  courseId
);

// Persist to database
const { created, updated } = await writeConceptMatches(results);

console.log(`Created ${created}, updated ${updated} matches`);
console.log(`Total concepts: ${summary.totalConcepts}`);
console.log(`High confidence: ${summary.high}`);
console.log(`Medium confidence: ${summary.medium}`);
console.log(`Average confidence: ${summary.avgConfidence.toFixed(2)}`);
```

## Performance

### Target Metrics

- **Latency**: < 20 seconds for typical workload (10-50 concepts)
- **Accuracy**: ≥ 68% correct matches (validated on test data)
- **Throughput**: Batch embeddings, concurrent LLM calls (max 3)

### Optimization Strategies

1. **Batch Embeddings**: Generate all embeddings in single API call
2. **Precompute Syllabus**: Cache syllabus embeddings per course
3. **Early Exit**: Skip LLM if no candidates above threshold
4. **Concurrency Control**: Limit parallel LLM calls to avoid rate limits
5. **Graceful Degradation**: Fall back to embeddings-only if LLM fails

### Cost Considerations

- **Embeddings**: ~$0.00002 per 1K tokens (text-embedding-3-small)
- **LLM Reasoning**: ~$0.003 per 1K tokens (Blackbox/GPT-4)
- **Typical Video**: 10-50 concepts × 5 candidates = 50-250 LLM calls
- **Estimated Cost**: $0.10-$0.50 per video

## Error Handling

### Degradation Paths

1. **LLM Unavailable**: Use embeddings-only (confidence = similarity)
2. **Embeddings Unavailable**: Use LLM-only (slower, more expensive)
3. **Both Unavailable**: Abort gracefully with error message
4. **Partial Failures**: Continue with successful matches, log failures

### Status Tracking

Video job status progression:
```
concepts_extracted → matching → matched
                              ↓
                         matching_failed (on error)
```

## Security

### Access Control

- User must be authenticated
- User must own the video job
- User must be enrolled in the course (or be admin)
- All checks performed before matching starts

### Data Privacy

- Matches are user-scoped (via video job ownership)
- No cross-user data leakage
- Lightweight summaries exposed to client
- Detailed match data requires authentication

## Testing

### Unit Tests

Located in `__tests__/matching/`:

- `concept-matcher.test.ts`: Core matching logic
- `write-concept-matches.test.ts`: Database operations

Run tests:
```bash
npm test matching
```

### Integration Testing

Test the full pipeline:

```typescript
// 1. Create test video job with concepts
// 2. Create test course with syllabus
// 3. Run matching
// 4. Verify results in database
// 5. Check summary statistics
```

## Monitoring

### Key Metrics to Track

- **Match Rate**: % of concepts successfully matched
- **Confidence Distribution**: High vs medium vs low
- **Processing Time**: P50, P95, P99 latencies
- **Error Rate**: % of failed matching attempts
- **Cost per Video**: Embedding + LLM API costs
- **User Feedback**: % of matches flagged as incorrect

### Logging

Structured logs include:
- Concept counts (extracted, syllabus)
- Shortlist sizes per concept
- LLM call durations
- Blended confidence scores
- Match creation/update counts
- Total pipeline duration

## Future Improvements

### Post-MVP Enhancements

1. **Confidence Calibration**: Learn from user feedback to adjust thresholds
2. **Prerequisite Detection**: Identify concept dependencies
3. **Multi-Course Matching**: Match across multiple enrolled courses
4. **Caching**: Persist syllabus embeddings in database
5. **Batch Processing**: Process multiple videos in parallel
6. **A/B Testing**: Experiment with different blend weights
7. **Fine-tuning**: Train custom model on feedback data

### Known Limitations

- Single match per concept (no many-to-many)
- No fuzzy matching for typos/variations
- No context-aware matching (course week/topic)
- No historical quality tracking per syllabus
- Manual match editing not supported (flag only)

## References

- [US-0004 Spec](../../../documentation_starter_pack/docs/specs/us-0004-concept-to-syllabus-matching.md)
- [Product Vision](../../../documentation_starter_pack/docs/vision.md)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Blackbox AI Models](https://docs.blackbox.ai/api-reference/models/chat-models)

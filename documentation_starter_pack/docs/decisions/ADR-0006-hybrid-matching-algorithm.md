# ADR-0006: Hybrid Two-Stage Matching Algorithm

Date: 2025-11-16
Status: Accepted
Deciders: Founder, AI Implementation Team

## Context

For US-0004 (Concept-to-Syllabus Matching), we need to match extracted concepts from videos to syllabus concepts with high accuracy (≥68% target) and reasonable speed (<20s per video).

**Problem Statement:**
- Pure embedding similarity is fast but can miss semantic nuances
- Pure LLM reasoning is accurate but too slow and expensive for all pairs
- Need to balance speed, cost, and accuracy for MVP

**Requirements:**
- Match 10-50 extracted concepts to 20-50 syllabus concepts per video
- Target accuracy: ≥68% correct matches
- Target latency: <20 seconds total
- Cost: ~$0.10 per video acceptable
- Explainability: Provide rationale for matches

**Constraints:**
- 48-hour hackathon timeline
- OpenAI API rate limits
- Budget limitations for MVP

## Decision

**Selected: Hybrid Two-Stage Algorithm**

**Stage 1: Embedding-Based Shortlisting**
- Compute cosine similarity between all concept pairs
- Filter candidates with similarity ≥ 0.60 (MEDIUM threshold)
- Select top-K=5 candidates per extracted concept
- Fast: O(N×M) similarity computations, ~1-2 seconds

**Stage 2: LLM Reasoning on Shortlist**
- For each shortlisted candidate, call LLM (Blackbox/OpenAI)
- LLM returns: `isMatch`, `confidence` (0-1), `matchType`, `rationale`
- Concurrency limit: 3 parallel LLM calls
- Slower: ~2-3 seconds per LLM call, but only for shortlist

**Final Blending:**
```
final_confidence = 0.6 × embedding_similarity + 0.4 × llm_confidence
```

**Selection:**
- Choose best candidate by `final_confidence`
- Accept only if `final_confidence ≥ 0.60`
- Store `matchType` and `rationale` for explainability

Implementation in `src/features/matching/concept-matcher.ts`

## Consequences

**Positive:**
- ✅ Fast: Embeddings filter 95% of pairs, LLM only on promising candidates
- ✅ Accurate: LLM catches semantic nuances embeddings miss
- ✅ Cost-effective: ~$0.09 per video (vs $3+ for pure LLM)
- ✅ Explainable: LLM provides human-readable rationale
- ✅ Graceful degradation: Falls back to embeddings-only if LLM fails
- ✅ Tunable: Can adjust blend weights based on validation data

**Negative:**
- ❌ More complex than single-stage approach
- ❌ Two failure modes (embeddings + LLM)
- ❌ Blend weights require calibration
- ❌ Still dependent on LLM API availability

**Follow-ups:**
- Validate blend weights (0.6/0.4) on real data
- A/B test different shortlist sizes (K=3 vs K=5 vs K=10)
- Monitor LLM failure rate and fallback behavior
- Consider caching LLM results for identical concept pairs

## Alternatives Considered

**Option A: Pure Embedding Similarity**
- Pros: Fast (~2s), cheap ($0.00003), simple
- Cons: Lower accuracy (~50-60%), no explainability, misses semantic nuances
- Rejected: Accuracy below 68% target

**Option B: Pure LLM Reasoning**
- Pros: Highest accuracy (~80-90%), best explainability
- Cons: Very slow (60-120s), expensive ($3-5 per video), rate limits
- Rejected: Too slow and expensive for MVP

**Option C: Embedding + Rule-Based Filters**
- Pros: Fast, deterministic, no LLM cost
- Cons: Hard to tune rules, brittle, no semantic understanding
- Rejected: Rules too fragile for varied educational content

**Option D: Fine-Tuned Embedding Model**
- Pros: Best of both worlds (fast + accurate)
- Cons: Requires training data, weeks of work, deployment complexity
- Rejected: 48-hour timeline too tight

**Option E: Different Blend Weights (0.5/0.5 or 0.7/0.3)**
- Considered but chose 0.6/0.4 as starting point
- Rationale: Slight preference for embeddings (faster, more stable)
- Can be tuned based on validation data

## Links

- Related ADRs: ADR-0005 (Embedding Provider), ADR-0007 (Confidence Thresholds)
- Implementation: `src/features/matching/concept-matcher.ts`
- Config: `src/features/matching/config.ts` (BLEND_WEIGHTS)
- Tests: `__tests__/matching/concept-matcher.test.ts`
- Spec: `docs/specs/us-0004-concept-to-syllabus-matching.md`

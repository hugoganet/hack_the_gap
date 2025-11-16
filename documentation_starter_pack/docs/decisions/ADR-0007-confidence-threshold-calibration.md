# ADR-0007: Confidence Threshold Calibration

Date: 2025-11-16
Status: Accepted
Deciders: Founder, AI Implementation Team

## Context

For US-0004 (Concept-to-Syllabus Matching), we need to determine confidence thresholds that classify matches into quality tiers and decide which matches to store in the database.

**Problem Statement:**
- Too low threshold → false positives (students think they know concepts they don't)
- Too high threshold → false negatives (miss valid matches, incomplete coverage)
- Need balance between precision and recall for MVP

**Requirements:**
- Target ≥68% accuracy (correct matches / total matches)
- Provide quality indicators to users (HIGH/MEDIUM/LOW confidence)
- Only store matches above minimum quality threshold
- Support partial match review workflow (MEDIUM confidence)

**Constraints:**
- Limited validation data for calibration (MVP phase)
- Must work across diverse educational content
- User trust is critical (false positives are dangerous)

## Decision

**Selected Thresholds:**

```typescript
MATCH_THRESHOLDS = {
  HIGH: 0.80,    // ≥80% confidence → Automatically accepted, green indicator
  MEDIUM: 0.60,  // 60-79% confidence → Partial match, yellow indicator, review suggested
}
// <60% confidence → Rejected, not stored in database
```

**Rationale:**
- **0.80 (HIGH)**: Conservative threshold for auto-acceptance
  - Embeddings + LLM both agree strongly
  - Low false positive rate
  - User can trust without verification
  
- **0.60 (MEDIUM)**: Minimum viable match quality
  - Captures borderline cases worth reviewing
  - Allows user feedback loop for improvement
  - Better to show partial match than miss entirely
  
- **<0.60**: Reject and don't store
  - Too uncertain to be useful
  - Reduces database noise
  - Prevents false confidence

**Implementation:**
- `src/features/matching/config.ts`: Threshold constants
- `src/features/matching/concept-matcher.ts`: Filtering logic
- `src/features/matching/write-concept-matches.ts`: Only stores ≥0.60

## Consequences

**Positive:**
- ✅ Clear quality tiers for UX (green/yellow indicators)
- ✅ Conservative HIGH threshold protects user trust
- ✅ MEDIUM tier enables feedback loop for improvement
- ✅ Rejection threshold reduces database clutter
- ✅ Easy to adjust based on validation data

**Negative:**
- ❌ May miss some valid matches (false negatives at 0.60 cutoff)
- ❌ Thresholds not yet validated on real data
- ❌ MEDIUM matches require user review (extra work)
- ❌ Fixed thresholds don't adapt to content difficulty

**Follow-ups:**
- Validate thresholds on 20 test videos before hackathon
- Track precision/recall at each threshold tier
- A/B test threshold adjustments (e.g., 0.75/0.55 vs 0.80/0.60)
- Consider dynamic thresholds based on syllabus difficulty
- Implement user feedback: "This match is wrong" → adjust thresholds

## Alternatives Considered

**Option A: Single Threshold (0.70)**
- Pros: Simpler, no quality tiers
- Cons: No distinction between strong and weak matches, harder to tune
- Rejected: Users need quality indicators for trust

**Option B: Three Tiers (0.85/0.70/0.50)**
- Pros: More granular quality levels
- Cons: More complex UX, harder to calibrate, diminishing returns
- Rejected: Two tiers sufficient for MVP

**Option C: Higher Thresholds (0.90/0.75)**
- Pros: Even more conservative, higher precision
- Cons: Lower recall, may miss too many valid matches
- Rejected: Too strict for MVP (need coverage)

**Option D: Lower Thresholds (0.70/0.50)**
- Pros: Higher recall, more matches shown
- Cons: More false positives, user trust at risk
- Rejected: False positives are dangerous (students think they know concepts they don't)

**Option E: Adaptive Thresholds**
- Pros: Adjusts to content difficulty automatically
- Cons: Complex to implement, hard to debug, unpredictable behavior
- Rejected: Too complex for 48-hour MVP

## Validation Plan

**Pre-Hackathon:**
1. Process 20 test videos across 3 subjects
2. Manually label ground truth matches
3. Measure precision/recall at different thresholds:
   - Precision = correct matches / total matches shown
   - Recall = correct matches / total possible matches
4. Adjust thresholds if precision <80% or recall <60%

**Post-Launch:**
1. Track user feedback: "This match is wrong" button
2. Calculate accuracy: correct matches / (correct + flagged)
3. If accuracy <68%, increase HIGH threshold
4. If coverage <50%, decrease MEDIUM threshold

## Links

- Related ADRs: ADR-0005 (Embeddings), ADR-0006 (Hybrid Algorithm)
- Implementation: `src/features/matching/config.ts`
- Tests: `__tests__/matching/concept-matcher.test.ts` (threshold mapping tests)
- Spec: `docs/specs/us-0004-concept-to-syllabus-matching.md`
- Vision: `docs/vision.md` (68% accuracy target)

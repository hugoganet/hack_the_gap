# ADR-0018: Flashcard Unlock Threshold (70% Confidence)

Date: 2025-11-18
Status: Accepted
Deciders: Hugo Ganet

## Context

The flashcard unlock system requires a confidence threshold to determine when a concept match is strong enough to unlock a flashcard answer. This threshold balances two competing forces:

1. **Accuracy**: Higher threshold (e.g., 80-90%) ensures unlocked answers are highly relevant, reducing false positives
2. **Unlock Frequency**: Lower threshold (e.g., 60-70%) increases unlock rate, improving user engagement and motivation

**Problem Statement**: What confidence threshold should trigger flashcard answer unlocks?

**Forces at play:**
- **User Experience**: Too few unlocks → frustration, feeling of no progress
- **Content Quality**: Too many unlocks → irrelevant answers, loss of trust
- **Matching Algorithm**: Hybrid system (0.6 × embeddings + 0.4 × LLM) produces confidence scores 0.0-1.0
- **Existing Thresholds**: Concept matching uses HIGH=0.80, MEDIUM=0.60 (ADR-0007)
- **MVP Timeline**: Need to balance accuracy with engagement for hackathon demo

## Decision

**Set unlock threshold to 70% confidence** (0.70)

Flashcards unlock when:
- Concept match confidence ≥ 0.70
- Answer generated from matched content using AI
- Unlock event recorded for analytics

This threshold sits between MEDIUM (0.60) and HIGH (0.80) from ADR-0007, creating a "HIGH-MEDIUM" tier specifically for unlocks.

## Consequences

**Positive:**
- **Balanced UX**: More unlocks than 80% threshold, fewer false positives than 60%
- **Engagement**: Students see progress faster, maintaining motivation
- **Quality**: Still filters out low-confidence matches (<70%)
- **Analytics**: Can track unlock rate and adjust threshold post-MVP if needed
- **Flexibility**: Threshold configurable in unlock service, easy to tune

**Negative:**
- **Potential False Positives**: Some unlocked answers may be less relevant than 80% threshold
- **User Trust Risk**: If too many irrelevant unlocks, students may lose confidence in system
- **Complexity**: Introduces third threshold tier (60%, 70%, 80%) vs. binary HIGH/MEDIUM

**Follow-ups:**
- Monitor unlock rate and user feedback during beta testing
- Track false positive rate (user reports of irrelevant unlocks)
- Consider A/B testing 70% vs. 75% vs. 80% thresholds post-MVP
- Add user setting to adjust personal unlock threshold (Phase 2)

## Alternatives Considered

**Option A: 80% threshold (HIGH confidence)**
- Pros: Maximum accuracy, aligns with existing HIGH threshold
- Cons: Too few unlocks, slow progress, reduced engagement
- Rejected: User experience suffers, motivation drops

**Option B: 60% threshold (MEDIUM confidence)**
- Pros: Maximum unlock frequency, fast progress
- Cons: Too many false positives, quality concerns
- Rejected: Risk of irrelevant answers damaging trust

**Option C: 75% threshold (split the difference)**
- Pros: Closer to HIGH threshold, better accuracy
- Cons: Fewer unlocks than 70%, marginal accuracy gain
- Rejected: 70% provides better balance for MVP

**Option D: Dynamic threshold (per-user or per-concept)**
- Pros: Personalized experience, optimal for each user
- Cons: Complex implementation, harder to debug, requires ML
- Deferred: Consider for Phase 2 after gathering data

## Links

- Related ADRs:
  - ADR-0007: Confidence threshold calibration (≥0.80 HIGH, ≥0.60 MEDIUM)
  - ADR-0006: Hybrid matching algorithm (0.6 × embeddings + 0.4 × LLM)
- Implementation:
  - `src/features/flashcards/unlock-service.ts` (line 35: `if (match.confidence < 0.7)`)
- Docs:
  - `FLASHCARD_UNLOCK_TESTING_GUIDE.md`
  - `UX_REFACTOR_PLAN.md`

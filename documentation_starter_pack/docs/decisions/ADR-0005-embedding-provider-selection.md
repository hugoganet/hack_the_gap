# ADR-0005: Embedding Provider Selection for Semantic Similarity

Date: 2025-11-16
Status: Accepted
Deciders: Founder, AI Implementation Team

## Context

For US-0004 (Concept-to-Syllabus Matching), we need to compute semantic similarity between extracted concepts from videos and syllabus concepts. This requires generating vector embeddings for text comparison.

**Requirements:**
- High-quality embeddings for educational/academic content
- Fast batch processing (10-50 concepts per video)
- Cost-effective for MVP budget
- Easy integration with existing OpenAI infrastructure
- Consistent results for reproducibility

**Constraints:**
- 48-hour hackathon timeline
- Target < 20 seconds total matching time per video
- Budget: ~$0.10 per video acceptable
- Must work with existing Vercel AI SDK setup

## Decision

**Selected: OpenAI `text-embedding-3-small`**

Implementation in `src/lib/ai/embeddings.ts`:
- Model: `text-embedding-3-small` (1536 dimensions)
- Batch processing via `embedMany()` from Vercel AI SDK
- Cosine similarity for vector comparison
- Float32Array conversion for type safety

## Consequences

**Positive:**
- ✅ Excellent quality for educational content (trained on diverse corpus)
- ✅ Fast: ~0.5s for 50 embeddings in batch
- ✅ Cost-effective: $0.00002 per 1K tokens (~$0.00003 per video)
- ✅ Already using OpenAI for LLM, no new vendor integration
- ✅ Vercel AI SDK provides clean abstraction
- ✅ 1536 dimensions balance quality vs performance

**Negative:**
- ❌ Vendor lock-in to OpenAI (mitigated: embeddings are standard vectors)
- ❌ Requires API key and internet connection (acceptable for MVP)
- ❌ No fine-tuning on domain-specific data (acceptable: general model works well)

**Follow-ups:**
- Monitor embedding quality on real student videos
- Consider caching syllabus embeddings (reuse across videos)
- Evaluate `text-embedding-3-large` if accuracy < 68% target
- Consider local models (Sentence Transformers) for cost optimization post-MVP

## Alternatives Considered

**Option A: Cohere Embeddings**
- Pros: Competitive quality, multilingual support
- Cons: New vendor integration, similar cost, no existing infrastructure
- Rejected: No clear advantage over OpenAI for MVP

**Option B: Sentence Transformers (Local)**
- Pros: Free, no API calls, privacy-friendly
- Cons: Slower (CPU inference), deployment complexity, model size
- Rejected: 48-hour timeline too tight for local model setup

**Option C: OpenAI `text-embedding-3-large`**
- Pros: Higher quality (3072 dimensions)
- Cons: 2x cost, slower, overkill for MVP
- Rejected: `small` model sufficient for initial validation

**Option D: OpenAI Ada-002 (Legacy)**
- Pros: Proven, widely used
- Cons: Deprecated, lower quality than v3 models
- Rejected: v3-small is better and same price

## Links

- Related ADRs: ADR-0006 (Hybrid Matching Algorithm)
- Implementation: `src/lib/ai/embeddings.ts`
- Docs: `src/features/matching/README.md`
- Spec: `docs/specs/us-0004-concept-to-syllabus-matching.md`
- OpenAI Docs: https://platform.openai.com/docs/guides/embeddings

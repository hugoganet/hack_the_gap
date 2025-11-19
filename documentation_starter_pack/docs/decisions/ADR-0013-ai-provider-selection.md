# ADR-0013: AI Provider Selection (Hybrid: Claude + OpenAI)

Date: 2025-11-18
Status: Accepted
Deciders: Founder

## Context

**Problem Statement:**
The application's core functionality depends on AI for:
- Concept extraction from content (videos, PDFs, articles)
- Semantic embeddings for concept matching
- LLM reasoning for match verification
- Flashcard generation
- Answer generation for unlock system

**Requirements:**
- High-quality concept extraction (70%+ accuracy)
- Multilingual embeddings (100+ languages)
- Fast response times (<30s for full pipeline)
- Reliable API with good uptime
- Reasonable cost structure
- Good developer experience

**Forces at Play:**
- Quality vs cost tradeoff
- Vendor lock-in vs best-in-class models
- API reliability vs self-hosted control
- Development speed vs long-term flexibility

## Decision

**Selected: Hybrid Approach (Claude 3.5 Sonnet + OpenAI Embeddings)**

Use different providers for different tasks:
- **Concept Extraction:** Claude 3.5 Sonnet (Anthropic)
- **Embeddings:** text-embedding-3-large (OpenAI, 3072 dimensions)
- **Match Reasoning:** Claude 3.5 Sonnet (Anthropic)
- **Flashcard Generation:** Claude 3.5 Sonnet (Anthropic)
- **Answer Generation:** Claude 3.5 Sonnet (Anthropic)

**Rationale for Split:**
- **Claude for LLM tasks:** Superior reasoning, better instruction following, more reliable outputs
- **OpenAI for embeddings:** Best-in-class multilingual embeddings (100+ languages)
- **Best of both worlds:** Use each provider's strengths

**Integration:**
- Vercel AI SDK for Claude (streaming and type safety)
- Direct OpenAI API for embeddings only
- Prompt engineering over fine-tuning (faster iteration)

**Cost Structure:**
- Claude 3.5 Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- text-embedding-3-large: ~$0.13 per 1M tokens
- Estimated: ~$0.08-0.12 per video processed
- Target: <$10/student/month at scale

## Consequences

**Positive:**
- ✅ **Claude advantages:** Superior reasoning, better instruction following, more reliable structured outputs
- ✅ **Claude advantages:** Longer context window (200K tokens vs 128K)
- ✅ **Claude advantages:** Better at following complex prompts
- ✅ **Claude advantages:** Lower cost for LLM tasks (~60% cheaper than GPT-4)
- ✅ **OpenAI advantages:** Best-in-class multilingual embeddings (100+ languages, ~95% cross-lingual similarity)
- ✅ **Combined:** Best tool for each job
- ✅ Reliable APIs with 99.9% uptime SLA (both providers)
- ✅ Excellent documentation (both providers)
- ✅ Fast response times (typically <5s for concept extraction)
- ✅ Streaming support via Vercel AI SDK (Claude)
- ✅ Active development and regular improvements (both)

**Negative:**
- ❌ **Complexity:** Two providers to manage
- ❌ **Vendor lock-in:** Dependent on both Anthropic and OpenAI
- ❌ **Multiple API keys:** More secrets to manage
- ❌ **Rate limits:** Need to track limits for both providers
- ❌ **Data sent to external services:** Privacy concerns (both)
- ❌ **No control over model updates:** Either provider can change
- ❌ **Potential for API outages:** Two failure points instead of one
- ❌ **Cost tracking:** Need to monitor two providers

**Follow-ups:**
- Monitor API costs daily (both providers)
- Implement caching for repeated queries
- Set up rate limiting and quotas (both)
- Consider fine-tuning if cost becomes issue
- Evaluate alternatives quarterly
- Add retry logic with exponential backoff
- Implement fallback between providers if one fails

## Alternatives Considered

### Option A: OpenAI Only (GPT-4 + Embeddings)
**Pros:**
- Single provider (simpler)
- Integrated solution
- Good documentation
- Large ecosystem
- Vercel AI SDK support

**Cons:**
- GPT-4 more expensive than Claude (~2.5x)
- Less reliable for structured outputs
- Shorter context window (128K vs 200K)
- Not as good at following complex prompts

**Rejected because:** Claude provides better quality for LLM tasks at lower cost. Worth the complexity of managing two providers.

### Option B: Local Models (Llama 3, Mistral)
**Pros:**
- No API costs (after initial setup)
- Complete control over models
- No vendor lock-in
- Data stays private
- No rate limits

**Cons:**
- Requires GPU infrastructure ($500+/month)
- Lower quality than GPT-4
- Slower inference times
- Need to manage infrastructure
- Complex deployment
- No multilingual embeddings as good as OpenAI
- Overkill for MVP

**Rejected because:** Infrastructure complexity and cost not worth it for MVP. Quality gap too large. Can revisit if API costs become prohibitive (>$10K/month).

### Option C: Cohere
**Pros:**
- Good embeddings (multilingual)
- Competitive pricing
- Good for semantic search
- Reliable API

**Cons:**
- LLM quality lower than GPT-4
- Smaller ecosystem
- Less documentation
- Fewer integrations
- Not as well-known

**Rejected because:** GPT-4 quality significantly better for concept extraction. Cohere embeddings good but OpenAI's text-embedding-3-large is superior for our use case.

### Option D: Google Gemini
**Pros:**
- Competitive with GPT-4
- Good multilingual support
- Free tier available
- Integrated with Google ecosystem

**Cons:**
- Less mature API
- Fewer integrations
- Documentation not as good
- Vercel AI SDK support limited
- Embeddings not as good as OpenAI

**Rejected because:** Less mature ecosystem. OpenAI has better developer experience and more reliable API. Gemini is promising but not ready for production use yet.

### Option E: Hybrid Approach (Multiple Providers)
**Pros:**
- Best tool for each job
- Reduced vendor lock-in
- Cost optimization potential
- Redundancy

**Cons:**
- Complex integration
- Multiple API keys to manage
- Inconsistent quality
- Harder to debug
- More failure points

**Rejected because:** Complexity not worth it for MVP. Can revisit if specific use cases benefit from different models.

## Cost Optimization Strategies

1. **Caching:**
   - Cache concept extractions (same video = same concepts)
   - Cache embeddings (same text = same embedding)
   - Cache match results (same concept pair = same match)
   - Estimated savings: 30-40%

2. **Prompt Optimization:**
   - Shorter prompts where possible
   - Structured outputs to reduce tokens
   - Few-shot examples only when needed
   - Estimated savings: 10-20%

3. **Blackbox Fallback:**
   - Use Blackbox for LLM reasoning (cheaper)
   - Fall back to GPT-4 if Blackbox fails
   - Estimated savings: 20-30% on LLM calls

4. **Batch Processing:**
   - Batch embedding generation
   - Process multiple concepts together
   - Estimated savings: 10-15%

**Target:** <$0.10 per video processed

## Migration Path (If Needed)

If OpenAI costs become prohibitive:

1. **Phase 1: Optimize Current Setup** (1-2 weeks)
   - Implement all caching strategies
   - Optimize prompts
   - Use Blackbox more aggressively
   - Target: 50% cost reduction

2. **Phase 2: Fine-Tune Models** (1-2 months)
   - Fine-tune GPT-3.5 for concept extraction
   - Use fine-tuned model for routine tasks
   - Keep GPT-4 for complex cases
   - Target: 70% cost reduction

3. **Phase 3: Hybrid Approach** (2-3 months)
   - Use local models for simple tasks
   - Use OpenAI for complex tasks
   - Implement smart routing
   - Target: 80% cost reduction

4. **Phase 4: Full Migration** (3-6 months)
   - Only if costs >$20K/month
   - Migrate to self-hosted models
   - Keep OpenAI as fallback
   - Target: 90% cost reduction

**Decision Point:** Only migrate if monthly costs exceed $10K and optimization strategies exhausted. Consider consolidating to single provider if management complexity becomes issue.

## Quality Metrics

**Acceptable Performance:**
- Concept extraction accuracy: ≥70%
- Embedding similarity for equivalent concepts: ≥0.90
- Match reasoning accuracy: ≥68%
- Response time: <30s for full pipeline
- API uptime: ≥99%

**If these are met, OpenAI is sufficient.**

## Links

- **OpenAI Docs:** https://platform.openai.com/docs
- **Vercel AI SDK:** https://sdk.vercel.ai/docs
- **Related ADRs:**
  - ADR-0005: Embedding provider (superseded by ADR-0017)
  - ADR-0017: Multilingual embeddings strategy
  - ADR-0006: Hybrid matching algorithm
  - ADR-0012: Monolith architecture
- **Tech Stack:** `docs/tech_stack.md`
- **Cost Analysis:** `docs/reference/COST_ANALYSIS.md` (TODO)

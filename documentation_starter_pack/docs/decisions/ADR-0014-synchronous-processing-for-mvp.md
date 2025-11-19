# ADR-0014: Synchronous Processing for MVP

Date: 2025-11-18
Status: Accepted
Deciders: Founder

## Context

**Problem Statement:**
Content processing (video transcription, concept extraction, matching, flashcard generation) takes 30-60 seconds. Need to decide how to handle this:
- Synchronous: User waits, sees progress
- Asynchronous: User submits, gets notified later

**Requirements:**
- 48-hour MVP timeline
- Simple implementation
- Good user experience
- Acceptable performance
- Easy to debug

**Forces at Play:**
- Development speed vs optimal UX
- Simplicity vs scalability
- MVP constraints vs production requirements
- User expectations vs technical limitations

## Decision

**Selected: Synchronous Processing with Progress Indicators**

Process content synchronously in API routes/Server Actions:
- User submits content URL/file
- Server processes immediately (blocking)
- UI shows progress indicators
- User sees results when complete
- 60-second timeout limit

**Implementation:**
```typescript
// Server Action
export async function processContent(url: string) {
  // 1. Fetch transcript (5-10s)
  const transcript = await fetchTranscript(url);
  
  // 2. Extract concepts (10-15s)
  const concepts = await extractConcepts(transcript);
  
  // 3. Match to goals (10-20s)
  const matches = await matchConcepts(concepts);
  
  // 4. Generate flashcards (5-10s)
  const flashcards = await generateFlashcards(matches);
  
  return { concepts, matches, flashcards };
}
```

**UI Pattern:**
- Show loading spinner with estimated time
- Display progress steps ("Fetching transcript...", "Extracting concepts...")
- Allow cancellation
- Show results immediately when done

## Consequences

**Positive:**
- ✅ Simplest implementation (no queue infrastructure)
- ✅ Immediate feedback (user sees results right away)
- ✅ Easy to debug (linear flow, no async complexity)
- ✅ No additional infrastructure (no Redis, no workers)
- ✅ Perfect for MVP and demo
- ✅ User knows exactly when processing is done
- ✅ No notification system needed
- ✅ Faster development (days vs weeks)

**Negative:**
- ❌ UI blocks during processing (user must wait)
- ❌ Browser timeout risk (60s limit)
- ❌ Can't process multiple videos in parallel
- ❌ Server resources tied up during processing
- ❌ Poor UX for slow connections
- ❌ Can't retry failed jobs automatically
- ❌ No job queue for rate limiting

**Follow-ups:**
- Monitor processing times (target: <60s p95)
- Add timeout handling (graceful failure)
- Implement cancellation
- Consider async queue if processing >60s consistently
- Add retry logic for transient failures

## Alternatives Considered

### Option A: Async Queue (Inngest/BullMQ)
**Structure:**
- User submits job to queue
- Background worker processes
- User gets notification when done
- Can check status via polling

**Pros:**
- Non-blocking UI
- Can process multiple jobs in parallel
- Automatic retries
- Better resource utilization
- Scalable to high volume

**Cons:**
- Complex infrastructure (Redis, workers)
- Need notification system
- Slower development (1-2 weeks)
- Harder to debug
- Overkill for MVP
- User doesn't see immediate results

**Rejected because:** Too complex for 48-hour MVP. Synchronous processing is acceptable for demo and early users. Can migrate later if needed.

### Option B: Polling with Status Updates
**Structure:**
- User submits job
- Server returns job ID
- Client polls for status
- Shows progress updates

**Pros:**
- Non-blocking UI
- Can show progress
- Better than pure async
- Easier than full queue

**Cons:**
- Still need background processing
- Polling overhead
- More complex than synchronous
- Need job status storage
- Slower development

**Rejected because:** Middle ground that adds complexity without major benefits. Either go fully synchronous (simple) or fully async (scalable). This is neither.

### Option C: WebSockets for Real-time Updates
**Structure:**
- User submits job
- Server processes in background
- WebSocket sends progress updates
- Real-time feedback

**Pros:**
- Non-blocking UI
- Real-time progress
- Great UX
- No polling overhead

**Cons:**
- Complex infrastructure (WebSocket server)
- Need to manage connections
- Harder to debug
- Overkill for MVP
- Vercel limitations for long-lived connections

**Rejected because:** Too complex for MVP. WebSockets add significant infrastructure complexity. Synchronous processing with progress indicators is simpler and sufficient.

### Option D: Server-Sent Events (SSE)
**Structure:**
- User submits job
- Server streams progress via SSE
- Client receives updates
- Simpler than WebSockets

**Pros:**
- Real-time updates
- Simpler than WebSockets
- Good browser support
- Works with HTTP

**Cons:**
- Still need background processing
- More complex than synchronous
- Vercel limitations
- Slower development

**Rejected because:** Adds complexity without solving core issue. Synchronous processing is simpler and acceptable for MVP.

## Performance Targets

**Acceptable for MVP:**
- Total processing time: <60s (p95)
- Breakdown:
  - Transcript fetch: <10s
  - Concept extraction: <15s
  - Concept matching: <20s
  - Flashcard generation: <10s
  - Buffer: 5s

**If consistently >60s, migrate to async queue.**

## Migration Path (If Needed)

If processing times exceed 60s consistently:

### Phase 1: Optimize Current Flow (1 week)
- Cache transcripts
- Batch API calls
- Optimize prompts
- Parallel processing where possible
- Target: <45s processing time

### Phase 2: Implement Async Queue (2-3 weeks)
- Add Inngest or BullMQ
- Implement background workers
- Add job status tracking
- Implement notifications
- Keep synchronous as option for small jobs

### Phase 3: Full Async (1 month)
- All processing async
- Real-time progress via SSE
- Automatic retries
- Job prioritization
- Rate limiting

**Decision Point:** Migrate if:
- Processing time >60s for >10% of jobs
- User complaints about waiting
- Need to process >100 videos/day
- Server resources consistently maxed

## User Experience Considerations

**Synchronous Advantages:**
- Immediate gratification (see results right away)
- No need to check back later
- Clear when processing is done
- Simpler mental model

**Synchronous Disadvantages:**
- Must wait (can't do other things)
- Anxiety if taking long
- Browser timeout risk

**Mitigation Strategies:**
- Show estimated time remaining
- Display progress steps
- Allow cancellation
- Provide entertainment (tips, examples)
- Set expectations upfront ("This takes ~30 seconds")

## Technical Implementation

**Timeout Handling:**
```typescript
// 60-second timeout
const timeout = 60000;
const result = await Promise.race([
  processContent(url),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), timeout)
  )
]);
```

**Progress Indicators:**
```typescript
// Server Action with status updates
export async function processContent(url: string) {
  updateStatus('Fetching transcript...');
  const transcript = await fetchTranscript(url);
  
  updateStatus('Extracting concepts...');
  const concepts = await extractConcepts(transcript);
  
  updateStatus('Matching to your goals...');
  const matches = await matchConcepts(concepts);
  
  updateStatus('Generating flashcards...');
  const flashcards = await generateFlashcards(matches);
  
  return { concepts, matches, flashcards };
}
```

**Cancellation:**
```typescript
// AbortController for cancellation
const controller = new AbortController();
const result = await processContent(url, { signal: controller.signal });

// User clicks cancel
controller.abort();
```

## Links

- **Related ADRs:**
  - ADR-0012: Monolith architecture
  - ADR-0013: AI provider (OpenAI)
- **Tech Stack:** `docs/tech_stack.md`
- **Architecture:** `docs/architecture.md`
- **Inngest Docs:** https://www.inngest.com/docs (for future migration)
- **BullMQ Docs:** https://docs.bullmq.io (alternative)

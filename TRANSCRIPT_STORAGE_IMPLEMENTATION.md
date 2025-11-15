# Transcript Storage Implementation

## Overview
Implemented the first phase of the video processing pipeline: fetching YouTube transcripts via SocialKit API and storing them in the database for later AI processing.

## Changes Made

### 1. Database Schema Update
**File:** `prisma/schema/schema.prisma`

Added `transcript` field to `VideoJob` model:
```prisma
model VideoJob {
  id                     String    @id @default(uuid())
  userId                 String
  url                    String
  youtubeVideoId         String?
  transcript             String?   @db.Text  // NEW: Store raw transcript
  status                 String
  processedConceptsCount Int?
  errorMessage           String?
  createdAt              DateTime  @default(now())
  completedAt            DateTime?
  concepts               Concept[]
  user                   User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("video_jobs")
}
```

### 2. Server Action Update
**File:** `app/actions/process-content.action.ts`

**Added:**
- User authentication via `getRequiredUser()`
- Database storage using Prisma
- Status tracking with `transcript_fetched` status

**Workflow:**
1. Authenticate user
2. Validate YouTube URL
3. Fetch transcript from SocialKit API
4. Store in database with status: "transcript_fetched"
5. Return success with videoJobId

**Response Structure:**
```typescript
{
  success: true,
  message: "Successfully fetched transcript! Processing concepts...",
  data: {
    videoJobId: string,
    url: string,
    transcriptLength: number
  }
}
```

### 3. UI Component
**File:** `app/orgs/[orgSlug]/(navigation)/users/client-org.tsx`

Already implemented:
- Drag-and-drop inbox interface
- URL input field
- Process button with loading state
- Toast notifications for success/error

## Status Workflow

```
User drops URL
    ↓
[transcript_fetched] ← We are here (Phase 1 complete)
    ↓
[processing] ← Next: AI concept extraction (Phase 2)
    ↓
[completed] ← Final: Flashcards generated
```

## Next Steps (Phase 2 - AI Processing)

### 1. Create Concept Extraction Service
**File:** `app/actions/extract-concepts.action.ts`

```typescript
export async function extractConcepts(videoJobId: string) {
  // 1. Fetch video job with transcript
  // 2. Call OpenAI to extract concepts
  // 3. Store concepts in database
  // 4. Match concepts to syllabus
  // 5. Generate flashcards
  // 6. Update status to "completed"
}
```

### 2. Concept Extraction Prompt
Based on your vision doc, the prompt should:
- Extract atomic concepts (one idea per concept)
- Include definitions
- Identify timestamps where concepts are explained
- Rate confidence (0-1)

### 3. Concept Matching
- Fetch syllabus concepts for user's active course
- Use OpenAI embeddings for semantic matching
- Store matches with confidence scores
- Only concepts with confidence >= 0.8 count as "learned"

### 4. Flashcard Generation
- Generate question/answer pairs from matched concepts
- Link back to video timestamps
- Initialize spaced repetition schedule

## Database Migration Status

**Migration:** `add_transcript_to_video_jobs`
**Status:** Pending (waiting for database connection)

**Command to apply:**
```bash
npx prisma db push
```

## Testing

Once database is updated, test with:
1. Drop a YouTube URL in the inbox
2. Verify transcript is fetched and stored
3. Check database for new `video_jobs` record
4. Verify `transcript` field contains full text
5. Verify status is "transcript_fetched"

## API Response Format (SocialKit)

```json
{
  "success": true,
  "data": {
    "url": "https://youtube.com/watch?v=...",
    "transcript": "Full concatenated text...",
    "transcriptSegments": [
      {
        "text": "Segment text",
        "start": 18,
        "duration": 4,
        "timestamp": "0:18"
      }
    ],
    "wordCount": 458,
    "segments": 61
  }
}
```

We store only `data.transcript` (full text) for AI processing.

## Environment Variables Required

```env
SOCIALKIT_API_KEY=your_api_key_here
DATABASE_URL=your_database_url
```

## Files Modified

1. `prisma/schema/schema.prisma` - Added transcript field
2. `app/actions/process-content.action.ts` - Added database storage
3. `app/orgs/[orgSlug]/(navigation)/users/client-org.tsx` - Already had UI (no changes needed)

## Architecture Decision

**Why store transcript before AI processing?**

✅ **Pros:**
- Fast user feedback (transcript fetched in ~2-3s)
- Reliable: Raw data preserved even if AI fails
- Reprocessable: Can improve prompts and reprocess later
- Cost control: Can batch AI calls
- Debugging: Can inspect raw transcripts

❌ **Cons:**
- Extra database storage (~5-10KB per video)
- Two-step process instead of one

**Decision:** Store first, process later (recommended for MVP)

## Cost Estimates

**Per video:**
- SocialKit API: ~$0.001 (transcript fetch)
- Database storage: ~10KB
- OpenAI (next phase): ~$0.02-0.05 (concept extraction + matching)

**Total per video:** ~$0.02-0.05

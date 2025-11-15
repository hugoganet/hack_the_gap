# Feature Spec: US-0002 - Video URL Submission

Owner: Founder
Status: Draft
Last Updated: 2025-11-14

## Summary

Allow students to paste a YouTube video URL to begin the concept extraction pipeline. This is the primary content input mechanism for the MVP - students provide videos they're already watching, and the system processes them.

**Why now:** Core to the MVP value prop - students must be able to submit NEW content (not pre-canned demos) to prove the extraction pipeline works.

## User Stories

- As a Motivated Struggler, I want to paste a YouTube video URL so that the system can extract concepts from content I'm already consuming.

## Acceptance Criteria

**Given** a user has selected a course
**When** they paste a YouTube URL into the input field
**Then** the system validates the URL and begins processing within 2 seconds

**Given** a user submits an invalid URL (not YouTube or malformed)
**When** validation fails
**Then** system shows clear error message: "Please enter a valid YouTube URL"

**Given** a video is already processing
**When** user tries to submit another video
**Then** system shows: "Processing your previous video. Please wait..."

**Detailed Acceptance Criteria:**

- [ ] Input field accepts YouTube URLs in formats: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
- [ ] Validation happens on paste/submit (instant feedback)
- [ ] Loading state shows: "Processing: Transcribing... Extracting concepts... Matching to syllabus..."
- [ ] Processing completes within 60 seconds (hackathon demo requirement)
- [ ] Error handling for: invalid URL, video unavailable, API failures, rate limits
- [ ] Mobile-friendly input (large tap target, paste button)
- [ ] User can cancel processing mid-flight (show "Cancel" button during processing)

## UX & Flows

```
[Dashboard with selected course]
    ↓
[Input Field: "Paste YouTube video URL"]
[Button: Process Video →]
    ↓
(User pastes URL)
    ↓
[Validation]
  Valid? → [Loading State]
  Invalid? → [Error Message + Red Border]
    ↓
[Loading Progress Bar]
"Processing your video..."
  ✓ Transcribing (10s)
  ⏳ Extracting concepts (30s)
  ⏳ Matching to syllabus (20s)
    ↓
[Success Screen]
"Extracted 4 concepts, matched 3 to your syllabus"
[Button: Review Concepts →]
```

**Mobile-first wireframe:**

- Full-width input field
- Placeholder text: "<https://youtube.com/watch?v=>..."
- Paste button for mobile users
- Clear progress indicators
- Estimated time remaining

## Scope

**In scope:**

- YouTube URL input and validation
- Real-time processing status updates
- Error handling for common failures
- Cancel processing functionality
- Processing time limit (60s max)
- Support for standard YouTube URL formats

**Out of scope:**

- TikTok, article URLs, PDF uploads (post-MVP)
- Video preview/thumbnail before processing (post-MVP)
- Batch upload (multiple videos at once) (post-MVP)
- Video timestamp selection (process specific segments) (post-MVP)
- Private/unlisted video support (public videos only for MVP)
- Auto-paste from clipboard (post-MVP)

## Technical Design

**Components impacted:**

- `VideoSubmissionForm.tsx` (new component)
- `ProcessingStatus.tsx` (new component)
- `VideoProcessor.ts` (backend service)
- `TranscriptionService.ts` (YouTube API integration)

**API contracts:**

```typescript
// POST /api/videos/submit
Request: {
  courseId: "phil-101",
  videoUrl: "https://youtube.com/watch?v=abc123"
}
Response: {
  jobId: "job-uuid-1234",
  status: "processing",
  estimatedTime: 60 // seconds
}

// GET /api/videos/status/:jobId
Response: {
  jobId: "job-uuid-1234",
  status: "processing" | "completed" | "failed",
  currentStep: "transcribing" | "extracting" | "matching",
  progress: 45, // percentage
  result?: {
    extractedConcepts: 4,
    matchedConcepts: 3,
    concepts: [...]
  },
  error?: {
    code: "INVALID_URL" | "VIDEO_UNAVAILABLE" | "RATE_LIMIT",
    message: "User-friendly error message"
  }
}

// POST /api/videos/cancel/:jobId
Response: {
  success: true
}
```

**Data model changes:**

```sql
-- Video processing jobs table
CREATE TABLE video_jobs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(50) NOT NULL,
  video_url TEXT NOT NULL,
  youtube_video_id VARCHAR(20),
  status VARCHAR(20) NOT NULL, -- processing, completed, failed, cancelled
  current_step VARCHAR(20), -- transcribing, extracting, matching
  progress INT DEFAULT 0,
  extracted_concepts INT,
  matched_concepts INT,
  error_code VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Create index for status polling
CREATE INDEX idx_video_jobs_status ON video_jobs(id, status);
```

**Processing pipeline:**

```typescript
async function processVideo(jobId: string, videoUrl: string, courseId: string) {
  try {
    // Step 1: Extract YouTube video ID
    updateJobStatus(jobId, { currentStep: 'transcribing', progress: 0 });
    const videoId = extractYouTubeVideoId(videoUrl);

    // Step 2: Get transcript (YouTube API)
    const transcript = await getYouTubeTranscript(videoId);
    updateJobStatus(jobId, { currentStep: 'extracting', progress: 30 });

    // Step 3: Extract concepts using AI (GPT-4/Claude)
    const extractedConcepts = await extractConcepts(transcript);
    updateJobStatus(jobId, { currentStep: 'matching', progress: 60 });

    // Step 4: Match to syllabus
    const syllabus = await getSyllabus(courseId);
    const matches = await matchConceptsToSyllabus(extractedConcepts, syllabus);

    // Step 5: Complete
    updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      extractedConcepts: extractedConcepts.length,
      matchedConcepts: matches.filter(m => m.confidence >= 0.8).length
    });
  } catch (error) {
    updateJobStatus(jobId, {
      status: 'failed',
      errorCode: classifyError(error),
      errorMessage: getUserFriendlyMessage(error)
    });
  }
}
```

**URL validation:**

```typescript
function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
  ];
  return patterns.some(pattern => pattern.test(url));
}

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:v=|\/)([\w-]{11})/);
  return match ? match[1] : null;
}
```

**Risks:**

- **YouTube API rate limits**: Mitigation: Cache transcripts, use quota-efficient endpoints
- **Processing timeout**: Mitigation: 60s hard limit, show error if exceeded
- **Invalid/private videos**: Mitigation: Clear error messages, suggest public alternatives
- **Concurrent processing**: Mitigation: Queue system, limit 1 video processing per user at a time
- **API cost**: YouTube transcript API free tier may be limited. Mitigation: Monitor usage, estimate $0.10 per video worst case

## Rollout

**Migration/feature flags:**

- No migration needed
- Feature flag: `video_processing_enabled` (killswitch for demo)

**Metrics:**

- Video submission rate (videos/user/day)
- Processing success rate (% jobs completed vs failed)
- Average processing time per video
- Error rate by type (invalid URL, unavailable video, API failures)
- Processing cancellation rate

**Post-launch checklist:**

- [ ] Test with 10 different YouTube videos (various lengths, channels)
- [ ] Verify error messages are user-friendly
- [ ] Test processing timeout (submit very long video)
- [ ] Test cancel functionality mid-processing
- [ ] Monitor YouTube API quota usage
- [ ] Test mobile paste functionality on iOS/Android

**Post-MVP improvements:**

- Support TikTok, article URLs, PDFs
- Batch processing (multiple videos)
- Video thumbnail preview
- Timestamp selection (process segments)
- Auto-detect clipboard YouTube URLs
- Offline processing queue (for flaky networks)

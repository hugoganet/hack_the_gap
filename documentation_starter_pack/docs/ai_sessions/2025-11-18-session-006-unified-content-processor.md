# AI Session 2025-11-18: Unified Content Processor + PDF Upload

**Date:** 2025-11-18
**Session Type:** Feature Implementation
**AI Assistant:** Claude (Sonnet 4.5)

## Objective

Implement PDF processing with unified content architecture to support multiple content types (videos, PDFs, articles, podcasts).

## Key Decisions

1. **Architecture**: Unified `ContentJob` model replaces `VideoJob`
   - Polymorphic design with content-type specific fields
   - Backward compatible (table: `video_jobs`, column mappings)
   - Extensible for future content types

2. **PDF Library**: pdf-parse for text extraction
   - Simple API, lightweight
   - Works for text-based PDFs
   - Dynamic import for ESM/CJS compatibility

3. **Upload Strategy**: Two-endpoint approach
   - `/api/upload-pdf`: File upload + text extraction
   - `processUploadedPDF()`: Server action for processing

## Implementation Summary

### Database Migration
- **File:** `20251118035542_unified_content_processor`
- Created `ContentType` enum: youtube, tiktok, pdf, url, podcast
- Renamed model: VideoJob → ContentJob
- Added fields: fileName, fileSize, pageCount, contentType
- Updated relations: Concept.videoJobId → contentJobId (mapped)

### Content Extraction Module
**Location:** `/src/features/content-extraction/`

**Files:**
- `types.ts`: TypeScript types for all extractors
- `video-extractor.ts`: YouTube/TikTok (refactored)
- `pdf-extractor.ts`: PDF text extraction (new)
- `url-extractor.ts`: Article extraction (placeholder)
- `podcast-extractor.ts`: Podcast transcription (placeholder)
- `index.ts`: Unified interface with auto-detection

**Key Functions:**
- `detectContentType(url)`: Auto-detect content type from URL
- `extractContent(url)`: Unified extraction interface
- `extractPDFText(url)`: URL-based PDF extraction
- `extractPDFTextFromBuffer(buffer)`: File upload support

### API Endpoints
- **POST /api/upload-pdf**: File upload endpoint
  - Validates type (PDF only) and size (10MB max)
  - Extracts text using pdf-parse
  - Returns extracted data to client

### Server Actions
- **processContent()**: Handles URL-based content (videos, PDFs)
- **processUploadedPDF()**: Handles file uploads
- Both use same AI pipeline: concept extraction → matching → flashcards

### UI Enhancements
**File:** `app/dashboard/users/client-org.tsx`

**Features:**
- Drag & drop zone with visual feedback
- Click to browse file picker
- File validation (type, size)
- Progress indicators ("Uploading...", "Extracting concepts...")
- Loading states with spinner
- Toast notifications

### Code Updates
Updated all `VideoJob` references → `ContentJob`:
- Actions: process-content, match-concepts, generate-flashcards
- API routes: flashcards/preview, concept-matches/feedback
- Components: cards-to-review-today, dashboard-stats
- Features: flashcard-generator, concept-matcher

## Technical Details

### PDF Extraction
```typescript
// Dynamic import for ESM/CJS compatibility
const pdfParsePromise = import("pdf-parse").then(mod => mod.default || mod);
const pdfParse = await pdfParsePromise;
const data = await pdfParse(buffer);
```

### Content Type Detection
```typescript
export function detectContentType(url: string): ContentTypeDetection {
  if (isYouTubeURL(url)) return { contentType: "youtube", confidence: 1.0 };
  if (isTikTokURL(url)) return { contentType: "tiktok", confidence: 1.0 };
  if (isPDFURL(url)) return { contentType: "pdf", confidence: 1.0 };
  if (isPodcastURL(url)) return { contentType: "podcast", confidence: 0.9 };
  return { contentType: "url", confidence: 0.7 };
}
```

## Testing

**Manual Testing:**
1. ✅ URL-based PDF processing
2. ✅ File upload (drag & drop)
3. ✅ File upload (click to browse)
4. ✅ File validation (type, size)
5. ✅ Concept extraction pipeline
6. ✅ Course matching
7. ✅ Flashcard generation

## Files Changed

### New Files
- `/src/features/content-extraction/` (entire module)
- `/app/api/upload-pdf/route.ts`
- `/app/actions/process-uploaded-pdf.action.ts`
- `/UPLOAD_FEATURE.md`
- `prisma/schema/migrations/20251118035542_unified_content_processor/`

### Modified Files
- `app/actions/process-content.action.ts`
- `app/actions/match-concepts.action.ts`
- `app/actions/generate-flashcards.action.ts`
- `app/dashboard/users/client-org.tsx`
- `app/dashboard/users/cards-to-review-today.tsx`
- `app/dashboard/get-dashboard-stats.ts`
- `app/api/flashcards/preview/[videoJobId]/route.ts`
- `app/api/concept-matches/[matchId]/feedback/route.ts`
- `src/features/flashcards/flashcard-generator.ts`
- `src/features/matching/concept-matcher.ts`
- `prisma/schema/schema.prisma`
- `prisma/schema/better-auth.prisma`

## Documentation Updates
- `documentation_starter_pack/docs/CHANGELOG.md`
- `documentation_starter_pack/docs/architecture.md`

## Future Enhancements

**Articles (URL extraction):**
- Jina AI Reader API
- Mozilla Readability
- Puppeteer for dynamic content

**Podcasts:**
- RSS feed parsing
- Whisper API for transcription
- AssemblyAI integration

**File Upload:**
- Multiple file support
- Batch processing
- Resume interrupted uploads
- Cloud storage integration

**PDF Processing:**
- OCR for scanned PDFs (Tesseract.js)
- Table extraction
- Image extraction

## Outcome

✅ **Success**

All content types (YouTube, TikTok, PDFs) now flow through unified pipeline:
`Content → Extraction → ContentJob → AI Concepts → Matching → Flashcards`

PDF support fully functional via both URL input and file upload with drag & drop interface.

# ADR-0016: Content Type Architecture (Unified Content Processor)

Date: 2025-11-18
Status: Accepted
Deciders: Hugo Ganet

## Context

The application initially supported only YouTube videos. To expand content sources (PDFs, TikTok, articles, podcasts), we need a unified content processing architecture.

**Requirements:**
- Support multiple content types: YouTube, TikTok, PDFs, articles, podcasts
- Unified AI pipeline: All content types → concept extraction → matching → flashcards
- Extensible: Easy to add new content types
- Type-safe: Discriminated unions for content-specific fields
- Backward compatible: Existing video processing must continue working

**Constraints:**
- Prisma schema limitations (no true polymorphism)
- Database migration must be non-breaking
- Existing `video_jobs` table has production data
- Must maintain API compatibility

**Forces:**
- Single Table Inheritance (STI): Simple, but nullable fields for all types
- Class Table Inheritance (CTI): Normalized, but complex joins
- Polymorphic associations: Flexible, but requires JSON columns
- Separate tables per type: Clean, but duplicates common fields

## Decision

**Adopt Single Table Inheritance (STI) with ContentType enum** for unified content processing.

**Implementation:**

### 1. Database Schema (Polymorphic STI)

**Model Rename:** `VideoJob` → `ContentJob`
- Table name remains `video_jobs` for backward compatibility
- Added `content_type` enum: `youtube | tiktok | pdf | url | podcast`
- Content-type specific fields (nullable):
  - Video: `youtube_video_id`, `tiktok_video_id`
  - PDF: `file_name`, `file_size`, `page_count`
  - Future: `podcast_duration`, `article_author`, etc.
- Common fields: `extracted_text` (renamed from `transcript` via `@map`)

**Migration:** `20251118035542_unified_content_processor`
- Non-breaking: Column mappings preserve existing data
- `transcript` column → `extractedText` field (via `@map("transcript")`)
- `videoJobId` column → `contentJobId` field (via `@map("videoJobId")`)

### 2. Content Extraction Module

**Location:** `/src/features/content-extraction/`

**Architecture:**
```
Content Input → Type Detection → Extractor → ContentJob → AI Pipeline
```

**Components:**
- `index.ts`: Unified interface with auto content-type detection
- `types.ts`: TypeScript types for extraction results
- `video-extractor.ts`: YouTube/TikTok via SocialKit API
- `pdf-extractor.ts`: PDF text via pdf-parse (Buffer + URL support)
- `url-extractor.ts`: Article extraction (placeholder for Jina AI Reader)
- `podcast-extractor.ts`: Podcast transcription (placeholder for Whisper)

**Type Detection:**
```typescript
function detectContentType(url: string): ContentType {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.endsWith('.pdf')) return 'pdf';
  // ... more patterns
}
```

**Unified Interface:**
```typescript
async function extractContent(url: string, contentType?: ContentType): Promise<ExtractionResult> {
  const type = contentType ?? detectContentType(url);
  switch (type) {
    case 'youtube': return extractYouTubeVideo(url);
    case 'pdf': return extractPDF(url);
    // ... more extractors
  }
}
```

### 3. Processing Pipeline

**Flow:**
1. User submits URL or uploads file
2. Detect content type (auto or explicit)
3. Extract text (transcript, PDF text, article content, etc.)
4. Store in `ContentJob` with type-specific metadata
5. AI concept extraction (same prompt for all types)
6. Match to course syllabus
7. Generate flashcards

**Backward Compatibility:**
- Existing `video_jobs` records automatically treated as `content_type: 'youtube'`
- All existing queries work without changes (column mappings)
- API responses unchanged (field names preserved)

## Consequences

**Positive:**
- ✅ Unified content processing pipeline (single code path)
- ✅ Easy to add new content types (new extractor + enum value)
- ✅ Type-safe discriminated unions in TypeScript
- ✅ Backward compatible (no breaking changes)
- ✅ Simple database schema (single table, no joins)
- ✅ Consistent AI pipeline for all content types

**Negative:**
- ⚠️ Nullable fields for content-type specific data (less strict schema)
- ⚠️ Table grows wider as more content types added
- ⚠️ No database-level validation of content-type specific fields
- ⚠️ Potential for "sparse" rows (many null fields)

**Follow-ups:**
- [ ] Implement article extraction (Jina AI Reader API)
- [ ] Implement podcast transcription (Whisper API)
- [ ] Add OCR support for scanned PDFs (Tesseract.js)
- [ ] Consider migrating to Class Table Inheritance if schema becomes too sparse
- [ ] Add content-type specific validation (Zod schemas)

## Alternatives Considered

**Option A: Class Table Inheritance (CTI)**
- Separate tables: `video_jobs`, `pdf_jobs`, `article_jobs`, etc.
- Common fields in `content_jobs` base table
- Pros: Normalized, no nullable fields, type-specific validation
- Cons: Complex joins, harder to query, more migrations
- Rejected: Too complex for MVP, harder to maintain

**Option B: Polymorphic Associations (JSON columns)**
- Single `content_jobs` table with `metadata` JSON column
- Content-type specific data in JSON
- Pros: Flexible, no schema changes for new types
- Cons: No type safety, hard to query, no indexes on JSON fields
- Rejected: Loses type safety, poor query performance

**Option C: Separate Tables (No Inheritance)**
- Completely separate: `video_jobs`, `pdf_jobs`, `article_jobs`
- No shared base table
- Pros: Clean separation, type-specific schemas
- Cons: Duplicates common fields, harder to query across types, more code duplication
- Rejected: Too much duplication, harder to maintain unified pipeline

**Option D: Keep Video-Only (No Expansion)**
- Stick with YouTube-only processing
- Pros: Simple, no migration needed
- Cons: Limits product value, students want PDFs/articles
- Rejected: Product needs multi-source content

## Links

- **Implementation:** Commit `07b72cd3` (refactor(content): rename VideoJob to ContentJob)
- **Migration:** `20251118035542_unified_content_processor`
- **Related ADRs:**
  - ADR-0014: Synchronous processing for MVP
- **Docs:**
  - `docs/architecture.md`: Content Extraction Architecture section
  - `docs/data/schema.yml`: ContentJob schema definition
  - `docs/data/data_dictionary.yml`: ContentJob field descriptions
  - `docs/data/erd.md`: Updated ERD with ContentJob
  - `src/features/content-extraction/README.md`: Technical implementation details

# Content Extraction System

A unified content processing architecture that extracts text and concepts from multiple content types: videos, PDFs, articles, and podcasts.

## Architecture

### Content Types Supported

- ✅ **YouTube** - Transcript extraction via SocialKit API
- ✅ **TikTok** - Transcript extraction via SocialKit API
- ✅ **PDF** - Text extraction using pdf-parse
- 🚧 **URL/Articles** - Placeholder (implement with Jina AI Reader or Readability)
- 🚧 **Podcasts** - Placeholder (implement with Whisper or AssemblyAI)

### Flow

```
URL Input → detectContentType() → extractContent() → ContentJob → Concept Extraction → Matching → Flashcards
```

## Usage

### Basic Usage

```typescript
import { extractContent, detectContentType } from '@/features/content-extraction';

// Auto-detect and extract
const { contentType, result } = await extractContent(url);

if (result.success && result.data) {
  const { extractedText, metadata } = result.data;
  // Process the content...
}
```

### Direct Extractor Usage

```typescript
import {
  extractYouTubeTranscript,
  extractPDFText
} from '@/features/content-extraction';

// YouTube
const youtubeResult = await extractYouTubeTranscript('https://youtube.com/watch?v=...');

// PDF
const pdfResult = await extractPDFText('https://example.com/document.pdf');
```

### Type Detection

```typescript
import { detectContentType } from '@/features/content-extraction';

const detection = detectContentType(url);
// { contentType: "pdf", confidence: 1.0 }
```

## Database Schema

### ContentJob Model

```prisma
model ContentJob {
  id                     String       @id @default(uuid())
  userId                 String
  url                    String
  contentType            ContentType  @default(youtube)

  // Video-specific fields
  youtubeVideoId         String?
  tiktokVideoId          String?

  // PDF-specific fields
  fileName               String?
  fileSize               Int?
  pageCount              Int?

  // Common fields
  extractedText          String?      @map("transcript") @db.Text
  status                 String
  processedConceptsCount Int?
  errorMessage           String?
  createdAt              DateTime     @default(now())
  completedAt            DateTime?

  concepts               Concept[]
  user                   User         @relation(...)
}
```

## Adding New Content Types

### 1. Add to ContentType Enum

```prisma
enum ContentType {
  youtube
  tiktok
  pdf
  url
  podcast
  newtype  // Add here
}
```

### 2. Create Extractor

```typescript
// src/features/content-extraction/newtype-extractor.ts

export async function extractNewType(url: string): Promise<ExtractionResult> {
  // Implementation...
  return {
    success: true,
    data: {
      extractedText: "...",
      metadata: { /* type-specific metadata */ }
    }
  };
}

export function isNewTypeURL(url: string): boolean {
  return url.includes("newtype.com");
}
```

### 3. Register in index.ts

```typescript
// src/features/content-extraction/index.ts

import { extractNewType, isNewTypeURL } from './newtype-extractor';

export function detectContentType(url: string): ContentTypeDetection {
  // Add detection logic
  if (isNewTypeURL(url)) {
    return { contentType: "newtype", confidence: 1.0 };
  }
  // ...
}

export async function extractContent(url: string) {
  // Add to switch statement
  switch (contentType) {
    case "newtype":
      result = await extractNewType(url);
      break;
    // ...
  }
}
```

### 4. Update Database Schema (if needed)

```prisma
model ContentJob {
  // Add type-specific fields
  newtypeSpecificField   String?
}
```

### 5. Run Migration

```bash
pnpm prisma migrate dev --name add_newtype_support
```

## Implementation Details

### PDF Extraction

Uses `pdf-parse` library with dynamic import to handle ESM/CJS compatibility:

```typescript
const pdfParsePromise = import("pdf-parse").then(mod => mod.default || mod);
const pdfParse = await pdfParsePromise;
const data = await pdfParse(buffer);
```

Supports:
- URL-based PDFs
- Buffer-based PDFs (for file uploads)
- Metadata extraction (page count, file size)

### Video Extraction

Uses SocialKit API for transcript fetching:
- Supports multiple YouTube URL formats (watch, shorts, embed)
- TikTok video support
- Returns transcript with timestamps

### Error Handling

All extractors return a consistent result type:

```typescript
type ExtractionResult = {
  success: boolean;
  error?: string;
  data?: {
    extractedText: string;
    metadata: Record<string, unknown>;
  };
};
```

## Testing

Test PDF processing:
```bash
# Try a public PDF URL in the app
https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
```

## Future Enhancements

### URL/Article Extraction
- Option 1: Jina AI Reader (`https://r.jina.ai/${url}`)
- Option 2: Mozilla Readability
- Option 3: Puppeteer/Playwright for dynamic content

### Podcast Transcription
- Option 1: Whisper API (OpenAI)
- Option 2: AssemblyAI
- Option 3: RSS feed parsing + transcript download

### File Upload Support
- Already scaffolded in UI (drag-and-drop)
- Need upload endpoint
- Use `extractPDFTextFromBuffer()` for uploaded PDFs

## Migration Notes

**Backward Compatibility:**
- Database table still named `video_jobs` via `@@map`
- Column `extractedText` mapped to existing `transcript` column
- All existing data preserved
- UI still receives `videoJobId` in responses

**Breaking Changes:**
- Prisma schema: `VideoJob` → `ContentJob`
- Code references updated throughout codebase
- Migration: `20251118035542_unified_content_processor`

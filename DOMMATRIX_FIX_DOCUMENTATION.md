# DOMMatrix Error Fix - Documentation

## Problem Summary

**Error**: `ReferenceError: DOMMatrix is not defined`

**Context**: The error occurred in Vercel's serverless environment when users submitted YouTube URLs for video processing, even though the YouTube processing flow doesn't directly use any browser APIs.

## Root Cause Analysis

### The Issue Chain

1. **pdf-parse dependency**: The application uses `pdf-parse` (v2.x) for PDF text extraction
2. **canvas dependency**: `pdf-parse` internally depends on the `canvas` package for rendering
3. **Browser API requirement**: `canvas` requires browser-specific APIs like `DOMMatrix`, `HTMLCanvasElement`, etc.
4. **Module bundling**: Next.js bundles all content extractors together because they're imported in the same index file
5. **Serverless limitation**: Vercel's Node.js serverless runtime doesn't provide browser APIs

### Why It Affected YouTube Processing

Even though YouTube video processing doesn't use PDF extraction, the error occurred because:

```typescript
// src/features/content-extraction/index.ts (BEFORE FIX)
import { extractPDFText, isPDFURL } from "./pdf-extractor";  // ❌ Loaded at module initialization
```

When `pdf-extractor.ts` is imported:
- It imports `pdf-parse` at the top level
- `pdf-parse` tries to load `canvas`
- `canvas` tries to access `DOMMatrix`
- **Error thrown in serverless environment**

This happens **before** any code execution, during the module loading phase.

## Solution Implemented

### 1. Dynamic Imports for PDF Extraction

**File**: `src/features/content-extraction/index.ts`

**Changes**:
- Removed static import of `pdf-extractor`
- Created `loadPDFExtractor()` function with dynamic import
- Modified `extractContent()` to lazy-load PDF extractor only when needed
- Created local `isPDFURLLocal()` to detect PDFs without importing the extractor

```typescript
// BEFORE (Static Import - ❌ Causes bundling issues)
import { extractPDFText, isPDFURL } from "./pdf-extractor";

// AFTER (Dynamic Import - ✅ Loads only when needed)
async function loadPDFExtractor() {
  const { extractPDFText, isPDFURL } = await import("./pdf-extractor");
  return { extractPDFText, isPDFURL };
}
```

**Benefits**:
- PDF extractor code is only loaded when processing PDF files
- YouTube, TikTok, and article processing don't trigger canvas loading
- Reduces serverless function bundle size for non-PDF routes

### 2. Dynamic Import in Upload API

**File**: `app/api/upload-pdf/route.ts`

**Changes**:
- Removed static import of `extractPDFTextFromBuffer`
- Added dynamic import inside the POST handler

```typescript
// BEFORE
import { extractPDFTextFromBuffer } from "@/features/content-extraction/pdf-extractor";

// AFTER
const { extractPDFTextFromBuffer } = await import(
  "@/features/content-extraction/pdf-extractor"
);
```

### 3. Webpack Configuration

**File**: `next.config.ts`

**Changes**:
- Added webpack configuration to externalize `canvas` in server builds
- Prevents bundling of native modules in serverless functions

```typescript
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals = config.externals ?? [];
    config.externals.push({
      canvas: "commonjs canvas",
    });
  }
  return config;
}
```

**Purpose**: Defense-in-depth approach - even if canvas is accidentally imported, webpack won't bundle it.

## Testing Guide

### 1. Test YouTube Video Processing

```bash
# Start the development server
npm run dev

# Navigate to the dashboard
# Submit a YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
# Verify:
# - No DOMMatrix error occurs
# - Video transcript is extracted successfully
# - Concepts are generated
# - Matching works correctly
```

### 2. Test PDF Upload

```bash
# Navigate to the dashboard
# Upload a PDF file (< 10MB)
# Verify:
# - PDF text extraction works
# - Concepts are generated from PDF content
# - No errors in console
```

### 3. Test TikTok and Article Processing

```bash
# Test TikTok URL
# Test article URL (any web page)
# Verify no errors occur
```

### 4. Verify Build Output

```bash
# Build the application
npm run build

# Check the build output for:
# - No canvas-related warnings
# - Successful compilation
# - No DOMMatrix references in server bundles
```

### 5. Test on Vercel (Production)

```bash
# Deploy to Vercel
vercel deploy

# Test all content types in production:
# - YouTube videos
# - TikTok videos
# - PDF uploads
# - Article URLs

# Monitor Vercel logs for any DOMMatrix errors
```

## Verification Checklist

- [ ] YouTube video processing works without DOMMatrix error
- [ ] TikTok video processing works
- [ ] PDF upload and extraction works
- [ ] Article/URL processing works
- [ ] No canvas-related errors in development
- [ ] No canvas-related errors in production (Vercel)
- [ ] Build completes successfully
- [ ] Serverless function size is reasonable
- [ ] All content types can be processed in the same session

## Technical Details

### Module Loading Order

**Before Fix**:
```
1. User submits YouTube URL
2. processContent action loads
3. extractContent imported from index.ts
4. index.ts imports pdf-extractor (static)
5. pdf-extractor imports pdf-parse
6. pdf-parse loads canvas
7. canvas tries to access DOMMatrix
8. ❌ ERROR: DOMMatrix is not defined
```

**After Fix**:
```
1. User submits YouTube URL
2. processContent action loads
3. extractContent imported from index.ts
4. index.ts does NOT import pdf-extractor (dynamic)
5. detectContentType identifies "youtube"
6. extractYouTubeTranscript called (no canvas involved)
7. ✅ SUCCESS: Video processed without loading PDF dependencies
```

### When PDF Processing Occurs

```
1. User uploads PDF or submits PDF URL
2. detectContentType identifies "pdf"
3. loadPDFExtractor() called (dynamic import)
4. pdf-extractor module loaded
5. pdf-parse and canvas loaded
6. PDF text extracted successfully
7. ✅ SUCCESS: PDF processed with canvas available when needed
```

## Alternative Solutions Considered

### Option 2: Webpack Externals Only
**Pros**: Simple configuration change
**Cons**: Doesn't prevent module loading, just externalizes it
**Status**: Implemented as additional safeguard

### Option 3: Alternative PDF Library
**Pros**: Could avoid canvas dependency entirely
**Cons**: Requires significant refactoring, may have different capabilities
**Status**: Not implemented (can be future improvement)

### Option 4: Separate API Routes
**Pros**: Complete isolation between content types
**Cons**: Code duplication, more complex architecture
**Status**: Not implemented (current solution is cleaner)

## Monitoring and Debugging

### Check for DOMMatrix Errors

```bash
# In Vercel dashboard, check function logs for:
grep -i "dommatrix" vercel-logs.txt
grep -i "canvas" vercel-logs.txt
```

### Verify Dynamic Imports

```bash
# Check Next.js build output for code splitting
npm run build | grep -i "pdf"
```

### Test Import Behavior

```typescript
// Add temporary logging in index.ts
console.log("Loading content-extraction index");

async function loadPDFExtractor() {
  console.log("Dynamically loading PDF extractor");
  const module = await import("./pdf-extractor");
  console.log("PDF extractor loaded successfully");
  return module;
}
```

## Performance Impact

### Before Fix
- All content extractors bundled together
- Canvas loaded for every request
- Larger serverless function size
- Potential cold start issues

### After Fix
- Content extractors loaded on-demand
- Canvas only loaded for PDF processing
- Smaller serverless function size for non-PDF routes
- Faster cold starts for YouTube/TikTok processing

## Future Improvements

1. **Consider alternative PDF libraries**: Explore `pdf-lib` or `pdfjs-dist` (server build) that don't require canvas
2. **Add telemetry**: Track which content types are most commonly used
3. **Optimize bundle size**: Further split extractors if needed
4. **Add retry logic**: Handle transient canvas loading issues gracefully

## Related Files

- `src/features/content-extraction/index.ts` - Main extraction orchestrator
- `src/features/content-extraction/pdf-extractor.ts` - PDF extraction logic
- `app/api/upload-pdf/route.ts` - PDF upload endpoint
- `app/actions/process-content.action.ts` - Content processing action
- `next.config.ts` - Next.js configuration with webpack externals

## References

- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [pdf-parse Documentation](https://www.npmjs.com/package/pdf-parse)
- [Canvas Node Module](https://www.npmjs.com/package/canvas)

# PDF Processing Fix - Migration from pdf-parse to unpdf

## Problem
- pdf-parse v2.4.5 requires @napi-rs/canvas (native module) and pdfjs-dist
- These dependencies cause DOMMatrix errors in Vercel's serverless environment
- Error: "ReferenceError: DOMMatrix is not defined"

## Solution
Replace pdf-parse with unpdf - a pure JavaScript, serverless-friendly PDF text extraction library

## Implementation Checklist

### Phase 1: Dependencies
- [x] Remove pdf-parse and @types/pdf-parse from package.json
- [x] Add unpdf to package.json
- [ ] Run pnpm install

### Phase 2: Code Changes
- [x] Rewrite src/features/content-extraction/pdf-extractor.ts
- [ ] Test locally with PDF uploads
- [ ] Test with PDF URLs

### Phase 3: Configuration Cleanup
- [x] Remove canvas webpack externals from next.config.ts
- [x] Keep dynamic imports (still useful for code splitting)

### Phase 4: Documentation
- [x] Update DOMMATRIX_FIX_DOCUMENTATION.md
- [x] Update VERCEL_SERVERLESS_FIXES.md
- [x] Add migration notes

### Phase 5: Testing & Deployment
- [ ] Install dependencies (pnpm install)
- [ ] Test locally with various PDFs
- [ ] Deploy to Vercel preview
- [ ] Monitor logs
- [ ] Deploy to production

## Next Steps

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Test locally**:
   ```bash
   pnpm dev
   # Upload a PDF file
   # Submit a PDF URL
   # Check console for errors
   ```

3. **Build and verify**:
   ```bash
   pnpm build
   # Check for no canvas/DOMMatrix warnings
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel deploy
   # Test in preview environment
   # Monitor function logs
   ```

## Status: Code Changes Complete - Ready for Testing
Started: 2025-01-XX
Completed: 2025-01-XX

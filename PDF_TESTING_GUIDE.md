# PDF Processing Testing Guide

## Pre-Testing Checklist

- [x] Dependencies installed (`pnpm install`)
- [x] unpdf v0.12.2 confirmed installed
- [ ] TypeScript compilation passes
- [ ] Local dev server starts
- [ ] Build completes successfully

## Test Scenarios

### Scenario 1: PDF File Upload (Primary Use Case)

**Steps:**
1. Start dev server: `pnpm dev`
2. Navigate to dashboard
3. Upload a small PDF file (< 1MB)
4. Upload a medium PDF file (1-5MB)
5. Upload a large PDF file (5-10MB)

**Expected Results:**
- ✅ All PDFs upload successfully
- ✅ Text is extracted from all PDFs
- ✅ Console shows: "Parsing PDF with unpdf..."
- ✅ Console shows: "PDF parsed successfully with unpdf..."
- ✅ No DOMMatrix errors
- ✅ No @napi-rs/canvas warnings
- ✅ Concepts are generated from extracted text

**Test PDFs:**
- Simple text PDF
- PDF with images
- PDF with tables
- Multi-page PDF
- PDF with special characters

### Scenario 2: PDF URL Processing

**Steps:**
1. Find a publicly accessible PDF URL
2. Submit the URL through the content processing form
3. Wait for processing to complete

**Expected Results:**
- ✅ PDF is fetched successfully
- ✅ Text is extracted
- ✅ No errors in console
- ✅ Concepts are generated

**Test URLs:**
- https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
- Any public research paper PDF
- Any public documentation PDF

### Scenario 3: Edge Cases

**Test Cases:**
1. **Empty PDF**: Upload a PDF with no text
   - Expected: Error message about empty PDF
   
2. **Corrupted PDF**: Upload a corrupted/invalid PDF
   - Expected: Error message about invalid PDF
   
3. **Password-protected PDF**: Upload an encrypted PDF
   - Expected: Error message (unpdf may not support encrypted PDFs)
   
4. **Very large PDF**: Upload a 10MB+ PDF
   - Expected: May hit size limit, should error gracefully

5. **Scanned PDF (images only)**: Upload a scanned document
   - Expected: Error message about no extractable text

### Scenario 4: Regression Testing

**Verify other content types still work:**

1. **YouTube Video**:
   - Submit a YouTube URL
   - ✅ Transcript extracted
   - ✅ No errors

2. **TikTok Video**:
   - Submit a TikTok URL
   - ✅ Transcript extracted
   - ✅ No errors

3. **Article/URL**:
   - Submit a web article URL
   - ✅ Text extracted
   - ✅ No errors

### Scenario 5: Performance Testing

**Metrics to Monitor:**

1. **Cold Start Time**:
   - First PDF upload after deployment
   - Should be 1-2 seconds (down from 2-3s)

2. **Memory Usage**:
   - Check Vercel function logs
   - Should be ~100MB (down from ~200MB)

3. **Bundle Size**:
   - Check build output
   - PDF route bundle should be smaller

## Console Output to Look For

### Success Messages
```
Fetching PDF from URL: https://example.com/doc.pdf
Parsing PDF with unpdf...
PDF parsed successfully with unpdf: {
  fileName: 'doc.pdf',
  estimatedPages: 5,
  textLength: 2500,
  preview: 'This is the beginning of the PDF text...'
}
```

### Error Messages (Should NOT Appear)
```
❌ Warning: Cannot load "@napi-rs/canvas"
❌ Warning: Cannot polyfill DOMMatrix, ImageData, Path2D
❌ Error: ReferenceError: DOMMatrix is not defined
❌ Error: Cannot find module '@napi-rs/canvas'
```

## Vercel Deployment Testing

### Preview Deployment

```bash
# Deploy to preview
vercel deploy

# Get the preview URL
# Test all scenarios above in preview environment
```

### Production Deployment

```bash
# After preview testing passes
vercel --prod

# Monitor production logs for 24 hours
# Check for any DOMMatrix errors
```

## Monitoring Commands

### Check Vercel Logs

```bash
# View recent logs
vercel logs [deployment-url]

# Search for errors
vercel logs [deployment-url] | grep -i "error"
vercel logs [deployment-url] | grep -i "dommatrix"
vercel logs [deployment-url] | grep -i "canvas"

# Search for success
vercel logs [deployment-url] | grep -i "unpdf"
```

### Local Logs

```bash
# Watch dev server logs
pnpm dev

# In another terminal, tail logs
tail -f .next/server/app-paths-manifest.json
```

## Success Criteria

### Must Pass
- [ ] All PDF uploads work without errors
- [ ] PDF URL processing works
- [ ] No DOMMatrix errors anywhere
- [ ] No @napi-rs/canvas warnings
- [ ] Text extraction quality is good
- [ ] Concepts are generated correctly
- [ ] Build completes without warnings
- [ ] Vercel deployment succeeds

### Should Pass
- [ ] Other content types still work (YouTube, TikTok, articles)
- [ ] Performance is same or better
- [ ] Bundle size is smaller
- [ ] Cold starts are faster

### Nice to Have
- [ ] Text extraction is better than pdf-parse
- [ ] Fewer edge case errors
- [ ] Better error messages

## Known Limitations

1. **Page count is estimated**: Not exact, but acceptable for metadata
2. **No OCR support**: Scanned PDFs won't work (same as pdf-parse)
3. **No password support**: Encrypted PDFs may not work (check unpdf docs)

## Troubleshooting

### "Cannot find module 'unpdf'"
```bash
pnpm install
```

### TypeScript errors
```bash
pnpm ts
# Check for specific errors
```

### Build fails
```bash
rm -rf .next
pnpm build
```

### Text extraction fails
- Check PDF is valid
- Check PDF is not encrypted
- Check PDF has actual text (not just images)
- Check Vercel logs for specific error

---

**Quick Start**: `pnpm install && pnpm dev` then upload a PDF!

# Testing Checklist for Vercel Serverless Fixes

This checklist ensures all fixes are working correctly before and after deployment.

## Pre-Deployment Testing (Local)

### 1. Build Verification

```bash
# Clean build
rm -rf .next
npm run build
```

**Expected Results**:
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No canvas-related warnings
- [ ] No file reading errors
- [ ] Build output shows code splitting for PDF extractor

### 2. Development Server Testing

```bash
npm run dev
```

#### Test Case 1: YouTube Video Processing
- [ ] Navigate to dashboard
- [ ] Submit YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- [ ] Verify: No DOMMatrix error in console
- [ ] Verify: No ENOENT error in console
- [ ] Verify: Transcript extracted successfully
- [ ] Verify: Concepts generated
- [ ] Verify: Matching works (if courses exist)
- [ ] Check terminal logs for any errors

#### Test Case 2: PDF Upload
- [ ] Navigate to dashboard
- [ ] Upload a PDF file (< 10MB)
- [ ] Verify: No errors in console
- [ ] Verify: Text extracted from PDF
- [ ] Verify: Concepts generated
- [ ] Verify: Matching works (if courses exist)
- [ ] Check terminal logs for any errors

#### Test Case 3: TikTok Video
- [ ] Navigate to dashboard
- [ ] Submit TikTok URL
- [ ] Verify: No errors in console
- [ ] Verify: Transcript extracted
- [ ] Verify: Concepts generated
- [ ] Check terminal logs for any errors

#### Test Case 4: Article URL
- [ ] Navigate to dashboard
- [ ] Submit article URL (any web page)
- [ ] Verify: No errors in console
- [ ] Verify: Text extracted
- [ ] Verify: Concepts generated
- [ ] Check terminal logs for any errors

### 3. Code Review

#### Check process-content.action.ts
- [ ] No `import path from "node:path"`
- [ ] No `import fs from "node:fs/promises"`
- [ ] Has `import { TRANSCRIPT_CONCEPT_EXTRACTION_PROMPT } from "@/master-prompts/transcript-concept-extraction-prompt"`
- [ ] Uses `const promptContent = TRANSCRIPT_CONCEPT_EXTRACTION_PROMPT;`
- [ ] No `fs.readFile()` calls

#### Check process-uploaded-pdf.action.ts
- [ ] No `import path from "node:path"`
- [ ] No `import fs from "node:fs/promises"`
- [ ] Has `import { TRANSCRIPT_CONCEPT_EXTRACTION_PROMPT } from "@/master-prompts/transcript-concept-extraction-prompt"`
- [ ] Uses `const promptContent = TRANSCRIPT_CONCEPT_EXTRACTION_PROMPT;`
- [ ] No `fs.readFile()` calls

#### Check content-extraction/index.ts
- [ ] No static import of `pdf-extractor`
- [ ] Has `loadPDFExtractor()` function with dynamic import
- [ ] Has `isPDFURLLocal()` function
- [ ] PDF case uses `await loadPDFExtractor()`

#### Check upload-pdf/route.ts
- [ ] No static import of `extractPDFTextFromBuffer`
- [ ] Uses dynamic import: `await import("@/features/content-extraction/pdf-extractor")`

#### Check next.config.ts
- [ ] Has webpack configuration
- [ ] Externalizes canvas in server builds

---

## Deployment Testing (Vercel)

### 1. Deploy to Preview

```bash
# Deploy to preview environment
vercel deploy

# Note the preview URL
```

### 2. Preview Environment Testing

#### Test Case 1: YouTube Video (Preview)
- [ ] Navigate to preview URL dashboard
- [ ] Submit YouTube URL
- [ ] Verify: No errors
- [ ] Verify: Concepts extracted
- [ ] Check Vercel logs: `vercel logs [preview-url]`
- [ ] Confirm: No DOMMatrix errors in logs
- [ ] Confirm: No ENOENT errors in logs

#### Test Case 2: PDF Upload (Preview)
- [ ] Upload PDF file
- [ ] Verify: No errors
- [ ] Verify: Concepts extracted
- [ ] Check Vercel logs
- [ ] Confirm: No errors in logs

#### Test Case 3: TikTok Video (Preview)
- [ ] Submit TikTok URL
- [ ] Verify: No errors
- [ ] Verify: Concepts extracted
- [ ] Check Vercel logs
- [ ] Confirm: No errors in logs

#### Test Case 4: Article URL (Preview)
- [ ] Submit article URL
- [ ] Verify: No errors
- [ ] Verify: Concepts extracted
- [ ] Check Vercel logs
- [ ] Confirm: No errors in logs

### 3. Deploy to Production

```bash
# Deploy to production
vercel --prod
```

### 4. Production Environment Testing

#### Test Case 1: YouTube Video (Production)
- [ ] Navigate to production dashboard
- [ ] Submit YouTube URL
- [ ] Verify: No errors
- [ ] Verify: Concepts extracted
- [ ] Verify: Matching works
- [ ] Check production logs
- [ ] Confirm: No DOMMatrix errors
- [ ] Confirm: No ENOENT errors

#### Test Case 2: PDF Upload (Production)
- [ ] Upload PDF file
- [ ] Verify: No errors
- [ ] Verify: Concepts extracted
- [ ] Verify: Matching works
- [ ] Check production logs
- [ ] Confirm: No errors

#### Test Case 3: Multiple Content Types in Sequence
- [ ] Submit YouTube URL
- [ ] Wait for completion
- [ ] Upload PDF file
- [ ] Wait for completion
- [ ] Submit TikTok URL
- [ ] Wait for completion
- [ ] Submit article URL
- [ ] Verify: All processed successfully
- [ ] Verify: No errors in any step

---

## Monitoring (First 24 Hours)

### Vercel Dashboard Checks

- [ ] Check function invocations count
- [ ] Check function error rate (should be 0%)
- [ ] Check function duration (should be reasonable)
- [ ] Check function memory usage

### Log Monitoring

```bash
# Monitor production logs
vercel logs --follow

# Search for specific errors
vercel logs | grep -i "error"
vercel logs | grep -i "dommatrix"
vercel logs | grep -i "enoent"
vercel logs | grep -i "canvas"
```

**Expected Results**:
- [ ] No DOMMatrix errors
- [ ] No ENOENT errors
- [ ] No canvas-related errors
- [ ] Concept extraction working
- [ ] AI responses normal

### User Feedback

- [ ] Monitor user reports
- [ ] Check for any content processing failures
- [ ] Verify concept quality is maintained
- [ ] Confirm matching accuracy is unchanged

---

## Performance Benchmarks

### Before Fixes (Baseline)

Record these metrics for comparison:

- YouTube processing time: _______ seconds
- PDF processing time: _______ seconds
- TikTok processing time: _______ seconds
- Article processing time: _______ seconds
- Error rate: _______ %

### After Fixes (Target)

- [ ] YouTube processing time: ≤ baseline (should be faster)
- [ ] PDF processing time: ≈ baseline (similar)
- [ ] TikTok processing time: ≤ baseline (should be faster)
- [ ] Article processing time: ≤ baseline (should be faster)
- [ ] Error rate: 0%

---

## Rollback Plan

If critical issues are found:

### Immediate Rollback

```bash
# Rollback to previous deployment
vercel rollback
```

### Verify Rollback

- [ ] Previous version is live
- [ ] Content processing works
- [ ] No new errors introduced

### Investigate Issues

1. Check Vercel logs for error details
2. Review code changes
3. Test locally with production data
4. Identify root cause
5. Apply fix
6. Re-test thoroughly
7. Re-deploy

---

## Success Criteria

All of the following must be true:

- [ ] ✅ No DOMMatrix errors in any environment
- [ ] ✅ No ENOENT errors in any environment
- [ ] ✅ YouTube video processing works
- [ ] ✅ PDF upload processing works
- [ ] ✅ TikTok video processing works
- [ ] ✅ Article URL processing works
- [ ] ✅ Concept extraction quality maintained
- [ ] ✅ Matching functionality works
- [ ] ✅ No performance degradation
- [ ] ✅ Build succeeds without warnings
- [ ] ✅ All tests pass
- [ ] ✅ No user-reported issues

---

## Sign-Off

### Developer

- Name: _________________
- Date: _________________
- Signature: _________________

### QA

- Name: _________________
- Date: _________________
- Signature: _________________

### Product Owner

- Name: _________________
- Date: _________________
- Signature: _________________

---

## Notes

Use this section to record any observations, issues, or improvements discovered during testing:

```
[Add notes here]
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-XX
**Status**: Ready for Testing

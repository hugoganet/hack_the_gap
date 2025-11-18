# Quick Fix Reference - Vercel Serverless Issues

## TL;DR

Two critical fixes were applied to make the application work in Vercel's serverless environment:

1. **DOMMatrix Error**: Dynamic imports for PDF extraction
2. **ENOENT Error**: Static imports for prompt constants

---

## Issue 1: DOMMatrix Error

### Error Message
```
ReferenceError: DOMMatrix is not defined
```

### Root Cause
- `pdf-parse` → `canvas` → browser APIs (DOMMatrix)
- Static imports load canvas even for non-PDF content
- Vercel serverless = no browser APIs

### Fix
**Dynamic imports** - Load PDF extractor only when needed

```typescript
// ❌ BEFORE
import { extractPDFText } from "./pdf-extractor";

// ✅ AFTER
async function loadPDFExtractor() {
  return await import("./pdf-extractor");
}
```

### Files Changed
- `src/features/content-extraction/index.ts`
- `app/api/upload-pdf/route.ts`
- `next.config.ts` (webpack externals)

---

## Issue 2: ENOENT Error

### Error Message
```
ENOENT: no such file or directory, open '/var/task/src/master-prompts/transcript-concept-extraction-prompt.md'
```

### Root Cause
- Code reads `.md` files at runtime with `fs.readFile()`
- `.md` files not in Vercel deployment bundle
- File system structure different in serverless

### Fix
**Static imports** - Use TypeScript constants instead

```typescript
// ❌ BEFORE
import fs from "node:fs/promises";
const promptContent = await fs.readFile(promptPath, "utf8");

// ✅ AFTER
import { TRANSCRIPT_CONCEPT_EXTRACTION_PROMPT } from "@/master-prompts/transcript-concept-extraction-prompt";
const promptContent = TRANSCRIPT_CONCEPT_EXTRACTION_PROMPT;
```

### Files Changed
- `app/actions/process-content.action.ts`
- `app/actions/process-uploaded-pdf.action.ts`

---

## Testing Commands

```bash
# Local testing
npm run build
npm run dev

# Deploy to preview
vercel deploy

# Deploy to production
vercel --prod

# Check logs
vercel logs [deployment-url]
vercel logs | grep -i "error"
```

---

## Verification

### ✅ Success Indicators
- No DOMMatrix errors in logs
- No ENOENT errors in logs
- YouTube processing works
- PDF upload works
- TikTok processing works
- Article processing works

### ❌ Failure Indicators
- DOMMatrix errors still appear
- ENOENT errors still appear
- Content processing fails
- Build fails

---

## Rollback

```bash
# If issues occur
vercel rollback
```

---

## Documentation

- **Detailed**: `VERCEL_SERVERLESS_FIXES.md`
- **Testing**: `TESTING_CHECKLIST.md`
- **DOMMatrix**: `DOMMATRIX_FIX_DOCUMENTATION.md`
- **Prompts**: `PROMPT_FILE_FIX_PLAN.md`

---

## Key Takeaways

1. **Dynamic imports** prevent unnecessary code loading
2. **Static constants** avoid file system access
3. **Serverless constraints** require different patterns than traditional Node.js
4. **Test thoroughly** in preview before production

---

**Status**: ✅ Fixed and Ready for Deployment

# Vercel Course Creation 500 Error - Diagnostic & Fix

## Problem Summary

**Symptom**: Course creation fails with 500 error in Vercel production
**Root Cause**: Missing prompt file in deployment bundle
**Error**: `ENOENT: no such file or directory, open '/var/task/src/master-prompts/hierarchical-knowledge-extraction-prompt.md'`

## Architecture Analysis

### Request Flow
1. **Client** → POST `/api/courses` with `{ name, subject, learningGoal }`
2. **API Route** (`app/api/courses/route.ts`) → Validates input
3. **Auth Check** → `getUser()` via Better Auth
4. **AI Extraction** → `extractHierarchicalKnowledge()` loads prompt file ❌ **FAILS HERE**
5. **Database Creation** → `createKnowledgeStructure()` (never reached)
6. **Response** → 500 error returned to client

### Why It Works Locally But Not on Vercel

| Environment | Behavior | Reason |
|------------|----------|--------|
| **Local Dev** | ✅ Works | Source files exist in filesystem |
| **Vercel Production** | ❌ Fails | `output: "standalone"` only includes traced imports |

### The Problematic Code

```typescript
// src/lib/ai/hierarchical-extraction.ts:48
async function loadPrompt(): Promise<string> {
  const promptPath = join(
    process.cwd(),
    "src/master-prompts/hierarchical-knowledge-extraction-prompt.md"
  );
  return readFile(promptPath, "utf-8"); // ❌ File not in bundle
}
```

## Solution Options

### ✅ Option 1: Convert Prompt to TypeScript Constant (RECOMMENDED)

**Pros:**
- Most reliable for serverless
- No filesystem dependencies
- Faster (no I/O)
- Works with all deployment platforms
- Easier to version control

**Cons:**
- Slightly larger bundle size
- Prompt is in code (but that's actually good for traceability)

**Implementation:** Convert `.md` file to `.ts` constant

### Option 2: Configure Next.js to Include Markdown Files

**Pros:**
- Keeps prompt as separate file
- No code changes needed

**Cons:**
- Requires custom webpack config
- More complex
- May break with Next.js updates
- Still filesystem-dependent

**Implementation:** Add to `next.config.ts`:
```typescript
webpack: (config) => {
  config.module.rules.push({
    test: /\.md$/,
    type: 'asset/source',
  });
  return config;
}
```

### Option 3: Use Vercel's outputFileTracingIncludes

**Pros:**
- Explicit file inclusion
- Keeps file structure

**Cons:**
- Vercel-specific
- Still uses filesystem
- Requires deployment to test

**Implementation:** Add to `next.config.ts`:
```typescript
experimental: {
  outputFileTracingIncludes: {
    '/api/courses': ['./src/master-prompts/**/*.md'],
  },
}
```

## Recommended Fix: Option 1

Convert the markdown prompt to a TypeScript constant for maximum reliability.

## Implementation Steps

1. Create `src/master-prompts/hierarchical-knowledge-extraction-prompt.ts`
2. Export the prompt as a string constant
3. Update `src/lib/ai/hierarchical-extraction.ts` to import the constant
4. Remove the `loadPrompt()` function and `readFile` import
5. Test locally
6. Deploy to Vercel
7. Verify course creation works

## Testing Checklist

- [ ] Local development: Course creation works
- [ ] Local build: `pnpm build && pnpm start` - Course creation works
- [ ] Vercel preview deployment: Course creation works
- [ ] Vercel production: Course creation works
- [ ] Error handling: Proper error messages for AI failures
- [ ] Database: Courses, concepts, and flashcards created correctly

## Additional Vercel Considerations

### Environment Variables Required
```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
BETTER_AUTH_SECRET=...
OPENAI_API_KEY=sk-...
```

### Vercel Function Limits
- **Timeout**: 60s (Hobby), 300s (Pro) - AI extraction takes 1-2s ✅
- **Memory**: 1024MB default - Should be sufficient ✅
- **Payload**: 4.5MB limit - Request payload is small ✅

### Prisma in Serverless
- ✅ Prisma Client is generated during build (`vercel-build` script)
- ✅ Connection pooling via `DATABASE_URL` (Supabase)
- ✅ Direct connection via `DIRECT_URL` for migrations
- ⚠️ Cold starts may cause initial connection delay

### Next.js Standalone Mode
- ✅ Reduces bundle size
- ⚠️ Only includes traced dependencies
- ⚠️ Filesystem access limited to traced files

## Monitoring & Debugging

### Vercel Function Logs
Access via: Vercel Dashboard → Project → Logs

**What to look for:**
- `Starting AI extraction for:` - Confirms request reached AI layer
- `ENOENT` errors - File not found issues
- Prisma connection errors - Database issues
- Timeout errors - Function execution time

### Local Debugging
```bash
# Test with production build
pnpm build
pnpm start

# Check if prompt file is in build
ls -la .next/standalone/src/master-prompts/
```

## Related Files

- `app/api/courses/route.ts` - API endpoint
- `src/lib/ai/hierarchical-extraction.ts` - AI extraction logic
- `src/lib/db/create-knowledge-structure.ts` - Database creation
- `src/lib/prisma.ts` - Prisma client singleton
- `next.config.ts` - Next.js configuration
- `vercel.json` - Vercel deployment config
- `package.json` - Build scripts

## Prevention

To avoid similar issues in the future:

1. **Prefer imports over filesystem reads** in serverless functions
2. **Test production builds locally** before deploying
3. **Use Vercel preview deployments** for testing
4. **Monitor function logs** after deployment
5. **Document environment-specific behavior**

## References

- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Vercel Function Limits](https://vercel.com/docs/functions/serverless-functions/runtimes)
- [Prisma in Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

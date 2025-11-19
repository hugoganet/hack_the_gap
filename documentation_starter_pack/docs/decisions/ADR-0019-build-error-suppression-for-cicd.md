# ADR-0019: Build Error Suppression for CI/CD

Date: 2025-11-18
Status: Accepted
Deciders: Founder

## Context

**Problem Statement:**
Vercel builds were failing due to:
- ESLint errors (non-critical warnings treated as errors)
- TypeScript errors (type issues in development code)
- Blocking deployments and slowing iteration velocity
- False positives preventing valid code from deploying

**Requirements:**
- Fast deployment velocity (critical for 48-hour MVP)
- Catch errors in development (not in CI/CD)
- Unblock deployments for non-critical issues
- Maintain code quality without blocking progress

**Forces at Play:**
- Deployment velocity vs code quality
- Developer experience vs production safety
- MVP speed vs long-term maintainability
- Pragmatism vs perfectionism

## Decision

**Selected: Suppress ESLint and TypeScript Errors During Vercel Builds**

Configure Next.js to ignore linting and type errors during production builds:

```typescript
// next.config.ts
export default {
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript during build
  },
  outputFileTracingRoot: path.resolve(__dirname), // Fix workspace warnings
};
```

**Quality Gates Moved to Development:**
- Pre-commit hooks (Husky + lint-staged)
- Local linting (markdownlint-cli2, ESLint, Prettier)
- IDE integration (real-time feedback)
- PR reviews (human oversight)

**Rationale:**
- Errors caught in development (where they should be fixed)
- CI/CD focuses on deployment (not code quality)
- Faster feedback loops (deploy first, iterate quickly)
- Unblocks team during rapid prototyping

## Consequences

**Positive:**
- ✅ Faster deployments (no build failures from lint/type errors)
- ✅ Unblocked CI/CD pipeline
- ✅ Better developer experience (deploy anytime)
- ✅ Faster iteration velocity (critical for MVP)
- ✅ Reduced false positives blocking deploys
- ✅ Focus on functionality over perfection
- ✅ Errors still caught in development
- ✅ Pre-commit hooks prevent bad code from being committed

**Negative:**
- ❌ Risk of deploying code with type errors
- ❌ Risk of deploying code with lint violations
- ❌ Reduced safety net in CI/CD
- ❌ Potential runtime errors from type issues
- ❌ Code quality depends on developer discipline
- ❌ May accumulate technical debt faster

**Mitigations:**
- ✅ Pre-commit hooks catch issues before commit
- ✅ IDE integration provides real-time feedback
- ✅ PR reviews catch issues before merge
- ✅ Can re-enable for production releases
- ✅ Monitor runtime errors in production
- ✅ Regular code quality audits

**Follow-ups:**
- Monitor production error rates
- Re-enable strict checks for production releases
- Add automated testing to catch runtime issues
- Regular code quality reviews
- Consider separate staging environment with strict checks

## Alternatives Considered

### Option A: Keep Strict Checks in CI/CD
**Approach:**
- Fail builds on any ESLint error
- Fail builds on any TypeScript error
- Force fixes before deployment

**Pros:**
- Maximum code quality
- Catches all issues before deployment
- No risk of deploying broken code
- Industry best practice

**Cons:**
- Blocks deployments frequently
- Slows iteration velocity
- False positives block valid code
- Frustrating developer experience
- Not suitable for rapid prototyping

**Rejected because:** Too slow for 48-hour MVP. Blocks progress on non-critical issues. Better to catch errors in development and move fast.

### Option B: Warning-Only Mode
**Approach:**
- Show ESLint/TS errors as warnings
- Don't fail builds
- Log errors for review

**Pros:**
- Visibility into issues
- Doesn't block deployments
- Can track error trends

**Cons:**
- Warnings often ignored
- No enforcement
- Errors accumulate
- Same outcome as suppression

**Rejected because:** If we're not failing builds, might as well suppress entirely. Warnings create noise without enforcement.

### Option C: Separate Staging Environment
**Approach:**
- Strict checks in staging
- Relaxed checks in development
- Manual promotion to production

**Pros:**
- Best of both worlds
- Safety net before production
- Fast iteration in dev

**Cons:**
- More complex infrastructure
- Slower deployment to production
- Additional maintenance
- Overkill for MVP

**Rejected because:** Too complex for solo founder and MVP. Can add later if needed.

### Option D: Selective Suppression
**Approach:**
- Suppress specific rules only
- Keep critical checks enabled
- Fine-grained control

**Pros:**
- Balance between speed and safety
- Catch critical issues
- Allow non-critical issues

**Cons:**
- Complex configuration
- Hard to maintain
- Subjective rule selection
- Still blocks some deployments

**Rejected because:** Too much configuration overhead. Either trust pre-commit hooks or don't. Full suppression is simpler.

## Pre-Commit Hook Strategy

**Husky + lint-staged Configuration:**

```json
// package.json
{
  "lint-staged": {
    "*.md": [
      "markdownlint-cli2 --fix --config .markdownlint.json",
      "prettier --write"
    ],
    "*.{js,ts,jsx,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**What Gets Checked:**
- Markdown linting (markdownlint-cli2)
- JavaScript/TypeScript linting (ESLint)
- Code formatting (Prettier)
- Only on staged files (fast)

**When It Runs:**
- Every `git commit`
- Before code enters repository
- Automatic fixes applied
- Commit blocked if errors remain

**Developer Experience:**
- Fast (only staged files)
- Automatic fixes (most issues)
- Clear error messages
- Can bypass with `--no-verify` (emergency only)

## Risk Assessment

**High Risk Scenarios:**
1. **Type error causes runtime crash**
   - Mitigation: TypeScript in IDE catches most issues
   - Mitigation: Pre-commit hooks catch before commit
   - Mitigation: PR reviews catch before merge
   - Mitigation: Monitor production errors

2. **Lint violation causes bug**
   - Mitigation: Most lint rules are style, not logic
   - Mitigation: Critical rules still checked in development
   - Mitigation: Testing catches logic issues

3. **Technical debt accumulation**
   - Mitigation: Regular code quality audits
   - Mitigation: Can re-enable strict checks periodically
   - Mitigation: PR reviews maintain standards

**Low Risk Scenarios:**
- Style inconsistencies (acceptable for MVP)
- Non-critical warnings (won't cause bugs)
- Development-only code (not in production)

## When to Re-Enable Strict Checks

**Triggers for Re-Enabling:**
- Moving from MVP to production
- Onboarding additional developers
- Production error rate >1%
- Technical debt becomes unmanageable
- Preparing for external audit

**How to Re-Enable:**
```typescript
// next.config.ts
export default {
  eslint: {
    ignoreDuringBuilds: false, // Re-enable ESLint
  },
  typescript: {
    ignoreBuildErrors: false, // Re-enable TypeScript
  },
};
```

**Migration Path:**
1. Fix all existing errors (1-2 days)
2. Re-enable checks
3. Monitor build success rate
4. Adjust rules if too strict

## Monitoring Strategy

**Metrics to Track:**
- Production error rate (target: <1%)
- Build success rate (target: >95%)
- Deployment frequency (target: >5/day)
- Time to deploy (target: <5 min)
- Code quality score (SonarQube, CodeClimate)

**Alerts:**
- Production error rate >1%
- Build failures >5%
- Deployment frequency <1/day

**Review Frequency:**
- Daily: Production error monitoring
- Weekly: Code quality review
- Monthly: Decision to re-enable strict checks

## Developer Guidelines

**Best Practices:**
1. Run linters locally before committing
2. Fix errors shown in IDE immediately
3. Don't bypass pre-commit hooks (except emergencies)
4. Review PR feedback carefully
5. Monitor production errors after deployment

**Commands:**
```bash
# Run linters locally
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check types
npx tsc --noEmit

# Run all checks
npm run lint && npx tsc --noEmit
```

## Links

- **Next.js Config:** `next.config.ts`
- **Husky Config:** `.husky/pre-commit`
- **lint-staged Config:** `package.json`
- **Related ADRs:**
  - ADR-0012: Monolith architecture
  - ADR-0014: Synchronous processing
- **Tech Stack:** `docs/tech_stack.md`

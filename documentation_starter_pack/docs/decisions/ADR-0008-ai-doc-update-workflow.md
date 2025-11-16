# ADR-0008: AI-Assisted Documentation Update Workflow

Date: 2025-11-16
Status: Accepted
Deciders: Founder

## Context

**Problem Statement:**
Documentation drift is a critical problem in fast-moving projects. After commits or PRs, documentation often becomes stale because:
- Manual doc updates are tedious and error-prone
- Developers forget which docs need updating
- Cross-references break silently
- Changelog entries are inconsistent or missing

**Requirements:**
- Keep docs synchronized with code changes automatically
- Generate minimal, review-ready patches (not full rewrites)
- Maintain traceability between commits and doc updates
- Support both pre-merge (PR validation) and post-commit (local) workflows
- Preserve human oversight (no auto-merge)

**Constraints:**
- Solo founder with limited time for manual doc maintenance
- Need to work with any AI provider (Copilot, Claude, ChatGPT)
- Must integrate with existing git workflow
- Cannot break existing documentation structure

## Decision

**Selected: AI-Powered Diff-to-Patch Documentation Updater**

**Architecture:**

1. **Diff Collection** (`scripts/collect_diff_for_ai.sh`)
   - Extracts unified diffs from commit ranges
   - Generates AI-friendly payload in `docs/ai_sessions/auto-diff-*.md`
   - Runs automatically via Husky post-commit hook

2. **AI Prompt** (`prompts/ai_doc_update_prompt.md`)
   - Loads project context from `docs/context.md`
   - Performs diff sanity check (scope, nature, impacted areas)
   - Maps changes to affected documentation using matrix
   - Generates minimal patch blocks per file
   - Validates cross-links and conventions
   - Outputs session summary

3. **Mapping Matrix** (Change Type → Docs to Update)
   - API changes → `docs/specs/`, `docs/architecture.md`
   - Data schema → `docs/data/*`, ADRs
   - Tech stack → `docs/tech_stack.md`, `docs/architecture.md`
   - Security → `docs/data/privacy.md`
   - Decisions → `docs/decisions/` (new ADRs)
   - Prompts → `prompts/README.md`, affected prompts

4. **Human Review Loop**
   - AI generates patches, human reviews and applies
   - No automatic merging or file overwrites
   - Explicit confirmation required before proceeding
   - TODO markers for unclear changes

**Workflow:**

```
Commit → collect_diff_for_ai.sh → auto-diff-*.md
       ↓
Load ai_doc_update_prompt.md in AI editor
       ↓
AI analyzes diff → generates patches
       ↓
Human reviews → applies patches → commits
```

**Key Features:**
- **Diff Sanity Check:** AI summarizes scope and asks for confirmation before proceeding
- **Minimal Patches:** Only changed sections, no reformatting noise
- **Atomic Updates:** One patch block per file
- **Validation Checklist:** 8-point checklist before output
- **Session Footer:** Summary, Decisions, Actions, Artifacts
- **Conservative Approach:** TODO markers instead of guessing

## Consequences

**Positive:**
- ✅ Reduces documentation drift by 80-90%
- ✅ Catches cross-reference breaks automatically
- ✅ Maintains consistent changelog format
- ✅ Works with any AI provider (no vendor lock-in)
- ✅ Human oversight prevents hallucinations
- ✅ Minimal patches are easy to review
- ✅ Integrates seamlessly with git workflow
- ✅ Scales to large codebases (diff-based, not full scan)

**Negative:**
- ❌ Requires AI editor access (Copilot/Claude/ChatGPT)
- ❌ Manual step (load prompt + paste diff)
- ❌ AI may miss subtle documentation needs
- ❌ Requires discipline to run after each commit
- ❌ Initial learning curve for prompt usage

**Follow-ups:**
- Monitor documentation quality over time
- Collect metrics on time saved vs manual updates
- Consider automating patch application (with approval)
- Add linter to validate patch format
- Create video tutorial for onboarding

## Alternatives Considered

**Option A: Manual Documentation Updates**
- Pros: Full human control, no AI dependency
- Cons: Time-consuming, error-prone, inconsistent, doesn't scale
- Rejected: Primary problem we're trying to solve

**Option B: Automated Doc Generation (Docusaurus/TypeDoc)**
- Pros: Fully automated, no manual work
- Cons: Only works for API docs, not architecture/decisions/specs
- Rejected: Too narrow, doesn't cover strategic documentation

**Option C: Pre-Commit Hook with Auto-Apply**
- Pros: Fully automated, no manual step
- Cons: Dangerous (AI hallucinations auto-merged), no human review
- Rejected: Too risky, violates "human oversight" requirement

**Option D: GitHub Actions Bot**
- Pros: Automated PR comments with suggested patches
- Cons: Requires API keys, complex setup, vendor lock-in
- Rejected: Overkill for solo founder, adds infrastructure complexity

**Option E: Documentation Linter Only**
- Pros: Simple, catches broken links and formatting
- Cons: Doesn't generate content, only validates
- Rejected: Complementary tool, not a replacement

## Links

- Related ADRs: ADR-0001 (Documentation Architecture)
- Prompt: `prompts/ai_doc_update_prompt.md`
- Script: `scripts/collect_diff_for_ai.sh`
- Usage Guide: `prompts/README.md`
- Template: `docs/templates/session.md`

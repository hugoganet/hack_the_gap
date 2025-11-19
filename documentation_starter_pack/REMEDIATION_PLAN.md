# Documentation Remediation Plan
**Date:** 2025-11-18  
**Based on:** DOCUMENTATION_AUDIT_2025-11-18.md  
**Objective:** Establish absolute clarity and single source of truth

---

## Executive Summary

This plan addresses **23 critical issues** identified in the documentation audit. The work is organized into **4 phases** over **6 weeks**, requiring an estimated **40-58 hours** of focused effort.

**Key Findings:**
- ✅ Strong foundation with excellent technical depth
- ⚠️ Product name inconsistency ("hack the gap" vs "Recall")
- ⚠️ Major pivot (2025-11-17) not fully reflected across all docs
- ⚠️ 7 missing ADRs for implemented decisions
- ⚠️ Operational documentation gaps (deployment, security, testing)

**Immediate Actions Required:**
1. **Decide product name** (Recall or keep TBD)
2. **Complete pivot documentation** (remove deprecated content)
3. **Create 7 missing ADRs** (auth, architecture, AI provider, etc.)
4. **Standardize terminology** (create glossary)
5. **Clarify implementation status** (single source of truth)

---

## Phase 1: Critical Fixes (Week 1) - 8-12 hours

### Priority: CRITICAL
**Goal:** Establish fundamental clarity on naming, pivot, and terminology

#### 1.1 Product Name Resolution (2 hours)
**Decision Required:** Is the product "Recall" or still "hack the gap (TBD)"?

**If "Recall":**
- [ ] Update `project.yaml` name field
- [ ] Update `context.md` references
- [ ] Update `architecture.md` mermaid diagrams
- [ ] Update `tech_stack.md` references
- [ ] Update `README.md` title
- [ ] Search and replace all instances

**If "hack the gap (TBD)":**
- [ ] Remove "Recall" from `context.md`
- [ ] Keep consistent "hack the gap" everywhere
- [ ] Add note in `project.yaml` about naming decision timeline

**Deliverable:** Single consistent product name across all documentation

---

#### 1.2 Complete Pivot Documentation (3 hours)

**Files to Update:**

**vision.md:**
- [ ] Line 109: Remove "what professor requires" from differentiators
- [ ] Line 156: Update "Multi-language support (English only for MVP)" → "Multi-language support (EN/FR implemented)"
- [ ] Move implemented features from "Post-MVP" to "In Scope (Implemented)"
- [ ] Add new section: "## Implemented Features" with i18n, PDF upload, multilingual embeddings

**architecture.md:**
- [ ] Update system context diagram: Remove "Admin/Founder" actor
- [ ] Update API section: Mark deprecated endpoints clearly
  - ~~GET /api/courses~~ → DEPRECATED (2025-11-17)
  - ~~GET /api/user/courses~~ → DEPRECATED (2025-11-17)
  - ~~POST /api/user/courses~~ → DEPRECATED (2025-11-17)
  - ~~GET /api/years~~ → REMOVED (2025-11-16)
  - ~~GET /api/semesters~~ → REMOVED (2025-11-16)
- [ ] Add new API section: Syllabus Management (US-0001a, US-0001b)

**tech_stack.md:**
- [ ] Add syllabus parsing technologies (pdf-parse, OCR plans)
- [ ] Update File/Blob Storage: "TBD (disabled)" → "Implemented (PDF upload)"
- [ ] Add migration note about VideoJob → ContentJob

**tasks.md:**
- [ ] Remove "US-0012: Admin pre-load syllabi" from backlog entirely
- [ ] Update US-0001 references to US-0001a/US-0001b
- [ ] Mark deprecated tasks clearly

**Deliverable:** All documents reflect student-centric approach, no admin/professor references

---

#### 1.3 Create Missing ADRs (5 hours)

**Priority ADRs to Create:**

1. **ADR-0011: Auth Provider Selection (Better-Auth)** (45 min)
   - Context: Need auth with org/team support
   - Decision: Better-Auth 1.3
   - Alternatives: Auth.js, Clerk, Supabase Auth
   - Rationale: Multi-tenant ready, flexible, no vendor lock-in
   - Consequences: Newer library, less battle-tested

2. **ADR-0012: Monolith Architecture** (45 min)
   - Context: 48-hour MVP timeline
   - Decision: Single Next.js application (frontend + backend)
   - Alternatives: Separate backend, microservices
   - Rationale: Fastest iteration, simpler deployment
   - Consequences: Harder to scale independently

3. **ADR-0013: AI Provider Selection (OpenAI)** (45 min)
   - Context: Need concept extraction, embeddings, matching
   - Decision: OpenAI (GPT-4 + text-embedding-3-large)
   - Alternatives: Anthropic Claude, local models, Cohere
   - Rationale: Best-in-class models, reliable API, good docs
   - Consequences: API costs, rate limits, vendor lock-in

4. **ADR-0014: Synchronous Processing for MVP** (45 min)
   - Context: Video processing pipeline
   - Decision: Synchronous API routes (60s timeout)
   - Alternatives: Async queue (Inngest, BullMQ)
   - Rationale: Simpler implementation, acceptable for demo
   - Consequences: UI blocks during processing

5. **ADR-0017: Multilingual Embeddings Strategy** (60 min)
   - Context: Support cross-lingual concept matching
   - Decision: Upgrade to text-embedding-3-large
   - Alternatives: Translation layer, separate models per language
   - Rationale: 100+ languages, ~95% cross-lingual similarity
   - Consequences: +10% cost per video, larger vectors

6. **ADR-0019: Build Error Suppression for CI/CD** (45 min)
   - Context: Deployment velocity vs type safety
   - Decision: Ignore ESLint/TS errors during Vercel builds
   - Alternatives: Strict CI checks, separate lint stage
   - Rationale: Errors caught in dev (pre-commit hooks)
   - Consequences: Risk of deploying broken code

7. **ADR-0020: Product Pivot to Student-Centric** (60 min)
   - Context: Institution-centric approach too rigid
   - Decision: Students upload own syllabi
   - Alternatives: Keep pre-loaded courses, hybrid approach
   - Rationale: Global market, lower friction, student ownership
   - Consequences: Syllabus upload complexity, quality control
   - Note: Move PIVOT_SUMMARY.md content here

**Deliverable:** 7 new ADRs in `docs/decisions/` following ADR template

---

#### 1.4 Standardize Terminology (2 hours)

**Create `docs/GLOSSARY.md`:**

```markdown
# Glossary

## Product & Branding
- **Product Name:** [Recall | hack the gap (TBD)] - [DECISION PENDING]
- **Tagline:** AI-powered Zettelkasten for students

## User Types
- **Self-Directed Learner:** Primary persona (canonical term)
- **Student:** Casual reference to users
- **Motivated Struggler:** Deprecated persona name (use Self-Directed Learner)

## Core Concepts
- **Learning Goals:** User-defined objectives (user-facing term)
- **Syllabus Concepts:** Technical term for learning goal concepts in database
- **Atomic Concept:** Concept learnable with ONE flashcard (core principle)
- **Knowledge Tree:** Hierarchical structure (Subject → Course → Nodes → Concepts)
- **Knowledge Node:** Individual node in knowledge tree

## Technical Terms
- **Content Job:** Processing job for any content type (replaces Video Job)
- **Video Job:** Deprecated term (use Content Job)
- **Concept Matching:** Process of matching extracted concepts to learning goals
- **Concept-to-Goal Matching:** Full term for concept matching
- **Spaced Repetition:** Learning methodology using timed reviews
- **Review Session:** Single instance of flashcard review

## Content Types
- **YouTube:** Video content from YouTube
- **TikTok:** Short-form video content
- **PDF:** Document content (uploaded or URL)
- **URL:** Article/webpage content
- **Podcast:** Audio content (future)

## Status Terms
- **✅ IMPLEMENTED:** Feature complete and deployed
- **🚧 IN PROGRESS:** Currently being developed
- **📋 TODO:** Planned but not started
- **❌ DEPRECATED:** No longer used, archived
- **⚠️ BLOCKED:** Waiting on dependency
```

**Update Documents:**
- [ ] Replace "Motivated Struggler" with "Self-Directed Learner" everywhere
- [ ] Replace "Video Job" with "Content Job" in all docs
- [ ] Standardize "Learning Goals" vs "Syllabus Concepts" usage
- [ ] Add glossary link to README.md

**Deliverable:** GLOSSARY.md + consistent terminology across all docs

---

## Phase 2: Content Updates (Week 2-3) - 12-16 hours

### Priority: HIGH
**Goal:** Update existing content to reflect current state

#### 2.1 Update Scope Statements (2 hours)
- [ ] vision.md: Move implemented features to "Implemented" section
- [ ] architecture.md: Update MVP scope to reflect multi-org support
- [ ] tech_stack.md: Update storage section with PDF implementation
- [ ] roadmap.md: Mark completed milestones

#### 2.2 Archive Deprecated Content (2 hours)
- [ ] Create `docs/specs/deprecated/` directory
- [ ] Move `us-0001-course-selection.md` to deprecated/
- [ ] Add deprecation notice to top of file
- [ ] Update links in other documents

#### 2.3 Add Cross-References (3 hours)
- [ ] Add "Related Documents" section to each major doc
- [ ] Link vision.md to architecture.md for Zettelkasten explanation
- [ ] Link architecture.md to specific ADRs inline
- [ ] Link tech_stack.md to data schema docs
- [ ] Link roadmap.md to user story specs
- [ ] Create bidirectional links

#### 2.4 Document Migrations (2 hours)
- [ ] Create `docs/data/MIGRATION_HISTORY.md`
- [ ] List all migrations chronologically
- [ ] Add migration descriptions and impacts
- [ ] Document rollback procedures

#### 2.5 Create Testing Strategy (3 hours)
- [ ] Create `docs/guides/TESTING_STRATEGY.md`
- [ ] Document test coverage goals (80% unit, 60% integration)
- [ ] List E2E test scenarios for full pipeline
- [ ] Add performance testing procedures
- [ ] Document testing tools and setup

---

## Phase 3: New Documentation (Week 4-6) - 20-30 hours

### Priority: MEDIUM
**Goal:** Fill operational documentation gaps

#### 3.1 Operational Guides (12 hours)

**Create `docs/guides/` directory with:**

1. **DEVELOPMENT.md** (2 hours)
   - Local environment setup
   - Prerequisites (Node, pnpm, Supabase)
   - Database setup and migrations
   - Running dev server
   - Common issues and solutions

2. **DEPLOYMENT.md** (2 hours)
   - Vercel deployment steps
   - Environment variables setup
   - Database migration in production
   - Rollback procedures
   - Monitoring setup

3. **SECURITY.md** (2 hours)
   - Threat model
   - Authentication flow
   - API security best practices
   - Secrets management
   - Security testing procedures

4. **OBSERVABILITY.md** (2 hours)
   - Logging strategy and format
   - Key metrics and SLIs
   - Alerting thresholds
   - Dashboard requirements
   - Log retention policies

5. **DISASTER_RECOVERY.md** (2 hours)
   - Backup strategy
   - Recovery procedures
   - RTO/RPO definitions
   - Data loss scenarios
   - Business continuity plan

6. **CONTRIBUTING.md** (2 hours)
   - Developer onboarding
   - Code review checklist
   - Documentation contribution workflow
   - Git workflow and branching
   - PR template

#### 3.2 Reference Documentation (8 hours)

**Create `docs/reference/` directory with:**

1. **API_REFERENCE.md** (3 hours)
   - Complete endpoint list
   - Request/response examples
   - Error codes and messages
   - Rate limiting
   - Authentication flow

2. **FEATURE_FLAGS.md** (2 hours)
   - Feature flag registry
   - Management strategy
   - Rollout procedures
   - Rollback procedures
   - Lifecycle policy

3. **COST_ANALYSIS.md** (2 hours)
   - Cost breakdown by service
   - Cost per user at scale
   - Scaling thresholds
   - Optimization strategies
   - Revenue model alignment

4. **MIGRATION_HISTORY.md** (1 hour)
   - Chronological migration list
   - Migration descriptions
   - Rollback procedures
   - Schema versioning

---

## Phase 4: Continuous Improvement (Ongoing)

### Priority: LOW
**Goal:** Maintain documentation quality over time

#### 4.1 Quality Checks (Monthly)
- [ ] Run documentation audit
- [ ] Check for broken links
- [ ] Verify terminology consistency
- [ ] Update implementation status
- [ ] Review and update metrics

#### 4.2 Automation (Setup Once)
- [ ] Add link checker to CI
- [ ] Add terminology checker
- [ ] Add documentation linter
- [ ] Add automated cross-reference validation

#### 4.3 Process Integration
- [ ] Require documentation updates with PRs
- [ ] Add documentation review to PR checklist
- [ ] Update docs before merging features
- [ ] Log documentation changes in CHANGELOG

---

## Success Metrics

### Phase 1 Completion Criteria
- [ ] Product name consistent across all files
- [ ] No references to deprecated features (admin, professor)
- [ ] 7 new ADRs created and linked
- [ ] GLOSSARY.md created with canonical terms
- [ ] Implementation status clear in context.md

### Phase 2 Completion Criteria
- [ ] All scope statements reflect current state
- [ ] Deprecated content archived
- [ ] Cross-references added to major docs
- [ ] Migration history documented
- [ ] Testing strategy documented

### Phase 3 Completion Criteria
- [ ] 6 operational guides created
- [ ] 4 reference documents created
- [ ] New directory structure implemented
- [ ] All guides reviewed and tested

### Overall Success Metrics
- **Completeness:** 75% → 95%
- **Consistency:** 60% → 95%
- **Accuracy:** 85% → 98%
- **Clarity:** 80% → 95%
- **Maintainability:** 70% → 90%

---

## Resource Requirements

### Time Commitment
- **Phase 1:** 8-12 hours (1-2 days focused work)
- **Phase 2:** 12-16 hours (2-3 days)
- **Phase 3:** 20-30 hours (4-6 days)
- **Total:** 40-58 hours over 6 weeks

### Skills Required
- Technical writing
- System architecture understanding
- Git/GitHub proficiency
- Markdown expertise
- Documentation tooling knowledge

### Tools Needed
- Text editor (VS Code recommended)
- Git client
- Markdown linter (markdownlint-cli2)
- Link checker
- Diagram tools (Mermaid, draw.io)

---

## Risk Mitigation

### Risk 1: Product Name Decision Delay
**Impact:** Blocks Phase 1 completion  
**Mitigation:** Set deadline for decision (48 hours), default to "hack the gap (TBD)" if no decision

### Risk 2: ADR Creation Bottleneck
**Impact:** Phase 1 takes longer than estimated  
**Mitigation:** Use ADR template, focus on essentials, iterate later

### Risk 3: Scope Creep
**Impact:** Project extends beyond 6 weeks  
**Mitigation:** Stick to phases, defer nice-to-haves to Phase 4

### Risk 4: Documentation Drift During Remediation
**Impact:** New changes conflict with updates  
**Mitigation:** Communicate remediation plan, coordinate with development

---

## Communication Plan

### Stakeholder Updates
- **Week 1:** Phase 1 completion report
- **Week 3:** Phase 2 completion report
- **Week 6:** Phase 3 completion report
- **Monthly:** Ongoing quality metrics

### Documentation Changes
- Log all changes in CHANGELOG.md
- Create AI session logs for major updates
- Tag documentation commits clearly
- Update context.md "Last Updated" timestamp

---

## Next Steps

### Immediate Actions (Today)
1. **Review this plan** with stakeholders
2. **Decide product name** (Recall or TBD)
3. **Assign owner** for remediation work
4. **Set timeline** for Phase 1 completion
5. **Create tracking issue** in project management tool

### Week 1 Kickoff
1. Begin Phase 1 work
2. Create branch: `docs/remediation-phase-1`
3. Work through checklist systematically
4. Review and merge at end of week

### Ongoing
1. Execute phases sequentially
2. Review and adjust plan as needed
3. Communicate progress regularly
4. Celebrate milestones

---

## Appendix: Quick Reference

### File Update Checklist

**Product Name Change:**
- [ ] project.yaml
- [ ] context.md
- [ ] architecture.md (diagrams)
- [ ] tech_stack.md
- [ ] README.md
- [ ] All mermaid diagrams

**Pivot Completion:**
- [ ] vision.md (differentiators, scope)
- [ ] architecture.md (diagrams, API)
- [ ] tech_stack.md (syllabus tech)
- [ ] tasks.md (remove US-0012)

**ADR Creation:**
- [ ] ADR-0011 (Auth)
- [ ] ADR-0012 (Monolith)
- [ ] ADR-0013 (AI Provider)
- [ ] ADR-0014 (Sync Processing)
- [ ] ADR-0017 (Multilingual)
- [ ] ADR-0019 (Build Config)
- [ ] ADR-0020 (Pivot)

**New Documents:**
- [ ] GLOSSARY.md
- [ ] guides/DEVELOPMENT.md
- [ ] guides/DEPLOYMENT.md
- [ ] guides/SECURITY.md
- [ ] guides/OBSERVABILITY.md
- [ ] guides/DISASTER_RECOVERY.md
- [ ] guides/CONTRIBUTING.md
- [ ] reference/API_REFERENCE.md
- [ ] reference/FEATURE_FLAGS.md
- [ ] reference/COST_ANALYSIS.md
- [ ] data/MIGRATION_HISTORY.md

---

**Plan Created:** 2025-11-18  
**Plan Owner:** [TO BE ASSIGNED]  
**Target Completion:** 2025-12-30 (6 weeks)  
**Status:** READY FOR REVIEW

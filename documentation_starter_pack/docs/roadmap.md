# Roadmap

> Time-phased outcomes for hackathon MVP and beyond.

## Now (Pre-Hackathon: Nov 14-17, 2025)

**Goal:** Validate feasibility and prepare infrastructure

- [x] Test concept extraction on 20 videos (validate 70%+ accuracy) ✅ DONE
- [ ] Recruit 3 beta test students
- [ ] Test syllabus upload with 5 different formats (PDF, Word, text, images, handwritten)
- [x] Set up OpenAI API account and verify quota ✅ DONE
- [x] Configure Supabase project and run migrations ✅ DONE
- [x] Deploy boilerplate to Vercel ✅ DONE
- [x] Test Better-Auth integration ✅ DONE
- [ ] Create ADRs for key decisions (ADR-0010 to ADR-0014)

**Success Criteria:**

- [x] Concept extraction accuracy ≥70% on test videos ✅ DONE
- [x] All infrastructure deployed and tested ✅ DONE
- [ ] 3 beta testers recruited and ready
- [ ] Syllabus upload tested with multiple formats

## Next (Hackathon: 48 hours, TBD) - UPDATED 2025-11-17

**Goal:** Build functional MVP demonstrating core value proposition

### Day 1: Syllabus Upload & Content Processing

- [ ] **NEW US-0001: Student syllabus upload** 🚧 IN PROGRESS
  - [ ] PDF/text upload interface
  - [ ] AI extraction using existing prompt
  - [ ] Alternative: AI conversation for goal definition
- [x] ~~US-0012: Admin pre-load syllabi~~ **DEPRECATED**
- [x] ~~US-0001: Course selection UI~~ **DEPRECATED**
- [x] US-0002: Video URL submission ✅ DONE
- [x] US-0003: Concept extraction ✅ DONE
- [x] US-0004: Concept-to-goal matching ✅ DONE

### Day 2: Review System (COMPLETE)

- [x] US-0005: Flashcard generation ✅ DONE
- [x] US-0006: First review session ✅ DONE
- [x] US-0007: Review scheduling ✅ DONE

### Day 3-4: Dashboard & Polish

- [ ] US-0008: Progress dashboard 🚧 TODO
- [ ] US-0009: Gap analysis 🚧 TODO
- [ ] E2E testing
- [ ] Mobile responsiveness
- [ ] Demo script preparation

#### Planned Prompt + Schema Update (2025-11-17)

- [ ] Update hierarchical extraction prompt to return:
  - [ ] Inline flashcard candidates per atomic concept
  - [ ] Bilingual content blocks (EN + FR) for concept text and flashcard fields (question/answer/hint/explanation)
- [ ] Design and apply DB schema changes to support:
  - [ ] concepts (canonical) + concept_localizations (EN/FR)
  - [ ] flashcards (canonical) + flashcard_localizations (EN/FR)
  - [ ] Transactional creation during course/goal creation
- [ ] Extend createKnowledgeStructure pipeline to persist flashcards + localizations inline
- [ ] Add minimal validation that required locales are present for core fields
- [ ] Feature flag rollout plan for inline flashcards + bilingual content

(See ADR-0010 for details: documentation_starter_pack/docs/decisions/ADR-0010-inline-flashcards-and-bilingual-concepts.md)

**Success Criteria:**

- [x] Full pipeline works end-to-end (video → concepts → flashcards → review) ✅ DONE
- [x] 68%+ concept matching accuracy ✅ DONE
- [ ] Syllabus upload working for multiple formats
- [ ] 3 beta students complete full flow (upload syllabus → process video → review)
- [ ] Demo-ready on mobile and desktop

## Later (Post-Hackathon: 1-3 months)

**Goal:** Refine MVP based on feedback, improve accuracy, add features

### Month 1: Validation & Iteration

- [ ] Collect feedback from beta testers
- [ ] Improve concept extraction accuracy (target: 80%+)
- [ ] Improve concept matching accuracy (target: 75%+)
- [ ] Add error handling and edge cases
- [ ] Implement async processing queue (Inngest/BullMQ)
- [ ] Add Sentry for error tracking
- [ ] Optimize performance (reduce processing time to <30s)
- [ ] Improve syllabus upload (OCR for handwritten notes, better PDF parsing)
- [ ] AI conversation refinement for goal definition

### Month 2: Feature Expansion

- [ ] Support TikTok videos
- [ ] Support article URLs
- [ ] Support podcast transcripts
- [ ] Support PDF uploads (lecture notes, textbooks)
- [ ] Manual flashcard editing
- [ ] Knowledge graph visualization (simplified)
- [ ] Daily review notifications
- [ ] Prerequisite relationship detection
- [ ] Multi-syllabus support (track multiple learning goals simultaneously)

### Month 3: Scale & Polish

- [ ] ~~Professor dashboard~~ (Not needed - student-centric approach)
- [ ] Collaborative learning goals (share syllabi with friends)
- [ ] Export to Obsidian (markdown + frontmatter)
- [ ] Advanced spaced repetition (SM-2 algorithm)
- [ ] Historical progress tracking
- [ ] Mobile app (React Native or PWA)
- [ ] AI tutor chat (answer questions about concepts)

**Success Criteria:**

- 20+ active students using daily (from any country/educational system)
- 75%+ concept matching accuracy
- 70%+ retention after 7 days (vs <20% baseline)
- NPS >40
- 3+ organic testimonials
- Students from 3+ different countries/educational systems

## Future (3-6 months)

**Goal:** Product-market fit and monetization

### B2C Features (Student-Focused)

- [ ] Freemium model (5 videos/month free, unlimited for $9.99/month)
- [ ] Collaborative study groups (share learning goals)
- [ ] Gamification (streaks, achievements, leaderboards)
- [ ] AI tutor chat (answer questions about concepts)
- [ ] Personalized study plans based on learning patterns
- [ ] Community-contributed syllabi (public library)
- [ ] Integration with note-taking apps (Notion, Obsidian, Roam)

### B2B Features (Optional - Not Core Focus)

- [ ] ~~Professor dashboard~~ (Deprioritized - focus on individual students)
- [ ] ~~Institutional licensing~~ (Deprioritized - B2C first)
- [ ] Potential: Tutoring marketplace (connect students with tutors based on gaps)
- [ ] Potential: Study group matching (find students with similar learning goals)

### Technical Improvements

- [ ] Fine-tuned models for concept extraction
- [ ] Multi-language support (French, Spanish, German, Chinese)
- [ ] Offline mode (PWA)
- [ ] Real-time collaboration on learning goals
- [ ] Advanced analytics (learning patterns, retention curves)
- [ ] A/B testing framework
- [ ] Better OCR for handwritten syllabi

**Success Criteria:**

- 100+ paying students (from diverse countries/backgrounds)
- $5K+ MRR
- 80%+ concept matching accuracy
- 75%+ retention after 30 days
- Students from 10+ countries using the platform
- 50+ community-contributed syllabi

## Bets & Themes

### Core Bets

1. **Zettelkasten methodology works for students** - Students get retention benefits without manual work
2. **Concept matching is valuable** - Connecting "what you learn" to "what YOU want to learn" is a killer feature
3. **Gen Z won't do manual flashcards** - 100% automation is the only way spaced repetition scales
4. **YouTube is sufficient for MVP** - Students already consume enough YouTube content to validate the concept
5. **Students can define their own goals** - Students worldwide have learning goals they want to track (not just institutional students)
6. **Global flexibility matters** - Not being tied to specific educational systems opens up worldwide market

### Strategic Themes

- **AI-first:** Leverage AI for all heavy lifting (extraction, matching, generation)
- **Zero friction:** No manual note-taking, no card creation, no organizing
- **Mobile-first:** Gen Z lives on phones, desktop is secondary
- **Retention-focused:** Optimize for long-term memory, not just passing exams
- **Student-owned:** Students define their own learning goals, not limited to institutional requirements
- **Global-first:** Works for any student worldwide, any educational system

### Risks to Monitor

- **AI accuracy plateau:** If we can't get >75% accuracy, value prop breaks
- **Retention doesn't improve:** If students still forget, product has no value
- **Behavior change required:** If students won't review daily, spaced repetition fails
- **Content quality varies:** YouTube content may be too shallow for deep learning
- **Monetization resistance:** Students may not pay for "study tools"
- **Syllabus upload friction:** If students can't easily upload/define goals, they won't start
- **Global diversity:** Different educational systems may require different approaches

### Pivot Options (if needed)

1. **Community-driven:** Focus on community-contributed syllabi and collaborative learning
2. **Content creation:** Become a MOOC platform with built-in retention
3. **Study group platform:** Focus on collaborative learning vs individual retention
4. **Tutoring marketplace:** Connect students with tutors based on gap analysis
5. **Note-taking app:** Pivot to Obsidian/Notion competitor with AI-powered retention
6. **B2B (last resort):** Sell to institutions, but only if B2C doesn't work

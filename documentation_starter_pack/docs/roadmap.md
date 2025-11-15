# Roadmap

> Time-phased outcomes for hackathon MVP and beyond.

## Now (Pre-Hackathon: Nov 14-17, 2025)

**Goal:** Validate feasibility and prepare infrastructure

- [ ] Test concept extraction on 20 videos (validate 70%+ accuracy)
- [ ] Recruit 3 beta test students
- [ ] Pre-download 5 public course syllabi
- [ ] Set up OpenAI API account and verify quota
- [ ] Configure Supabase project and run migrations
- [ ] Deploy boilerplate to Vercel
- [ ] Test Better-Auth integration
- [ ] Create ADRs for key decisions (ADR-0010 to ADR-0014)

**Success Criteria:**

- Concept extraction accuracy ≥70% on test videos
- All infrastructure deployed and tested
- 3 beta testers recruited and ready

## Next (Hackathon: 48 hours, TBD)

**Goal:** Build functional MVP demonstrating core value proposition

### Day 1-2: Core Pipeline

- [ ] US-0012: Admin pre-load syllabi (seed data)
- [ ] US-0001: Course selection UI
- [ ] US-0002: Video URL submission
- [ ] US-0003: Concept extraction ⚠️ CRITICAL
- [ ] US-0004: Concept-to-syllabus matching ⚠️ CRITICAL

### Day 2-3: Review System

- [ ] US-0005: Flashcard generation
- [ ] US-0006: First review session
- [ ] US-0007: Review scheduling

### Day 3-4: Dashboard & Polish

- [ ] US-0008: Progress dashboard
- [ ] US-0009: Gap analysis
- [ ] E2E testing
- [ ] Mobile responsiveness
- [ ] Demo script preparation

**Success Criteria:**

- Full pipeline works end-to-end (video → concepts → flashcards → review)
- 68%+ concept matching accuracy
- 3 beta students complete review sessions
- Demo-ready on mobile and desktop

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

### Month 2: Feature Expansion

- [ ] Support TikTok videos
- [ ] Support article URLs
- [ ] Support PDF uploads (syllabus + lecture notes)
- [ ] Manual flashcard editing
- [ ] Knowledge graph visualization (simplified)
- [ ] Daily review notifications
- [ ] Prerequisite relationship detection

### Month 3: Scale & Polish

- [ ] Professor dashboard (class-wide progress)
- [ ] Manual syllabus upload and parsing
- [ ] Multi-course tracking (student takes multiple courses)
- [ ] Export to Obsidian (markdown + frontmatter)
- [ ] Advanced spaced repetition (SM-2 algorithm)
- [ ] Historical progress tracking
- [ ] Mobile app (React Native or PWA)

**Success Criteria:**

- 20+ active students using daily
- 75%+ concept matching accuracy
- 70%+ retention after 7 days (vs <20% baseline)
- NPS >40
- 3+ organic testimonials

## Future (3-6 months)

**Goal:** Product-market fit and monetization

### B2C Features

- [ ] Freemium model (5 videos/month free, unlimited for $9.99/month)
- [ ] Collaborative study groups
- [ ] Gamification (streaks, achievements, leaderboards)
- [ ] AI tutor chat (answer questions about concepts)
- [ ] Personalized study plans
- [ ] Integration with LMS (Canvas, Moodle, Blackboard)

### B2B Features (Professor/Institution)

- [ ] Professor dashboard (upload syllabus, see class progress)
- [ ] Institutional licensing ($99/month per class)
- [ ] Custom branding
- [ ] Analytics and insights
- [ ] Integration with university systems
- [ ] Bulk student onboarding

### Technical Improvements

- [ ] Fine-tuned models for concept extraction
- [ ] Multi-language support (French, Spanish, German)
- [ ] Offline mode (PWA)
- [ ] Real-time collaboration
- [ ] Advanced analytics (learning patterns, retention curves)
- [ ] A/B testing framework

**Success Criteria:**

- 100+ paying students
- 5+ professor partnerships
- $5K+ MRR
- 80%+ concept matching accuracy
- 75%+ retention after 30 days

## Bets & Themes

### Core Bets

1. **Zettelkasten methodology works for students** - Students get retention benefits without manual work
2. **Concept matching is valuable** - Connecting "what you learn" to "what professor requires" is a killer feature
3. **Gen Z won't do manual flashcards** - 100% automation is the only way spaced repetition scales
4. **YouTube is sufficient for MVP** - Students already consume enough YouTube content to validate the concept

### Strategic Themes

- **AI-first:** Leverage AI for all heavy lifting (extraction, matching, generation)
- **Zero friction:** No manual note-taking, no card creation, no organizing
- **Mobile-first:** Gen Z lives on phones, desktop is secondary
- **Retention-focused:** Optimize for long-term memory, not just passing exams
- **Professor-aligned:** Match to syllabus requirements, not generic knowledge

### Risks to Monitor

- **AI accuracy plateau:** If we can't get >75% accuracy, value prop breaks
- **Retention doesn't improve:** If students still forget, product has no value
- **Behavior change required:** If students won't review daily, spaced repetition fails
- **Content quality varies:** YouTube content may be too shallow for deep learning
- **Monetization resistance:** Students may not pay for "study tools"

### Pivot Options (if needed)

1. **B2B-first:** Sell to professors/institutions instead of students
2. **Content creation:** Become a MOOC platform with built-in retention
3. **Study group platform:** Focus on collaborative learning vs individual retention
4. **Tutoring marketplace:** Connect students with tutors based on gap analysis
5. **LMS plugin:** Integrate into existing platforms (Canvas, Moodle) vs standalone app

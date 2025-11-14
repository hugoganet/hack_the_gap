# Product Vision

> Keep it short, specific, and user-centered. This is your north star.

## One-liner

An AI-powered knowledge retention system that automatically converts students' passive content consumption (lectures, YouTube, TikTok) into an active Zettelkasten-based learning system with spaced repetition, eliminating manual note-taking while ensuring long-term memory encoding.

## Problem & Opportunity

**Problem:**
Students consume educational content everywhere (lectures, YouTube explainers, TikTok summaries, articles, newsletters) but retain only ~15% after two weeks. They know they're forgetting but have no system for long-term encoding. Current solution is panic-cramming before exams, which fails. The root cause: passive consumption without active encoding.

**Who cares:**
University students in conceptually dense fields (philosophy, sciences, economics) where you need to understand AND remember fundamentals to build on them. Specifically: students who already supplement lectures with YouTube/TikTok/articles but can't recall the content when needed.

**Why now:**
Gen Z is now the majority of university students and represents the first cohort that genuinely cannot power through traditional reading/studying (post-COVID shift). The educational system broke in the last 3 years:

- 70% drop in reading comprehension
- 8-minute average attention spans
- 65% failure rates in conceptually dense courses like philosophy
- Students ARE learning (via videos/social media) but retention systems haven't adapted

**Key Insight:**
Students won't manually create flashcards or organize notes anymore. The ONLY way spaced repetition works at scale is 100% automation from content they're already consuming passively. Previous generations could power through; this one genuinely can't - and that's a market reality, not a moral judgment.

## Target Users & Personas (ICP)

### Primary Persona: "The Motivated Struggler"

- Age: 18-22, university student
- Context: Takes conceptually dense courses (not just memorization-based)
- Current behavior: Already watches YouTube/TikTok educational content to supplement lectures
- Pain point: Frustrated by forgetting everything post-exam despite "studying"
- Tech comfort: Downloads apps, tries productivity tools
- Motivation: Intrinsically motivated (cares about actually learning, not just passing)

**Trigger moments:**

- Failed or nearly failed an exam despite watching hours of video content
- Realizes passive consumption ≠ learning
- Wants to actually remember things long-term but doesn't have time for manual flashcard creation

**Jobs to be Done (JTBD):**

- "Help me retain what I learn without extra manual work"
- "Show me what I actually know vs what I think I know"
- "Tell me exactly what gaps I have before the exam"
- "Make reviewing feel effortless and fit into my daily routine"

**Pains:**

- Forgetting course material 2 weeks after consuming it
- Not knowing what they don't know (false confidence)
- Manual flashcard creation is too time-consuming
- Note-taking apps (Notion/Obsidian) require too much active organization
- Traditional study methods (reading textbooks) don't match their learning style

**Gains:**

- Ace quizzes on material they previously would've forgotten
- See clear progress: "12/45 concepts mastered"
- Spend 3 min/day reviewing vs 2 hours panic-cramming
- Actually understand connections between concepts
- Feel confident going into exams

### Secondary Persona: "The Power User" (Post-MVP)

- Age: 22-30, grad students or knowledge workers
- Uses: Obsidian, Roam, RemNote
- Wants: Graph view, manual editing, export to markdown
- Value: Appreciate the Zettelkasten methodology, want AI to accelerate their existing workflow

## Value Proposition

**Core Value:**
Students get Zettelkasten benefits (retention, conceptual connections, deep understanding) without the work (manual note-taking, linking, curating). Obsidian is for knowledge workers; this is for Gen Z students who just want to pass exams without forgetting everything.

**How it Works:**

1. Professor uploads course syllabus (or use pre-populated public syllabi)
2. AI extracts 30-50 required concepts from syllabus
3. Student watches YouTube video, reads article, or attends lecture
4. AI extracts atomic concepts from content, creates knowledge graph (hidden backend)
5. AI matches concepts to syllabus requirements with confidence scores
6. System generates flashcards for matched concepts
7. Student reviews via spaced repetition (3-5 min/day)
8. Dashboard shows: "12/45 concepts mastered" and "You're missing: [specific gaps]"

**Magic Moment:**
Watch a video → see it auto-convert to flashcards matched to course objectives within 60 seconds → progress bar updates → review tomorrow → ace a quiz on that material.

**Differentiators:**

1. **Zero manual work**: No note-taking, no card creation, no organizing - just consume content you're already consuming
2. **Concept matching**: Connects what you're learning to what the professor actually requires (syllabus mapping)
3. **Gap analysis**: Shows exactly what you know vs don't know before exams
4. **Zettelkasten engine**: Uses proven knowledge graph methodology (atomic notes, typed links) as backend, but hides complexity from students
5. **Intercepts passive flow**: Works with content students already consume (YouTube, TikTok, articles) rather than requiring behavior change

**vs Competitors:**

- Anki/Quizlet: Require manual card creation (students won't do it)
- Notion/Obsidian/RemNote: Require manual note-taking and organization (too much friction)
- MOOCs/video platforms: No retention mechanism, no concept tracking
- AI note-takers (Otter, Notion AI): Focus on transcription/summarization, not retention or concept mastery

None connect: "what professor requires" + "what student actually consumes" + "spaced repetition retention" + "knowledge graph understanding"

## Scope & Non-goals

**In Scope (MVP - 48 hours):**

- Pre-populate 3 public course syllabi (philosophy, biology, economics)
- Process YouTube video URLs → extract atomic concepts via AI
- Match extracted concepts to syllabus with confidence scores (>80% = learned, <80% = partial)
- Generate flashcards from matched concepts
- Spaced repetition scheduling (basic algorithm)
- Progress dashboard: "X/Y concepts mastered"
- Gap analysis: "You're missing: [list of concepts]"
- Student feedback: "This match is wrong" button (data collection only)
- Mobile-first web interface
- Accept 20-30% concept matching error rate (show confidence scores)

**In Scope (Post-MVP):**

- Graph visualization (simplified for students, power users get full view)
- Manual syllabus PDF upload and parsing
- Multiple content sources: TikTok, articles, lecture recordings, PDFs
- Student editing: Delete/edit flashcards, add custom notes
- Prerequisite relationship detection ("learn X before Y")
- Export to Obsidian format (markdown + frontmatter)
- Professor dashboard: Upload syllabus, see class progress
- Improved AI accuracy via feedback loop
- Mobile app (native iOS/Android)

**Out of Scope:**

- Fine-tuned models (use prompt engineering + chatGPT/Claude)
- Social features, collaboration, sharing (focus on individual learning)
- Content creation (not a MOOC platform)
- Replacing professors or lectures (augmentation, not replacement)
- Perfect AI accuracy (acknowledge limitations, show improvement path)
- Multi-language support (English only for MVP)
- Desktop apps (web-first for speed)

**Critical MVP Boundaries:**

- ONE student journey end-to-end that works flawlessly
- ONE course syllabus fully mapped
- 10 videos processed successfully
- 3 test students showing improved retention
- Not breadth (many features) but depth (core pipeline proven)

## Success Criteria (Leading Indicators)

**Hackathon Success (4 days):**

- 10 videos processed → 47+ concepts extracted → 68%+ matched to syllabus
- 3 test students complete 24h review cycle → 80%+ retention vs 20% baseline (measured via spot quiz)
- Average review time: <30 min/day
- Concept extraction accuracy: 70%+ (acceptable for MVP)
- Zero critical bugs in core pipeline (video → concepts → match → flashcards → review)

**Post-Hackathon Validation (30 days):**

- 20 students using for 1 full week
- 60%+ retention after 7 days (vs <20% baseline)
- 50%+ daily active usage (students come back for reviews)
- <30% churn after first week
- 3+ organic testimonials: "I actually remember things now"

**Product-Market Fit Signals (90 days):**

- 100 active students across 5+ courses
- 70%+ concept matching accuracy (with feedback loop improvements)
- Students ace exams on auto-generated content (professor validation)
- 1-2 professor partnerships for syllabus integration
- NPS >40
- Students refer friends organically

**Metrics to Track:**

- Retention rate (% recalled after 7/14/30 days)
- Daily active usage (% students reviewing daily)
- Concept coverage (% of syllabus mastered per student)
- Matching accuracy (% correct concept matches)
- Time saved (review time vs traditional cramming)
- Exam performance (grades before/after using system)

## Risks & Assumptions

**Critical Assumptions:**

1. Students will trust AI-generated flashcards without manual verification
2. Concept matching at 70%+ accuracy is "good enough" to be useful
3. Students care more about retention than understanding the underlying Zettelkasten methodology
4. YouTube/TikTok content contains sufficient depth to extract meaningful atomic concepts
5. Professors will share syllabi (or public syllabi are accessible)
6. Spaced repetition works even with auto-generated content (not just manually created)
7. Students will review daily if the friction is low enough (<5 min)

**Top Risks:**

1. **Concept matching accuracy**: False positives (student thinks they know something they don't) are dangerous. Mitigation: Show confidence scores, allow flagging, accept 20-30% error for MVP
2. **Retention validation**: Hard to prove retention improvement in 4 days. Mitigation: Spot quizzes before/after, focus on user testimonials, show data even if imperfect
3. **AI extraction quality**: YouTube content varies wildly (some is shallow, clickbait). Mitigation: Test with high-quality educational channels first (CrashCourse, Khan Academy)
4. **Chicken-egg (syllabus)**: Need professor to upload syllabus before students can use it. Mitigation: Pre-populate public syllabi for MVP, don't require prof partnership in 48h
5. **Behavior change**: Students need to review daily, which is a habit. Mitigation: Push notifications, make reviews <3 min, show progress gamification
6. **Content variety**: MVP only supports YouTube URLs. Real students consume TikTok, PDFs, articles. Mitigation: Expand post-MVP, focus on proof of concept first
7. **Technical complexity**: Building concept extraction + matching + graph + spaced repetition in 48h is ambitious. Mitigation: Use existing APIs (GPT-4 for extraction, simple graph DB, basic SM-2 algorithm)

**Known Constraints:**

- 48-hour hackathon timeline (MVP only)
- No budget for fine-tuned models (use GPT-4/Claude APIs)
- No existing professor partnerships (use public data)
- Mobile-first but web-only for MVP (no native apps yet)
- Accept AI imperfection, show improvement roadmap

**What Could Kill This:**

- Concept matching <50% accurate → students lose trust
- Retention doesn't improve within 7 days → no value prop
- Review friction >30 min/day → students abandon
- Can't find public syllabi → no seed data for MVP
- AI costs >$10/student/month → unit economics broken

**De-Risking Plan:**

- Test concept extraction on 20 videos BEFORE hackathon (validate feasibility)
- Partner with 3 students NOW for beta testing during hackathon
- Pre-download 5 public syllabi (philosophy, biology, economics, psychology, history)
- Build feedback loop from day 1 (track bad matches, use for improvement)
- Set expectations: "70% accurate MVP, improving with use" vs "perfect AI"

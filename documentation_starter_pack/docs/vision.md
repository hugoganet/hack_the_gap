# Product Vision

> Keep it short, specific, and user-centered. This is your north star.

## One-liner

An AI-powered Zettelkasten system that automatically breaks down students' learning materials into atomic concepts (each learnable with ONE flashcard), then matches consumed content to these goals using spaced repetition for long-term retention.

## Problem & Opportunity

**Problem:**
Students worldwide consume educational content everywhere (YouTube explainers, articles, podcasts, online courses) but retain only ~15% after two weeks. They know they're forgetting but have no system for long-term encoding. Current solution is panic-cramming before exams, which fails. The root cause: passive consumption without active encoding.

**Who cares:**
Students globally in any field of study who want to actually retain what they learn. Not limited to traditional university students - includes self-learners, online course students, bootcamp participants, and anyone with learning goals. Specifically: students who already consume educational content but can't recall it when needed.

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

1. **Student uploads their syllabus** (PDF/text) OR **talks to AI** to define learning goals
2. **AI creates hierarchical knowledge structure** (Subject → Course(s) → Subdirectories → Atomic Concepts)
   - **CORE PRINCIPLE**: Each atomic concept must be learnable with ONE flashcard
   - AI determines appropriate number of concepts (no arbitrary limits)
   - Follows Zettelkasten principles: atomic, connected, hierarchical
3. **Student consumes content** (YouTube videos, articles, podcasts)
4. **Student uploads content** to the app
5. **AI extracts atomic concepts** from content (each = ONE flashcard)
6. **AI matches** content concepts to learning goals with confidence scores
7. **System generates flashcards** (one per atomic concept)
8. **Student reviews** via spaced repetition (3-5 min/day)
9. **Dashboard shows**: "12/45 concepts mastered" and "You're missing: [specific gaps]"

**Magic Moment:**
Upload your syllabus → watch a video → see it auto-convert to flashcards matched to YOUR learning goals within 60 seconds → progress bar updates → review tomorrow → actually remember the material.

**Differentiators:**

1. **Truly atomic concepts**: AI breaks down learning materials into concepts that can each be learned with ONE flashcard (not arbitrary chunks)
2. **Hierarchical knowledge structure**: Subject → Course(s) → Subdirectories → Atomic Concepts (Zettelkasten methodology)
3. **Zero manual work**: No note-taking, no card creation, no organizing - just consume content you're already consuming
4. **Your own learning goals**: Upload your syllabus or define goals with AI - works for any educational system worldwide
5. **Concept matching**: Connects what you're learning to what YOU want to learn (not limited to institutional syllabi)
6. **Gap analysis**: Shows exactly what you know vs don't know before exams/goals
7. **Zettelkasten engine**: Uses proven knowledge graph methodology (atomic notes, typed links) as backend, but hides complexity from students
8. **Intercepts passive flow**: Works with content students already consume (YouTube, articles, podcasts) rather than requiring behavior change
9. **Global flexibility**: Not tied to any specific educational system - works for students worldwide

**vs Competitors:**

- Anki/Quizlet: Require manual card creation (students won't do it)
- Notion/Obsidian/RemNote: Require manual note-taking and organization (too much friction)
- MOOCs/video platforms: No retention mechanism, no concept tracking
- AI note-takers (Otter, Notion AI): Focus on transcription/summarization, not retention or concept mastery

None connect: "what professor requires" + "what student actually consumes" + "spaced repetition retention" + "knowledge graph understanding"

## Scope & Non-goals

**In Scope (MVP - 48 hours):**

- **Student uploads syllabus** (PDF/text) OR defines learning goals via AI conversation
- **AI creates hierarchical knowledge structure** (Subject → Course(s) → Subdirectories → Atomic Concepts)
- **CORE: Each atomic concept = ONE flashcard** (AI's primary responsibility)
- AI determines appropriate number of concepts (no arbitrary limits)
- Process YouTube video URLs → extract atomic concepts via AI ✅ DONE
- Match extracted concepts to learning goals with confidence scores (>80% = learned, <80% = partial) ✅ DONE
- Generate flashcards from matched concepts (one per atomic concept) ✅ DONE
- Spaced repetition scheduling (basic algorithm) ✅ DONE
- Progress dashboard: "X/Y concepts mastered"
- Gap analysis: "You're missing: [list of concepts]"
- Student feedback: "This match is wrong" button (data collection only)
- Mobile-first web interface
- Accept 20-30% concept matching error rate (show confidence scores)

**In Scope (Post-MVP):**

- Graph visualization (simplified for students, power users get full view)
- Multiple content sources: TikTok, articles, lecture recordings, PDFs
- Student editing: Delete/edit flashcards, add custom notes
- Prerequisite relationship detection ("learn X before Y")
- Export to Obsidian format (markdown + frontmatter)
- Improved AI accuracy via feedback loop
- Mobile app (native iOS/Android)
- Collaborative learning goals (share syllabi with friends)
- AI tutor chat (answer questions about concepts)

**Out of Scope:**

- Fine-tuned models (use prompt engineering + GPT-4/Claude)
- Social features, collaboration (focus on individual learning for MVP)
- Content creation (not a MOOC platform)
- Replacing teachers or courses (augmentation, not replacement)
- Perfect AI accuracy (acknowledge limitations, show improvement path)
- Multi-language support (English only for MVP)
- Desktop apps (web-first for speed)
- Institutional integrations (LMS, university systems) - focus on individual students

**Critical MVP Boundaries:**

- ONE student journey end-to-end that works flawlessly
- ONE student-uploaded syllabus fully processed
- 10 videos processed successfully
- 3 test students showing improved retention
- Not breadth (many features) but depth (core pipeline proven)
- Works for any student worldwide (not limited to specific educational systems)

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

1. **AI can reliably break down materials into truly atomic concepts** (each = ONE flashcard) ← CORE ASSUMPTION
2. Students will trust AI-generated flashcards without manual verification
3. Concept matching at 70%+ accuracy is "good enough" to be useful
4. Students care more about retention than understanding the underlying Zettelkasten methodology
5. YouTube/podcast/article content contains sufficient depth to extract meaningful atomic concepts
6. Students can provide their own syllabi or define learning goals with AI assistance
7. Spaced repetition works even with auto-generated content (not just manually created)
8. Students will review daily if the friction is low enough (<5 min)
9. Students worldwide have learning goals they want to track (not just institutional students)
10. Hierarchical structure (Subject → Course → Subdirectories → Concepts) makes sense to students

**Top Risks:**

1. **Atomic concept quality** ← HIGHEST RISK: AI may create concepts that require multiple flashcards or are too broad. Mitigation: Strict prompt engineering, validation layer, manual editing, continuous feedback loop. **This is the CORE of the system - must get this right.**
2. **Concept matching accuracy**: False positives (student thinks they know something they don't) are dangerous. Mitigation: Show confidence scores, allow flagging, accept 20-30% error for MVP
3. **Retention validation**: Hard to prove retention improvement in 4 days. Mitigation: Spot quizzes before/after, focus on user testimonials, show data even if imperfect
4. **AI extraction quality**: Content varies wildly (some is shallow, clickbait). Mitigation: Test with high-quality educational content first
5. **Syllabus upload friction**: Students may not have digital syllabi or may struggle to define goals. Mitigation: AI conversation to help define goals, accept various formats (PDF, text, images)
6. **Behavior change**: Students need to review daily, which is a habit. Mitigation: Push notifications, make reviews <3 min, show progress gamification
7. **Content variety**: MVP only supports YouTube URLs. Real students consume articles, PDFs, podcasts. Mitigation: Expand post-MVP, focus on proof of concept first
8. **Global diversity**: Students worldwide have different educational systems and learning styles. Mitigation: Flexible goal definition, not tied to specific curriculum structures
9. **Hierarchical complexity**: Students may find tree structure confusing. Mitigation: Hide complexity in UI, show flat list by default, tree view optional

**Known Constraints:**

- 48-hour hackathon timeline (MVP only)
- No budget for fine-tuned models (use GPT-4/Claude APIs)
- No existing professor partnerships (use public data)
- Mobile-first but web-only for MVP (no native apps yet)
- Accept AI imperfection, show improvement roadmap

**What Could Kill This:**

- **Concepts are not truly atomic** (<95% atomic) → flashcards don't work, students lose trust ← CRITICAL
- Concept matching <50% accurate → students lose trust
- Retention doesn't improve within 7 days → no value prop
- Review friction >30 min/day → students abandon
- Syllabus upload too complex → students can't get started
- AI costs >$10/student/month → unit economics broken
- Students don't have clear learning goals → can't define what to track
- Hierarchical structure is too complex → students confused

**De-Risking Plan:**

- **Test atomic concept generation on 10 syllabi BEFORE implementation** (validate AI can create truly atomic concepts) ← CRITICAL
- Manually verify: Can each concept be learned with ONE flashcard?
- Test concept extraction on 20 videos BEFORE hackathon (validate feasibility) ✅ DONE
- Partner with 3 students NOW for beta testing during hackathon
- Test syllabus upload with 5 different formats (PDF, Word, text, images, handwritten)
- Build AI conversation flow for goal definition (fallback if upload fails)
- Build feedback loop from day 1 (track bad matches, track non-atomic concepts)
- Set expectations: "70% accurate MVP, improving with use" vs "perfect AI"
- **Continuous monitoring of concept atomicity** (most important metric)

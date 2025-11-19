# Recall - Product & User Metrics Document
## Hack the Gap Submission

---

## 🎯 Problem Understanding

### Problem Statement
Students worldwide consume educational content everywhere (YouTube, articles, podcasts, online courses) but retain only ~15% after two weeks. They know they're forgetting but have no system for long-term encoding—the root cause is passive consumption without active encoding.

### Target Persona: "The Motivated Struggler"

**Who they are:**
University students (18-22) taking conceptually dense courses who already watch YouTube/TikTok educational content to supplement lectures. They're intrinsically motivated—they care about actually learning, not just passing—but are frustrated by forgetting everything post-exam despite "studying."

**Why this matters now:**
Gen Z is the first cohort that genuinely cannot power through traditional reading/studying (post-COVID shift). The educational system broke in the last 3 years: 70% drop in reading comprehension, 8-minute average attention spans, and 65% failure rates in conceptually dense courses like philosophy. Students ARE learning (via videos/social media) but retention systems haven't adapted.

### Key Pain Points

1. **Forgetting despite effort**: Students watch hours of educational content but can't recall it 2 weeks later when they need it for exams
2. **False confidence**: They don't know what they don't know—passive consumption creates an illusion of understanding
3. **Manual flashcard creation is too time-consuming**: Students won't create flashcards manually (Anki/Quizlet require too much work)
4. **No connection between consumption and learning goals**: Content they consume isn't mapped to what professors actually require

---

## 💎 Product Excellence & Craft

### Value Proposition
**Students get Zettelkasten benefits (retention, conceptual connections, deep understanding) without the work.** Upload your syllabus, consume content you're already watching, and get automatic flashcards matched to YOUR learning goals—with zero manual note-taking.

### Core Features & Prioritization

#### ✅ **Implemented (MVP - 48 hours)**

1. **Hierarchical Knowledge Structure** *(Addresses: "No clear learning goals")*
   - Students upload syllabus (PDF/text) or define goals via AI conversation
   - AI creates Subject → Course → Subdirectories → Atomic Concepts structure
   - Each atomic concept = ONE flashcard (Zettelkasten methodology)
   - **Why now**: Foundation for everything—without clear goals, matching is meaningless
   - **Deferred**: Multi-language support, institutional LMS integrations

2. **Automated Content Processing** *(Addresses: "Manual work is too time-consuming")*
   - Support for YouTube, TikTok, and PDF uploads
   - AI extracts 20-35 atomic concepts automatically per content piece
   - Each concept includes definition, timestamp, confidence score
   - Processing time: ~60 seconds per video
   - **Why now**: Core magic moment—students see immediate value
   - **Deferred**: Podcasts, articles, lecture recordings

3. **Intelligent Concept Matching** *(Addresses: "Content not mapped to learning goals")*
   - Two-stage AI matching: GPT-5-mini embeddings for initial candidate recognition, then Claude 3.5 Sonnet for detailed processing
   - AI matches extracted concepts to syllabus with confidence scores
   - >80% confidence = learned, <80% = partial match
   - Shows rationale for each match
   - **Why now**: Connects consumption to goals—the key differentiator
   - **Deferred**: Prerequisite detection, graph visualization

4. **Confirm-to-Unlock Flashcards** *(Addresses: "Forgetting despite effort")*
   - Flashcards start locked (question visible, answer hidden)
   - When content matches a concept, student confirms → unlocks answer
   - Unlocked cards enter spaced repetition schedule
   - **Why now**: Gamification drives engagement, proves retention works
   - **Deferred**: Advanced spaced repetition algorithms, mobile app

5. **Progress Dashboard** *(Addresses: "False confidence")*
   - Shows "X/Y concepts mastered" per course
   - Gap analysis: "You're missing: [specific concepts]"
   - Unlock streaks and milestones (gamification)
   - **Why now**: Students need to see progress to stay motivated
   - **Deferred**: Social features, collaborative learning

6. **Integrated User Feedback System** *(Addresses: "Product improvement & validation")*
   - Feedback prompts at key interaction points (post-unlock, post-review, dashboard)
   - Connected to Notion database for real-time feedback collection
   - Captures user sentiment, feature requests, and pain points
   - **Why now**: Essential for MVP validation and rapid iteration
   - **Deferred**: In-app feedback analytics dashboard, automated sentiment analysis

#### 🔮 **Post-MVP Roadmap**

- **Graph visualization** (simplified for students, full view for power users)
- **Multiple content sources** (TikTok, articles, lecture recordings, PDFs)
- **Student editing** (delete/edit flashcards, add custom notes)
- **AI tutor chat** (answer questions about concepts)
- **Export to Obsidian** (markdown + frontmatter for power users)

---

## 📈 Adoption & Traction

### North-Star Metric
**Unlock Rate**: Percentage of syllabus concepts unlocked through content consumption

**Why this metric:**
- Directly measures product value: students are consuming content AND it's matching their learning goals
- Leading indicator of retention improvement (can't retain what you haven't unlocked)
- Captures both engagement (content consumption) and efficacy (matching accuracy)
- Gamification-friendly (students see progress bar fill up and unlock streaks)

### User Journey

```
1. Sign up → Create account (email/OAuth)
2. Upload syllabus → AI extracts 30-50 atomic concepts
3. See dashboard → "0/45 concepts mastered" (motivation)
4. Paste YouTube URL → Watch AI extract concepts (magic moment)
5. Confirm matches → Unlock flashcards (dopamine hit)
6. Review tomorrow → Spaced repetition kicks in (retention proof)
7. Check progress → "12/45 concepts mastered" (visible progress)
8. Repeat daily → Unlock streak builds (habit formation)
```

### Key Actions We Track

| Action | Why It Matters | Current Status |
|--------|----------------|----------------|
| **Content Processed** | Measures engagement—students are actively using the system | Track via `ContentJob` table |
| **Concepts Unlocked** | Measures efficacy—matching is working, students see value | Track via `UnlockEvent` table |
| **Daily Review Completion** | Measures retention—students are building long-term memory | Track via `ReviewSession` table |
| **User Feedback Submitted** | Measures product-market fit and identifies improvement areas | Track via `Feedback` table + Notion integration |

### Current Traction (MVP Launch)

**As of 11/18/25:**
- 🚀 **Product Status**: Live at recall.academy
- 🎯 **Core Pipeline**: Fully functional (syllabus → content → concepts → matches → flashcards → reviews)
- 📊 **Feedback System**: Active at key touchpoints (post-unlock, post-review, dashboard) with Notion integration
- 🔄 **Rapid Iteration**: Real-time user feedback enables quick product improvements

**MVP Validation Goals (Next 7 Days):**
- 10 videos processed → 200+ concepts extracted
- 30 external test students complete 24h review cycle
- 40% retention after 7 days
- Average review time: <5 min/day
- Concept matching accuracy: 70%+

**Realistic Projections (30 Days Post-Hackathon):**
- 150 active students across
- 100+ videos processed
- 60%+ retention after 7 days (vs <20% baseline)
- 50%+ daily active usage (students come back for reviews)
- 3+ organic testimonials: "I actually remember things now"

---

## 🎣 User Acquisition

### Acquisition Channels

1. **Reddit (r/GetStudying, r/productivity, r/Anki)**
   - Target: Students frustrated with traditional study methods
   - Hook: "I built an AI that auto-converts YouTube videos into flashcards matched to your syllabus"
   - CTA: "Try it free at recall.academy"

2. **Twitter/X (EdTech & Study communities)**
   - Target: Students sharing study tips, complaining about forgetting
   - Hook: "Stop forgetting what you learn. Recall turns passive content consumption into active retention."
   - CTA: "Upload your syllabus → paste a YouTube URL → see the magic"

3. **Direct Outreach (University Discord/Slack groups)**
   - Target: Students in conceptually dense courses (philosophy, biology, economics)
   - Hook: "Struggling with [Course Name]? I built a tool that auto-generates flashcards from YouTube videos"
   - CTA: "DM me for early access"

### Sample Outreach Copy

**Reddit Post:**
```
Title: I built an AI that turns YouTube videos into flashcards matched to your syllabus

Body:
Like most students, I watch tons of educational YouTube videos but forget everything 2 weeks later. So I built Recall—an AI that:

1. Extracts atomic concepts from videos (with timestamps)
2. Matches them to YOUR syllabus/learning goals
3. Auto-generates flashcards with spaced repetition
4. Shows you exactly what you know vs don't know

It's like Anki but 100% automated. No manual card creation.

Try it: recall.academy (free during beta)

Would love feedback from this community!
```

**Twitter Thread:**
```
1/ Students consume hours of educational content but retain <15% after 2 weeks.

The problem isn't the content—it's the lack of active encoding.

I built Recall to fix this. Here's how it works 🧵

2/ Upload your syllabus (or define learning goals with AI)
→ Recall creates a hierarchical knowledge structure
→ Each concept = ONE flashcard (Zettelkasten methodology)

3/ Paste a YouTube URL
→ AI extracts 20-35 atomic concepts in ~60 seconds
→ Matches them to YOUR learning goals with confidence scores
→ Auto-generates flashcards

4/ Confirm matches → unlock flashcards → review with spaced repetition
→ See progress: "12/45 concepts mastered"
→ Gap analysis: "You're missing: [specific concepts]"

5/ Result: Zettelkasten benefits without the work.

Try it free: recall.academy

Built in 48h for @hackthegap. Feedback welcome!
```

### Funnel Summary

**Awareness → Interest → Trial → Activation → Retention**

- **Awareness**: Reddit posts, Twitter threads, university Discord mentions
- **Interest**: Landing page explains value prop in 10 seconds ("Stop forgetting what you learn")
- **Trial**: Sign up → upload syllabus (2 min onboarding)
- **Activation**: Process first YouTube video → see concepts match → unlock first flashcard (magic moment)
- **Retention**: Daily review reminders → unlock streaks → visible progress → habit formation

**Key Metric**: Time to first unlock (<5 minutes from sign-up)

---

### Technology Stack

**Frontend:**
- Next.js 15 (App Router) + React 19
- TypeScript (strict mode)
- TailwindCSS v4 + Shadcn/UI

**Backend:**
- Next.js API Routes + Server Actions
- PostgreSQL (Supabase)
- Prisma ORM
- Better Auth (email/password, OAuth)

**AI/ML:**
- GPT-5-mini (embeddings for initial concept matching)
- Claude 3.5 Sonnet (concept extraction, detailed matching)
- AI SDK (Vercel)
- Custom prompts for atomic concept generation

**Infrastructure:**
- Vercel (hosting, serverless functions)
- Supabase (database, auth)
- Resend (transactional emails)

### Key Technical Decisions

1. **Two-Stage AI Matching Pipeline**
   - **Decision**: Use GPT-5-mini embeddings for initial candidate recognition, then Claude 3.5 Sonnet for detailed processing
   - **Why**: Embeddings provide fast, scalable similarity search; Claude excels at nuanced concept analysis
   - **Trade-off**: Two API calls per match, but significantly improves accuracy and reduces false positives

2. **Hierarchical Knowledge Structure (Zettelkasten)**
   - **Decision**: Subject → Course → Subdirectories → Atomic Concepts
   - **Why**: Proven methodology for long-term retention, scales globally
   - **Trade-off**: More complex than flat list, but enables graph view later

3. **Confirm-to-Unlock Gamification**
   - **Decision**: Flashcards start locked, unlock via content consumption (discovery)
   - **Why**: Drives engagement, creates dopamine loops, proves matching works
   - **Trade-off**: Adds friction, but increases perceived value

4. **Serverless Architecture (Vercel + Supabase)**
   - **Decision**: No custom backend, use Next.js API routes + Supabase
   - **Why**: Ship faster, scale automatically, lower ops burden
   - **Trade-off**: Cold starts, but acceptable for MVP

5. **Integrated Feedback Collection at Key Touchpoints**
   - **Decision**: Prompt users for feedback after critical actions (unlock, review completion, dashboard visits)
   - **Why**: Validates product-market fit, identifies friction points, enables rapid iteration during MVP phase
   - **Trade-off**: Potential interruption to user flow, but essential for learning and improvement

### Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│  (Next.js 15 App Router + React 19 + TailwindCSS)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Next.js)                       │
│  • Server Actions (form submissions, mutations)             │
│  • API Routes (webhooks, external integrations)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  • Content Processing (YouTube → Transcript → Concepts)     │
│  • Concept Matching (AI-powered similarity scoring)         │
│  • Flashcard Generation (Atomic concept → Q&A pairs)        │
│  • Spaced Repetition (Review scheduling algorithm)          │
│  • Unlock Service (Gamification logic)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER (Prisma ORM)                     │
│  • PostgreSQL (Supabase)                                    │
│  • 15+ tables (Users, Courses, Concepts, Flashcards, etc.) │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│  • GPT-5-mini (embeddings for candidate matching)              │
│  • Claude 3.5 Sonnet (concept extraction, detailed matching)│
│  • YouTube API (video metadata, transcripts)               │
│  • Resend (transactional emails)                           │
│  • Better Auth (authentication)                            │
└─────────────────────────────────────────────────────────────┘
```

### Visual Assets

**Suggested Screenshots:**
1. Syllabus upload flow (drag-and-drop interface)
2. Content processing (YouTube/TikTok/PDF upload options)
3. Concept extraction progress (real-time processing)
4. Concept matching results (confidence scores, rationale)
5. Flashcard unlock moment (before/after state)
6. Dashboard showing progress (12/45 concepts mastered)
7. Review session interface (spaced repetition in action)

**Optional GIF:**
- End-to-end flow: Upload syllabus → paste YouTube URL → see concepts match → unlock flashcard → review tomorrow



# Glossary

> Canonical terminology for Recall. Use these terms consistently across all documentation.

**Last Updated:** 2025-11-18

---

## Product & Branding

- **Product Name:** Recall (finalized 2025-11-18)
- **Former Name:** "hack the gap" (development placeholder, deprecated)
- **Tagline:** AI-powered Zettelkasten for students
- **Core Principle:** Each atomic concept = ONE flashcard

---

## User Types

- **Self-Directed Learner:** Primary persona (canonical term)
  - Students who want to retain what they learn
  - Upload their own syllabi or define learning goals
  - Consume educational content (videos, articles, PDFs)
  
- **Student:** Casual reference to users (acceptable in informal contexts)

- **~~Motivated Struggler~~:** DEPRECATED persona name (use Self-Directed Learner)

- **~~Admin/Founder~~:** DEPRECATED (no longer needed after pivot to student-centric approach)

---

## Core Concepts

### Learning & Knowledge

- **Learning Goals:** User-defined objectives for what they want to learn (user-facing term)
- **Syllabus Concepts:** Technical term for learning goal concepts stored in database
- **Atomic Concept:** Concept that can be learned with ONE flashcard (core system principle)
- **Knowledge Tree:** Hierarchical structure organizing concepts (Subject → Course → Nodes → Concepts)
- **Knowledge Node:** Individual node in knowledge tree (e.g., "Epistemology" under "Philosophy")

### Content & Processing

- **Content Job:** Processing job for any content type (canonical term, replaces Video Job)
- **~~Video Job~~:** DEPRECATED term (use Content Job)
- **Content Type:** Type of content being processed (youtube, tiktok, pdf, url, podcast)
- **Extracted Text:** Text content extracted from any source (replaces "transcript" for non-video content)

### Matching & Learning

- **Concept Matching:** Process of matching extracted concepts to learning goals (short form)
- **Concept-to-Goal Matching:** Full term for concept matching process
- **Confidence Score:** 0.0-1.0 score indicating match quality
  - ≥0.80 = HIGH confidence (green, auto-accepted)
  - 0.60-0.79 = MEDIUM confidence (yellow, requires confirmation)
  - <0.60 = LOW confidence (rejected, not shown)
- **Match Type:** Category of match (exact, partial, related, prerequisite)

### Review & Retention

- **Spaced Repetition:** Learning methodology using timed reviews for long-term retention
- **Review Session:** Single instance of flashcard review
- **Flashcard State:** locked | unlocked | mastered
- **Unlock:** Process of revealing flashcard answer when high-confidence match found (≥70%)

---

## Content Types

- **YouTube:** Video content from YouTube platform
- **TikTok:** Short-form video content from TikTok platform
- **PDF:** Document content (uploaded file or URL)
- **URL:** Article/webpage content (future)
- **Podcast:** Audio content (future)

---

## Technical Terms

### Database Models

- **ContentJob:** Processing job record (table: `video_jobs` for backward compatibility)
- **Concept:** AI-extracted concept from content
- **SyllabusConcept:** Learning goal concept from user's syllabus
- **ConceptMatch:** Link between extracted concept and syllabus concept
- **Flashcard:** Review card with question/answer
- **UnlockEvent:** Record of flashcard answer unlock
- **UserStats:** Aggregate user statistics

### AI & Processing

- **Embedding:** Vector representation of concept for semantic similarity
- **Embedding Model:** text-embedding-3-large (3072 dimensions, multilingual)
- **LLM:** Large Language Model (GPT-4 for concept extraction and reasoning)
- **Hybrid Matching:** Two-stage algorithm (embeddings + LLM reasoning)
- **Cosine Similarity:** Measure of semantic similarity between embeddings (0.0-1.0)

### Internationalization

- **Locale:** Language/region code (en, fr)
- **Translation Key:** Identifier for translated text in message catalogs
- **Message Catalog:** JSON file containing translations for a locale
- **Cross-Lingual Matching:** Matching concepts across different languages using multilingual embeddings

---

## Status Terms

Use these consistently in documentation and task tracking:

- **✅ IMPLEMENTED:** Feature complete and deployed
- **🚧 IN PROGRESS:** Currently being developed
- **📋 TODO:** Planned but not started
- **❌ DEPRECATED:** No longer used, archived
- **⚠️ BLOCKED:** Waiting on dependency
- **🔄 REFACTORING:** Being restructured/improved

---

## Architectural Terms

- **Monolith:** Single Next.js application (frontend + backend collocated)
- **Server Action:** Next.js server-side function for mutations
- **Server Component:** React component rendered on server (RSC)
- **Client Component:** React component rendered in browser
- **API Route:** REST endpoint in Next.js

---

## Process Terms

- **ADR:** Architecture Decision Record (documents key decisions)
- **User Story:** Feature description from user perspective (US-####)
- **Spec:** Detailed feature specification
- **Session:** Logged AI collaboration session
- **Context Bundle:** Entry point document (context.md) with links to all docs

---

## Deprecated Terms

These terms should NO LONGER be used:

- ~~"hack the gap"~~ → Use "Recall"
- ~~"Motivated Struggler"~~ → Use "Self-Directed Learner"
- ~~"Video Job"~~ → Use "Content Job"
- ~~"Transcript"~~ (for non-video) → Use "Extracted Text"
- ~~"Admin/Founder"~~ → No longer applicable (student-centric approach)
- ~~"Pre-loaded courses"~~ → Students upload their own syllabi
- ~~"Course selection"~~ → Syllabus upload
- ~~"Academic year/semester"~~ → Removed for global flexibility

---

## Usage Guidelines

### When to Use What

**User-Facing Documentation:**
- Use "Learning Goals" (not "Syllabus Concepts")
- Use "Student" or "Self-Directed Learner"
- Use "Recall" (not "hack the gap")
- Use simple, non-technical language

**Technical Documentation:**
- Use "Syllabus Concepts" (database model name)
- Use "Content Job" (not "Video Job")
- Use "Self-Directed Learner" (canonical persona)
- Use precise technical terms

**Code & Database:**
- Use exact model names (ContentJob, SyllabusConcept, etc.)
- Use snake_case for database columns
- Use camelCase for TypeScript/JavaScript
- Follow existing naming conventions

---

## Related Documents

- **Vision:** `./vision.md` - Product vision and value proposition
- **Architecture:** `./architecture.md` - System architecture and technical details
- **Context:** `./context.md` - Entry point for all documentation
- **User Stories:** `./user_stories/README.md` - Feature descriptions

---

**Glossary Maintained By:** Documentation team  
**Review Frequency:** Monthly or when new terms introduced  
**Last Review:** 2025-11-18

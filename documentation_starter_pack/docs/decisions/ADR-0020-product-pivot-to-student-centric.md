# ADR-0020: Product Pivot to Student-Centric Approach

Date: 2025-11-17
Status: Accepted
Deciders: Founder

## Context

**Problem Statement:**
Original product design was institution-centric:
- Admin/professor pre-loads course syllabi
- Students select from pre-populated courses
- Tied to specific educational systems (French UE, academic years, semesters)
- Geographic limitation: designed for institutional students only
- Dependency on professor partnerships for content

**Issues with Original Approach:**
1. **Chicken-and-egg problem**: Need professors to pre-load courses before students can use
2. **Geographic limitation**: Only works for specific educational systems
3. **Scaling bottleneck**: Growth limited by professor partnerships
4. **Rigid structure**: Academic year/semester model doesn't fit all students
5. **Limited market**: Excludes self-learners, online course students, bootcamp participants

**Forces at Play:**
- Market size (institutional vs global)
- Go-to-market complexity (B2B2C vs B2C)
- Product-market fit timeline
- Development complexity
- User autonomy vs curated content

## Decision

**Selected: Pivot to Student-Centric Approach**

Shift from institution-centric to student-centric model:

### OLD APPROACH (Before 2025-11-17)
- Admin/professor pre-loads course syllabi
- Students select from 3 pre-populated courses
- Tied to French UE system (academic years, semesters)
- Geographic limitation: institutional students only
- B2B2C model (sell to institutions)

### NEW APPROACH (After 2025-11-17)
- **Students upload their own syllabi** (PDF, text, images)
- **AI conversation** to help define learning goals (alternative)
- Works for **any student worldwide**, any educational system
- **Global flexibility**: not tied to curriculum structures
- B2C model (sell directly to students)

**Implementation:**
1. **Syllabus Upload (NEW US-0001):**
   - PDF/text/image upload interface
   - AI extracts atomic concepts using existing prompt
   - Alternative: AI conversation for goal definition
   - Store concepts linked to student's profile

2. **Simplified Data Model:**
   - Remove `academic_years` table
   - Remove `semesters` table
   - Simplify `courses` table (no year/semester fields)
   - Focus on user-uploaded syllabi

3. **Updated User Stories:**
   - Deprecate US-0001 (Course Selection)
   - Deprecate US-0012 (Admin Pre-load Syllabi)
   - Create NEW US-0001 (Syllabus Upload)
   - Update persona: "Motivated Struggler" → "Self-Directed Learner"

## Consequences

**Positive:**
- ✅ **10x larger market**: Not limited to institutional students
- ✅ **No chicken-and-egg**: Students can start immediately
- ✅ **Global reach**: Works for any educational system worldwide
- ✅ **Faster go-to-market**: No need for professor partnerships
- ✅ **Student ownership**: Students define their own learning goals
- ✅ **Flexibility**: Works for self-learners, online courses, bootcamps
- ✅ **Simpler sales**: B2C vs B2B2C
- ✅ **Lower friction**: No institutional approval needed
- ✅ **Scalability**: Growth not limited by partnerships

**Negative:**
- ❌ **Syllabus upload friction**: Students may not have digital syllabi
- ❌ **Quality control**: User-uploaded syllabi may be lower quality
- ❌ **Global diversity**: Different educational systems and styles
- ❌ **Support complexity**: More diverse use cases to support
- ❌ **Lost institutional leverage**: Can't use professor endorsements
- ❌ **OCR complexity**: Need to handle handwritten syllabi

**Mitigations:**
- AI conversation to help define goals (fallback if no syllabus)
- Accept various formats (PDF, text, images, handwritten)
- AI validation of uploaded syllabi
- Community ratings for quality control (future)
- Flexible goal definition (not tied to specific structures)

**Follow-ups:**
- Test syllabus upload with 5+ different formats
- Implement OCR for handwritten notes
- Refine AI conversation for goal definition
- Add community-contributed syllabi library
- Monitor upload success rate and friction points

## Alternatives Considered

### Option A: Keep Institution-Centric Approach
**Approach:**
- Continue with pre-loaded courses
- Focus on professor partnerships
- Build institutional features
- B2B2C sales model

**Pros:**
- Curated, high-quality content
- Professor endorsements
- Institutional credibility
- Clear target market

**Cons:**
- Chicken-and-egg problem
- Limited to specific geographies
- Slow go-to-market
- Dependency on partnerships
- Smaller market size

**Rejected because:** Chicken-and-egg problem too hard to solve. Market too small. Go-to-market too slow for MVP validation.

### Option B: Hybrid Approach
**Approach:**
- Pre-loaded courses AND user uploads
- Students can choose either
- Best of both worlds

**Pros:**
- Flexibility for users
- Curated content available
- User-generated content possible

**Cons:**
- Complex to build and maintain
- Confusing UX (two paths)
- Still have chicken-and-egg for pre-loaded
- More development time

**Rejected because:** Adds complexity without solving core problem. Better to focus on one approach and do it well.

### Option C: Community-Curated Library
**Approach:**
- Students upload syllabi
- Community votes/rates
- Best syllabi become "official"
- Hybrid of user-generated and curated

**Pros:**
- Quality control through community
- User-generated content
- Curated over time

**Cons:**
- Cold start problem (need critical mass)
- Moderation complexity
- Slower to get quality content
- Still need upload feature

**Rejected because:** Can add later as enhancement. Start with simple upload, add community features post-MVP.

### Option D: AI-Only (No Upload)
**Approach:**
- No syllabus upload
- Only AI conversation to define goals
- Fully conversational interface

**Pros:**
- No upload friction
- Conversational UX
- Flexible goal definition

**Cons:**
- Harder to get structured goals
- Students may not know what to say
- Less concrete than syllabus
- Harder to validate completeness

**Rejected because:** Students often have syllabi already. Upload is faster than conversation for those who have documents. Can offer both (upload + conversation).

## Migration Path

**Phase 1: Core Pivot (Complete - 2025-11-17)**
- ✅ Remove academic year/semester structure
- ✅ Deprecate admin pre-load features
- ✅ Update documentation (vision, context, user stories)
- ✅ Simplify data model

**Phase 2: Syllabus Upload (In Progress - 2025-11-18)**
- 🚧 Implement PDF/text upload interface
- 🚧 AI extraction using existing prompt
- 🚧 Store concepts linked to student profile
- 🚧 Test with multiple formats

**Phase 3: AI Conversation (Future)**
- [ ] Implement conversational goal definition
- [ ] Refine prompts for goal extraction
- [ ] Test with students who don't have syllabi
- [ ] Iterate based on feedback

**Phase 4: Community Features (Future)**
- [ ] Community-contributed syllabi library
- [ ] Rating and review system
- [ ] Syllabus templates by subject
- [ ] Collaborative goal definition

## Impact on User Stories

### Deprecated Stories
- ~~US-0001: Course Selection~~ → Students no longer select from pre-loaded courses
- ~~US-0012: Admin Pre-load Syllabi~~ → No admin pre-loading needed

### New Stories
- **NEW US-0001a: Add Learning Goal via AI Conversation** (Priority: P0)
- **NEW US-0001b: Add Learning Goal via Document Upload** (Priority: P0)

### Updated Stories
- **US-0004**: Renamed "Concept-to-Syllabus Matching" → "Concept-to-Goal Matching"
- **US-0008**: Updated to support multiple learning goals (not single course)
- **US-0009**: Updated to support multiple learning goals (not single course)
- **All stories**: Changed persona "Motivated Struggler" → "Self-Directed Learner"

## Impact on Data Schema

### Removed Tables (2025-11-16)
- `academic_years` - No longer needed
- `semesters` - No longer needed

### Removed Fields
- `courses.year_id` - Removed for flexibility
- `courses.semester_id` - Removed for flexibility

### Simplified Tables
- `courses` - Now just subject + name (no calendar structure)
- Focus on user-uploaded syllabi, not pre-loaded institutional courses

### New Tables (Future)
- `user_syllabi` - Store uploaded syllabus files
- `syllabus_uploads` - Track upload history and metadata

## Success Metrics (Updated)

### MVP Success (4 days)
- [ ] Syllabus upload working for multiple formats (PDF, text, images)
- [ ] 3 beta students complete full flow (upload → process → review)
- [x] 68%+ concept matching accuracy ✅ DONE
- [x] Core pipeline working end-to-end ✅ DONE

### Post-MVP Success (30 days)
- [ ] 20+ active students from any country/educational system
- [ ] Students from 3+ different countries/systems
- [ ] 70%+ retention after 7 days
- [ ] 50%+ daily active usage

### Product-Market Fit (90 days)
- [ ] 100+ paying students from diverse countries/backgrounds
- [ ] Students from 10+ countries using platform
- [ ] 50+ community-contributed syllabi
- [ ] NPS >40

## Key Benefits of Pivot

1. **Global Market Access**
   - Not limited to specific educational systems
   - Works for students worldwide
   - 10x larger addressable market

2. **Lower Friction**
   - No need to pre-populate courses
   - No professor partnerships required
   - Students can start immediately

3. **Student Ownership**
   - Students define their own learning goals
   - Personalized to individual needs
   - Flexible and adaptable

4. **Scalability**
   - No dependency on partnerships
   - Growth limited only by student acquisition
   - Viral potential (students share with friends)

5. **Flexibility**
   - Works for self-learners
   - Works for online courses
   - Works for bootcamps
   - Works for traditional students

## Risks & Mitigations

### Risk 1: Syllabus Upload Friction
**Risk:** Students may not have digital syllabi or struggle to define goals  
**Mitigation:**
- AI conversation as alternative
- Accept various formats (PDF, text, images)
- OCR for handwritten notes
- Templates and examples
- Guided onboarding

### Risk 2: Global Diversity
**Risk:** Students worldwide have different educational systems and styles  
**Mitigation:**
- Flexible goal definition
- Not tied to specific curriculum structures
- Support multiple languages
- Adapt to different learning styles

### Risk 3: Quality Control
**Risk:** User-uploaded syllabi may be lower quality than curated ones  
**Mitigation:**
- AI validation of uploads
- Feedback loop for improvements
- Community ratings (future)
- Manual review for flagged content

### Risk 4: Support Complexity
**Risk:** More diverse use cases = more support requests  
**Mitigation:**
- Comprehensive documentation
- Video tutorials
- FAQ and help center
- Community forum
- AI chatbot for common questions

## Links

- **PIVOT_SUMMARY.md:** `docs/PIVOT_SUMMARY.md` (original pivot document)
- **Related ADRs:**
  - ADR-0009: Knowledge tree migration (removed academic structure)
  - ADR-0012: Monolith architecture
  - ADR-0017: Multilingual embeddings (enables global market)
- **Updated Documentation:**
  - `docs/vision.md` - Rewrote for student-centric approach
  - `docs/context.md` - Added pivot explanation
  - `docs/user_stories/README.md` - Deprecated old stories
  - `docs/roadmap.md` - Updated MVP scope
  - `project.yaml` - Updated summary and notes
- **User Stories:**
  - `docs/user_stories/us-0001a-add-learning-goal-ai-conversation.md`
  - `docs/user_stories/us-0001b-add-learning-goal-document-upload.md`

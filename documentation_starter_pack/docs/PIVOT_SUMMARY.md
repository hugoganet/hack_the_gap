# Major Product Pivot - 2025-11-17

## Summary

Shifted from **institution-centric** (pre-loaded courses) to **student-centric** (user-uploaded syllabi) approach. Students now upload their own learning goals instead of selecting from pre-populated courses.

## What Changed

### OLD APPROACH (Before 2025-11-17)
- Admin/professor pre-loads course syllabi
- Students select from 3 pre-populated courses (Philosophy 101, Biology 101, Economics 101)
- Tied to specific educational systems (French UE system, academic years, semesters)
- Geographic limitation: designed for institutional students

### NEW APPROACH (After 2025-11-17)
- **Students upload their own syllabi** (PDF, text, images)
- **AI conversation** to help define learning goals (alternative to upload)
- Works for **any student worldwide**, any educational system
- **Global flexibility**: not tied to specific curriculum structures
- Students can track multiple learning goals simultaneously

## What Stayed the Same

✅ **Core pipeline unchanged**:
1. AI extracts atomic concepts from syllabus (using existing `syllabus-concept-extraction-prompt.md`)
2. Student uploads content (YouTube, articles, podcasts)
3. AI extracts concepts from content
4. AI matches content concepts to learning goals
5. System generates flashcards
6. Student reviews with spaced repetition

✅ **Implementation status**:
- US-0002: Video URL Submission ✅ DONE
- US-0003: Concept Extraction ✅ DONE
- US-0004: Concept Matching ✅ DONE
- US-0005: Flashcard Generation ✅ DONE
- US-0006: First Review Session ✅ DONE
- US-0007: Review Scheduling ✅ DONE

## User Stories Changes

### Deprecated
- ~~US-0001: Course Selection~~ - Students no longer select from pre-loaded courses
- ~~US-0012: Admin Pre-load Syllabi~~ - No admin pre-loading needed

### New
- **NEW US-0001: Syllabus Upload & Goal Definition** 🚧 IN PROGRESS
  - Student uploads syllabus (PDF/text/image)
  - AI extracts atomic concepts using existing prompt
  - Alternative: AI conversation to define learning goals
  - Works for any educational system worldwide

### Updated
- **US-0004**: Renamed from "Concept-to-Syllabus Matching" to "Concept-to-Goal Matching"
- **US-0008**: Updated to support multiple learning goals (not single course)
- **US-0009**: Updated to support multiple learning goals (not single course)
- **All stories**: Changed persona from "Motivated Struggler" to "Self-Directed Learner"

## Data Schema Changes

### Removed (2025-11-16)
- `academic_years` table - No longer needed
- `semesters` table - No longer needed
- `courses.year_id` field - Removed for flexibility
- `courses.semester_id` field - Removed for flexibility

### Simplified
- `courses` table now simpler (just subject + name, no calendar structure)
- Focus on user-uploaded syllabi, not pre-loaded institutional courses

## Documentation Updated

### Files Updated (2025-11-17)
1. ✅ `docs/vision.md` - Rewrote to reflect student-centric, global approach
2. ✅ `docs/context.md` - Added pivot explanation, updated status
3. ✅ `docs/user_stories/README.md` - Deprecated old stories, added NEW US-0001
4. ✅ `docs/roadmap.md` - Updated MVP scope, removed professor features
5. ✅ `project.yaml` - Updated summary, stage, and notes

### Files Still Needing Updates
- [ ] `docs/architecture.md` - Remove course selection references, add syllabus upload flow
- [ ] `docs/specs/us-0001-course-selection.md` - Mark as deprecated or archive
- [ ] `docs/specs/us-0001-syllabus-upload.md` - Create new spec (TODO)
- [ ] `docs/tech_stack.md` - Update to reflect syllabus parsing needs
- [ ] `docs/data/` - Update schema documentation to reflect removed tables

## Implementation Priority

### Immediate (Week 1)
1. **NEW US-0001: Syllabus Upload** 🚧 IN PROGRESS
   - PDF/text upload interface
   - AI extraction using existing `syllabus-concept-extraction-prompt.md`
   - Alternative: AI conversation for goal definition
   - Store concepts linked to student's profile

### Next (Week 2)
2. **US-0008: Progress Dashboard** - Update to support multiple learning goals
3. **US-0009: Gap Analysis** - Update to support multiple learning goals

### Future
- Improve syllabus upload (OCR for handwritten notes, better PDF parsing)
- AI conversation refinement for goal definition
- Multi-syllabus support (track multiple learning goals simultaneously)
- Community-contributed syllabi (public library)

## Key Benefits of Pivot

1. **Global Market**: Not limited to specific educational systems
2. **Lower Friction**: No need to pre-populate courses or partner with institutions
3. **Student Ownership**: Students define their own learning goals
4. **Flexibility**: Works for self-learners, online courses, bootcamps, etc.
5. **Scalability**: No dependency on professor partnerships or institutional data

## Risks & Mitigations

### Risk 1: Syllabus Upload Friction
- **Risk**: Students may not have digital syllabi or struggle to define goals
- **Mitigation**: AI conversation to help define goals, accept various formats (PDF, text, images)

### Risk 2: Global Diversity
- **Risk**: Students worldwide have different educational systems and learning styles
- **Mitigation**: Flexible goal definition, not tied to specific curriculum structures

### Risk 3: Quality Control
- **Risk**: User-uploaded syllabi may be lower quality than curated ones
- **Mitigation**: AI validation, feedback loop, community ratings (future)

## Success Metrics (Updated)

### MVP Success (4 days)
- [ ] Syllabus upload working for multiple formats
- [ ] 3 beta students complete full flow (upload syllabus → process video → review)
- [x] 68%+ concept matching accuracy ✅ DONE
- [x] Core pipeline working end-to-end ✅ DONE

### Post-MVP Success (30 days)
- [ ] 20+ active students from any country/educational system
- [ ] Students from 3+ different countries/educational systems
- [ ] 70%+ retention after 7 days
- [ ] 50%+ daily active usage

### Product-Market Fit (90 days)
- [ ] 100+ paying students from diverse countries/backgrounds
- [ ] Students from 10+ countries using the platform
- [ ] 50+ community-contributed syllabi
- [ ] NPS >40

## Next Steps

1. ✅ Update core documentation (vision, context, user stories, roadmap) - DONE
2. 🚧 Implement NEW US-0001 (Syllabus Upload) - IN PROGRESS
3. [ ] Update architecture documentation
4. [ ] Create new spec for syllabus upload
5. [ ] Update data schema documentation
6. [ ] Test with beta users from different countries/systems

---

**Document Created**: 2025-11-17  
**Author**: AI Documentation Assistant  
**Status**: Complete - Core documentation updated, implementation in progress

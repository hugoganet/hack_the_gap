# Deprecated Specifications

This directory contains specifications for features that have been deprecated or removed from the product.

## Why Keep Deprecated Specs?

- **Historical reference:** Understanding past decisions and implementations
- **Context for new team members:** See how the product evolved
- **Audit trail:** Track what was built, why it was removed, and what replaced it
- **Learning:** Understand what didn't work and why

## Deprecation Policy

When a feature is deprecated:

1. Move the spec to this directory
2. Add a deprecation notice at the top of the file with:
   - Date deprecated
   - Reason for deprecation
   - What replaced it (if applicable)
   - Link to related ADR
3. Update all references in other documents
4. Add entry to CHANGELOG.md

## Deprecated Specifications

### US-0001: Course Selection (Deprecated 2025-11-17)

**File:** `us-0001-course-selection.md`

**Reason:** Major product pivot from institution-centric to student-centric approach. Students now upload their own syllabi instead of selecting from pre-loaded courses.

**Replaced by:** NEW US-0001 - Syllabus Upload & Goal Definition
- US-0001a: Add learning goal via AI conversation
- US-0001b: Add learning goal via document upload (PDF/text)

**Related ADR:** [ADR-0020: Product Pivot to Student-Centric](../decisions/ADR-0020-product-pivot-to-student-centric.md)

**Original Status:** ✅ Implemented (2025-11-16)  
**Deprecated:** 2025-11-17  
**Impact:** Removed admin/professor pre-loading workflow, removed course selection UI, removed academic year/semester structure

---

## Related Documents

- [ADR-0020: Product Pivot to Student-Centric](../decisions/ADR-0020-product-pivot-to-student-centric.md)
- [PIVOT_SUMMARY.md](../PIVOT_SUMMARY.md)
- [Active Specifications](../README.md)

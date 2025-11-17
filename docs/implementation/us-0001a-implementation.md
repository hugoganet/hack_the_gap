# US-0001a Implementation: Add Learning Goal via AI Conversation

**Status:** ✅ IMPLEMENTED  
**Date:** 2025-01-17  
**Developer:** AI Assistant

---

## Overview

This document describes the implementation of US-0001a: Add Learning Goal via AI Conversation. This feature allows users to define learning goals through an AI conversation, which creates a personalized hierarchical knowledge structure.

## Architecture

### Components Created

1. **Type Definitions** (`src/types/hierarchical-extraction.ts`)
   - TypeScript types for AI response structure
   - Input/output types for extraction process
   - Error types for validation

2. **AI Extraction Service** (`src/lib/ai/hierarchical-extraction.ts`)
   - Calls Blackbox AI (Claude Sonnet 4.5)
   - Formats input for hierarchical extraction prompt
   - Parses and validates JSON response
   - Handles timeouts and errors

3. **Quality Validation** (`src/lib/validation/extraction-quality.ts`)
   - Validates extraction quality checks
   - Checks confidence thresholds (minimum 0.5)
   - Validates atomic concepts (ONE flashcard test)
   - Validates hierarchy completeness

4. **Database Transaction Logic** (`src/lib/db/create-knowledge-structure.ts`)
   - Creates Subject (upsert)
   - Creates Course
   - Creates KnowledgeNodes recursively (topological order)
   - Creates SyllabusConcepts
   - Creates NodeSyllabusConcept junction records
   - Creates UserCourse enrollment
   - All wrapped in transaction (rollback on failure)

5. **API Endpoint** (`app/api/courses/route.ts`)
   - POST `/api/courses` endpoint
   - Input validation
   - AI processing integration
   - Quality validation
   - Database transaction
   - Comprehensive error handling

6. **Test Script** (`scripts/test-hierarchical-extraction.ts`)
   - Test cases for different input types
   - Validates extraction and quality checks

### Data Flow

```
User Input (Form)
    ↓
POST /api/courses
    ↓
Input Validation
    ↓
AI Extraction (Claude Sonnet 4.5)
    ↓
Quality Validation
    ↓
Database Transaction
    ├─ Create Subject
    ├─ Create Course
    ├─ Create KnowledgeNodes (recursive)
    ├─ Create SyllabusConcepts
    ├─ Create NodeSyllabusConcept (junction)
    └─ Create UserCourse (enrollment)
    ↓
Success Response
    ↓
Navigate to Course Detail Page
```

## API Specification

### Request

**Endpoint:** `POST /api/courses`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "subject": "Philosophy",
  "name": "Ethics",
  "learningGoal": "I want to learn about Kantian Ethics"
}
```

### Response (Success)

**Status:** `200 OK`

```json
{
  "id": "uuid",
  "code": "ETH",
  "name": "Ethics",
  "subjectId": "uuid",
  "subject": {
    "id": "uuid",
    "name": "Philosophy"
  },
  "metadata": {
    "totalConcepts": 12,
    "treeDepth": 3,
    "extractionConfidence": 0.88,
    "inputType": "specific",
    "requiresReview": false
  }
}
```

### Response (Error)

**Status:** `400 Bad Request` or `500 Internal Server Error`

```json
{
  "error": {
    "code": "INSUFFICIENT_DATA",
    "message": "Please provide more details about what you want to learn.",
    "suggestions": [
      "Specify the subject area (e.g., Philosophy, Biology, Economics)",
      "Provide course content or learning objectives",
      "Describe specific topics you want to master"
    ]
  }
}
```

### Error Codes

- `INSUFFICIENT_DATA` - Input lacks critical information
- `AMBIGUOUS_INPUT` - Input is too ambiguous
- `AI_PROCESSING_FAILED` - AI processing failed or timed out
- `QUALITY_CHECK_FAILED` - Extraction quality below threshold
- `DATABASE_ERROR` - Database transaction failed
- `INTERNAL_ERROR` - Unexpected error

## Database Schema

### Tables Used

1. **Subject**
   - `id` (UUID, PK)
   - `name` (String, unique)
   - `createdAt` (DateTime)

2. **Course**
   - `id` (UUID, PK)
   - `code` (String, unique)
   - `name` (String)
   - `subjectId` (UUID, FK → Subject)
   - `syllabusUrl` (String, nullable)
   - `createdAt` (DateTime)

3. **KnowledgeNode**
   - `id` (UUID, PK)
   - `subjectId` (UUID, FK → Subject)
   - `parentId` (UUID, FK → KnowledgeNode, nullable)
   - `name` (String)
   - `slug` (String, nullable)
   - `order` (Int)
   - `metadata` (JSON)
   - `createdAt` (DateTime)
   - `updatedAt` (DateTime)

4. **SyllabusConcept**
   - `id` (UUID, PK)
   - `courseId` (UUID, FK → Course)
   - `conceptText` (String)
   - `category` (String, nullable)
   - `importance` (Int, nullable, 1-3)
   - `order` (Int)
   - `createdAt` (DateTime)

5. **NodeSyllabusConcept** (Junction)
   - `nodeId` (UUID, FK → KnowledgeNode)
   - `syllabusConceptId` (UUID, FK → SyllabusConcept)
   - `addedByUserId` (UUID, nullable)
   - `createdAt` (DateTime)
   - PK: `(nodeId, syllabusConceptId)`

6. **UserCourse** (Enrollment)
   - `userId` (UUID, FK → User)
   - `courseId` (UUID, FK → Course)
   - `isActive` (Boolean)
   - `learnedCount` (Int, default 0)
   - `createdAt` (DateTime)
   - PK: `(userId, courseId)`

## Quality Checks

### Validation Rules

1. **All Concepts Atomic** (CRITICAL)
   - Each concept must be learnable with ONE flashcard
   - Compound concepts are rejected

2. **Minimum Confidence** (CRITICAL)
   - Confidence ≥ 0.5 (reject below)
   - Confidence 0.5-0.7 (flag for review)
   - Confidence ≥ 0.7 (accept)

3. **At Least One Concept** (CRITICAL)
   - Must extract at least 1 atomic concept

4. **Complete Hierarchy** (CRITICAL)
   - No orphaned nodes
   - All parent references valid

5. **Appropriate Tree Depth**
   - Recommended: 3-6 levels
   - Warning if outside range

## Testing

### Manual Testing Steps

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Dashboard**
   - Go to `/dashboard/courses`
   - Click "Add Learning Goal" button

3. **Test Case 1: Specific Topic**
   - Subject: "Philosophy"
   - Course Name: "Ethics"
   - Learning Goal: "I want to learn about Kantian Ethics"
   - Expected: 3-level tree, 10-15 concepts

4. **Test Case 2: Moderate Input**
   - Subject: "Biology"
   - Course Name: "Cell Biology"
   - Learning Goal: Paste a course syllabus
   - Expected: 4-5 level tree, 30-100 concepts

5. **Test Case 3: Insufficient Data**
   - Subject: "Math"
   - Course Name: "Algebra"
   - Learning Goal: "I want to learn"
   - Expected: Error with suggestions

### Automated Testing

Run the test script:
```bash
npx tsx scripts/test-hierarchical-extraction.ts
```

### Build Test

```bash
npm run build
```

Expected: Build succeeds with only linting warnings (no TypeScript errors)

## Performance

### Metrics

- **AI Processing Time:** < 30s (p95), < 60s (p99)
- **Database Transaction:** < 5s (p95)
- **Total Request Time:** < 40s (p95)
- **Timeout:** 60s (hard limit)

### Optimization

- Dynamic imports for AI/DB modules (avoid loading on GET requests)
- Parallel database operations where possible (Promise.all)
- Transaction rollback on any failure

## Error Handling

### User-Facing Errors

1. **Validation Errors**
   - Inline form validation
   - Clear error messages

2. **Processing Errors**
   - Toast notifications
   - Actionable suggestions
   - Form data preserved

3. **Timeout Errors**
   - "Processing took too long" message
   - Retry option

### Developer Errors

1. **Logging**
   - All errors logged to console
   - Extraction metadata logged
   - Quality check failures logged

2. **Monitoring**
   - Track extraction success rate
   - Track confidence distribution
   - Track processing time (p50, p95, p99)

## Future Improvements

1. **Caching**
   - Cache AI responses for identical inputs
   - Reduce API costs and latency

2. **Streaming**
   - Stream AI response to show progress
   - Better UX for long processing times

3. **Manual Review UI**
   - Admin interface for low-confidence extractions
   - Edit/approve extracted structures

4. **Analytics**
   - Track input types distribution
   - Track concept count distribution
   - Track tree depth distribution

5. **Batch Processing**
   - Process multiple learning goals at once
   - Bulk import from CSV/Excel

## Dependencies

### External Services

- **Blackbox AI** (Claude Sonnet 4.5)
  - API Key: `BLACKBOX_API_KEY`
  - Base URL: `https://api.blackbox.ai`

### NPM Packages

- `ai` - AI SDK for text generation
- `@ai-sdk/openai` - OpenAI-compatible provider
- `@prisma/client` - Database ORM

## Acceptance Criteria Status

- ✅ AC1: Form Validation & Submission
- ✅ AC2: AI Processing & User Feedback
- ✅ AC3: Hierarchical Knowledge Structure Creation
- ✅ AC4: Extraction Quality Validation
- ✅ AC5: Success Confirmation & Navigation
- ✅ AC6: Input Type Adaptation
- ✅ AC7: Error Handling - Insufficient Data
- ✅ AC8: Error Handling - Ambiguous Input

## Known Issues

None at this time.

## Changelog

- **2025-01-17**: Initial implementation
  - Created type definitions
  - Implemented AI extraction service
  - Implemented quality validation
  - Implemented database transaction logic
  - Updated API endpoint
  - Created test script
  - Documentation completed

---

**Next Steps:**
1. Manual testing with real users
2. Monitor extraction quality metrics
3. Iterate on prompt based on feedback
4. Implement US-0001b (Document Upload)

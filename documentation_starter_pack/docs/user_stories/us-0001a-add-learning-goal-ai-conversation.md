# US-0001a: Add Learning Goal via AI Conversation

**Status:** 🚧 IN PROGRESS  
**Priority:** P0 (Critical Path - First User Action)  
**Estimate:** 8h  
**Created:** 2025-01-17  
**Updated:** 2025-01-17

---

## Story

**ID:** US-0001a  
**Persona:** Self-Directed Learner (Primary ICP)  
**Title:** As a self-directed learner, I want to define my learning goals through an AI conversation so that the system can create a personalized knowledge structure for me to master.

---

## Context

This is the **FIRST action** a new user takes after account creation. The product has shifted from institution-centric (pre-loaded courses) to student-centric (user-defined learning goals). This story replaces the deprecated US-0001 (Course Selection).

**User Journey:**
1. User creates account → lands on empty dashboard
2. Sees "Add Your First Learning Goal" CTA
3. Opens dialog with form (subject, course name, learning goal text)
4. Submits → AI processes input → creates hierarchical knowledge structure
5. User sees progress dashboard with "0/X concepts mastered"

**Critical Dependencies:**
- `src/master-prompts/hierarchical-knowledge-extraction-prompt.md` (AI processing)
- `app/dashboard/courses/_components/create-course-dialog.tsx` (UI form - READY)
- Database models: Subject, Course, KnowledgeNode, SyllabusConcept, UserCourse

---

## Acceptance Criteria

### AC1: Form Validation & Submission
**Given** a new user on the dashboard  
**When** they click "Add Learning Goal" and fill the form  
**Then** the form validates:
- Subject: min 1 char, required (e.g., "Philosophy", "Biology")
- Course Name: min 3 chars, required (e.g., "Ethics", "Cell Biology")
- Learning Goal: min 10 chars, required (syllabus text, course description, or natural language goal)

**And** the submit button is disabled until all fields are valid  
**And** the form shows real-time validation errors

### AC2: AI Processing & User Feedback
**Given** a valid form submission  
**When** the user clicks "Create Course"  
**Then** the system:
- Shows loading state with spinner ("Processing your learning goal...")
- Calls `/api/courses` POST endpoint
- Formats input for hierarchical-knowledge-extraction-prompt.md
- Processes with AI (GPT-4 or Claude 3.5 Sonnet)
- Completes within 30 seconds (timeout at 60s)

**And** if processing fails:
- Shows error toast: "Failed to create course. Please try again."
- Keeps form data intact (no data loss)
- Logs error for debugging

### AC3: Hierarchical Knowledge Structure Creation
**Given** successful AI processing  
**When** the AI returns the JSON response  
**Then** the system creates database records in order:

1. **Subject** (if not exists)
   - name: from AI output `knowledgeTree.subject.name`
   - slug: from AI output `knowledgeTree.subject.slug`
   - metadata: from AI output `knowledgeTree.subject.metadata`

2. **Course**
   - code: from AI output `courses[0].code` (or generate from name)
   - name: from AI output `courses[0].name`
   - subjectId: linked to Subject
   - syllabusUrl: null (no upload for AI conversation)
   - metadata: from AI output `courses[0].metadata`

3. **KnowledgeNodes** (hierarchical tree, topological order)
   - For each node in `knowledgeTree.courses[0].subdirectories` (recursive):
     - id: UUID (generated)
     - subjectId: linked to Subject
     - parentId: null for top-level, or parent node's id
     - name: from AI output `node.name`
     - slug: from AI output `node.slug`
     - order: from AI output `node.order`
     - metadata: from AI output `node.metadata`
   - Create parent nodes BEFORE child nodes

4. **SyllabusConcepts** (atomic concepts only)
   - For each concept in `atomicConcepts` array:
     - id: UUID (generated)
     - courseId: linked to Course
     - conceptText: from AI output `concept.conceptText`
     - category: from AI output `concept.category`
     - importance: from AI output `concept.importance` (1-3 or null)
     - order: from AI output `concept.order`

5. **NodeSyllabusConcept** (junction table)
   - For each atomic concept:
     - nodeId: lookup KnowledgeNode by `concept.parentPath`
     - syllabusConceptId: linked to SyllabusConcept
     - addedByUserId: current user's id

6. **UserCourse** (enrollment)
   - userId: current user's id
   - courseId: linked to Course
   - isActive: true
   - learnedCount: 0 (no concepts learned yet)

**And** all database operations are wrapped in a transaction (rollback on failure)

### AC4: Extraction Quality Validation
**Given** the AI returns a JSON response  
**When** the system validates the output  
**Then** it checks:
- `qualityChecks.allConceptsAtomic === true` (CRITICAL: each concept = ONE flashcard)
- `extractionMetadata.extractionConfidence >= 0.7` (minimum acceptable confidence)
- `extractionMetadata.totalAtomicConcepts > 0` (at least 1 concept extracted)
- `qualityChecks.completeHierarchy === true` (no orphaned nodes)

**And** if validation fails:
- Log warning with extraction metadata
- Show user-friendly error: "We couldn't process your learning goal. Please try rephrasing or providing more details."
- Do NOT create database records

**And** if `extractionMetadata.extractionConfidence < 0.7`:
- Flag for manual review (log to monitoring system)
- Still create records but mark course with `metadata.requiresReview: true`

### AC5: Success Confirmation & Navigation
**Given** successful database creation  
**When** all records are committed  
**Then** the system:
- Shows success toast: "Course created successfully!"
- Closes the dialog
- Resets the form
- Navigates to `/dashboard/courses/{courseId}` (course detail page)
- Refreshes the router to show updated data

**And** the course detail page shows:
- Course name and subject
- Progress: "0/{totalAtomicConcepts} concepts mastered"
- Knowledge tree visualization (hierarchical structure)
- "Add Content" CTA (to start uploading videos)

### AC6: Input Type Adaptation
**Given** different types of learning goal input  
**When** the AI processes the text  
**Then** it adapts the tree depth appropriately:

- **Broad input** (e.g., "Philosophy Licence 1 full program")
  - Tree depth: 5-6 levels
  - Estimated concepts: 100-300+
  - Multiple courses under subject

- **Moderate input** (e.g., "Ethics course syllabus")
  - Tree depth: 4-5 levels
  - Estimated concepts: 30-100
  - Single course with subdirectories

- **Specific input** (e.g., "Kantian Ethics")
  - Tree depth: 3-4 levels
  - Estimated concepts: 10-40
  - Focused structure

- **Very specific input** (e.g., "Categorical Imperative")
  - Tree depth: 3 levels (minimum)
  - Estimated concepts: 5-15
  - Input concept + related concepts

**And** the system stores `inputAnalysis.inputType` in course metadata for analytics

### AC7: Error Handling - Insufficient Data
**Given** the user provides vague input (e.g., "I want to learn")  
**When** the AI cannot extract meaningful structure  
**Then** the system:
- Returns error code: `INSUFFICIENT_DATA`
- Shows user-friendly message: "Please provide more details about what you want to learn. For example: subject area, course name, or specific topics."
- Suggests improvements:
  - "Specify the subject area (e.g., Philosophy, Biology, Economics)"
  - "Provide course content or learning objectives"
  - "Describe specific topics you want to master"
- Keeps form open with data intact

### AC8: Error Handling - Ambiguous Input
**Given** the user provides ambiguous input (e.g., "Ethics")  
**When** the AI cannot determine scope (full program vs. single topic)  
**Then** the system:
- Assumes moderate scope (single course) as default
- Proceeds with extraction
- Stores `inputAnalysis.detectedScope` in metadata
- Shows info message: "We've created a course structure for Ethics. You can add more details later."

---

## Technical Implementation

### API Endpoint: POST `/api/courses`

**Request Body:**
```typescript
{
  subject: string;      // e.g., "Philosophy"
  name: string;         // e.g., "Ethics"
  learningGoal: string; // Syllabus text or natural language goal
}
```

**Response (Success):**
```typescript
{
  id: string;           // Course UUID
  code: string;         // Generated or from AI
  name: string;
  subjectId: string;
  subject: {
    id: string;
    name: string;
  };
  metadata: {
    totalConcepts: number;
    treeDepth: number;
    extractionConfidence: number;
    inputType: "broad" | "moderate" | "specific" | "very_specific";
  };
}
```

**Response (Error):**
```typescript
{
  error: {
    code: "INSUFFICIENT_DATA" | "AMBIGUOUS_INPUT" | "AI_PROCESSING_FAILED";
    message: string;
    details?: string;
    suggestions?: string[];
  };
}
```

### Processing Flow

```typescript
// 1. Validate input
const { subject, name, learningGoal } = requestBody;
validateInput(subject, name, learningGoal);

// 2. Format for AI prompt
const aiInput = formatForHierarchicalExtraction({
  subject,
  courseName: name,
  learningGoalText: learningGoal,
  userId: currentUser.id,
});

// 3. Call AI (GPT-4 or Claude 3.5 Sonnet)
const aiResponse = await callHierarchicalExtractionPrompt(aiInput, {
  temperature: 0.2,
  maxTokens: 8000,
  timeout: 60000, // 60s timeout
});

// 4. Validate AI response
validateExtractionQuality(aiResponse);

// 5. Create database records (transaction)
const course = await prisma.$transaction(async (tx) => {
  // 5a. Create/get Subject
  const subject = await tx.subject.upsert({
    where: { name: aiResponse.knowledgeTree.subject.name },
    create: {
      name: aiResponse.knowledgeTree.subject.name,
      // ... other fields
    },
    update: {},
  });

  // 5b. Create Course
  const course = await tx.course.create({
    data: {
      code: aiResponse.knowledgeTree.courses[0].code || generateCode(name),
      name: aiResponse.knowledgeTree.courses[0].name,
      subjectId: subject.id,
      // ... other fields
    },
  });

  // 5c. Create KnowledgeNodes (topological order)
  const nodeMap = await createKnowledgeNodesRecursive(
    tx,
    subject.id,
    aiResponse.knowledgeTree.courses[0].subdirectories,
    null, // parentId for top-level
  );

  // 5d. Create SyllabusConcepts
  const concepts = await Promise.all(
    aiResponse.atomicConcepts.map((concept) =>
      tx.syllabusConcept.create({
        data: {
          courseId: course.id,
          conceptText: concept.conceptText,
          category: concept.category,
          importance: concept.importance,
          order: concept.order,
        },
      })
    )
  );

  // 5e. Create NodeSyllabusConcept (link concepts to nodes)
  await Promise.all(
    aiResponse.atomicConcepts.map((concept, index) => {
      const nodeId = findNodeByPath(nodeMap, concept.parentPath);
      return tx.nodeSyllabusConcept.create({
        data: {
          nodeId,
          syllabusConceptId: concepts[index].id,
          addedByUserId: currentUser.id,
        },
      });
    })
  );

  // 5f. Create UserCourse (enrollment)
  await tx.userCourse.create({
    data: {
      userId: currentUser.id,
      courseId: course.id,
      isActive: true,
      learnedCount: 0,
    },
  });

  return course;
});

// 6. Return success response
return {
  id: course.id,
  code: course.code,
  name: course.name,
  subjectId: course.subjectId,
  subject: { id: subject.id, name: subject.name },
  metadata: {
    totalConcepts: aiResponse.extractionMetadata.totalAtomicConcepts,
    treeDepth: aiResponse.extractionMetadata.treeDepth,
    extractionConfidence: aiResponse.extractionMetadata.extractionConfidence,
    inputType: aiResponse.inputAnalysis.inputType,
  },
};
```

### Helper Functions

```typescript
// Recursive function to create KnowledgeNodes in topological order
async function createKnowledgeNodesRecursive(
  tx: PrismaTransaction,
  subjectId: string,
  nodes: AINode[],
  parentId: string | null,
  pathMap: Map<string, string> = new Map()
): Promise<Map<string, string>> {
  for (const node of nodes) {
    const createdNode = await tx.knowledgeNode.create({
      data: {
        subjectId,
        parentId,
        name: node.name,
        slug: node.slug,
        order: node.order,
        metadata: node.metadata,
      },
    });

    // Store path → nodeId mapping
    pathMap.set(node.path, createdNode.id);

    // Recursively create children
    if (node.children && node.children.length > 0) {
      const childNodes = node.children.filter((c) => c.nodeType === "subdirectory");
      await createKnowledgeNodesRecursive(
        tx,
        subjectId,
        childNodes,
        createdNode.id,
        pathMap
      );
    }
  }

  return pathMap;
}

// Find node ID by hierarchical path
function findNodeByPath(
  pathMap: Map<string, string>,
  path: string
): string {
  const nodeId = pathMap.get(path);
  if (!nodeId) {
    throw new Error(`Node not found for path: ${path}`);
  }
  return nodeId;
}

// Validate extraction quality
function validateExtractionQuality(aiResponse: AIResponse): void {
  const { qualityChecks, extractionMetadata } = aiResponse;

  if (!qualityChecks.allConceptsAtomic) {
    throw new Error("QUALITY_CHECK_FAILED: Not all concepts are atomic");
  }

  if (extractionMetadata.extractionConfidence < 0.5) {
    throw new Error("QUALITY_CHECK_FAILED: Confidence too low");
  }

  if (extractionMetadata.totalAtomicConcepts === 0) {
    throw new Error("QUALITY_CHECK_FAILED: No concepts extracted");
  }

  if (!qualityChecks.completeHierarchy) {
    throw new Error("QUALITY_CHECK_FAILED: Incomplete hierarchy");
  }
}
```

---

## UI/UX Requirements

### Form Design (EXISTING - `create-course-dialog.tsx`)
- ✅ Dialog modal (600px width)
- ✅ 3 form fields: Subject, Course Name, Learning Goal
- ✅ Learning Goal: Textarea with min-height 200px, monospace font
- ✅ Real-time validation with error messages
- ✅ Submit button disabled until valid
- ✅ Loading state with spinner during processing
- ✅ Cancel button (closes dialog, resets form)

### Success State
- Toast notification: "Course created successfully!" (green, 3s duration)
- Automatic navigation to course detail page
- Dialog closes and form resets

### Error States
- **Validation errors**: Show inline below each field (red text)
- **Processing errors**: Toast notification (red, 5s duration)
- **Insufficient data**: Toast with suggestions (yellow, 7s duration)
- **Timeout**: Toast "Processing is taking longer than expected. Please try again." (red, 5s)

### Loading State
- Submit button: Disabled, shows spinner + "Processing..."
- Dialog: Cannot be closed during processing
- Estimated time: "This usually takes 10-30 seconds"

---

## Testing Requirements

### Unit Tests
- [ ] Form validation (subject, name, learningGoal)
- [ ] AI input formatting
- [ ] Extraction quality validation
- [ ] Database transaction rollback on error
- [ ] Helper functions (createKnowledgeNodesRecursive, findNodeByPath)

### Integration Tests
- [ ] POST `/api/courses` with valid input → 201 Created
- [ ] POST `/api/courses` with invalid input → 400 Bad Request
- [ ] POST `/api/courses` with insufficient data → 400 with suggestions
- [ ] POST `/api/courses` with AI timeout → 500 Server Error
- [ ] Database records created correctly (Subject, Course, Nodes, Concepts, UserCourse)
- [ ] Transaction rollback on partial failure

### E2E Tests
- [ ] User opens dialog → fills form → submits → sees success → navigates to course page
- [ ] User submits vague input → sees error with suggestions → refines input → success
- [ ] User submits during network failure → sees error → retries → success
- [ ] Multiple users create courses simultaneously → no race conditions

### AI Prompt Tests
- [ ] Broad input (full program) → 5-6 levels, 100+ concepts
- [ ] Moderate input (single course) → 4-5 levels, 30-100 concepts
- [ ] Specific input (single topic) → 3-4 levels, 10-40 concepts
- [ ] Very specific input (single concept) → 3 levels, 5-15 concepts
- [ ] Ambiguous input → defaults to moderate scope
- [ ] Insufficient input → returns error with suggestions

---

## Performance Requirements

- **AI Processing**: < 30s (p95), < 60s (p99)
- **Database Transaction**: < 5s (p95)
- **Total Request Time**: < 40s (p95)
- **Timeout**: 60s (hard limit)

---

## Monitoring & Analytics

### Metrics to Track
- **Extraction Success Rate**: % of successful extractions vs. errors
- **Extraction Confidence Distribution**: Histogram of confidence scores
- **Input Type Distribution**: Broad vs. Moderate vs. Specific vs. Very Specific
- **Concept Count Distribution**: Histogram of totalAtomicConcepts
- **Tree Depth Distribution**: Histogram of treeDepth
- **Processing Time**: p50, p95, p99 latencies
- **Error Rate by Type**: INSUFFICIENT_DATA, AMBIGUOUS_INPUT, AI_PROCESSING_FAILED

### Logging
- Log all AI requests/responses (for debugging and prompt refinement)
- Log extraction metadata (confidence, concept count, tree depth)
- Log quality check failures (for manual review)
- Log user input (anonymized) for prompt improvement

---

## Dependencies

### Existing Components
- ✅ `app/dashboard/courses/_components/create-course-dialog.tsx` (UI form)
- ✅ `src/master-prompts/hierarchical-knowledge-extraction-prompt.md` (AI prompt)
- ✅ Prisma models: Subject, Course, KnowledgeNode, SyllabusConcept, UserCourse, NodeSyllabusConcept

### New Components (To Build)
- [ ] `app/api/courses/route.ts` (POST endpoint)
- [ ] `src/lib/ai/hierarchical-extraction.ts` (AI client wrapper)
- [ ] `src/lib/db/create-knowledge-structure.ts` (Database transaction logic)
- [ ] `src/lib/validation/extraction-quality.ts` (Quality validation)

---

## Success Criteria

### Definition of Done
- [ ] User can create a learning goal via AI conversation
- [ ] AI extracts hierarchical knowledge structure (3-6 levels)
- [ ] Database records created correctly (Subject → Course → Nodes → Concepts)
- [ ] User enrolled in course (UserCourse record)
- [ ] User navigates to course detail page showing "0/X concepts"
- [ ] All acceptance criteria pass
- [ ] Unit, integration, and E2E tests pass
- [ ] Error handling works for all edge cases
- [ ] Performance requirements met (< 40s p95)

### User Validation
- [ ] 3 test users successfully create learning goals
- [ ] 100% of extractions have `allConceptsAtomic === true`
- [ ] 90%+ of extractions have confidence ≥ 0.7
- [ ] Users understand error messages and can recover
- [ ] Users find the generated knowledge structure intuitive

---

## Notes

- **CRITICAL**: This is the FIRST user action. If this fails, the entire product fails.
- **Atomicity**: Each concept MUST be learnable with ONE flashcard. This is non-negotiable.
- **Confidence Threshold**: 0.7 is the minimum. Below 0.5 = reject. Between 0.5-0.7 = flag for review.
- **Transaction Safety**: All database operations MUST be in a transaction. Partial failures = rollback.
- **User Experience**: Processing time is critical. Show clear loading states and progress indicators.
- **Error Recovery**: Users should never lose their input data. Always keep form data on error.

---

## Related Stories

- **US-0001b**: Add Learning Goal via Document Upload (Next)
- **US-0008**: Progress Dashboard (Depends on this)
- **US-0009**: Gap Analysis (Depends on this)
- **US-0002**: Video URL Submission (Depends on this)

---

## Changelog

- **2025-01-17**: Initial creation (replaces deprecated US-0001)

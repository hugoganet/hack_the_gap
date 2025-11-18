# Flashcard Unlock System - Implementation Plan

**Goal:** Implement locked/unlocked flashcard system with gamification (Phase 1 + 2)  
**Timeline:** 5-7 days  
**Approach:** Single database migration, incremental feature rollout

---

## 🎯 Overview

### What We're Building

**Core Mechanic:**
1. User adds learning goal → AI generates syllabus concepts + **questions only** (locked state)
2. User consumes content (videos/PDFs) → Concepts matched to syllabus
3. High-confidence matches (≥80%) → **Unlock answers** + celebration
4. Unlocked flashcards → Available for spaced repetition review

**Gamification:**
- Progress tracking (locked/unlocked/mastered counts)
- Unlock notifications with celebrations
- Content recommendations (which videos unlock most answers)
- Unlock streaks
- Visual progress map

---

## 📋 Implementation Steps

## ✅ Progress Tracker

- [x] **STEP 1:** Database Schema (Single Migration) - COMPLETED
- [x] **STEP 2:** Update AI Prompt (Question-Only Generation) - COMPLETED
- [x] **STEP 3:** Update Zod Validation Schema - COMPLETED
- [x] **STEP 4:** Update Knowledge Structure Creation - COMPLETED
- [ ] **STEP 5:** Create Answer Unlock Service
- [ ] **STEP 6:** Integrate Unlock Service
- [ ] **STEP 7:** Create UI Components
- [ ] **STEP 8:** Create Progress Dashboard
- [ ] **STEP 9:** Create Notification System
- [ ] **STEP 10:** Update API Routes
- [ ] **STEP 11:** Update Dashboard Pages
- [ ] **STEP 12:** Testing & Validation

---

### **STEP 1: Database Schema (Single Migration)** ✅ COMPLETED

**Duration:** 1 hour  
**Files:** `prisma/schema/schema.prisma`, `prisma/migrations/`

#### 1.1 Update Flashcard Model

```prisma
model Flashcard {
  id                    String   @id @default(uuid())
  
  // Relationships
  syllabusConceptId     String
  syllabusConcept       SyllabusConcept @relation(fields: [syllabusConceptId], references: [id], onDelete: Cascade)
  
  conceptMatchId        String?  // NULL = locked, NOT NULL = unlocked
  conceptMatch          ConceptMatch? @relation(fields: [conceptMatchId], references: [id], onDelete: SetNull)
  
  userId                String
  user                  User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Content
  question              String   // Always present (from syllabus)
  answer                String?  // NULL = locked, NOT NULL = unlocked
  questionTranslation   String?
  answerTranslation     String?
  language              String @default("en")
  difficulty            String   // easy, medium, hard
  hints                 Json?    // Array of hint strings (available when locked)
  
  // State tracking (Phase 1)
  state                 String @default("locked") // locked | unlocked | mastered
  unlockedAt            DateTime? // When answer was revealed
  unlockedBy            String?   // contentJobId that unlocked it
  
  // Gamification (Phase 2)
  unlockProgress        Float @default(0.0) // 0.0-1.0 (for partial matches)
  relatedContentIds     Json?    // Array of contentJobIds that could unlock this
  
  // Spaced repetition (only active when unlocked)
  timesReviewed         Int @default(0)
  timesCorrect          Int @default(0)
  lastReviewedAt        DateTime?
  nextReviewAt          DateTime? // NULL when locked
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([userId, state])
  @@index([userId, nextReviewAt])
  @@index([syllabusConceptId])
  @@index([conceptMatchId])
  @@unique([syllabusConceptId, userId]) // One flashcard per concept per user
}
```

#### 1.2 Add UnlockEvent Model (for analytics)

```prisma
model UnlockEvent {
  id              String   @id @default(uuid())
  userId          String
  user            User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  flashcardId     String
  flashcard       Flashcard @relation(fields: [flashcardId], references: [id], onDelete: Cascade)
  
  contentJobId    String
  contentJob      ContentJob @relation(fields: [contentJobId], references: [id], onDelete: Cascade)
  
  conceptMatchId  String
  conceptMatch    ConceptMatch @relation(fields: [conceptMatchId], references: [id], onDelete: Cascade)
  
  confidence      Float    // Match confidence that triggered unlock
  
  createdAt       DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([contentJobId])
}
```

#### 1.3 Add UserStats Model (for gamification)

```prisma
model UserStats {
  id                    String   @id @default(uuid())
  userId                String   @unique
  user                  User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Unlock stats
  totalUnlocks          Int @default(0)
  totalLocked           Int @default(0)
  totalMastered         Int @default(0)
  unlockRate            Float @default(0.0) // totalUnlocks / (totalUnlocks + totalLocked)
  
  // Streaks
  currentStreak         Int @default(0)  // Days with at least 1 unlock
  longestStreak         Int @default(0)
  lastUnlockDate        DateTime?
  
  // Milestones
  firstUnlockAt         DateTime?
  milestone10           DateTime? // 10 unlocks
  milestone50           DateTime? // 50 unlocks
  milestone100          DateTime? // 100 unlocks
  
  updatedAt             DateTime @updatedAt
  
  @@index([userId])
}
```

#### 1.4 Run Migration

```bash
npx prisma migrate dev --name add_flashcard_unlock_system
npx prisma generate
```

**Validation:**
- ✅ Migration runs without errors
- ✅ Existing data preserved (answer field nullable)
- ✅ Indexes created

---

### **STEP 2: Update AI Prompt (Question-Only Generation)** ✅ COMPLETED

**Duration:** 30 minutes  
**Files:** `src/master-prompts/hierarchical-knowledge-extraction-prompt.md`

#### 2.1 Add Flashcard Generation Section

Add after "Atomic Concept Rules" section:

```markdown
## Flashcard Generation (Question-Only)

For each atomic concept, generate ONE question that tests understanding. 
**DO NOT generate answers** - answers will be unlocked when students consume content.

**Question Requirements:**
- **Format:** "What is...", "How does...", "Why...", "Explain...", "What are the key characteristics of..."
- **Clarity:** Question must be self-contained and unambiguous
- **Testability:** Must have a clear, factual answer (not opinion-based)
- **Difficulty:** Match concept importance (3=hard, 2=medium, 1=easy)
- **Language:** Match detected language (L)

**Hints (Optional but Recommended):**
- Provide 2-3 hints that guide thinking without revealing the answer
- Hints should prime curiosity and help students recognize the answer in content
- Format: Array of strings

**Example:**
```json
{
  "conceptText": "Categorical Imperative",
  "flashcard": {
    "question": "What is the Categorical Imperative in Kantian ethics?",
    "difficulty": "hard",
    "hints": [
      "Think about universal moral laws",
      "Consider Kant's formulation about treating humanity",
      "It's a principle that applies unconditionally"
    ]
  }
}
```

**Bad Examples (Avoid):**
- ❌ "Is the Categorical Imperative important?" (yes/no question)
- ❌ "Discuss Kant's ethics" (too vague)
- ❌ "What do you think about the Categorical Imperative?" (opinion-based)
```

#### 2.2 Update JSON Schema

Update `atomicConcepts` array schema:

```json
"atomicConcepts": [
  {
    "conceptText": "string (3-100 chars, atomic concept name)",
    "path": "string (full hierarchical path)",
    "parentPath": "string (path of immediate parent node)",
    "importance": "integer | null (1-3)",
    "category": "string | null",
    "order": "integer (order within parent)",
    "isAtomic": "boolean (always true)",
    "flashcard": {
      "question": "string (10-500 chars, clear testable question)",
      "difficulty": "string (easy | medium | hard)",
      "hints": "array of strings (2-3 hints, optional)"
    }
  }
]
```

#### 2.3 Update Examples

Update all 4 examples (broad/moderate/specific/very_specific) to include flashcard objects without answers.

**Validation:**
- ✅ Prompt generates questions without answers
- ✅ Questions are clear and testable
- ✅ Hints are helpful but don't reveal answers

---

### **STEP 3: Update Zod Validation Schema** ✅ COMPLETED

**Duration:** 20 minutes  
**Files:** `src/lib/validation/extraction-schema.ts`

#### 3.1 Create Flashcard Schema

```typescript
import { z } from 'zod';

export const FlashcardSchema = z.object({
  question: z.string()
    .min(10, 'Question must be at least 10 characters')
    .max(500, 'Question must be less than 500 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  hints: z.array(z.string()).optional(),
  // Note: No answer field - answers are unlocked later
});

export const AtomicConceptSchema = z.object({
  conceptText: z.string().min(3).max(100),
  path: z.string(),
  parentPath: z.string(),
  importance: z.number().int().min(1).max(3).nullable(),
  category: z.string().nullable(),
  order: z.number().int(),
  isAtomic: z.boolean(),
  flashcard: FlashcardSchema, // Required for each concept
});

export const ExtractionResultSchema = z.object({
  inputAnalysis: z.object({
    inputType: z.enum(['broad', 'moderate', 'specific', 'very_specific']),
    detectedScope: z.string(),
    recommendedDepth: z.number().int().min(3).max(6),
    estimatedConceptCount: z.number().int(),
  }),
  knowledgeTree: z.object({
    subject: z.object({
      name: z.string(),
      slug: z.string(),
      metadata: z.record(z.any()).optional(),
    }),
    courses: z.array(z.any()), // Simplified for brevity
  }),
  atomicConcepts: z.array(AtomicConceptSchema),
  extractionMetadata: z.object({
    totalNodes: z.number().int(),
    totalAtomicConcepts: z.number().int(),
    treeDepth: z.number().int(),
    coursesCount: z.number().int(),
    subdirectoriesCount: z.number().int(),
    coreConceptsCount: z.number().int(),
    importantConceptsCount: z.number().int(),
    supplementalConceptsCount: z.number().int(),
    extractionConfidence: z.number().min(0).max(1),
    detectedLanguage: z.string(),
    processingNotes: z.string(),
  }),
  qualityChecks: z.object({
    allConceptsAtomic: z.boolean(),
    appropriateDepth: z.boolean(),
    completeHierarchy: z.boolean(),
    logicalRelationships: z.boolean(),
    noDuplicates: z.boolean(),
    requiresReview: z.boolean(),
  }),
});

export type FlashcardInput = z.infer<typeof FlashcardSchema>;
export type AtomicConcept = z.infer<typeof AtomicConceptSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
```

**Validation:**
- ✅ Schema validates question-only flashcards
- ✅ TypeScript types generated correctly
- ✅ Validation errors are clear

---

### **STEP 4: Update Knowledge Structure Creation (Locked Flashcards)** ✅ COMPLETED

**Duration:** 1 hour  
**Files:** `src/lib/db/create-knowledge-structure.ts`

#### 4.1 Update Function to Create Locked Flashcards

```typescript
import { prisma } from '@/lib/db';
import type { ExtractionResult } from '@/lib/validation/extraction-schema';

export async function createKnowledgeStructure(
  extraction: ExtractionResult,
  userId: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create or find Subject
    const subject = await tx.subject.upsert({
      where: { name: extraction.knowledgeTree.subject.name },
      update: {},
      create: {
        name: extraction.knowledgeTree.subject.name,
        slug: extraction.knowledgeTree.subject.slug,
      },
    });

    // 2. Create Course
    const course = await tx.course.create({
      data: {
        code: extraction.knowledgeTree.courses[0].code || `COURSE-${Date.now()}`,
        name: extraction.knowledgeTree.courses[0].name,
        subjectId: subject.id,
        syllabusUrl: null,
      },
    });

    // 3. Create KnowledgeNodes (hierarchical, topological order)
    const nodeMap = new Map<string, string>(); // path → nodeId
    const sortedNodes = topologicalSort(extraction.knowledgeTree);
    
    for (const node of sortedNodes) {
      const parentId = node.parentPath ? nodeMap.get(node.parentPath) : null;
      
      const createdNode = await tx.knowledgeNode.create({
        data: {
          subjectId: subject.id,
          parentId,
          name: node.name,
          slug: node.slug,
          order: node.order,
          metadata: node.metadata || {},
        },
      });
      
      nodeMap.set(node.path, createdNode.id);
    }

    // 4. Create SyllabusConcepts + LOCKED Flashcards
    const flashcardIds: string[] = [];
    
    for (const concept of extraction.atomicConcepts) {
      // Create syllabus concept
      const syllabusConcept = await tx.syllabusConcept.create({
        data: {
          courseId: course.id,
          conceptText: concept.conceptText,
          category: concept.category,
          importance: concept.importance,
          order: concept.order,
          language: extraction.extractionMetadata.detectedLanguage,
        },
      });

      // Link concept to knowledge node
      const nodeId = nodeMap.get(concept.parentPath);
      if (nodeId) {
        await tx.nodeSyllabusConcept.create({
          data: {
            nodeId,
            syllabusConceptId: syllabusConcept.id,
          },
        });
      }

      // Create LOCKED flashcard (question only, no answer)
      const flashcard = await tx.flashcard.create({
        data: {
          syllabusConceptId: syllabusConcept.id,
          conceptMatchId: null,        // Not matched yet
          userId,
          question: concept.flashcard.question,
          answer: null,                // 🔒 LOCKED: No answer yet
          questionTranslation: null,
          answerTranslation: null,
          language: extraction.extractionMetadata.detectedLanguage,
          difficulty: concept.flashcard.difficulty,
          hints: concept.flashcard.hints || [],
          state: 'locked',
          unlockedAt: null,
          unlockedBy: null,
          unlockProgress: 0.0,
          relatedContentIds: [],
          nextReviewAt: null,          // Can't review until unlocked
        },
      });
      
      flashcardIds.push(flashcard.id);
    }

    // 5. Enroll user in course
    await tx.userCourse.create({
      data: {
        userId,
        courseId: course.id,
        isActive: true,
        learnedCount: 0,
      },
    });

    // 6. Initialize or update user stats
    await tx.userStats.upsert({
      where: { userId },
      update: {
        totalLocked: { increment: flashcardIds.length },
      },
      create: {
        userId,
        totalUnlocks: 0,
        totalLocked: flashcardIds.length,
        totalMastered: 0,
        unlockRate: 0.0,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    return {
      subject,
      course,
      flashcardsCreated: flashcardIds.length,
      state: 'locked' as const,
    };
  });
}

// Helper: Topological sort for hierarchical nodes
function topologicalSort(knowledgeTree: any): any[] {
  const nodes: any[] = [];
  
  // Add subject (root)
  nodes.push({
    name: knowledgeTree.subject.name,
    slug: knowledgeTree.subject.slug,
    path: knowledgeTree.subject.name,
    parentPath: null,
    order: 0,
    metadata: knowledgeTree.subject.metadata,
  });
  
  // Add courses and subdirectories recursively
  for (const course of knowledgeTree.courses) {
    nodes.push({
      name: course.name,
      slug: course.slug,
      path: course.path,
      parentPath: knowledgeTree.subject.name,
      order: course.order,
      metadata: course.metadata,
    });
    
    if (course.subdirectories) {
      for (const subdir of course.subdirectories) {
        addNodeRecursive(subdir, nodes);
      }
    }
  }
  
  return nodes;
}

function addNodeRecursive(node: any, nodes: any[]) {
  nodes.push({
    name: node.name,
    slug: node.slug,
    path: node.path,
    parentPath: node.path.split('/').slice(0, -1).join('/'),
    order: node.order,
    metadata: node.metadata,
  });
  
  if (node.children) {
    for (const child of node.children) {
      if (child.nodeType === 'subdirectory') {
        addNodeRecursive(child, nodes);
      }
    }
  }
}
```

**Validation:**
- ✅ Locked flashcards created with questions only
- ✅ UserStats initialized
- ✅ Transaction succeeds or rolls back completely

---

### **STEP 5: Create Answer Unlock Service**

**Duration:** 1.5 hours  
**Files:** `src/features/flashcards/unlock-service.ts`

#### 5.1 Create Unlock Service

```typescript
import { prisma } from '@/lib/db';
import { openai } from '@/lib/ai/openai';
import type { ConceptMatch } from '@prisma/client';

interface UnlockResult {
  flashcardId: string;
  question: string;
  answer: string;
  conceptText: string;
  unlockedAt: Date;
  source: string;
}

export async function unlockFlashcardAnswers(
  matches: ConceptMatch[],
  contentJobId: string,
  userId: string
): Promise<UnlockResult[]> {
  const unlocked: UnlockResult[] = [];

  for (const match of matches) {
    // Only unlock for high-confidence matches
    if (match.confidence < 0.8) continue;

    // Find locked flashcard for this syllabus concept
    const flashcard = await prisma.flashcard.findFirst({
      where: {
        syllabusConceptId: match.syllabusConceptId,
        userId,
        state: 'locked',
      },
      include: {
        syllabusConcept: true,
      },
    });

    if (!flashcard) continue;

    // Get extracted concept details
    const extractedConcept = await prisma.concept.findUnique({
      where: { id: match.extractedConceptId },
    });

    if (!extractedConcept) continue;

    // Generate answer from matched content
    const answer = await generateAnswerFromContent(
      extractedConcept,
      flashcard.syllabusConcept,
      match.rationale || ''
    );

    // UNLOCK: Add answer and update state
    const unlockedFlashcard = await prisma.flashcard.update({
      where: { id: flashcard.id },
      data: {
        answer,
        conceptMatchId: match.id,
        state: 'unlocked',
        unlockedAt: new Date(),
        unlockedBy: contentJobId,
        nextReviewAt: new Date(), // Ready for immediate review
      },
    });

    // Create unlock event (for analytics)
    await prisma.unlockEvent.create({
      data: {
        userId,
        flashcardId: unlockedFlashcard.id,
        contentJobId,
        conceptMatchId: match.id,
        confidence: match.confidence,
      },
    });

    // Get content job details for source attribution
    const contentJob = await prisma.contentJob.findUnique({
      where: { id: contentJobId },
      select: { url: true, fileName: true, contentType: true },
    });

    unlocked.push({
      flashcardId: unlockedFlashcard.id,
      question: flashcard.question,
      answer,
      conceptText: flashcard.syllabusConcept.conceptText,
      unlockedAt: unlockedFlashcard.unlockedAt!,
      source: contentJob?.fileName || contentJob?.url || 'Unknown source',
    });
  }

  // Update user stats
  if (unlocked.length > 0) {
    await updateUserStatsAfterUnlock(userId, unlocked.length);
  }

  return unlocked;
}

async function generateAnswerFromContent(
  extractedConcept: any,
  syllabusConcept: any,
  matchRationale: string
): Promise<string> {
  const prompt = `You are generating a flashcard answer based on content the student consumed.

QUESTION CONTEXT (from syllabus):
- Concept: ${syllabusConcept.conceptText}
- Category: ${syllabusConcept.category || 'N/A'}
- Importance: ${syllabusConcept.importance || 'N/A'}

CONTENT CONTEXT (from video/PDF):
- Extracted concept: ${extractedConcept.name}
- Definition: ${extractedConcept.definition}
- Context: ${extractedConcept.context || 'N/A'}

MATCHING RATIONALE:
${matchRationale}

Generate a concise, accurate answer (1-3 sentences) that:
1. Directly answers the question about the syllabus concept
2. Incorporates specific details from the content consumed
3. Includes a concrete example if available in the content
4. Is suitable for flashcard review (clear and memorable)

ANSWER:`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 200,
  });

  return response.choices[0].message.content?.trim() || 'Answer generation failed';
}

async function updateUserStatsAfterUnlock(userId: string, unlockCount: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    // Create stats if not exists
    await prisma.userStats.create({
      data: {
        userId,
        totalUnlocks: unlockCount,
        totalLocked: 0,
        totalMastered: 0,
        unlockRate: 0.0,
        currentStreak: 1,
        longestStreak: 1,
        lastUnlockDate: today,
        firstUnlockAt: new Date(),
      },
    });
    return;
  }

  // Check if last unlock was yesterday (streak continues)
  const lastUnlock = stats.lastUnlockDate;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = stats.currentStreak;
  if (!lastUnlock || lastUnlock < yesterday) {
    // Streak broken, reset to 1
    newStreak = 1;
  } else if (lastUnlock.getTime() === yesterday.getTime()) {
    // Streak continues
    newStreak = stats.currentStreak + 1;
  }
  // If lastUnlock === today, don't increment (already counted today)

  const newLongestStreak = Math.max(stats.longestStreak, newStreak);

  // Calculate new unlock rate
  const totalFlashcards = await prisma.flashcard.count({
    where: { userId },
  });
  const totalUnlocked = stats.totalUnlocks + unlockCount;
  const unlockRate = totalFlashcards > 0 ? totalUnlocked / totalFlashcards : 0;

  // Update stats
  await prisma.userStats.update({
    where: { userId },
    data: {
      totalUnlocks: { increment: unlockCount },
      totalLocked: { decrement: unlockCount },
      unlockRate,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastUnlockDate: today,
      firstUnlockAt: stats.firstUnlockAt || new Date(),
    },
  });

  // Check milestones
  if (totalUnlocked === 10 && !stats.milestone10) {
    await prisma.userStats.update({
      where: { userId },
      data: { milestone10: new Date() },
    });
  }
  if (totalUnlocked === 50 && !stats.milestone50) {
    await prisma.userStats.update({
      where: { userId },
      data: { milestone50: new Date() },
    });
  }
  if (totalUnlocked === 100 && !stats.milestone100) {
    await prisma.userStats.update({
      where: { userId },
      data: { milestone100: new Date() },
    });
  }
}
```

**Validation:**
- ✅ Answers generated from content context
- ✅ Flashcards unlocked correctly
- ✅ User stats updated
- ✅ Unlock events tracked

---

### **STEP 6: Integrate Unlock Service into Content Processing**

**Duration:** 30 minutes  
**Files:** `src/features/matching/concept-matcher.ts`, `app/api/process-content/route.ts`

#### 6.1 Update Concept Matcher to Trigger Unlocks

```typescript
// src/features/matching/concept-matcher.ts

import { unlockFlashcardAnswers } from '@/features/flashcards/unlock-service';

export async function matchConceptsToSyllabus(
  extractedConcepts: Concept[],
  courseId: string,
  contentJobId: string,
  userId: string
) {
  // ... existing matching logic ...
  
  const matches = await performHybridMatching(extractedConcepts, syllabusConcepts);
  
  // Write matches to database
  await writeConceptMatches(matches, contentJobId, userId);
  
  // 🆕 UNLOCK FLASHCARDS for high-confidence matches
  const unlocked = await unlockFlashcardAnswers(matches, contentJobId, userId);
  
  return {
    matches,
    unlocked, // Return unlock results for notification
  };
}
```

#### 6.2 Update Content Processing API

```typescript
// app/api/process-content/route.ts

export async function POST(req: Request) {
  const { contentJobId, userId } = await req.json();
  
  // ... existing content processing ...
  
  // Extract concepts
  const concepts = await extractConcepts(extractedText);
  
  // Match to syllabus + unlock flashcards
  const { matches, unlocked } = await matchConceptsToSyllabus(
    concepts,
    courseId,
    contentJobId,
    userId
  );
  
  return NextResponse.json({
    success: true,
    conceptsExtracted: concepts.length,
    conceptsMatched: matches.length,
    flashcardsUnlocked: unlocked.length, // 🆕 Return unlock count
    unlocked, // 🆕 Return unlock details for notification
  });
}
```

**Validation:**
- ✅ Unlocks triggered automatically after matching
- ✅ Unlock results returned to client
- ✅ No breaking changes to existing flow

---

### **STEP 7: Create UI Components (Locked/Unlocked States)**

**Duration:** 2 hours  
**Files:** `src/components/flashcards/`, `app/[locale]/dashboard/courses/[courseId]/review/`

#### 7.1 Create FlashcardCard Component

```typescript
// src/components/flashcards/flashcard-card.tsx

import { Lock, Unlock, Star, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FlashcardCardProps {
  flashcard: {
    id: string;
    question: string;
    answer: string | null;
    state: 'locked' | 'unlocked' | 'mastered';
    difficulty: string;
    hints?: string[];
    unlockedAt?: Date | null;
    unlockedBy?: string | null;
    timesReviewed: number;
    timesCorrect: number;
  };
  onReview?: () => void;
  showAnswer?: boolean;
}

export function FlashcardCard({ flashcard, onReview, showAnswer = false }: FlashcardCardProps) {
  const isLocked = flashcard.state === 'locked';
  const isMastered = flashcard.state === 'mastered';

  return (
    <Card className={`relative ${isLocked ? 'border-orange-200' : isMastered ? 'border-green-200' : 'border-blue-200'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{flashcard.question}</CardTitle>
          <Badge variant={isLocked ? 'secondary' : isMastered ? 'default' : 'outline'}>
            {isLocked && <Lock className="w-3 h-3 mr-1" />}
            {!isLocked && !isMastered && <Unlock className="w-3 h-3 mr-1" />}
            {isMastered && <Star className="w-3 h-3 mr-1" />}
            {flashcard.state}
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit">
          {flashcard.difficulty}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLocked ? (
          <LockedContent hints={flashcard.hints} />
        ) : (
          <UnlockedContent
            answer={flashcard.answer!}
            unlockedAt={flashcard.unlockedAt}
            unlockedBy={flashcard.unlockedBy}
            showAnswer={showAnswer}
            timesReviewed={flashcard.timesReviewed}
            timesCorrect={flashcard.timesCorrect}
            isMastered={isMastered}
          />
        )}

        {!isLocked && onReview && (
          <Button onClick={onReview} className="w-full">
            {isMastered ? 'Review again' : 'Start reviewing'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function LockedContent({ hints }: { hints?: string[] }) {
  return (
    <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg space-y-3">
      <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
        <Lock className="w-5 h-5" />
        <p className="font-medium">Answer locked</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Watch content that covers this concept to unlock the answer
      </p>
      
      {hints && hints.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="w-4 h-4" />
            <span>Hints:</span>
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {hints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UnlockedContent({
  answer,
  unlockedAt,
  unlockedBy,
  showAnswer,
  timesReviewed,
  timesCorrect,
  isMastered,
}: {
  answer: string;
  unlockedAt?: Date | null;
  unlockedBy?: string | null;
  showAnswer: boolean;
  timesReviewed: number;
  timesCorrect: number;
  isMastered: boolean;
}) {
  return (
    <div className="space-y-3">
      {unlockedAt && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Unlock className="w-4 h-4" />
          <span>Unlocked {new Date(unlockedAt).toLocaleDateString()}</span>
        </div>
      )}

      {showAnswer && (
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Answer:</p>
          <p className="text-sm">{answer}</p>
        </div>
      )}

      {timesReviewed > 0 && (
        <div className="text-xs text-muted-foreground">
          Reviewed: {timesReviewed} times • Correct: {timesCorrect}/{timesReviewed} (
          {Math.round((timesCorrect / timesReviewed) * 100)}%)
          {isMastered && ' • ⭐ Mastered'}
        </div>
      )}
    </div>
  );
}
```

#### 7.2 Create FlashcardList Component

```typescript
// src/components/flashcards/flashcard-list.tsx

import { FlashcardCard } from './flashcard-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlashcardListProps {
  flashcards: any[];
  onReview: (flashcardId: string) => void;
}

export function FlashcardList({ flashcards, onReview }: FlashcardListProps) {
  const locked = flashcards.filter(f => f.state === 'locked');
  const unlocked = flashcards.filter(f => f.state === 'unlocked');
  const mastered = flashcards.filter(f => f.state === 'mastered');

  return (
    <Tabs defaultValue="unlocked" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="unlocked">
          Unlocked ({unlocked.length})
        </TabsTrigger>
        <TabsTrigger value="locked">
          Locked ({locked.length})
        </TabsTrigger>
        <TabsTrigger value="mastered">
          Mastered ({mastered.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="unlocked" className="space-y-4">
        {unlocked.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No unlocked flashcards yet. Watch content to unlock answers!
          </p>
        ) : (
          unlocked.map(flashcard => (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
              onReview={() => onReview(flashcard.id)}
              showAnswer={false}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="locked" className="space-y-4">
        {locked.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            All flashcards unlocked! 🎉
          </p>
        ) : (
          locked.map(flashcard => (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="mastered" className="space-y-4">
        {mastered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No mastered flashcards yet. Keep reviewing!
          </p>
        ) : (
          mastered.map(flashcard => (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
              onReview={() => onReview(flashcard.id)}
              showAnswer={true}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
```

**Validation:**
- ✅ Locked state shows question + hints
- ✅ Unlocked state shows answer
- ✅ Mastered state shows stats
- ✅ Tabs work correctly

---

### **STEP 8: Create Progress Dashboard (Gamification)**

**Duration:** 2 hours  
**Files:** `src/components/dashboard/unlock-progress.tsx`, `app/[locale]/dashboard/page.tsx`

#### 8.1 Create UnlockProgress Component

```typescript
// src/components/dashboard/unlock-progress.tsx

import { Lock, Unlock, Star, TrendingUp, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UnlockProgressProps {
  stats: {
    totalUnlocks: number;
    totalLocked: number;
    totalMastered: number;
    unlockRate: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export function UnlockProgress({ stats }: UnlockProgressProps) {
  const total = stats.totalUnlocks + stats.totalLocked + stats.totalMastered;
  const unlockPercentage = total > 0 ? (stats.totalUnlocks / total) * 100 : 0;
  const masteredPercentage = total > 0 ? (stats.totalMastered / total) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Concepts</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <Progress value={unlockPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(unlockPercentage)}% unlocked
          </p>
        </CardContent>
      </Card>

      {/* Locked */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Locked</CardTitle>
          <Lock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.totalLocked}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Watch content to unlock
          </p>
        </CardContent>
      </Card>

      {/* Unlocked */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unlocked</CardTitle>
          <Unlock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.totalUnlocks}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Ready to review
          </p>
        </CardContent>
      </Card>

      {/* Mastered */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mastered</CardTitle>
          <Star className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.totalMastered}</div>
          <Progress value={masteredPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.round(masteredPercentage)}% mastered
          </p>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unlock Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-4">
            <div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">Current streak</p>
            </div>
            <div>
              <div className="text-xl font-semibold text-muted-foreground">{stats.longestStreak}</div>
              <p className="text-xs text-muted-foreground">Longest streak</p>
            </div>
          </div>
          {stats.currentStreak >= 3 && (
            <Badge variant="default" className="mt-2">
              🔥 On fire! Keep it up!
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 8.2 Create ContentRecommendations Component

```typescript
// src/components/dashboard/content-recommendations.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Youtube, FileText, ExternalLink } from 'lucide-react';

interface ContentRecommendation {
  id: string;
  title: string;
  type: 'youtube' | 'pdf' | 'url';
  potentialUnlocks: number;
  concepts: string[];
}

interface ContentRecommendationsProps {
  recommendations: ContentRecommendation[];
  onSelect: (contentId: string) => void;
}

export function ContentRecommendations({ recommendations, onSelect }: ContentRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Content</CardTitle>
        <p className="text-sm text-muted-foreground">
          Watch these to unlock the most answers
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map(rec => (
          <div key={rec.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {rec.type === 'youtube' && <Youtube className="w-4 h-4 text-red-500" />}
                {rec.type === 'pdf' && <FileText className="w-4 h-4 text-blue-500" />}
                {rec.type === 'url' && <ExternalLink className="w-4 h-4 text-green-500" />}
                <h4 className="font-medium">{rec.title}</h4>
              </div>
              
              <Badge variant="secondary">
                🔓 Unlocks {rec.potentialUnlocks} answer{rec.potentialUnlocks > 1 ? 's' : ''}
              </Badge>
              
              <div className="flex flex-wrap gap-1">
                {rec.concepts.slice(0, 3).map((concept, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {concept}
                  </Badge>
                ))}
                {rec.concepts.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{rec.concepts.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <Button onClick={() => onSelect(rec.id)} size="sm">
              Process
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

**Validation:**
- ✅ Progress cards show correct counts
- ✅ Streak tracking works
- ✅ Content recommendations display
- ✅ Responsive layout

---

### **STEP 9: Create Unlock Notification System**

**Duration:** 1 hour  
**Files:** `src/components/notifications/unlock-toast.tsx`, `src/lib/notifications.ts`

#### 9.1 Create Unlock Toast Component

```typescript
// src/components/notifications/unlock-toast.tsx

import { toast } from 'sonner';
import { Unlock, PartyPopper } from 'lucide-react';

export function showUnlockNotification(unlocked: {
  flashcardId: string;
  question: string;
  conceptText: string;
  source: string;
}[]) {
  if (unlocked.length === 0) return;

  const count = unlocked.length;
  const concepts = unlocked.map(u => u.conceptText).join(', ');

  toast.success(
    <div className="flex items-start gap-3">
      <PartyPopper className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold">
          🎉 Unlocked {count} answer{count > 1 ? 's' : ''}!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {concepts}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          From: {unlocked[0].source}
        </p>
      </div>
    </div>,
    {
      duration: 5000,
      action: {
        label: 'Review now',
        onClick: () => {
          window.location.href = '/dashboard/review';
        },
      },
    }
  );
}

export function showMilestoneNotification(milestone: number) {
  const messages = {
    10: '🎯 First 10 unlocks!',
    50: '🚀 50 unlocks milestone!',
    100: '🏆 100 unlocks achieved!',
  };

  toast.success(messages[milestone as keyof typeof messages] || `${milestone} unlocks!`, {
    duration: 7000,
  });
}

export function showStreakNotification(streak: number) {
  if (streak < 3) return;

  toast.success(
    <div className="flex items-center gap-2">
      <span className="text-2xl">🔥</span>
      <div>
        <p className="font-semibold">{streak}-day streak!</p>
        <p className="text-sm text-muted-foreground">Keep unlocking daily!</p>
      </div>
    </div>,
    { duration: 4000 }
  );
}
```

#### 9.2 Integrate Notifications into Content Processing

```typescript
// app/api/process-content/route.ts

import { showUnlockNotification, showMilestoneNotification } from '@/components/notifications/unlock-toast';

export async function POST(req: Request) {
  // ... existing processing ...
  
  const { matches, unlocked } = await matchConceptsToSyllabus(...);
  
  // Return unlock data for client-side notification
  return NextResponse.json({
    success: true,
    conceptsExtracted: concepts.length,
    conceptsMatched: matches.length,
    flashcardsUnlocked: unlocked.length,
    unlocked, // Client will show notification
  });
}
```

```typescript
// Client-side (content submission form)

async function handleSubmit() {
  const response = await fetch('/api/process-content', {
    method: 'POST',
    body: JSON.stringify({ contentJobId, userId }),
  });
  
  const data = await response.json();
  
  if (data.unlocked && data.unlocked.length > 0) {
    showUnlockNotification(data.unlocked);
  }
}
```

**Validation:**
- ✅ Toast notifications appear on unlock
- ✅ Milestone notifications trigger
- ✅ Streak notifications show
- ✅ Notifications are dismissible

---

### **STEP 10: Update API Routes**

**Duration:** 1 hour  
**Files:** `app/api/flashcards/`, `app/api/user/stats/`

#### 10.1 Create Flashcards API

```typescript
// app/api/flashcards/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('courseId');
  const state = searchParams.get('state'); // locked | unlocked | mastered

  const where: any = { userId: session.user.id };
  if (courseId) {
    where.syllabusConcept = { courseId };
  }
  if (state) {
    where.state = state;
  }

  const flashcards = await prisma.flashcard.findMany({
    where,
    include: {
      syllabusConcept: true,
      conceptMatch: {
        include: {
          extractedConcept: true,
        },
      },
    },
    orderBy: [
      { state: 'asc' }, // locked first
      { createdAt: 'desc' },
    ],
  });

  return NextResponse.json({ flashcards });
}
```

#### 10.2 Create User Stats API

```typescript
// app/api/user/stats/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await prisma.userStats.findUnique({
    where: { userId: session.user.id },
  });

  if (!stats) {
    // Initialize stats if not exists
    const newStats = await prisma.userStats.create({
      data: {
        userId: session.user.id,
        totalUnlocks: 0,
        totalLocked: 0,
        totalMastered: 0,
        unlockRate: 0.0,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
    return NextResponse.json({ stats: newStats });
  }

  return NextResponse.json({ stats });
}
```

**Validation:**
- ✅ API returns flashcards by state
- ✅ Stats API returns user progress
- ✅ Authentication works
- ✅ Filtering works

---

### **STEP 11: Update Dashboard Pages**

**Duration:** 1.5 hours  
**Files:** `app/[locale]/dashboard/page.tsx`, `app/[locale]/dashboard/courses/[courseId]/page.tsx`

#### 11.1 Update Main Dashboard

```typescript
// app/[locale]/dashboard/page.tsx

import { UnlockProgress } from '@/components/dashboard/unlock-progress';
import { ContentRecommendations } from '@/components/dashboard/content-recommendations';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/signin');

  // Fetch user stats
  const stats = await prisma.userStats.findUnique({
    where: { userId: session.user.id },
  });

  // Fetch content recommendations (simplified)
  const lockedFlashcards = await prisma.flashcard.findMany({
    where: {
      userId: session.user.id,
      state: 'locked',
    },
    include: {
      syllabusConcept: true,
    },
    take: 10,
  });

  // Generate recommendations based on locked concepts
  const recommendations = await generateContentRecommendations(lockedFlashcards);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track your learning progress</p>
      </div>

      {stats && <UnlockProgress stats={stats} />}

      {recommendations.length > 0 && (
        <ContentRecommendations
          recommendations={recommendations}
          onSelect={(id) => {
            // Handle content selection
          }}
        />
      )}

      {/* Existing dashboard content */}
    </div>
  );
}
```

#### 11.2 Update Course Page

```typescript
// app/[locale]/dashboard/courses/[courseId]/page.tsx

import { FlashcardList } from '@/components/flashcards/flashcard-list';

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/signin');

  const flashcards = await prisma.flashcard.findMany({
    where: {
      userId: session.user.id,
      syllabusConcept: {
        courseId: params.courseId,
      },
    },
    include: {
      syllabusConcept: true,
    },
    orderBy: [
      { state: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Flashcards</h1>
        <p className="text-muted-foreground">
          {flashcards.filter(f => f.state === 'locked').length} locked •{' '}
          {flashcards.filter(f => f.state === 'unlocked').length} unlocked •{' '}
          {flashcards.filter(f => f.state === 'mastered').length} mastered
        </p>
      </div>

      <FlashcardList
        flashcards={flashcards}
        onReview={(id) => {
          // Navigate to review page
          window.location.href = `/dashboard/courses/${params.courseId}/review?flashcardId=${id}`;
        }}
      />
    </div>
  );
}
```

**Validation:**
- ✅ Dashboard shows unlock progress
- ✅ Course page shows flashcard list
- ✅ Tabs work correctly
- ✅ Navigation works

---

### **STEP 12: Testing & Validation**

**Duration:** 2 hours

#### 12.1 Manual Testing Checklist

**Locked Flashcard Creation:**
- [ ] Add learning goal → Flashcards created with questions only
- [ ] Verify `answer` field is NULL
- [ ] Verify `state` is 'locked'
- [ ] Verify `nextReviewAt` is NULL
- [ ] Verify UserStats initialized

**Answer Unlocking:**
- [ ] Process video/PDF → Concepts matched
- [ ] High-confidence matches (≥80%) unlock flashcards
- [ ] Verify `answer` field populated
- [ ] Verify `state` changed to 'unlocked'
- [ ] Verify `unlockedAt` timestamp set
- [ ] Verify `nextReviewAt` set to now
- [ ] Verify UnlockEvent created

**User Stats:**
- [ ] Unlock increments `totalUnlocks`
- [ ] Unlock decrements `totalLocked`
- [ ] Unlock rate calculated correctly
- [ ] Streak increments on consecutive days
- [ ] Streak resets after gap
- [ ] Milestones trigger at 10, 50, 100

**UI Components:**
- [ ] Locked card shows question + hints
- [ ] Locked card shows "Watch content to unlock"
- [ ] Unlocked card shows answer
- [ ] Unlocked card shows unlock date + source
- [ ] Mastered card shows stats
- [ ] Tabs filter correctly
- [ ] Progress cards show correct counts

**Notifications:**
- [ ] Unlock toast appears with correct count
- [ ] Milestone toast appears at 10, 50, 100
- [ ] Streak toast appears at 3+ days
- [ ] Toasts are dismissible
- [ ] "Review now" button works

**Dashboard:**
- [ ] Progress cards show correct data
- [ ] Streak tracking works
- [ ] Content recommendations appear
- [ ] Recommendations show potential unlocks

#### 12.2 Edge Cases

- [ ] No matching content → Flashcard stays locked
- [ ] Low confidence match (<80%) → No unlock
- [ ] Duplicate unlock attempt → Idempotent (no error)
- [ ] User with no stats → Stats created automatically
- [ ] Empty hints array → No hints section shown
- [ ] Very long question → Truncated or wrapped correctly

#### 12.3 Performance

- [ ] Unlock service handles 50+ matches in <5s
- [ ] Dashboard loads in <2s
- [ ] Flashcard list renders 100+ cards smoothly
- [ ] No N+1 queries (check Prisma logs)

---

## 📊 Success Metrics

### Phase 1 (Core Functionality)
- ✅ Locked flashcards created successfully
- ✅ Answers unlock on content match
- ✅ UI shows locked/unlocked states
- ✅ Notifications work

### Phase 2 (Gamification)
- ✅ Progress tracking accurate
- ✅ Streaks calculated correctly
- ✅ Content recommendations relevant
- ✅ Milestones trigger

### User Engagement (Post-Launch)
- **Target:** 70%+ users unlock at least 1 answer within 24h
- **Target:** 50%+ users maintain 3+ day streak
- **Target:** 80%+ users review unlocked flashcards within 48h
- **Target:** Average 3+ unlocks per content processed

---

## 🚀 Deployment Checklist

- [ ] Run database migration in production
- [ ] Verify existing data preserved
- [ ] Test with real user account
- [ ] Monitor error logs for 24h
- [ ] Check unlock notification delivery
- [ ] Verify stats calculation accuracy
- [ ] Test on mobile devices
- [ ] Verify performance (no slowdowns)

---

## 📝 Documentation Updates

After implementation, update:
- [ ] `README.md` - Add flashcard unlock feature
- [ ] `CHANGELOG.md` - Document changes
- [ ] `docs/architecture.md` - Update data flow
- [ ] `docs/data/schema.yml` - Add new models
- [ ] `docs/data/erd.md` - Update ERD
- [ ] Create ADR for flashcard unlock system

---

## 🎯 Timeline Summary

| Step | Duration | Cumulative |
|------|----------|------------|
| 1. Database Schema | 1h | 1h |
| 2. Update Prompt | 0.5h | 1.5h |
| 3. Zod Schema | 0.3h | 1.8h |
| 4. Knowledge Structure | 1h | 2.8h |
| 5. Unlock Service | 1.5h | 4.3h |
| 6. Integration | 0.5h | 4.8h |
| 7. UI Components | 2h | 6.8h |
| 8. Progress Dashboard | 2h | 8.8h |
| 9. Notifications | 1h | 9.8h |
| 10. API Routes | 1h | 10.8h |
| 11. Dashboard Pages | 1.5h | 12.3h |
| 12. Testing | 2h | 14.3h |

**Total: ~14-15 hours (2 days of focused work)**

---

## 🔄 Rollback Plan

If issues arise:

1. **Database:** Migration is additive (nullable fields), safe to rollback
2. **Code:** Feature flag to disable unlock system
3. **Data:** Existing flashcards unaffected (answer field nullable)

```typescript
// Feature flag
const ENABLE_FLASHCARD_UNLOCK = process.env.ENABLE_FLASHCARD_UNLOCK === 'true';

if (ENABLE_FLASHCARD_UNLOCK) {
  await unlockFlashcardAnswers(...);
}
```

---

## ✅ Definition of Done

- [ ] All 12 steps completed
- [ ] Manual testing checklist passed
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Database migration successful
- [ ] UI responsive on mobile
- [ ] Notifications working
- [ ] Stats accurate
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to production

---

**Ready to implement!** 🚀

Start with Step 1 (Database Schema) and work sequentially. Each step builds on the previous one.

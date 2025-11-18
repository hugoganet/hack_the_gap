/**
 * Database transaction logic for creating hierarchical knowledge structures
 * Creates Subject → Course → KnowledgeNodes → SyllabusConcepts → UserCourse
 */

import type { PrismaClient } from "@/generated/prisma";
import type { Prisma } from "@/generated/prisma";
import type {
  HierarchicalExtractionResponse,
  NodeChild,
  Subdirectory,
} from "@/types/hierarchical-extraction";

/**
 * Result of creating a knowledge structure
 */
export type KnowledgeStructureResult = {
  courseId: string;
  subjectId: string;
  subjectName: string;
  courseName: string;
  courseCode: string;
  totalConcepts: number;
  treeDepth: number;
  extractionConfidence: number;
  inputType: string;
  requiresReview: boolean;
};

/**
 * Create complete knowledge structure from AI extraction
 * All operations wrapped in a transaction (rollback on failure)
 */
export async function createKnowledgeStructure(
  prisma: PrismaClient,
  userId: string,
  extraction: HierarchicalExtractionResponse
): Promise<KnowledgeStructureResult> {
  return prisma.$transaction(async (tx) => {
    const { knowledgeTree, atomicConcepts, extractionMetadata, qualityChecks } =
      extraction;

    // 1. Create or get Subject
    const subject = await tx.subject.upsert({
      where: { name: knowledgeTree.subject.name },
      create: {
        name: knowledgeTree.subject.name,
      },
      update: {},
    });

    // 2. Create Course (first course from the tree)
    const courseData = knowledgeTree.courses[0];
    if (typeof courseData === "undefined") {
      throw new Error("No course data in extraction");
    }

    const course = await tx.course.create({
      data: {
        code: courseData.code ?? generateCourseCode(courseData.name),
        name: courseData.name,
        subjectId: subject.id,
        syllabusUrl: null,
      },
    });

    // 3. Create KnowledgeNodes (topological order: parents before children)
    const nodePathMap = new Map<string, string>(); // path -> nodeId
    const usedSlugs = new Set<string>(); // Track used slugs to prevent duplicates

    // Create all nodes SEQUENTIALLY to avoid duplicate slug conflicts
    for (const subdirectory of courseData.subdirectories) {
      await createKnowledgeNodesRecursive(
        tx,
        subject.id,
        subdirectory,
        null, // parentId for top-level
        nodePathMap,
        usedSlugs
      );
    }

    // 4. Create SyllabusConcepts + LOCKED Flashcards
    console.log(`Creating ${atomicConcepts.length} syllabus concepts...`);
    const conceptIdMap = new Map<string, string>(); // path -> conceptId
    const flashcardIds: string[] = [];
    
    // Extract language from extraction metadata (default to 'en' if not provided)
    const detectedLanguage = extractionMetadata.detectedLanguage ?? "en";
    console.log(`Detected syllabus language: ${detectedLanguage}`);

    // Create concepts and flashcards sequentially to maintain order
    for (let index = 0; index < atomicConcepts.length; index++) {
      const concept = atomicConcepts[index];
      if (!concept) continue;

      console.log(`Creating concept ${index + 1}/${atomicConcepts.length}: ${concept.conceptText}`);
      
      // Create syllabus concept
      const syllabusConcept = await tx.syllabusConcept.create({
        data: {
          courseId: course.id,
          conceptText: concept.conceptText,
          category: concept.category,
          importance: concept.importance,
          order: concept.order,
          language: detectedLanguage,
        },
      });

      conceptIdMap.set(concept.path, syllabusConcept.id);

      // Create LOCKED flashcard (question only, no answer)
      console.log(`  Creating locked flashcard for: ${concept.conceptText}`);
      const flashcard = await tx.flashcard.create({
        data: {
          syllabusConceptId: syllabusConcept.id,
          conceptMatchId: null, // Not matched yet
          userId,
          question: concept.flashcard.question,
          answer: null, // 🔒 LOCKED: No answer yet
          questionTranslation: null,
          answerTranslation: null,
          language: detectedLanguage,
          difficulty: concept.flashcard.difficulty,
          hints: concept.flashcard.hints ?? [],
          state: "locked",
          unlockedAt: null,
          unlockedBy: null,
          unlockProgress: 0.0,
          relatedContentIds: [],
          nextReviewAt: null, // Can't review until unlocked
        },
      });

      flashcardIds.push(flashcard.id);
      console.log(`  ✓ Created locked flashcard: ${flashcard.id}`);
    }

    console.log(`Created ${conceptIdMap.size} syllabus concepts and ${flashcardIds.length} locked flashcards successfully`);

    // 5. Create NodeSyllabusConcept (link concepts to nodes)
    console.log(`Linking ${atomicConcepts.length} concepts to nodes...`);
    
    const linkResults = await Promise.all(
      atomicConcepts.map(async (concept, index) => {
        const nodeId = nodePathMap.get(concept.parentPath);
        const conceptId = conceptIdMap.get(concept.path);

        console.log(`Linking concept ${index + 1}: ${concept.conceptText}`);
        console.log(`  Parent path: ${concept.parentPath}`);
        console.log(`  Node ID: ${nodeId ? "found" : "NOT FOUND"}`);
        console.log(`  Concept ID: ${conceptId ? "found" : "NOT FOUND"}`);

        if (!nodeId) {
          console.error(`ERROR: Node not found for parent path: ${concept.parentPath}`);
          console.error(`Available node paths:`, Array.from(nodePathMap.keys()));
          throw new Error(
            `Node not found for parent path: ${concept.parentPath}`
          );
        }

        if (!conceptId) {
          console.error(`ERROR: Concept not found for path: ${concept.path}`);
          throw new Error(`Concept not found for path: ${concept.path}`);
        }

        return tx.nodeSyllabusConcept.create({
          data: {
            nodeId,
            syllabusConceptId: conceptId,
            addedByUserId: userId,
          },
        });
      })
    );

    console.log(`Successfully linked ${linkResults.length} concepts to nodes`);

    // 6. Create UserCourse (enrollment)
    await tx.userCourse.create({
      data: {
        userId,
        courseId: course.id,
        isActive: true,
        learnedCount: 0,
      },
    });

    // 7. Initialize or update UserStats
    console.log(`Initializing user stats for ${flashcardIds.length} locked flashcards...`);
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

    console.log(`✓ Knowledge structure created successfully`);
    console.log(`  - Subject: ${subject.name}`);
    console.log(`  - Course: ${course.name} (${course.code})`);
    console.log(`  - Concepts: ${conceptIdMap.size}`);
    console.log(`  - Locked flashcards: ${flashcardIds.length}`);
    console.log(`  - Tree depth: ${extractionMetadata.treeDepth}`);

    // Return result
    return {
      courseId: course.id,
      subjectId: subject.id,
      subjectName: subject.name,
      courseName: course.name,
      courseCode: course.code,
      totalConcepts: extractionMetadata.totalAtomicConcepts,
      treeDepth: extractionMetadata.treeDepth,
      extractionConfidence: extractionMetadata.extractionConfidence,
      inputType: extraction.inputAnalysis.inputType,
      requiresReview: qualityChecks.requiresReview,
    };
  });
}

/**
 * Recursively create KnowledgeNodes in topological order
 * Returns a map of path -> nodeId for linking concepts
 */
async function createKnowledgeNodesRecursive(
  tx: Prisma.TransactionClient,
  subjectId: string,
  node: Subdirectory | NodeChild,
  parentId: string | null,
  pathMap: Map<string, string>,
  usedSlugs: Set<string> = new Set<string>()
): Promise<void> {
  // Ensure unique slug by appending counter if needed
  let uniqueSlug = node.slug;
  let counter = 1;
  while (usedSlugs.has(`${subjectId}-${uniqueSlug}`)) {
    uniqueSlug = `${node.slug}-${counter}`;
    counter++;
  }
  usedSlugs.add(`${subjectId}-${uniqueSlug}`);

  // Create the current node
  const createdNode = await tx.knowledgeNode.create({
    data: {
      subjectId,
      parentId,
      name: node.name,
      slug: uniqueSlug,
      order: node.order,
      metadata: (node.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });

  // Store path -> nodeId mapping
  pathMap.set(node.path, createdNode.id);

  // Recursively create children (only subdirectories, not atomic concepts)
  if ("children" in node && node.children) {
    const subdirectoryChildren = node.children.filter(
      (child) => child.nodeType === "subdirectory"
    );

    // Create children SEQUENTIALLY to avoid duplicate slug conflicts
    for (const child of subdirectoryChildren) {
      await createKnowledgeNodesRecursive(
        tx,
        subjectId,
        child,
        createdNode.id,
        pathMap,
        usedSlugs
      );
    }
  }
}

/**
 * Generate a course code from the course name
 * Example: "Introduction to Philosophy" -> "ITP"
 */
function generateCourseCode(courseName: string): string {
  // Take first letter of each word, uppercase, max 6 chars
  const code = courseName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 6);

  // If code is too short, pad with course name chars
  if (code.length < 3) {
    return courseName.replace(/[^A-Z]/gi, "").toUpperCase().slice(0, 6);
  }

  return code;
}

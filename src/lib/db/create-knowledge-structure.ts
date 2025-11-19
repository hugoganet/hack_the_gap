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

    let course = await tx.course.findFirst({
      where: { subjectId: subject.id, name: courseData.name },
    });

    if (!course) {
      const baseCode = courseData.code ?? generateCourseCode(courseData.name);
      const uniqueCode = await generateUniqueCourseCode(tx, baseCode);
      course = await createCourseWithRetry(tx, {
        code: uniqueCode,
        name: courseData.name,
        subjectId: subject.id,
        syllabusUrl: null,
      });
    }

    // 3. Create KnowledgeNodes (topological order: parents before children)
    const nodePathMap = new Map<string, string>(); // path -> nodeId
    const usedSlugs = new Set<string>(); // Track used slugs to prevent duplicates

    // Create all nodes SEQUENTIALLY to avoid duplicate slug conflicts
    for (const subdirectory of courseData.subdirectories) {
      // eslint-disable-next-line no-await-in-loop
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!concept) continue;

      console.log(`Creating concept ${index + 1}/${atomicConcepts.length}: ${concept.conceptText}`);
      
      // Create syllabus concept
      // eslint-disable-next-line no-await-in-loop
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
      // eslint-disable-next-line no-await-in-loop
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

    // 5. Create NodeSyllabusConcept (link concepts to nodes) - batch insert to keep txn fast
    console.log(`Linking ${atomicConcepts.length} concepts to nodes...`);

    const linkData: Prisma.NodeSyllabusConceptCreateManyInput[] = [];

    for (let index = 0; index < atomicConcepts.length; index++) {
      const concept = atomicConcepts[index];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!concept) continue;
      const nodeId = nodePathMap.get(concept.parentPath);
      const conceptId = conceptIdMap.get(concept.path);

      console.log(`Linking concept ${index + 1}: ${concept.conceptText}`);
      console.log(`  Parent path: ${concept.parentPath}`);
      console.log(`  Node ID: ${nodeId ? "found" : "NOT FOUND"}`);
      console.log(`  Concept ID: ${conceptId ? "found" : "NOT FOUND"}`);

      if (!nodeId) {
        console.error(`ERROR: Node not found for parent path: ${concept.parentPath}`);
        console.error(`Available node paths:`, Array.from(nodePathMap.keys()));
        throw new Error(`Node not found for parent path: ${concept.parentPath}`);
      }

      if (!conceptId) {
        console.error(`ERROR: Concept not found for path: ${concept.path}`);
        throw new Error(`Concept not found for path: ${concept.path}`);
      }

      linkData.push({
        nodeId,
        syllabusConceptId: conceptId,
        addedByUserId: userId,
      });
    }

    if (linkData.length > 0) {
      const createManyResult = await tx.nodeSyllabusConcept.createMany({
        data: linkData,
        skipDuplicates: true,
      });
      console.log(`Successfully linked ${createManyResult.count} concepts to nodes`);
    } else {
      console.log(`No concepts to link`);
    }

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
  }, { timeout: 30000 }); // extend interactive transaction timeout to handle remote DB latency and batch work
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
  // Ensure per-subject unique slug (check in-memory for this run and DB for existing rows)
  const uniqueSlug = await generateUniqueSlugForSubject(tx, subjectId, node.slug, usedSlugs);
  usedSlugs.add(`${subjectId}-${uniqueSlug}`);

  // Create the current node
  const createdNode = await createNodeWithRetry(tx, {
    subjectId,
    parentId,
    name: node.name,
    slug: uniqueSlug,
    order: node.order,
    metadata: (node.metadata ?? {}) as Prisma.InputJsonValue,
  }, subjectId, usedSlugs);

  // Store path -> nodeId mapping
  pathMap.set(node.path, createdNode.id);

  // Recursively create children (only subdirectories, not atomic concepts)
  if ("children" in node && node.children) {
    const subdirectoryChildren = node.children.filter(
      (child) => child.nodeType === "subdirectory"
    );

    // Create children SEQUENTIALLY to avoid duplicate slug conflicts
    for (const child of subdirectoryChildren) {
      // eslint-disable-next-line no-await-in-loop
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

/**
 * Ensure globally unique course code to satisfy @unique on Course.code.
 * Looks up existing codes starting with base and returns next available suffix.
 */
async function generateUniqueCourseCode(
  tx: Prisma.TransactionClient,
  baseCode: string
): Promise<string> {
  // Normalize: uppercase, no spaces
  const normalized = baseCode.trim().toUpperCase().replace(/\s+/g, "");
  const existing = await tx.course.findMany({
    where: { code: { startsWith: normalized } },
    select: { code: true },
  });
  const existingCodes = new Set(existing.map((r) => r.code));
  if (!existingCodes.has(normalized)) return normalized;

  let maxSuffix = 1;
  const pattern = new RegExp(`^${escapeRegExp(normalized)}(?:-(\\d+))?$`);
  for (const c of existingCodes) {
    const m = c.match(pattern);
    if (m) {
      const num = m[1] ? parseInt(m[1], 10) : 1;
      if (!Number.isNaN(num)) maxSuffix = Math.max(maxSuffix, num);
    }
  }
  let suffix = Math.max(2, maxSuffix + 1);
  const MAX_TRIES = 50;
  for (let i = 0; i < MAX_TRIES; i++) {
    const candidate = `${normalized}-${suffix}`;
    if (!existingCodes.has(candidate)) return candidate;
    suffix++;
  }
  return `${normalized}-${Date.now()}`;
}

/**
 * Create course with retry on global code uniqueness collisions (P2002).
 */
async function createCourseWithRetry(
  tx: Prisma.TransactionClient,
  data: {
    code: string;
    name: string;
    subjectId: string;
    syllabusUrl: string | null;
  }
) {
  const MAX_ATTEMPTS = 5;
  let attempt = 0;
  let current = { ...data };
  while (attempt < MAX_ATTEMPTS) {
    try {
      return tx.course.create({ data: current });
    } catch (err) {
      const e = err as unknown as { code?: string };
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (e && e.code === "P2002") {
        const base = baseFromSlug(current.code);
        // eslint-disable-next-line no-await-in-loop
        const next = await generateUniqueCourseCode(tx, base);
        current = { ...current, code: next };
        attempt++;
        continue;
      }
      throw err;
    }
  }
  // Final try without special handling
  return tx.course.create({ data: current });
}

/**
 * Compute a collision-resistant slug unique within a subject.
 * - Scopes uniqueness by subjectId only (NOT by user or globally)
 * - Looks up existing slugs in DB that start with baseSlug
 * - Also respects in-run usedSlugs to avoid duplicates in the same transaction
 */
async function generateUniqueSlugForSubject(
  tx: Prisma.TransactionClient,
  subjectId: string,
  baseSlug: string,
  usedSlugs: Set<string>
): Promise<string> {
  const key = (s: string) => `${subjectId}-${s}`;

  // Gather existing slugs from DB that start with baseSlug within the subject
  const existing = await tx.knowledgeNode.findMany({
    where: {
      subjectId,
      slug: { startsWith: baseSlug },
    },
    select: { slug: true },
  });

  const existingSlugs = new Set<string>(existing.map((r) => r.slug ?? ""));

  // If baseSlug is free both in-memory and DB, use it
  if (!usedSlugs.has(key(baseSlug)) && !existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Find the next available numeric suffix: base, base-2, base-3, ...
  let maxSuffix = 1;
  const pattern = new RegExp(`^${escapeRegExp(baseSlug)}(?:-(\\d+))?$`);
  for (const s of existingSlugs) {
    const m = s.match(pattern);
    if (m) {
      const num = m[1] ? parseInt(m[1], 10) : 1;
      if (!Number.isNaN(num)) maxSuffix = Math.max(maxSuffix, num);
    }
  }

  // Also account for slugs used earlier in this run
  for (const s of usedSlugs) {
    const slugOnly = s.startsWith(`${subjectId}-`) ? s.slice(subjectId.length + 1) : s;
    const m = slugOnly.match(pattern);
    if (m) {
      const num = m[1] ? parseInt(m[1], 10) : 1;
      if (!Number.isNaN(num)) maxSuffix = Math.max(maxSuffix, num);
    }
  }

  // Try from maxSuffix+1 upward until both DB and in-memory are free
  let suffix = maxSuffix + 1;
  // In case baseSlug wasn't counted as 1 above, ensure we start at 2 minimum
  if (suffix < 2) suffix = 2;

  // Avoid infinite loop; cap retries reasonably
  const MAX_TRIES = 50;
  for (let i = 0; i < MAX_TRIES; i++) {
    const candidate = `${baseSlug}-${suffix}`;
    if (!usedSlugs.has(key(candidate)) && !existingSlugs.has(candidate)) {
      return candidate;
    }
    suffix++;
  }

  // Fallback to baseSlug with timestamp to avoid total failure
  return `${baseSlug}-${Date.now()}`;
}

/** Escape string for safe use in RegExp constructor */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Create knowledge node with collision-retry in case of race-condition P2002.
 * Retries by incrementing the numeric suffix on the slug within the same subject.
 */
async function createNodeWithRetry(
  tx: Prisma.TransactionClient,
  data: {
    subjectId: string;
    parentId: string | null;
    name: string;
    slug: string;
    order: number;
    metadata: Prisma.InputJsonValue;
  },
  subjectId: string,
  usedSlugs: Set<string>
) {
  const MAX_ATTEMPTS = 5;
  let attempt = 0;
  let currentData = { ...data };

  while (attempt < MAX_ATTEMPTS) {
    try {
      return tx.knowledgeNode.create({ data: currentData });
    } catch (err) {
      const e = err as unknown as { code?: string };
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (e && e.code === "P2002") {
        // Collision; compute next slug and retry
        const base = baseFromSlug(currentData.slug);
        // eslint-disable-next-line no-await-in-loop
        const next = await generateUniqueSlugForSubject(tx, subjectId, base, usedSlugs);
        currentData = { ...currentData, slug: next };
        usedSlugs.add(`${subjectId}-${next}`);
        attempt++;
        continue;
      }
      throw err;
    }
  }
  // Last attempt without special handling
  return tx.knowledgeNode.create({ data: currentData });
}

/** Extract base part before numeric suffix (e.g., foo-3 -> foo) */
function baseFromSlug(slug: string): string {
  const m = slug.match(/^(.*?)(?:-(\d+))?$/);
  return m ? m[1] || slug : slug;
}

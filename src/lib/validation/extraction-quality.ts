/**
 * Quality validation for hierarchical knowledge extraction
 * Validates AI extraction output before database insertion
 */

import type {
  HierarchicalExtractionResponse,
  ExtractionMetadata,
  QualityChecks,
} from "@/types/hierarchical-extraction";

export class ExtractionQualityError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: string
  ) {
    super(message);
    this.name = "ExtractionQualityError";
  }
}

/**
 * Validate extraction quality before database insertion
 * Throws ExtractionQualityError if validation fails
 */
export function validateExtractionQuality(
  response: HierarchicalExtractionResponse
): void {
  const { qualityChecks, extractionMetadata } = response;

  // CRITICAL: All concepts must be atomic (ONE flashcard test)
  if (!qualityChecks.allConceptsAtomic) {
    throw new ExtractionQualityError(
      "Quality check failed: Not all concepts are atomic",
      "NOT_ATOMIC",
      "Each concept must be learnable with ONE flashcard. Some concepts are too broad or compound."
    );
  }

  // CRITICAL: Minimum confidence threshold
  if (extractionMetadata.extractionConfidence < 0.5) {
    throw new ExtractionQualityError(
      "Quality check failed: Extraction confidence too low",
      "LOW_CONFIDENCE",
      `Confidence: ${extractionMetadata.extractionConfidence}. Minimum required: 0.5`
    );
  }

  // CRITICAL: Must have at least one concept
  if (extractionMetadata.totalAtomicConcepts === 0) {
    throw new ExtractionQualityError(
      "Quality check failed: No concepts extracted",
      "NO_CONCEPTS",
      "The extraction must produce at least one atomic concept"
    );
  }

  // CRITICAL: Hierarchy must be complete (no orphaned nodes)
  if (!qualityChecks.completeHierarchy) {
    throw new ExtractionQualityError(
      "Quality check failed: Incomplete hierarchy",
      "INCOMPLETE_HIERARCHY",
      "Some nodes are orphaned or have invalid parent references"
    );
  }

  // Validate tree depth is reasonable
  if (extractionMetadata.treeDepth < 3 || extractionMetadata.treeDepth > 6) {
    console.warn(
      `Warning: Tree depth ${extractionMetadata.treeDepth} is outside recommended range (3-6)`
    );
  }

  // Validate concept counts match
  const totalByImportance =
    extractionMetadata.coreConceptsCount +
    extractionMetadata.importantConceptsCount +
    extractionMetadata.supplementalConceptsCount;

  if (totalByImportance > extractionMetadata.totalAtomicConcepts) {
    console.warn(
      `Warning: Concept count mismatch. Total by importance: ${totalByImportance}, Total concepts: ${extractionMetadata.totalAtomicConcepts}`
    );
  }
}

/**
 * Check if extraction requires manual review
 * Returns true if confidence is between 0.5-0.7 or requiresReview flag is set
 */
export function requiresManualReview(
  metadata: ExtractionMetadata,
  qualityChecks: QualityChecks
): boolean {
  return (
    qualityChecks.requiresReview ||
    (metadata.extractionConfidence >= 0.5 &&
      metadata.extractionConfidence < 0.7)
  );
}

/**
 * Get quality score (0-100) based on extraction metadata
 */
export function getQualityScore(
  metadata: ExtractionMetadata,
  qualityChecks: QualityChecks
): number {
  let score = 0;

  // Confidence score (0-40 points)
  score += metadata.extractionConfidence * 40;

  // Quality checks (0-40 points, 10 points each)
  if (qualityChecks.allConceptsAtomic) score += 10;
  if (qualityChecks.appropriateDepth) score += 10;
  if (qualityChecks.completeHierarchy) score += 10;
  if (qualityChecks.logicalRelationships) score += 10;

  // Concept count (0-10 points)
  if (metadata.totalAtomicConcepts >= 10) {
    score += 10;
  } else if (metadata.totalAtomicConcepts >= 5) {
    score += 5;
  }

  // Tree depth appropriateness (0-10 points)
  if (metadata.treeDepth >= 3 && metadata.treeDepth <= 6) {
    score += 10;
  } else if (metadata.treeDepth >= 2 && metadata.treeDepth <= 7) {
    score += 5;
  }

  return Math.round(score);
}

/**
 * Validate that atomic concepts array matches the tree structure
 */
export function validateConceptsMatchTree(
  response: HierarchicalExtractionResponse
): void {
  const { atomicConcepts, knowledgeTree } = response;

  // Collect all paths from the tree
  const treePaths = new Set<string>();
  
  for (const course of knowledgeTree.courses) {
    for (const subdir of course.subdirectories) {
      collectPathsFromNode(subdir, treePaths);
    }
  }

  // Check that all atomic concepts have valid parent paths in the tree
  for (const concept of atomicConcepts) {
    if (!treePaths.has(concept.parentPath)) {
      throw new ExtractionQualityError(
        `Concept "${concept.conceptText}" has invalid parent path: ${concept.parentPath}`,
        "INVALID_PARENT_PATH",
        "All atomic concepts must have valid parent paths in the knowledge tree"
      );
    }
  }
}

/**
 * Helper: Recursively collect all paths from a node and its children
 */
function collectPathsFromNode(
  node: { path: string; children?: { path: string; children?: unknown }[] },
  paths: Set<string>
): void {
  paths.add(node.path);
  
  if (node.children) {
    for (const child of node.children) {
      collectPathsFromNode(child as { path: string; children?: { path: string; children?: unknown }[] }, paths);
    }
  }
}

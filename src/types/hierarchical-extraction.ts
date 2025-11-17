/**
 * TypeScript types for Hierarchical Knowledge Extraction AI Response
 * Based on src/master-prompts/hierarchical-knowledge-extraction-prompt.md
 */

export type InputType = "broad" | "moderate" | "specific" | "very_specific";

export type InputAnalysis = {
  inputType: InputType;
  detectedScope: string;
  recommendedDepth: number;
  estimatedConceptCount: number;
};

export type SubjectData = {
  name: string;
  slug: string;
  metadata?: {
    description?: string;
    academicLevel?: string;
  };
};

export type NodeChild = {
  name: string;
  slug: string;
  path: string;
  order: number;
  nodeType: "subdirectory" | "concept";
  isAtomic: boolean;
  importance?: number | null;
  category?: string | null;
  metadata?: Record<string, unknown>;
  children?: NodeChild[];
};

export type Subdirectory = {
  name: string;
  slug: string;
  path: string;
  order: number;
  metadata?: {
    description?: string;
    weeksCovered?: string | null;
  };
  children: NodeChild[];
};

export type CourseData = {
  name: string;
  slug: string;
  code: string | null;
  path: string;
  order: number;
  metadata?: {
    description?: string;
    credits?: string | null;
    semester?: string | null;
  };
  subdirectories: Subdirectory[];
};

export type KnowledgeTree = {
  subject: SubjectData;
  courses: CourseData[];
};

export type AtomicConcept = {
  conceptText: string;
  path: string;
  parentPath: string;
  importance: number | null;
  category: string | null;
  order: number;
  isAtomic: boolean;
  flashcardQuestion: string;
};

export type ExtractionMetadata = {
  totalNodes: number;
  totalAtomicConcepts: number;
  treeDepth: number;
  coursesCount: number;
  subdirectoriesCount: number;
  coreConceptsCount: number;
  importantConceptsCount: number;
  supplementalConceptsCount: number;
  extractionConfidence: number;
  processingNotes: string;
};

export type QualityChecks = {
  allConceptsAtomic: boolean;
  appropriateDepth: boolean;
  completeHierarchy: boolean;
  logicalRelationships: boolean;
  noDuplicates: boolean;
  requiresReview: boolean;
};

export type HierarchicalExtractionResponse = {
  inputAnalysis: InputAnalysis;
  knowledgeTree: KnowledgeTree;
  atomicConcepts: AtomicConcept[];
  extractionMetadata: ExtractionMetadata;
  qualityChecks: QualityChecks;
};

export type ExtractionError = {
  code: "INSUFFICIENT_DATA" | "AMBIGUOUS_INPUT" | "AI_PROCESSING_FAILED" | "UNSUPPORTED_LANGUAGE";
  message: string;
  details?: string;
  suggestions?: string[];
  detectedLanguage?: string;
};

export type ExtractionErrorResponse = {
  error: ExtractionError;
};

export type ExtractionResult = HierarchicalExtractionResponse | ExtractionErrorResponse;

// Type guard to check if response is an error
export function isExtractionError(
  result: ExtractionResult
): result is ExtractionErrorResponse {
  return "error" in result;
}

/**
 * Zod validation schemas for hierarchical knowledge extraction
 * Validates AI extraction output structure and types
 */

import { z } from "zod";

export const FlashcardSchema = z.object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be less than 500 characters"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  hints: z.array(z.string()).optional(),
});

export const AtomicConceptSchema = z.object({
  conceptText: z.string().min(3).max(100),
  path: z.string(),
  parentPath: z.string(),
  importance: z.number().int().min(1).max(3).nullable(),
  category: z.string().nullable(),
  order: z.number().int(),
  isAtomic: z.boolean(),
  flashcard: FlashcardSchema,
});

export const InputAnalysisSchema = z.object({
  inputType: z.enum(["broad", "moderate", "specific", "very_specific"]),
  detectedScope: z.string(),
  recommendedDepth: z.number().int().min(3).max(6),
  estimatedConceptCount: z.number().int(),
});

export const SubjectDataSchema = z.object({
  name: z.string(),
  slug: z.string(),
  metadata: z
    .object({
      description: z.string().optional(),
      academicLevel: z.string().optional(),
    })
    .optional(),
});

export const NodeChildSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    slug: z.string(),
    path: z.string(),
    order: z.number().int(),
    nodeType: z.enum(["subdirectory", "concept"]),
    isAtomic: z.boolean(),
    importance: z.number().int().min(1).max(3).nullable().optional(),
    category: z.string().nullable().optional(),
    metadata: z.record(z.any()).optional(),
    children: z.array(NodeChildSchema).optional(),
  })
);

export const SubdirectorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  path: z.string(),
  order: z.number().int(),
  metadata: z
    .object({
      description: z.string().optional(),
      weeksCovered: z.string().nullable().optional(),
    })
    .optional(),
  children: z.array(NodeChildSchema),
});

export const CourseDataSchema = z.object({
  name: z.string(),
  slug: z.string(),
  code: z.string().nullable(),
  path: z.string(),
  order: z.number().int(),
  metadata: z
    .object({
      description: z.string().optional(),
      credits: z.string().nullable().optional(),
      semester: z.string().nullable().optional(),
    })
    .optional(),
  subdirectories: z.array(SubdirectorySchema),
});

export const KnowledgeTreeSchema = z.object({
  subject: SubjectDataSchema,
  courses: z.array(CourseDataSchema),
});

export const ExtractionMetadataSchema = z.object({
  totalNodes: z.number().int(),
  totalAtomicConcepts: z.number().int(),
  treeDepth: z.number().int(),
  coursesCount: z.number().int(),
  subdirectoriesCount: z.number().int(),
  coreConceptsCount: z.number().int(),
  importantConceptsCount: z.number().int(),
  supplementalConceptsCount: z.number().int(),
  extractionConfidence: z.number().min(0).max(1),
  processingNotes: z.string(),
  detectedLanguage: z.string().optional(),
});

export const QualityChecksSchema = z.object({
  allConceptsAtomic: z.boolean(),
  appropriateDepth: z.boolean(),
  completeHierarchy: z.boolean(),
  logicalRelationships: z.boolean(),
  noDuplicates: z.boolean(),
  requiresReview: z.boolean(),
});

export const HierarchicalExtractionResponseSchema = z.object({
  inputAnalysis: InputAnalysisSchema,
  knowledgeTree: KnowledgeTreeSchema,
  atomicConcepts: z.array(AtomicConceptSchema),
  extractionMetadata: ExtractionMetadataSchema,
  qualityChecks: QualityChecksSchema,
});

export const ExtractionErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      "INSUFFICIENT_DATA",
      "AMBIGUOUS_INPUT",
      "AI_PROCESSING_FAILED",
      "UNSUPPORTED_LANGUAGE",
    ]),
    message: z.string(),
    details: z.string().optional(),
    suggestions: z.array(z.string()).optional(),
    detectedLanguage: z.string().optional(),
  }),
});

export const ExtractionResultSchema = z.union([
  HierarchicalExtractionResponseSchema,
  ExtractionErrorSchema,
]);

// Type exports
export type FlashcardInput = z.infer<typeof FlashcardSchema>;
export type AtomicConceptInput = z.infer<typeof AtomicConceptSchema>;
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

/**
 * Validate extraction response against schema
 * Throws ZodError if validation fails
 */
export function validateExtractionResponse(data: unknown) {
  return HierarchicalExtractionResponseSchema.parse(data);
}

/**
 * Safe validation that returns success/error object
 */
export function safeValidateExtractionResponse(data: unknown) {
  return HierarchicalExtractionResponseSchema.safeParse(data);
}

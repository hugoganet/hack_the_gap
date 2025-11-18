/**
 * Types for flashcard generation feature
 * Based on US-0005 specification and master prompt
 */

export type DifficultyHint = "easy" | "medium" | "hard";

export type QuestionType = 
  | "definition"
  | "comparison"
  | "mechanism"
  | "application"
  | "definition_with_outcome";

/**
 * Input data structure for flashcard generation
 * Matches the structure defined in the master prompt
 */
export type ConceptMatchInput = {
  extractedConcept: {
    conceptText: string;
    definition: string | null;
    timestamp: string | null;
    confidence: number;
    language?: string; // Language of the extracted concept (e.g., 'en', 'fr')
  };
  syllabusConcept: {
    conceptText: string;
    category: string | null;
    importance: number | null;
    language?: string; // Language of the syllabus concept (e.g., 'en', 'fr')
  };
  course: {
    code: string;
    name: string;
    subject: string;
    academicLevel: number;
  };
  video: {
    id: string;
    title: string | null;
    youtubeVideoId: string | null;
  };
  match: {
    confidence: number;
    matchType: string | null;
    rationale: string | null;
  };
};

/**
 * Quality flags for flashcard validation
 */
export type QualityFlags = {
  isAtomic: boolean;
  isTestable: boolean;
  avoidsTriviaPattern: boolean;
  appropriateDifficulty: boolean;
};

/**
 * Metadata about flashcard generation
 */
export type FlashcardMetadata = {
  questionType: QuestionType;
  answerLength: number;
  generationConfidence: number;
  pedagogicalNotes: string;
  qualityFlags: QualityFlags;
};

/**
 * Generated flashcard structure (from AI)
 */
export type GeneratedFlashcard = {
  question: string;
  answer: string;
  questionTranslation?: string | null; // Translation for bilingual support
  answerTranslation?: string | null; // Translation for bilingual support
  language?: string; // Primary language of the flashcard
  sourceTimestamp: string | null;
  difficultyHint: DifficultyHint;
};

/**
 * Complete AI response structure
 */
export type FlashcardGenerationResponse = {
  flashcard: GeneratedFlashcard;
  metadata: FlashcardMetadata;
};

/**
 * Error response from AI
 */
export type FlashcardGenerationError = {
  error: {
    code: "INSUFFICIENT_DATA" | "QUALITY_VALIDATION_FAILED" | "CONCEPT_NOT_TESTABLE";
    message: string;
    details: string;
    attemptedOutput?: {
      question: string;
      reason: string;
    };
  };
};

/**
 * Flashcard ready for database insertion
 */
export type FlashcardDTO = {
  conceptMatchId: string;
  userId: string;
  question: string;
  answer: string;
  questionTranslation?: string | null; // Translation for bilingual support
  answerTranslation?: string | null; // Translation for bilingual support
  language?: string; // Primary language of the flashcard
  sourceTimestamp: string | null;
  // Note: difficultyHint is used for initial scheduling but not stored in DB
};

/**
 * Result of flashcard generation for a single concept match
 */
export type FlashcardGenerationResult = {
  success: boolean;
  conceptMatchId: string;
  flashcard?: FlashcardDTO;
  metadata?: FlashcardMetadata;
  error?: string;
  skipped?: boolean;
  skipReason?: string;
};

/**
 * Summary of batch flashcard generation
 */
export type FlashcardGenerationSummary = {
  totalMatches: number;
  attempted: number;
  successful: number;
  failed: number;
  skipped: number;
  avgConfidence: number;
  avgGenerationTimeMs: number;
  errors: {
    conceptMatchId: string;
    error: string;
  }[];
};

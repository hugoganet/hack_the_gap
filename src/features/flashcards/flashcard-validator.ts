/**
 * Flashcard quality validation
 * Based on US-0005 specification and master prompt validation rules
 */

import type { GeneratedFlashcard, QualityFlags } from "./types";

/**
 * Validation result
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Validates a generated flashcard against quality standards
 * Returns validation result with errors and warnings
 */
export function validateFlashcard(flashcard: GeneratedFlashcard): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Question validation
  const questionErrors = validateQuestion(flashcard.question);
  errors.push(...questionErrors);

  // Answer validation
  const answerErrors = validateAnswer(flashcard.answer);
  errors.push(...answerErrors);

  // Difficulty validation
  if (!["easy", "medium", "hard"].includes(flashcard.difficultyHint)) {
    errors.push(`Invalid difficulty hint: ${flashcard.difficultyHint}`);
  }

  // Timestamp validation (optional field)
  if (flashcard.sourceTimestamp !== null) {
    const timestampErrors = validateTimestamp(flashcard.sourceTimestamp);
    errors.push(...timestampErrors);
  }

  // Cross-field validation
  if (flashcard.question.toLowerCase().includes(flashcard.answer.toLowerCase().slice(0, 20))) {
    warnings.push("Question contains part of the answer");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates question format and content
 */
function validateQuestion(question: string): string[] {
  const errors: string[] = [];

  // Length validation
  if (question.length < 10) {
    errors.push("Question too short (minimum 10 characters)");
  }
  if (question.length > 200) {
    errors.push("Question too long (maximum 200 characters)");
  }

  // Format validation - must start with interrogative word (English or French)
  const interrogatives = [
    // English
    "what", "how", "why", "when", "where", "who", "which", "explain", "describe",
    // French
    "quel", "quelle", "quels", "quelles", "comment", "pourquoi", "quand", "où", "qui", "expliquez", "décrivez"
  ];
  const startsWithInterrogative = interrogatives.some(word => 
    question.toLowerCase().startsWith(word)
  );
  
  if (!startsWithInterrogative) {
    errors.push("Question must start with an interrogative word (What, How, Why, etc. or Quel, Comment, Pourquoi, etc.)");
  }

  // Forbidden patterns - yes/no questions
  const yesNoPatterns = [
    /^is\s/i,
    /^are\s/i,
    /^do\s/i,
    /^does\s/i,
    /^can\s/i,
    /^could\s/i,
    /^would\s/i,
    /^should\s/i,
    /^will\s/i,
    /^has\s/i,
    /^have\s/i,
    /true or false/i,
    /yes or no/i,
  ];

  for (const pattern of yesNoPatterns) {
    if (pattern.test(question)) {
      errors.push("Question uses forbidden yes/no format");
      break;
    }
  }

  // Forbidden patterns - multiple choice
  if (question.toLowerCase().includes("which of the following")) {
    errors.push("Question uses forbidden multiple choice format");
  }

  // Must end with question mark
  if (!question.trim().endsWith("?")) {
    errors.push("Question must end with a question mark");
  }

  return errors;
}

/**
 * Validates answer format and content
 */
function validateAnswer(answer: string): string[] {
  const errors: string[] = [];

  // Length validation
  if (answer.length < 50) {
    errors.push("Answer too short (minimum 50 characters)");
  }
  if (answer.length > 400) {
    errors.push("Answer too long (maximum 400 characters)");
  }

  // Sentence count validation (1-3 sentences)
  const sentenceCount = (answer.match(/[.!?]+/g) ?? []).length;
  if (sentenceCount === 0) {
    errors.push("Answer must contain at least one complete sentence");
  }
  if (sentenceCount > 5) {
    errors.push("Answer too verbose (maximum 5 sentences)");
  }

  // Anti-patterns
  const antiPatterns = [
    { pattern: /^well,?\s/i, message: "Answer contains conversational filler" },
    { pattern: /^so,?\s/i, message: "Answer contains conversational filler" },
    { pattern: /^you see,?\s/i, message: "Answer contains conversational filler" },
    { pattern: /basically,?\s/i, message: "Answer contains conversational filler" },
    { pattern: /\s+is when\s+/i, message: "Answer uses circular definition pattern" },
    { pattern: /usually|sometimes|often/i, message: "Answer contains vague qualifiers (use only if essential)" },
  ];

  for (const { pattern, message } of antiPatterns) {
    if (pattern.test(answer)) {
      errors.push(message);
    }
  }

  return errors;
}

/**
 * Validates timestamp format (HH:MM:SS)
 */
function validateTimestamp(timestamp: string): string[] {
  const errors: string[] = [];
  
  const timestampPattern = /^\d{2}:\d{2}:\d{2}$/;
  if (!timestampPattern.test(timestamp)) {
    errors.push("Invalid timestamp format (expected HH:MM:SS)");
  }

  return errors;
}

/**
 * Generates quality flags based on flashcard content
 */
export function generateQualityFlags(
  flashcard: GeneratedFlashcard,
  validation: ValidationResult
): QualityFlags {
  return {
    isAtomic: checkIsAtomic(flashcard.question),
    isTestable: checkIsTestable(flashcard.question, flashcard.answer),
    avoidsTriviaPattern: checkAvoidsTriviaPattern(flashcard.question),
    appropriateDifficulty: validation.isValid,
  };
}

/**
 * Checks if question tests a single concept (atomic)
 */
function checkIsAtomic(question: string): boolean {
  // Check for compound questions (multiple "and", "or")
  const andCount = (question.match(/\sand\s/gi) ?? []).length;
  const orCount = (question.match(/\sor\s/gi) ?? []).length;
  
  // Allow one "and" or "or" for natural phrasing, but flag multiple
  return (andCount + orCount) <= 1;
}

/**
 * Checks if question has a clear, testable answer
 */
function checkIsTestable(question: string, answer: string): boolean {
  // Question and answer should both be substantial
  if (question.length < 10 || answer.length < 50) {
    return false;
  }

  // Answer should not be too vague
  const vaguePatterns = [
    /it depends/i,
    /varies/i,
    /there is no single answer/i,
  ];

  return !vaguePatterns.some(pattern => pattern.test(answer));
}

/**
 * Checks if question tests understanding vs. trivia
 */
function checkAvoidsTriviaPattern(question: string): boolean {
  // Trivia patterns to avoid
  const triviaPatterns = [
    /what year/i,
    /when was.*born/i,
    /who invented/i,
    /in what year/i,
    /how many/i, // Can be trivia unless testing core concept
  ];

  return !triviaPatterns.some(pattern => pattern.test(question));
}

/**
 * Calculates an overall quality score (0-1)
 */
export function calculateQualityScore(
  validation: ValidationResult,
  qualityFlags: QualityFlags,
  generationConfidence: number
): number {
  // Start with generation confidence
  let score = generationConfidence;

  // Penalize for validation errors
  score -= validation.errors.length * 0.1;

  // Penalize for warnings (less severe)
  score -= validation.warnings.length * 0.05;

  // Bonus for quality flags
  const flagsTrue = Object.values(qualityFlags).filter(Boolean).length;
  score += (flagsTrue / 4) * 0.1;

  // Clamp to 0-1 range
  return Math.max(0, Math.min(1, score));
}

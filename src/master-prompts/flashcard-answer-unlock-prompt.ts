/**
 * Flashcard Answer Unlock Prompt
 * Builds the LLM prompt used to generate a concise flashcard answer
 * from matched content for a syllabus concept.
 * Separated to keep Separation of Concerns (SoC) and allow reuse/versioning.
 */

import type { Concept, SyllabusConcept } from "@/generated/prisma";

export type FlashcardAnswerPromptParams = {
  extractedConcept: Concept;
  syllabusConcept: SyllabusConcept;
  matchRationale: string;
  answerLanguage: string; // ISO code like "en", "fr"
};

/**
 * Construct the exact prompt string currently used by unlock-service.
 * Keep wording identical to preserve model behavior.
 */
export function buildFlashcardAnswerPrompt({
  extractedConcept,
  syllabusConcept,
  matchRationale,
  answerLanguage,
}: FlashcardAnswerPromptParams): string {
  return `You are generating a flashcard answer based on content the student consumed.

LANGUAGE REQUIREMENT: The answer must be written in ${answerLanguage}.

QUESTION CONTEXT (from syllabus):
- Concept: ${syllabusConcept.conceptText}
- Category: ${syllabusConcept.category ?? "N/A"}
- Importance: ${syllabusConcept.importance ?? "N/A"}

CONTENT CONTEXT (from video/PDF):
- Extracted concept: ${extractedConcept.conceptText}
- Definition: ${extractedConcept.definition ?? "N/A"}

MATCHING RATIONALE:
${matchRationale}

Generate a concise, accurate answer (1-3 sentences) that:
1. Directly answers the question about the syllabus concept
2. Incorporates specific details from the content consumed
3. Includes a concrete example if available in the content
4. Is suitable for flashcard review (clear and memorable)

ANSWER:`;
}

export default buildFlashcardAnswerPrompt;

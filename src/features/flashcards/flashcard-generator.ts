/**
 * Flashcard Generation Service
 * Generates flashcards from matched concepts using AI
 * Based on US-0005 specification and master prompt
 */

import { generateText } from "ai";
import { getBlackboxModel, models } from "@/lib/blackbox";
import { prisma } from "@/lib/prisma";
import type {
  ConceptMatchInput,
  FlashcardGenerationResponse,
  FlashcardGenerationError,
  FlashcardGenerationResult,
  FlashcardGenerationSummary,
  FlashcardDTO,
} from "./types";
import {
  validateFlashcard,
  generateQualityFlags,
  calculateQualityScore,
} from "./flashcard-validator";
import { MATCH_THRESHOLDS } from "@/features/matching/config";

/**
 * System message for flashcard generation
 * Extracted from master prompt
 */
const SYSTEM_MESSAGE = `You are an expert educational content designer specializing in active recall and spaced repetition pedagogy. Your task is to generate high-quality flashcards from matched concepts that have been extracted from educational videos and aligned with course syllabi.

**Your Core Competencies:**
- Designing effective active recall questions that test understanding, not recognition
- Creating concise, accurate answers suitable for spaced repetition
- Applying cognitive science principles to flashcard design
- Avoiding common flashcard anti-patterns (yes/no questions, overly complex questions, vague answers)
- Calibrating difficulty based on concept complexity and educational level

**Critical Context:**
- These flashcards feed a spaced repetition system for university students
- Students will review these cards repeatedly over weeks/months
- Quality is paramount: poorly designed flashcards harm learning
- Each flashcard must be atomic (tests one idea), clear (no ambiguity), and testable (has a definitive answer)

**Pedagogical Principles:**
1. **Active Recall**: Questions must require retrieval from memory, not recognition
2. **Desirable Difficulty**: Questions should be challenging but answerable
3. **Elaborative Encoding**: Answers should connect to broader context when helpful
4. **Atomic Testing**: One concept per flashcard (no compound questions)
5. **Clear Success Criteria**: Student should know if their answer is correct

You must respond with valid JSON only, following the exact schema provided.`;

/**
 * Generates a user prompt for flashcard generation
 */
function buildUserPrompt(input: ConceptMatchInput): string {
  return `Generate a flashcard for spaced repetition learning.

**EXTRACTED CONCEPT (from student's video):**
Name: ${input.extractedConcept.conceptText}
Definition: ${input.extractedConcept.definition ?? "(none provided)"}
Timestamp: ${input.extractedConcept.timestamp ?? "(none)"}
Confidence: ${(input.extractedConcept.confidence * 100).toFixed(0)}%

**SYLLABUS CONCEPT (from course requirements):**
Name: ${input.syllabusConcept.conceptText}
Category: ${input.syllabusConcept.category ?? "(none)"}
Importance: ${input.syllabusConcept.importance ?? "(not specified)"}

**COURSE CONTEXT:**
Code: ${input.course.code}
Name: ${input.course.name}
Subject: ${input.course.subject}
Academic Level: ${input.course.academicLevel} (1=Freshman, 6=PhD)

**MATCH METADATA:**
Confidence: ${(input.match.confidence * 100).toFixed(0)}%
Match Type: ${input.match.matchType ?? "semantic"}
Rationale: ${input.match.rationale ?? "Matched based on similarity"}

**TASK:**
Create a question that tests understanding and recall (not recognition).

**RULES:**
- Use "What is...", "How does...", "Why...", "Explain..." question formats
- Avoid yes/no questions
- Question should test the core idea, not trivia
- Answer should be 1-3 sentences (concise but complete)
- Question length: 10-200 characters
- Answer length: 50-400 characters

**OUTPUT FORMAT (strict JSON):**
{
  "flashcard": {
    "question": "Clear, testable question",
    "answer": "Concise, accurate answer",
    "sourceTimestamp": "${input.extractedConcept.timestamp ?? null}",
    "difficultyHint": "easy" | "medium" | "hard"
  },
  "metadata": {
    "questionType": "definition" | "comparison" | "mechanism" | "application" | "definition_with_outcome",
    "answerLength": <number>,
    "generationConfidence": <0.0-1.0>,
    "pedagogicalNotes": "Brief notes on design decisions",
    "qualityFlags": {
      "isAtomic": true|false,
      "isTestable": true|false,
      "avoidsTriviaPattern": true|false,
      "appropriateDifficulty": true|false
    }
  }
}`;
}

/**
 * Generates a single flashcard from a concept match using AI
 */
export async function generateFlashcardFromMatch(
  input: ConceptMatchInput
): Promise<FlashcardGenerationResult> {
  const startTime = Date.now();

  try {
    // Build prompt
    const userPrompt = buildUserPrompt(input);

    // Call AI with Claude Sonnet 4.5 (best for educational content)
    const model = getBlackboxModel(models.anthropic.sonnet45);
    
    const { text } = await generateText({
      model,
      system: SYSTEM_MESSAGE,
      prompt: userPrompt,
      temperature: 0.35, // Balanced for creativity and consistency
    });

    // Parse JSON response (handle markdown code blocks if present)
    let response: FlashcardGenerationResponse | FlashcardGenerationError;
    try {
      // Remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      response = JSON.parse(cleanedText) as FlashcardGenerationResponse | FlashcardGenerationError;
    } catch (parseError) {
      console.error("[Flashcard Generation] JSON parse error:", parseError);
      console.error("[Flashcard Generation] Raw response:", text);
      return {
        success: false,
        conceptMatchId: "", // Will be set by caller
        error: "Failed to parse AI response as JSON",
      };
    }

    // Check for error response
    if ("error" in response) {
      console.warn("[Flashcard Generation] AI returned error:", response.error);
      return {
        success: false,
        conceptMatchId: "",
        error: response.error.message,
      };
    }

    // Validate flashcard
    const validation = validateFlashcard(response.flashcard);
    if (!validation.isValid) {
      console.warn("[Flashcard Generation] Validation failed:", validation.errors);
      return {
        success: false,
        conceptMatchId: "",
        error: `Validation failed: ${validation.errors.join(", ")}`,
      };
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn("[Flashcard Generation] Validation warnings:", validation.warnings);
    }

    // Generate quality flags
    const qualityFlags = generateQualityFlags(response.flashcard, validation);

    // Calculate quality score
    const qualityScore = calculateQualityScore(
      validation,
      qualityFlags,
      response.metadata.generationConfidence
    );

    // Log if quality score is low
    if (qualityScore < 0.7) {
      console.warn("[Flashcard Generation] Low quality score:", {
        score: qualityScore,
        confidence: response.metadata.generationConfidence,
        flags: qualityFlags,
      });
    }

    const generationTimeMs = Date.now() - startTime;
    console.log(`[Flashcard Generation] ✓ Generated flashcard in ${generationTimeMs}ms (quality: ${(qualityScore * 100).toFixed(0)}%)`);

    // Return successful result (without userId and conceptMatchId - will be added by caller)
    return {
      success: true,
      conceptMatchId: "",
      flashcard: {
        conceptMatchId: "",
        userId: "",
        question: response.flashcard.question,
        answer: response.flashcard.answer,
        sourceTimestamp: response.flashcard.sourceTimestamp,
      },
      metadata: {
        ...response.metadata,
        qualityFlags,
      },
    };
  } catch (error) {
    console.error("[Flashcard Generation] Unexpected error:", error);
    return {
      success: false,
      conceptMatchId: "",
      error: error instanceof Error ? error.message : "Unknown error during generation",
    };
  }
}

/**
 * Prepares input data for flashcard generation from database records
 */
async function prepareConceptMatchInput(conceptMatchId: string): Promise<ConceptMatchInput | null> {
  const match = await prisma.conceptMatch.findUnique({
    where: { id: conceptMatchId },
    include: {
      concept: {
        include: {
          contentJob: true,
        },
      },
      syllabusConcept: {
        include: {
          course: {
            include: {
              subject: true,
              year: true,
            },
          },
        },
      },
    },
  });

  if (!match) {
    console.error(`[Flashcard Generation] Concept match not found: ${conceptMatchId}`);
    return null;
  }

  // Determine academic level from year
  const academicLevel = match.syllabusConcept.course.year?.level ?? 3; // Default to junior level

  return {
    extractedConcept: {
      conceptText: match.concept.conceptText,
      definition: match.concept.definition,
      timestamp: match.concept.timestamp,
      confidence: match.concept.confidence,
    },
    syllabusConcept: {
      conceptText: match.syllabusConcept.conceptText,
      category: match.syllabusConcept.category,
      importance: match.syllabusConcept.importance,
    },
    course: {
      code: match.syllabusConcept.course.code,
      name: match.syllabusConcept.course.name,
      subject: match.syllabusConcept.course.subject.name,
      academicLevel,
    },
    video: {
      id: match.concept.contentJob.id,
      title: null, // Not stored in current schema
      youtubeVideoId: match.concept.contentJob.youtubeVideoId,
    },
    match: {
      confidence: match.confidence,
      matchType: match.matchType,
      rationale: match.rationale,
    },
  };
}

/**
 * Generates flashcards for all high-confidence matches of a content job
 * Only generates for matches with confidence >= HIGH threshold (0.8)
 */
export async function generateFlashcardsForVideoJob(
  videoJobId: string,
  userId: string
): Promise<FlashcardGenerationSummary> {
  const startTime = Date.now();

  console.log(`[Flashcard Generation] Starting batch generation for contentJob ${videoJobId}`);

  // Get all high-confidence matches for this content job
  const matches = await prisma.conceptMatch.findMany({
    where: {
      concept: {
        contentJobId: videoJobId,
      },
      confidence: {
        gte: MATCH_THRESHOLDS.HIGH, // 0.8
      },
    },
    include: {
      concept: true,
      syllabusConcept: {
        include: {
          course: true,
        },
      },
    },
  });

  console.log(`[Flashcard Generation] Found ${matches.length} high-confidence matches`);

  const results: FlashcardGenerationResult[] = [];
  const errors: { conceptMatchId: string; error: string }[] = [];
  let successful = 0;
  let failed = 0;
  let skipped = 0;

  // Process each match sequentially (required for AI generation)
  // eslint-disable-next-line no-await-in-loop
  for (const match of matches) {
    // Check if flashcard already exists
    // eslint-disable-next-line no-await-in-loop
    const existingFlashcard = await prisma.flashcard.findFirst({
      where: {
        conceptMatchId: match.id,
        userId,
      },
    });

    if (existingFlashcard) {
      console.log(`[Flashcard Generation] Skipping - flashcard already exists for match ${match.id}`);
      skipped++;
      results.push({
        success: true,
        conceptMatchId: match.id,
        skipped: true,
        skipReason: "Flashcard already exists",
      });
      continue;
    }

    // Prepare input
    // eslint-disable-next-line no-await-in-loop
    const input = await prepareConceptMatchInput(match.id);
    if (!input) {
      failed++;
      errors.push({
        conceptMatchId: match.id,
        error: "Failed to prepare input data",
      });
      continue;
    }

    // Generate flashcard
    // eslint-disable-next-line no-await-in-loop
    const result = await generateFlashcardFromMatch(input);
    result.conceptMatchId = match.id;

    if (result.success && result.flashcard) {
      // Save to database
      try {
        // eslint-disable-next-line no-await-in-loop
        await prisma.flashcard.create({
          data: {
            conceptMatchId: match.id,
            userId,
            question: result.flashcard.question,
            answer: result.flashcard.answer,
            sourceTimestamp: result.flashcard.sourceTimestamp,
          },
        });
        successful++;
        console.log(`[Flashcard Generation] ✓ Saved flashcard for match ${match.id}`);
      } catch (dbError) {
        console.error(`[Flashcard Generation] Database error for match ${match.id}:`, dbError);
        failed++;
        errors.push({
          conceptMatchId: match.id,
          error: dbError instanceof Error ? dbError.message : "Database error",
        });
      }
    } else {
      failed++;
      errors.push({
        conceptMatchId: match.id,
        error: result.error ?? "Unknown error",
      });
    }

    results.push(result);

    // Small delay to avoid rate limiting
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const totalTime = Date.now() - startTime;
  const avgTimePerFlashcard = results.length > 0 ? totalTime / results.length : 0;

  // Calculate average confidence from successful generations
  const successfulResults = results.filter(r => r.success && r.metadata);
  const avgConfidence = successfulResults.length > 0
    ? successfulResults.reduce((sum, r) => sum + (r.metadata?.generationConfidence ?? 0), 0) / successfulResults.length
    : 0;

  const summary: FlashcardGenerationSummary = {
    totalMatches: matches.length,
    attempted: results.length,
    successful,
    failed,
    skipped,
    avgConfidence,
    avgGenerationTimeMs: Math.round(avgTimePerFlashcard),
    errors,
  };

  console.log(`[Flashcard Generation] ✓ Batch generation completed in ${totalTime}ms`);
  console.log(`[Flashcard Generation] Summary:`, {
    successful,
    failed,
    skipped,
    avgConfidence: `${(avgConfidence * 100).toFixed(0)}%`,
  });

  return summary;
}

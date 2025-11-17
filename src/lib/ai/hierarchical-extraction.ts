/**
 * AI service for hierarchical knowledge extraction
 * Calls Blackbox AI (Claude Sonnet 4.5) with the hierarchical extraction prompt
 */

import { streamText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type {
  HierarchicalExtractionResponse,
  ExtractionResult,
} from "@/types/hierarchical-extraction";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Input for hierarchical extraction
 */
export type ExtractionInput = {
  subject: string;
  courseName: string;
  learningGoalText: string;
  userId: string;
};

/**
 * Options for extraction
 */
export type ExtractionOptions = {
  temperature?: number;
  maxTokens?: number;
  timeout?: number; // milliseconds
};

const DEFAULT_OPTIONS: Required<ExtractionOptions> = {
  temperature: 0.2,
  maxTokens: 32000, // Increased from 8000 to handle larger responses
  timeout: 90000, // 90 seconds (increased for longer processing)
};

/**
 * Load the hierarchical extraction prompt from file
 */
async function loadPrompt(): Promise<string> {
  const promptPath = join(
    process.cwd(),
    "src/master-prompts/hierarchical-knowledge-extraction-prompt.md"
  );
  return readFile(promptPath, "utf-8");
}

/**
 * Format input for the AI prompt
 */
function formatPromptInput(input: ExtractionInput): string {
  return `Please analyze the following educational material and create a hierarchical knowledge structure.

Subject: ${input.subject}
Course Name: ${input.courseName}

---MATERIAL START---
${input.learningGoalText}
---MATERIAL END---

Return a complete JSON object following the schema in your instructions.`;
}

/**
 * Parse and validate AI response
 */
function parseAIResponse(responseText: string): ExtractionResult {
  try {
    // Try to extract JSON from markdown code blocks if present
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present (handle both complete and incomplete blocks)
    // Match: ```json ... ``` or ```json ... (without closing)
    const jsonMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)(?:\n?```|$)/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // If still starts with backticks, remove them
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```$/, '').trim();
    }
    
    // Parse JSON
    const parsed = JSON.parse(jsonText) as ExtractionResult;
    
    // Validate it has the expected structure
    if ("error" in parsed) {
      return parsed;
    }
    
    const response = parsed as HierarchicalExtractionResponse;
    
    // Basic structure validation
    if (typeof response.inputAnalysis !== "object") {
      throw new Error("Invalid response structure: missing inputAnalysis");
    }
    if (typeof response.knowledgeTree !== "object") {
      throw new Error("Invalid response structure: missing knowledgeTree");
    }
    if (!Array.isArray(response.atomicConcepts)) {
      throw new Error("Invalid response structure: missing atomicConcepts array");
    }
    if (typeof response.extractionMetadata !== "object") {
      throw new Error("Invalid response structure: missing extractionMetadata");
    }
    if (typeof response.qualityChecks !== "object") {
      throw new Error("Invalid response structure: missing qualityChecks");
    }
    
    return response;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.error("Response text length:", responseText.length);
    console.error("Response text preview:", responseText.substring(0, 500));
    console.error("Response text end:", responseText.substring(Math.max(0, responseText.length - 500)));
    
    // Check if it's a truncation issue
    if (error instanceof SyntaxError && error.message.includes("position")) {
      throw new Error(
        "AI response was truncated. The learning goal may be too complex. Try breaking it into smaller parts or providing a more focused topic."
      );
    }
    
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Call the hierarchical extraction AI
 * Returns the parsed extraction result or throws an error
 */
export async function extractHierarchicalKnowledge(
  input: ExtractionInput,
  options: ExtractionOptions = {}
): Promise<HierarchicalExtractionResponse> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Load the system prompt
    const systemPrompt = await loadPrompt();
    
    // Format the user message
    const userMessage = formatPromptInput(input);
    
    // Use OpenAI GPT-4o for large responses (no 16KB limit)
    // Blackbox has a hard 16KB output limit that causes truncation
    const model = openai("gpt-5-mini-2025-08-07");
    
    // Call AI with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("AI processing timeout"));
      }, opts.timeout);
    });
    
    // Use streaming to handle response
    const streamPromise = streamText({
      model,
      system: systemPrompt,
      prompt: userMessage,
      temperature: opts.temperature,
      maxRetries: 2,
    });
    
    const stream = await Promise.race([streamPromise, timeoutPromise]);
    
    // Collect the full response from the stream
    let fullText = "";
    for await (const chunk of stream.textStream) {
      fullText += chunk;
    }
    
    console.log("AI response received, length:", fullText.length);
    
    // Parse the response
    const parsed = parseAIResponse(fullText);
    
    // Check if it's an error response
    if ("error" in parsed) {
      throw new Error(
        `AI returned error: ${parsed.error.code} - ${parsed.error.message}`
      );
    }
    
    return parsed;
  } catch (error) {
    console.error("Hierarchical extraction failed:", error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        throw new Error(
          `AI processing took too long (>${Math.round(opts.timeout / 1000)}s). Please try again or simplify your input.`
        );
      }
      throw error;
    }
    
    throw new Error("Unknown error during hierarchical extraction");
  }
}

/**
 * Test function to validate the extraction works
 * Can be used in development/testing
 */
export async function testExtraction(): Promise<void> {
  const testInput: ExtractionInput = {
    subject: "Philosophy",
    courseName: "Ethics",
    learningGoalText: "I want to learn about Kantian Ethics",
    userId: "test-user-id",
  };
  
  console.log("Testing hierarchical extraction...");
  console.log("Input:", testInput);
  
  try {
    const result = await extractHierarchicalKnowledge(testInput);
    console.log("Success!");
    console.log("Extracted concepts:", result.extractionMetadata.totalAtomicConcepts);
    console.log("Tree depth:", result.extractionMetadata.treeDepth);
    console.log("Confidence:", result.extractionMetadata.extractionConfidence);
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
}

/**
 * Zod schema matching HierarchicalExtractionResponse for typed object generation
 */
const InputTypeSchema = z.enum(["broad", "moderate", "specific", "very_specific"]);

const InputAnalysisSchema = z.object({
  inputType: InputTypeSchema,
  detectedScope: z.string(),
  recommendedDepth: z.number(),
  estimatedConceptCount: z.number(),
});

const SubjectDataSchema = z.object({
  name: z.string(),
  slug: z.string(),
  metadata: z
    .object({
      description: z.string().optional(),
      academicLevel: z.string().optional(),
    })
    .optional(),
});

type NodeChildRuntime = {
  name: string;
  slug: string;
  path: string;
  order: number;
  nodeType: "subdirectory" | "concept";
  isAtomic: boolean;
  importance?: number | null;
  category?: string | null;
  metadata?: Record<string, unknown>;
  children?: NodeChildRuntime[];
};

const NodeChildSchema: z.ZodType<NodeChildRuntime> = z.lazy(() =>
  z.object({
    name: z.string(),
    slug: z.string(),
    path: z.string(),
    order: z.number(),
    nodeType: z.enum(["subdirectory", "concept"]),
    isAtomic: z.boolean(),
    importance: z.number().nullable().optional(),
    category: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
    children: z.array(NodeChildSchema).optional(),
  })
);

const SubdirectorySchema = z.object({
  name: z.string(),
  slug: z.string(),
  path: z.string(),
  order: z.number(),
  metadata: z
    .object({
      description: z.string().optional(),
      weeksCovered: z.string().nullable().optional(),
    })
    .optional(),
  children: z.array(NodeChildSchema),
});

const CourseDataSchema = z.object({
  name: z.string(),
  slug: z.string(),
  code: z.string().nullable().optional(),
  path: z.string(),
  order: z.number(),
  metadata: z
    .object({
      description: z.string().optional(),
      credits: z.string().nullable().optional(),
      semester: z.string().nullable().optional(),
    })
    .optional(),
  subdirectories: z.array(SubdirectorySchema),
});

const KnowledgeTreeSchema = z.object({
  subject: SubjectDataSchema,
  courses: z.array(CourseDataSchema),
});

const AtomicConceptSchema = z.object({
  conceptText: z.string(),
  path: z.string(),
  parentPath: z.string(),
  importance: z.number().nullable(),
  category: z.string().nullable(),
  order: z.number(),
  isAtomic: z.boolean(),
  flashcardQuestion: z.string(),
});

const ExtractionMetadataSchema = z.object({
  totalNodes: z.number(),
  totalAtomicConcepts: z.number(),
  treeDepth: z.number(),
  coursesCount: z.number(),
  subdirectoriesCount: z.number(),
  coreConceptsCount: z.number(),
  importantConceptsCount: z.number(),
  supplementalConceptsCount: z.number(),
  extractionConfidence: z.number(),
  processingNotes: z.string(),
});

const QualityChecksSchema = z.object({
  allConceptsAtomic: z.boolean(),
  appropriateDepth: z.boolean(),
  completeHierarchy: z.boolean(),
  logicalRelationships: z.boolean(),
  noDuplicates: z.boolean(),
  requiresReview: z.boolean(),
});

const HierarchicalExtractionResponseSchema = z.object({
  inputAnalysis: InputAnalysisSchema,
  knowledgeTree: KnowledgeTreeSchema,
  atomicConcepts: z.array(AtomicConceptSchema),
  extractionMetadata: ExtractionMetadataSchema,
  qualityChecks: QualityChecksSchema,
});

/**
 * Structured, typed extraction using Vercel AI SDK object generation
 */
export async function extractHierarchicalKnowledgeStructured(
  input: ExtractionInput,
  options: ExtractionOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const systemPrompt = await loadPrompt();
  const userMessage = formatPromptInput(input);

  const model = openai("gpt-4o-mini");

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("AI processing timeout")), opts.timeout)
  );

  const genPromise = generateObject({
    model,
    system: systemPrompt,
    prompt: userMessage,
    schema: HierarchicalExtractionResponseSchema,
    temperature: opts.temperature,
    maxRetries: 2,
  });

  const { object } = await Promise.race([genPromise, timeoutPromise]);

  return object;
}

/**
 * Validate an extracted hierarchical knowledge JSON file against quality rules.
 *
 * Usage:
 *   pnpm tsx scripts/validate-extraction.ts extracted-knowledge-structure.json
 *   # or without arg, defaults to ./extracted-knowledge-structure.json
 */

import { readFile } from "fs/promises";
import { resolve } from "path";
import process from "node:process";

import {
  validateExtractionQuality,
  validateConceptsMatchTree,
  requiresManualReview,
  getQualityScore,
  ExtractionQualityError,
} from "../src/lib/validation/extraction-quality";

import type {
  HierarchicalExtractionResponse,
} from "../src/types/hierarchical-extraction";

function isHierarchicalExtractionResponse(
  obj: unknown
): obj is HierarchicalExtractionResponse {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    "inputAnalysis" in o &amp;&amp;
    "knowledgeTree" in o &amp;&amp;
    "atomicConcepts" in o &amp;&amp;
    "extractionMetadata" in o &amp;&amp;
    "qualityChecks" in o
  );
}

async function main(): Promise<void> {
  const argPath = process.argv[2] ?? "extracted-knowledge-structure.json";
  const filePath = resolve(process.cwd(), argPath);

  console.log("Reading extraction JSON from:", filePath);
  const raw = await readFile(filePath, "utf-8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("ERROR: Failed to parse JSON file.");
    console.error(e);
    process.exit(1);
  }

  // Guard against error-shaped responses
  if (parsed &amp;&amp; typeof parsed === "object" &amp;&amp; "error" in (parsed as any)) {
    console.error("ERROR: Extraction contains an error payload:", (parsed as any).error);
    process.exit(1);
  }

  if (!isHierarchicalExtractionResponse(parsed)) {
    console.error(
      "ERROR: JSON does not match expected HierarchicalExtractionResponse shape."
    );
    console.error(
      "Required top-level keys: inputAnalysis, knowledgeTree, atomicConcepts, extractionMetadata, qualityChecks"
    );
    process.exit(1);
  }

  const response = parsed as HierarchicalExtractionResponse;

  try {
    // Structural validation between concepts and tree
    validateConceptsMatchTree(response);

    // Quality gate validation (atomicity, confidence, etc.)
    validateExtractionQuality(response);

    // Derived metrics
    const review = requiresManualReview(
      response.extractionMetadata,
      response.qualityChecks
    );
    const score = getQualityScore(
      response.extractionMetadata,
      response.qualityChecks
    );

    // Summary
    console.log("Validation SUCCESS");
    console.log("Summary:");
    console.log("- Subject:", response.knowledgeTree.subject.name);
    console.log(
      "- Course:",
      response.knowledgeTree.courses?.[0]?.name ?? "(first course not present)"
    );
    console.log("- Total atomic concepts:", response.extractionMetadata.totalAtomicConcepts);
    console.log("- Tree depth:", response.extractionMetadata.treeDepth);
    console.log("- Extraction confidence:", response.extractionMetadata.extractionConfidence);
    console.log("- Input type:", response.inputAnalysis.inputType);
    console.log("- Requires review:", review ? "YES" : "NO");
    console.log("- Quality score (0-100):", score);
    console.log("Quality checks:", response.qualityChecks);
  } catch (err) {
    if (err instanceof ExtractionQualityError) {
      console.error("Validation FAILED with quality error:");
      console.error("- Code:", err.code);
      console.error("- Message:", err.message);
      if (err.details) console.error("- Details:", err.details);
      process.exit(2);
    }

    console.error("Validation FAILED with unexpected error:");
    console.error(err);
    process.exit(3);
  }
}

main().catch((e) => {
  console.error("Unexpected failure running validator:", e);
  process.exit(4);
});

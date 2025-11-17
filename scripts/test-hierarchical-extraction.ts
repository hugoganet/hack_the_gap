/**
 * Test script for hierarchical extraction
 * Run with: npx tsx scripts/test-hierarchical-extraction.ts
 */

import { extractHierarchicalKnowledge } from "@/lib/ai/hierarchical-extraction";
import { validateExtractionQuality } from "@/lib/validation/extraction-quality";

async function testExtraction() {
  console.log("🧪 Testing Hierarchical Knowledge Extraction\n");

  const testCases = [
    {
      name: "Specific Topic - Kantian Ethics",
      input: {
        subject: "Philosophy",
        courseName: "Ethics",
        learningGoalText: "I want to learn about Kantian Ethics",
        userId: "test-user-id",
      },
    },
    {
      name: "Moderate Input - Cell Biology Course",
      input: {
        subject: "Biology",
        courseName: "Cell Biology",
        learningGoalText: `
          BIOL2001: Cell Biology
          Course Content:
          Unit 1: Cell Structure
          - Cell Membrane and Transport
          - Nucleus and Genetic Material
          - Organelles
          
          Unit 2: Cell Division
          - Cell Cycle
          - Mitosis
          - Meiosis
        `,
        userId: "test-user-id",
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Test Case: ${testCase.name}`);
    console.log("─".repeat(60));

    try {
      console.log("⏳ Calling AI extraction...");
      const result = await extractHierarchicalKnowledge(testCase.input);

      console.log("✅ Extraction successful!");
      console.log(`   Input Type: ${result.inputAnalysis.inputType}`);
      console.log(`   Total Concepts: ${result.extractionMetadata.totalAtomicConcepts}`);
      console.log(`   Tree Depth: ${result.extractionMetadata.treeDepth}`);
      console.log(`   Confidence: ${result.extractionMetadata.extractionConfidence}`);

      // Validate quality
      console.log("\n⏳ Validating extraction quality...");
      validateExtractionQuality(result);
      console.log("✅ Quality validation passed!");

      // Show sample concepts
      console.log("\n📚 Sample Concepts:");
      result.atomicConcepts.slice(0, 5).forEach((concept, i) => {
        console.log(`   ${i + 1}. ${concept.conceptText} (importance: ${concept.importance ?? "N/A"})`);
      });

      console.log("\n✅ Test passed!");
    } catch (error) {
      console.error("❌ Test failed:");
      console.error(error instanceof Error ? error.message : error);
    }
  }

  const separator = "=".repeat(60);
  console.log(`\n${separator}`);
  console.log("🎉 All tests completed!");
}

// Run tests
testExtraction().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

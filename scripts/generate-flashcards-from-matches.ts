/**
 * Script to generate flashcards from all existing high-confidence concept matches
 * 
 * Usage:
 *   npx tsx scripts/generate-flashcards-from-matches.ts
 * 
 * This script will:
 * 1. Find all high-confidence concept matches (≥0.8)
 * 2. Group by video job and user
 * 3. Generate flashcards for each group
 * 4. Report results
 */

import { prisma } from "@/lib/prisma";
import { generateFlashcardsForVideoJob } from "@/features/flashcards/flashcard-generator";
import { MATCH_THRESHOLDS } from "@/features/matching/config";

async function main() {
  console.log("🚀 Starting flashcard generation from existing matches...\n");

  // 1. Find all high-confidence matches grouped by video job
  const matches = await prisma.conceptMatch.findMany({
    where: {
      confidence: {
        gte: MATCH_THRESHOLDS.HIGH, // 0.8
      },
    },
    include: {
      concept: {
        include: {
          videoJob: {
            select: {
              id: true,
              userId: true,
              status: true,
            },
          },
        },
      },
    },
  });

  console.log(`📊 Found ${matches.length} high-confidence matches\n`);

  if (matches.length === 0) {
    console.log("✅ No matches found. Nothing to process.");
    return;
  }

  // 2. Group by video job
  const videoJobGroups = new Map<string, { userId: string; matchCount: number }>();
  
  for (const match of matches) {
    const videoJobId = match.concept.videoJob.id;
    const userId = match.concept.videoJob.userId;
    
    if (!videoJobGroups.has(videoJobId)) {
      videoJobGroups.set(videoJobId, { userId, matchCount: 0 });
    }
    
    const group = videoJobGroups.get(videoJobId);
    if (group) {
      group.matchCount++;
    }
  }

  console.log(`📹 Found ${videoJobGroups.size} video jobs with high-confidence matches\n`);

  // 3. Process each video job
  let totalProcessed = 0;
  let totalSuccessful = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  const errors: { videoJobId: string; error: string }[] = [];

  // Process each video job sequentially (required for AI generation)
  // eslint-disable-next-line no-await-in-loop
  for (const [videoJobId, { userId, matchCount }] of videoJobGroups.entries()) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`📹 Processing Video Job: ${videoJobId}`);
    console.log(`   User: ${userId}`);
    console.log(`   Matches: ${matchCount}`);
    console.log(`${"=".repeat(80)}\n`);

    try {
      // eslint-disable-next-line no-await-in-loop
      const summary = await generateFlashcardsForVideoJob(videoJobId, userId);
      
      totalProcessed += summary.attempted;
      totalSuccessful += summary.successful;
      totalFailed += summary.failed;
      totalSkipped += summary.skipped;

      console.log(`\n✅ Video Job ${videoJobId} completed:`);
      console.log(`   ✓ Successful: ${summary.successful}`);
      console.log(`   ✗ Failed: ${summary.failed}`);
      console.log(`   ⊘ Skipped: ${summary.skipped}`);
      console.log(`   ⏱ Avg Time: ${summary.avgGenerationTimeMs}ms per flashcard`);
      console.log(`   📊 Avg Confidence: ${(summary.avgConfidence * 100).toFixed(0)}%`);

      if (summary.errors.length > 0) {
        console.log(`\n   ⚠️  Errors:`);
        for (const error of summary.errors) {
          console.log(`      - Match ${error.conceptMatchId}: ${error.error}`);
        }
      }
    } catch (error) {
      console.error(`\n❌ Error processing video job ${videoJobId}:`, error);
      errors.push({
        videoJobId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      totalFailed += matchCount;
    }

    // Small delay between video jobs to avoid overwhelming the API
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 4. Final summary
  console.log(`\n${"=".repeat(80)}`);
  console.log("📊 FINAL SUMMARY");
  console.log(`${"=".repeat(80)}\n`);
  console.log(`Video Jobs Processed: ${videoJobGroups.size}`);
  console.log(`Total Matches Attempted: ${totalProcessed}`);
  console.log(`✓ Successful: ${totalSuccessful}`);
  console.log(`✗ Failed: ${totalFailed}`);
  console.log(`⊘ Skipped: ${totalSkipped}`);
  
  const successRate = totalProcessed > 0 
    ? ((totalSuccessful / totalProcessed) * 100).toFixed(1)
    : "0";
  console.log(`\nSuccess Rate: ${successRate}%`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Video Jobs with Errors (${errors.length}):`);
    for (const error of errors) {
      console.log(`   - ${error.videoJobId}: ${error.error}`);
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("✅ Flashcard generation completed!");
  console.log(`${"=".repeat(80)}\n`);
}

// Run the script
main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

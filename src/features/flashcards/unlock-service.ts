/**
 * Flashcard Answer Unlock Service
 * Unlocks flashcard answers when high-confidence concept matches are found
 */

import { prisma } from "@/lib/prisma"; // Align with project-wide prisma import convention
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { ConceptMatch, Concept, SyllabusConcept } from "@/generated/prisma";
import { buildFlashcardAnswerPrompt } from "@/master-prompts/flashcard-answer-unlock-prompt";

export type UnlockResult = {
  flashcardId: string;
  question: string;
  answer: string;
  conceptText: string;
  unlockedAt: Date;
  source: string;
  confidence: number;
};

/**
 * Unlock flashcard answers for high-confidence concept matches
 * Returns array of unlocked flashcards for notification
 */
export async function unlockFlashcardAnswers(
  matches: ConceptMatch[],
  contentJobId: string,
  userId: string
): Promise<UnlockResult[]> {
  console.log(`🔓 Unlock service: Processing ${matches.length} matches for user ${userId}`);
  
  const unlocked: UnlockResult[] = [];

  // Create tasks for processing each match to avoid top-level await inside a loop
  const tasks = matches.map((match) => async (): Promise<UnlockResult | null> => {
    // Only unlock for high-confidence matches (≥70%)
    if (match.confidence < 0.7) {
      console.log(`  ⏭️  Skipping match (confidence ${match.confidence} < 0.7)`);
      return null;
    }

    console.log(`  🔍 Processing match: ${match.id} (confidence: ${match.confidence})`);

    // Find locked flashcard for this syllabus concept
    const flashcard = await prisma.flashcard.findFirst({
      where: {
        syllabusConceptId: match.syllabusConceptId,
        userId,
        state: "locked",
      },
      include: {
        syllabusConcept: true,
      },
    });

    if (!flashcard) {
      console.log(`  ⏭️  No locked flashcard found for syllabus concept ${match.syllabusConceptId}`);
      return null;
    }

    console.log(`  📝 Found locked flashcard: ${flashcard.id} - "${flashcard.question}"`);

    // Get extracted concept details
    const extractedConcept = await prisma.concept.findUnique({
      where: { id: match.conceptId },
    });

    if (!extractedConcept) {
      console.log(`  ⚠️  Extracted concept not found: ${match.conceptId}`);
      return null;
    }

    console.log(`  🤖 Generating answer from content...`);

    // Generate answer from matched content
    const answer = await generateAnswerFromContent(
      extractedConcept,
      flashcard.syllabusConcept,
      match.rationale || ""
    );

    console.log(`  ✅ Answer generated: "${answer.substring(0, 50)}..."`);

    // UNLOCK: Add answer and update state
    const unlockedFlashcard = await prisma.flashcard.update({
      where: { id: flashcard.id },
      data: {
        answer,
        conceptMatchId: match.id,
        state: "unlocked",
        unlockedAt: new Date(),
        unlockedBy: contentJobId,
        nextReviewAt: new Date(), // Ready for immediate review
      },
    });

    console.log(`  🔓 Flashcard unlocked: ${unlockedFlashcard.id}`);

    // Create unlock event (for analytics)
    await prisma.unlockEvent.create({
      data: {
        userId,
        flashcardId: unlockedFlashcard.id,
        contentJobId,
        conceptMatchId: match.id,
        confidence: match.confidence,
      },
    });

    console.log(`  📊 Unlock event recorded`);

    // Get content job details for source attribution
    const contentJob = await prisma.contentJob.findUnique({
      where: { id: contentJobId },
      select: { url: true, fileName: true, contentType: true },
    });

    const source =
      contentJob?.fileName ||
      contentJob?.url ||
      "Unknown source";

    return {
      flashcardId: unlockedFlashcard.id,
      question: flashcard.question,
      answer,
      conceptText: flashcard.syllabusConcept.conceptText,
      unlockedAt: unlockedFlashcard.unlockedAt ?? new Date(),
      source,
      confidence: match.confidence,
    };
  });

  // Execute all tasks in parallel (or concurrently) and collect results
  const settled = await Promise.allSettled(tasks.map(async (t) => t()));
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value) {
      unlocked.push(r.value);
    } else if (r.status === "rejected") {
      console.error("Error processing a match:", r.reason);
    }
  }

  console.log(`🎉 Unlocked ${unlocked.length} flashcards total`);

  // Update user stats
  if (unlocked.length > 0) {
    await updateUserStatsAfterUnlock(userId, unlocked.length);
  }

  return unlocked;
}

/**
 * Force-unlock a single flashcard from a concept match (e.g. user confirmed a partial match)
 * Bypasses confidence threshold and treats the match as if it were high-confidence.
 * Idempotent: if flashcard already unlocked via this match, it returns existing state without duplicating events.
 */
export async function forceUnlockFlashcardAnswer(
  conceptMatchId: string,
  userId: string
): Promise<UnlockResult | null> {
  const match = await prisma.conceptMatch.findUnique({
    where: { id: conceptMatchId },
    include: {
      concept: true,
      syllabusConcept: true,
    },
  });

  if (!match) {
    console.log(`forceUnlock: ConceptMatch not found ${conceptMatchId}`);
    return null;
  }

  // Locate locked flashcard for this syllabus concept + user
  const flashcard = await prisma.flashcard.findFirst({
    where: {
      syllabusConceptId: match.syllabusConceptId,
      userId,
    },
    include: { syllabusConcept: true },
  });

  if (!flashcard) {
    console.log(`forceUnlock: No flashcard found for syllabusConcept ${match.syllabusConceptId}`);
    return null;
  }

  // If already unlocked (answer present + state unlocked) do not regenerate
  if (flashcard.state === "unlocked" && flashcard.answer) {
    console.log(`forceUnlock: Flashcard already unlocked ${flashcard.id}`);
    return {
      flashcardId: flashcard.id,
      question: flashcard.question,
      answer: flashcard.answer,
      conceptText: flashcard.syllabusConcept.conceptText,
      unlockedAt: flashcard.unlockedAt ?? new Date(),
      source: flashcard.unlockedBy ?? "manual-confirmation",
      confidence: match.confidence,
    };
  }

  // Fetch content job for source attribution & for unlock event foreign key
  const contentJob = await prisma.contentJob.findUnique({
    where: { id: match.concept.contentJobId },
    select: { id: true, fileName: true, url: true },
  });

  const source = contentJob?.fileName || contentJob?.url || "manual-confirmation";

  // Generate answer (reuse internal helper)
  const answer = await generateAnswerFromContent(
    match.concept,
    match.syllabusConcept,
    match.rationale || "User confirmed match"
  );

  const updated = await prisma.flashcard.update({
    where: { id: flashcard.id },
    data: {
      answer,
      conceptMatchId: match.id,
      state: "unlocked",
      unlockedAt: new Date(),
      unlockedBy: match.concept.contentJobId,
      nextReviewAt: new Date(),
    },
  });

  // Mark user feedback for auditing (treat as exact)
  await prisma.conceptMatch.update({
    where: { id: match.id },
    data: {
      matchType: match.matchType === "exact" ? match.matchType : "exact",
      userFeedback: "correct",
    },
  });

  // Create unlock event (manual override equivalent)
  await prisma.unlockEvent.create({
    data: {
      userId,
      flashcardId: updated.id,
      contentJobId: match.concept.contentJobId,
      conceptMatchId: match.id,
      confidence: match.confidence,
    },
  });

  // Update stats (single unlock)
  await updateUserStatsAfterUnlock(userId, 1);

  return {
    flashcardId: updated.id,
    question: updated.question,
    answer,
    conceptText: match.syllabusConcept.conceptText,
    unlockedAt: updated.unlockedAt ?? new Date(),
    source,
    confidence: match.confidence,
  };
}

/**
 * Generate answer from matched content using AI
 */
async function generateAnswerFromContent(
  extractedConcept: Concept,
  syllabusConcept: SyllabusConcept,
  matchRationale: string
): Promise<string> {
  const answerLanguage = (extractedConcept.language || syllabusConcept.language || "en").trim();
  try { console.log(`[unlock] target answer language: ${answerLanguage}`); } catch {}
  const prompt = buildFlashcardAnswerPrompt({
    extractedConcept,
    syllabusConcept,
    matchRationale,
    answerLanguage,
  });

  try {
    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt,
      temperature: 0.3,
    });

    return text.trim();
  } catch (error) {
    console.error("Error generating answer:", error);
    // Fallback to basic answer
    return extractedConcept.definition || "Answer generation failed";
  }
}

/**
 * Update user stats after unlocking flashcards
 * Handles streaks, milestones, and unlock rate
 */
async function updateUserStatsAfterUnlock(
  userId: string,
  unlockCount: number
): Promise<void> {
  console.log(`📊 Updating user stats for ${unlockCount} unlocks...`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    console.log(`  Creating new user stats...`);
    // Create stats if not exists
    await prisma.userStats.create({
      data: {
        userId,
        totalUnlocks: unlockCount,
        totalLocked: 0,
        totalMastered: 0,
        unlockRate: 0.0,
        currentStreak: 1,
        longestStreak: 1,
        lastUnlockDate: today,
        firstUnlockAt: new Date(),
      },
    });
    console.log(`  ✓ User stats created`);
    return;
  }

  // Check if last unlock was yesterday (streak continues)
  const lastUnlock = stats.lastUnlockDate;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = stats.currentStreak;
  if (!lastUnlock || lastUnlock < yesterday) {
    // Streak broken, reset to 1
    newStreak = 1;
    console.log(`  🔥 Streak reset to 1 (last unlock was ${lastUnlock?.toISOString() || "never"})`);
  } else if (lastUnlock.getTime() === yesterday.getTime()) {
    // Streak continues
    newStreak = stats.currentStreak + 1;
    console.log(`  🔥 Streak continues: ${newStreak} days`);
  } else {
    // Already unlocked today, don't increment
    console.log(`  🔥 Already unlocked today, streak stays at ${stats.currentStreak}`);
  }

  const newLongestStreak = Math.max(stats.longestStreak, newStreak);

  // Calculate new unlock rate
  const totalFlashcards = await prisma.flashcard.count({
    where: { userId },
  });
  const totalUnlocked = stats.totalUnlocks + unlockCount;
  const unlockRate = totalFlashcards > 0 ? totalUnlocked / totalFlashcards : 0;

  console.log(`  📈 Unlock rate: ${Math.round(unlockRate * 100)}% (${totalUnlocked}/${totalFlashcards})`);

  // Update stats
  await prisma.userStats.update({
    where: { userId },
    data: {
      totalUnlocks: { increment: unlockCount },
      totalLocked: { decrement: unlockCount },
      unlockRate,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastUnlockDate: today,
      firstUnlockAt: stats.firstUnlockAt || new Date(),
    },
  });

  console.log(`  ✓ User stats updated`);

  // Check milestones
  const previousTotal = stats.totalUnlocks;
  const newTotal = totalUnlocked;

  if (previousTotal < 10 && newTotal >= 10) {
    await prisma.userStats.update({
      where: { userId },
      data: { milestone10: new Date() },
    });
    console.log(`  🎯 Milestone reached: 10 unlocks!`);
  }
  if (previousTotal < 50 && newTotal >= 50) {
    await prisma.userStats.update({
      where: { userId },
      data: { milestone50: new Date() },
    });
    console.log(`  🚀 Milestone reached: 50 unlocks!`);
  }
  if (previousTotal < 100 && newTotal >= 100) {
    await prisma.userStats.update({
      where: { userId },
      data: { milestone100: new Date() },
    });
    console.log(`  🏆 Milestone reached: 100 unlocks!`);
  }
}

/**
 * Get unlock statistics for a user
 */
export async function getUserUnlockStats(userId: string) {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    // Return default stats if not found
    return {
      totalUnlocks: 0,
      totalLocked: 0,
      totalMastered: 0,
      unlockRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastUnlockDate: null,
      firstUnlockAt: null,
    };
  }

  return stats;
}

/**
 * Get recent unlock events for a user
 */
export async function getRecentUnlocks(userId: string, limit = 10) {
  return prisma.unlockEvent.findMany({
    where: { userId },
    include: {
      flashcard: {
        include: {
          syllabusConcept: true,
        },
      },
      contentJob: {
        select: {
          url: true,
          fileName: true,
          contentType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

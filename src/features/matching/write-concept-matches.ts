import { prisma } from "@/lib/prisma";
import type { MatchResultDTO } from "./concept-matcher";

/**
 * Writes concept matches to the database with idempotency.
 * For each conceptId, we upsert (replace) any existing match.
 * Only creates records if confidence >= MEDIUM threshold (0.60).
 */
export async function writeConceptMatches(
  results: MatchResultDTO[]
): Promise<{ created: number; updated: number }> {
  if (results.length === 0) {
    return { created: 0, updated: 0 };
  }

  // Get all existing matches for these concepts in one query
  const conceptIds = results.map((r) => r.conceptId);
  const existingMatches = await prisma.conceptMatch.findMany({
    where: { conceptId: { in: conceptIds } },
    select: { id: true, conceptId: true },
  });

  const existingMap = new Map(
    existingMatches.map((m) => [m.conceptId, m.id])
  );

  // Separate into updates and creates
  const toUpdate = results.filter((r) => existingMap.has(r.conceptId));
  const toCreate = results.filter((r) => !existingMap.has(r.conceptId));

  // Batch update using transactions
  const updatePromises = toUpdate.map(async (result) => {
    const matchId = existingMap.get(result.conceptId);
    if (!matchId) return;
    
    return prisma.conceptMatch.update({
      where: { id: matchId },
      data: {
        syllabusConceptId: result.syllabusConceptId,
        confidence: result.confidence,
        matchType: result.matchType,
        rationale: result.rationale,
      },
    });
  });

  // Batch create
  const createPromise = async () => {
    if (toCreate.length === 0) {
      return { count: 0 };
    }
    return prisma.conceptMatch.createMany({
      data: toCreate.map((result) => ({
        conceptId: result.conceptId,
        syllabusConceptId: result.syllabusConceptId,
        confidence: result.confidence,
        matchType: result.matchType,
        rationale: result.rationale,
      })),
    });
  };

  // Execute all operations in parallel
  const [, createResult] = await Promise.all([
    Promise.all(updatePromises),
    createPromise(),
  ]);

  return {
    created: createResult.count,
    updated: toUpdate.length,
  };
}

/**
 * Deletes all concept matches for a given video job.
 * Useful for re-matching or cleanup.
 */
export async function deleteConceptMatchesByVideoJob(
  videoJobId: string
): Promise<number> {
  const concepts = await prisma.concept.findMany({
    where: { videoJobId },
    select: { id: true },
  });

  const conceptIds = concepts.map((c) => c.id);

  const result = await prisma.conceptMatch.deleteMany({
    where: {
      conceptId: { in: conceptIds },
    },
  });

  return result.count;
}

import { prisma } from "@/lib/prisma";
import type { MatchResultDTO } from "./concept-matcher";
import type { ConceptMatch } from "@/generated/prisma";

/**
 * Writes concept matches to the database with idempotency.
 * For each conceptId, we upsert (replace) any existing match.
 * Only creates records if confidence >= MEDIUM threshold (0.60).
 * Returns the created/updated ConceptMatch objects for unlock service.
 */
export async function writeConceptMatches(
  results: MatchResultDTO[],
  contentJobId: string,
  userId: string
): Promise<{ matches: ConceptMatch[]; created: number; updated: number }> {
  if (results.length === 0) {
    return { matches: [], created: 0, updated: 0 };
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

  // Batch update and collect updated matches
  const updatedMatches = await Promise.all(
    toUpdate.map(async (result) => {
      const matchId = existingMap.get(result.conceptId);
      if (!matchId) return null;
      
      return prisma.conceptMatch.update({
        where: { id: matchId },
        data: {
          syllabusConceptId: result.syllabusConceptId,
          confidence: result.confidence,
          matchType: result.matchType,
          rationale: result.rationale,
        },
      });
    })
  );

  // Batch create and then fetch created matches
  let createdMatches: ConceptMatch[] = [];
  if (toCreate.length > 0) {
    await prisma.conceptMatch.createMany({
      data: toCreate.map((result) => ({
        conceptId: result.conceptId,
        syllabusConceptId: result.syllabusConceptId,
        confidence: result.confidence,
        matchType: result.matchType,
        rationale: result.rationale,
      })),
    });

    // Fetch the created matches
    createdMatches = await prisma.conceptMatch.findMany({
      where: {
        conceptId: { in: toCreate.map((r) => r.conceptId) },
      },
    });
  }

  // Combine updated and created matches
  const allMatches = [
    ...updatedMatches.filter((m): m is ConceptMatch => m !== null),
    ...createdMatches,
  ];

  const createdCount = createdMatches.length;
  const updatedCount = updatedMatches.filter(m => m !== null).length;

  console.log(`📝 Wrote ${allMatches.length} concept matches (${createdCount} created, ${updatedCount} updated)`);

  return { matches: allMatches, created: createdCount, updated: updatedCount };
}

/**
 * Deletes all concept matches for a given video job.
 * Useful for re-matching or cleanup.
 */
export async function deleteConceptMatchesByVideoJob(
  videoJobId: string
): Promise<number> {
  const concepts = await prisma.concept.findMany({
    where: { videoJobId: videoJobId },
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

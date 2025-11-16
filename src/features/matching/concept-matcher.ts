import { prisma } from "@/lib/prisma";
import type { Concept, SyllabusConcept } from "@/generated/prisma";
import { BLEND_WEIGHTS, MATCH_SHORTLIST_TOP_K, MATCH_THRESHOLDS, type MatchType } from "./config";
import { buildExtractedText, buildSyllabusText, cosineSimilarity, embedTextsOrNull } from "@/lib/ai/embeddings";
import { verifyWithLLM } from "./ai-reasoning";

export type MatchResultDTO = {
  conceptId: string;
  syllabusConceptId: string;
  confidence: number;
  matchType: MatchType;
  rationale: string;
  sim: number;
  llmConfidence: number | null;
};

export async function matchConceptsToSyllabus(videoJobId: string, courseId: string) {
  const concepts = await prisma.concept.findMany({
    where: { videoJobId },
    orderBy: { createdAt: "asc" },
  });
  const syllabus = await prisma.syllabusConcept.findMany({
    where: { courseId },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const extractedTexts = concepts.map((c) => buildExtractedText(c));
  const syllabusTexts = syllabus.map((s) => buildSyllabusText(s));

  const [extractedEmbeds, syllabusEmbeds] = await Promise.all([
    embedTextsOrNull(extractedTexts),
    embedTextsOrNull(syllabusTexts),
  ]);

  const simMatrix: number[][] = [];
  const results: MatchResultDTO[] = [];

  for (let i = 0; i < concepts.length; i++) {
    const c = concepts[i];

    // If embeddings are available, compute similarities; else default zeros
    const sims: number[] = [];
    if (extractedEmbeds && syllabusEmbeds) {
      for (let j = 0; j < syllabus.length; j++) {
        sims.push(cosineSimilarity(extractedEmbeds[i], syllabusEmbeds[j]));
      }
    } else {
      for (let j = 0; j < syllabus.length; j++) sims.push(0);
    }
    simMatrix.push(sims);

    // Shortlist top-K candidates above MEDIUM threshold
    const candidates = sims
      .map((v, idx) => ({ idx, v }))
      .filter((x) => x.v >= MATCH_THRESHOLDS.MEDIUM)
      .sort((a, b) => b.v - a.v)
      .slice(0, MATCH_SHORTLIST_TOP_K);

    let best: MatchResultDTO | null = null;

    for (const cand of candidates) {
      const s = syllabus[cand.idx];
      const llm = await verifyWithLLM({
        extractedName: c.conceptText,
        extractedDefinition: c.definition ?? null,
        syllabusName: s.conceptText,
        syllabusCategory: s.category ?? null,
        embeddingSimilarity: cand.v,
      });

      // If LLM fails, keep an embeddings-only degraded result
      const llmConfidence = llm?.confidence ?? null;
      const matchType: MatchType = llm?.matchType ?? "related";
      const rationale = llm?.rationale ?? "Similarity-based match.";
      const blended = (BLEND_WEIGHTS.SIM_WEIGHT * cand.v) + (BLEND_WEIGHTS.LLM_WEIGHT * (llmConfidence ?? cand.v));

      const candidate: MatchResultDTO = {
        conceptId: c.id,
        syllabusConceptId: s.id,
        confidence: blended,
        matchType,
        rationale,
        sim: cand.v,
        llmConfidence,
      };

      if (!best || candidate.confidence > best.confidence) {
        best = candidate;
      }
    }

    if (best && best.confidence >= MATCH_THRESHOLDS.MEDIUM) {
      results.push(best);
    }
  }

  // Summaries
  const created = results.length;
  const high = results.filter((r) => r.confidence >= MATCH_THRESHOLDS.HIGH).length;
  const medium = results.filter((r) => r.confidence >= MATCH_THRESHOLDS.MEDIUM && r.confidence < MATCH_THRESHOLDS.HIGH).length;
  const avgConfidence = results.length ? results.reduce((a, b) => a + b.confidence, 0) / results.length : 0;

  return { results, summary: { totalConcepts: concepts.length, candidatesEvaluated: simMatrix.length, created, high, medium, avgConfidence } };
}

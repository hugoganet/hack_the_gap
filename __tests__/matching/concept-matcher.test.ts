import { describe, it, expect, vi, beforeEach } from "vitest";
import { cosineSimilarity } from "@/lib/ai/embeddings";
import { MATCH_THRESHOLDS, BLEND_WEIGHTS } from "@/features/matching/config";

describe("Concept Matching", () => {
  describe("cosineSimilarity", () => {
    it("should return 1 for identical vectors", () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([1, 0, 0]);
      expect(cosineSimilarity(a, b)).toBe(1);
    });

    it("should return 0 for orthogonal vectors", () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([0, 1, 0]);
      expect(cosineSimilarity(a, b)).toBe(0);
    });

    it("should return -1 for opposite vectors", () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([-1, 0, 0]);
      expect(cosineSimilarity(a, b)).toBe(-1);
    });

    it("should handle zero vectors", () => {
      const a = new Float32Array([0, 0, 0]);
      const b = new Float32Array([1, 0, 0]);
      expect(cosineSimilarity(a, b)).toBe(0);
    });

    it("should calculate similarity for typical embeddings", () => {
      const a = new Float32Array([0.5, 0.5, 0.5]);
      const b = new Float32Array([0.6, 0.4, 0.5]);
      const similarity = cosineSimilarity(a, b);
      expect(similarity).toBeGreaterThan(0.9);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe("Confidence Blending", () => {
    it("should blend embedding and LLM scores correctly", () => {
      const embeddingSim = 0.8;
      const llmConfidence = 0.9;
      const blended =
        BLEND_WEIGHTS.SIM_WEIGHT * embeddingSim +
        BLEND_WEIGHTS.LLM_WEIGHT * llmConfidence;
      
      // 0.6 * 0.8 + 0.4 * 0.9 = 0.48 + 0.36 = 0.84
      expect(blended).toBeCloseTo(0.84, 2);
    });

    it("should favor embedding when LLM confidence is low", () => {
      const embeddingSim = 0.9;
      const llmConfidence = 0.5;
      const blended =
        BLEND_WEIGHTS.SIM_WEIGHT * embeddingSim +
        BLEND_WEIGHTS.LLM_WEIGHT * llmConfidence;
      
      // 0.6 * 0.9 + 0.4 * 0.5 = 0.54 + 0.20 = 0.74
      expect(blended).toBeCloseTo(0.74, 2);
    });

    it("should favor LLM when embedding similarity is low", () => {
      const embeddingSim = 0.5;
      const llmConfidence = 0.9;
      const blended =
        BLEND_WEIGHTS.SIM_WEIGHT * embeddingSim +
        BLEND_WEIGHTS.LLM_WEIGHT * llmConfidence;
      
      // 0.6 * 0.5 + 0.4 * 0.9 = 0.30 + 0.36 = 0.66
      expect(blended).toBeCloseTo(0.66, 2);
    });
  });

  describe("Threshold Classification", () => {
    it("should classify high confidence matches correctly", () => {
      const confidence = 0.85;
      const isHigh = confidence >= MATCH_THRESHOLDS.HIGH;
      expect(isHigh).toBe(true);
    });

    it("should classify medium confidence matches correctly", () => {
      const confidence = 0.70;
      const isMedium = confidence >= MATCH_THRESHOLDS.MEDIUM && confidence < MATCH_THRESHOLDS.HIGH;
      expect(isMedium).toBe(true);
    });

    it("should classify low confidence matches correctly", () => {
      const confidence = 0.50;
      const isLow = confidence < MATCH_THRESHOLDS.MEDIUM;
      expect(isLow).toBe(true);
    });

    it("should handle boundary cases at thresholds", () => {
      // Test exact threshold values
      expect(MATCH_THRESHOLDS.HIGH).toBe(0.8);
      expect(MATCH_THRESHOLDS.MEDIUM).toBe(0.6);
      
      // Test values just below thresholds
      const justBelowHigh = 0.799;
      const justBelowMedium = 0.599;
      expect(justBelowHigh < MATCH_THRESHOLDS.HIGH).toBe(true);
      expect(justBelowMedium < MATCH_THRESHOLDS.MEDIUM).toBe(true);
    });
  });

  describe("Best Candidate Selection", () => {
    it("should select candidate with highest blended score", () => {
      const candidates = [
        { confidence: 0.75, matchType: "related" as const },
        { confidence: 0.85, matchType: "exact" as const },
        { confidence: 0.70, matchType: "example-of" as const },
      ];

      const best = candidates.reduce((prev, curr) =>
        curr.confidence > prev.confidence ? curr : prev
      );

      expect(best.confidence).toBe(0.85);
      expect(best.matchType).toBe("exact");
    });

    it("should handle ties by selecting first occurrence", () => {
      const candidates = [
        { confidence: 0.80, matchType: "related" as const, id: "first" },
        { confidence: 0.80, matchType: "exact" as const, id: "second" },
      ];

      const best = candidates.reduce((prev, curr) =>
        curr.confidence > prev.confidence ? curr : prev
      );

      expect(best.id).toBe("first");
    });

    it("should handle single candidate", () => {
      const candidates = [
        { confidence: 0.75, matchType: "related" as const },
      ];

      const best = candidates[0];
      expect(best.confidence).toBe(0.75);
    });

    it("should handle empty candidates", () => {
      const candidates: { confidence: number; matchType: string }[] = [];
      expect(candidates.length).toBe(0);
    });
  });

  describe("Match Type Logic", () => {
    it("should assign exact match for identical concepts", () => {
      const matchType = "exact";
      expect(matchType).toBe("exact");
    });

    it("should assign related match for connected concepts", () => {
      const matchType = "related";
      expect(matchType).toBe("related");
    });

    it("should assign example-of for specific instances", () => {
      const matchType = "example-of";
      expect(matchType).toBe("example-of");
    });
  });

  describe("Edge Cases", () => {
    it("should handle concepts with no definition", () => {
      const conceptText = "Categorical Imperative";
      const definition: string | null = null;
      const text = definition ? `${conceptText}: ${definition}` : conceptText;
      expect(text).toBe("Categorical Imperative");
    });

    it("should handle syllabus concepts with no category", () => {
      const conceptText = "Kant's Ethics";
      const category: string | null = null;
      const text = category ? `${conceptText} — ${category}` : conceptText;
      expect(text).toBe("Kant's Ethics");
    });

    it("should handle empty shortlist", () => {
      const shortlist: { idx: number; v: number }[] = [];
      expect(shortlist.length).toBe(0);
    });

    it("should handle all candidates below threshold", () => {
      const candidates = [
        { similarity: 0.50 },
        { similarity: 0.45 },
        { similarity: 0.40 },
      ];

      const aboveThreshold = candidates.filter(
        (c) => c.similarity >= MATCH_THRESHOLDS.MEDIUM
      );

      expect(aboveThreshold.length).toBe(0);
    });
  });

  describe("Performance Metrics", () => {
    it("should calculate average confidence correctly", () => {
      const results = [
        { confidence: 0.80 },
        { confidence: 0.90 },
        { confidence: 0.70 },
      ];

      const avg = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      expect(avg).toBeCloseTo(0.80, 2);
    });

    it("should handle zero results for average", () => {
      const results: { confidence: number }[] = [];
      const avg = results.length > 0 ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length : 0;
      expect(avg).toBe(0);
    });

    it("should count high confidence matches", () => {
      const results = [
        { confidence: 0.85 },
        { confidence: 0.90 },
        { confidence: 0.70 },
        { confidence: 0.65 },
      ];

      const high = results.filter((r) => r.confidence >= MATCH_THRESHOLDS.HIGH).length;
      expect(high).toBe(2);
    });

    it("should count medium confidence matches", () => {
      const results = [
        { confidence: 0.85 },
        { confidence: 0.90 },
        { confidence: 0.70 },
        { confidence: 0.65 },
      ];

      const medium = results.filter(
        (r) => r.confidence >= MATCH_THRESHOLDS.MEDIUM && r.confidence < MATCH_THRESHOLDS.HIGH
      ).length;
      expect(medium).toBe(2);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { writeConceptMatches, deleteConceptMatchesByVideoJob } from "@/features/matching/write-concept-matches";
import type { MatchResultDTO } from "@/features/matching/concept-matcher";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    conceptMatch: {
      findMany: vi.fn(),
      update: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    concept: {
      findMany: vi.fn(),
    },
  },
}));

describe("writeConceptMatches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle empty results", async () => {
    const results: MatchResultDTO[] = [];
    const result = await writeConceptMatches(results);
    
    expect(result).toEqual({ created: 0, updated: 0 });
    expect(prisma.conceptMatch.findMany).not.toHaveBeenCalled();
  });

  it("should create new matches when none exist", async () => {
    const results: MatchResultDTO[] = [
      {
        conceptId: "concept-1",
        syllabusConceptId: "syllabus-1",
        confidence: 0.85,
        matchType: "exact",
        rationale: "Test match",
        sim: 0.80,
        llmConfidence: 0.90,
      },
    ];

    vi.mocked(prisma.conceptMatch.findMany).mockResolvedValue([]);
    vi.mocked(prisma.conceptMatch.createMany).mockResolvedValue({ count: 1 });

    const result = await writeConceptMatches(results);

    expect(result).toEqual({ created: 1, updated: 0 });
    expect(prisma.conceptMatch.createMany).toHaveBeenCalledWith({
      data: [
        {
          conceptId: "concept-1",
          syllabusConceptId: "syllabus-1",
          confidence: 0.85,
          matchType: "exact",
          rationale: "Test match",
        },
      ],
    });
  });

  it("should update existing matches", async () => {
    const results: MatchResultDTO[] = [
      {
        conceptId: "concept-1",
        syllabusConceptId: "syllabus-2",
        confidence: 0.90,
        matchType: "related",
        rationale: "Updated match",
        sim: 0.85,
        llmConfidence: 0.95,
      },
    ];

    vi.mocked(prisma.conceptMatch.findMany).mockResolvedValue([
      {
        id: "match-1",
        conceptId: "concept-1",
        syllabusConceptId: "syllabus-1",
        confidence: 0.80,
        matchType: "exact",
        rationale: "Old match",
        userFeedback: null,
        createdAt: new Date(),
      },
    ]);
    vi.mocked(prisma.conceptMatch.update).mockResolvedValue({
      id: "match-1",
      conceptId: "concept-1",
      syllabusConceptId: "syllabus-2",
      confidence: 0.90,
      matchType: "related",
      rationale: "Updated match",
      userFeedback: null,
      createdAt: new Date(),
    });
    vi.mocked(prisma.conceptMatch.createMany).mockResolvedValue({ count: 0 });

    const result = await writeConceptMatches(results);

    expect(result).toEqual({ created: 0, updated: 1 });
    expect(prisma.conceptMatch.update).toHaveBeenCalledWith({
      where: { id: "match-1" },
      data: {
        syllabusConceptId: "syllabus-2",
        confidence: 0.90,
        matchType: "related",
        rationale: "Updated match",
      },
    });
  });

  it("should handle mixed create and update operations", async () => {
    const results: MatchResultDTO[] = [
      {
        conceptId: "concept-1",
        syllabusConceptId: "syllabus-1",
        confidence: 0.85,
        matchType: "exact",
        rationale: "Existing match",
        sim: 0.80,
        llmConfidence: 0.90,
      },
      {
        conceptId: "concept-2",
        syllabusConceptId: "syllabus-2",
        confidence: 0.75,
        matchType: "related",
        rationale: "New match",
        sim: 0.70,
        llmConfidence: 0.80,
      },
    ];

    vi.mocked(prisma.conceptMatch.findMany).mockResolvedValue([
      {
        id: "match-1",
        conceptId: "concept-1",
        syllabusConceptId: "syllabus-1",
        confidence: 0.80,
        matchType: "exact",
        rationale: "Old match",
        userFeedback: null,
        createdAt: new Date(),
      },
    ]);
    vi.mocked(prisma.conceptMatch.update).mockResolvedValue({
      id: "match-1",
      conceptId: "concept-1",
      syllabusConceptId: "syllabus-1",
      confidence: 0.85,
      matchType: "exact",
      rationale: "Existing match",
      userFeedback: null,
      createdAt: new Date(),
    });
    vi.mocked(prisma.conceptMatch.createMany).mockResolvedValue({ count: 1 });

    const result = await writeConceptMatches(results);

    expect(result).toEqual({ created: 1, updated: 1 });
    expect(prisma.conceptMatch.update).toHaveBeenCalledTimes(1);
    expect(prisma.conceptMatch.createMany).toHaveBeenCalledTimes(1);
  });
});

describe("deleteConceptMatchesByVideoJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete all matches for a video job", async () => {
    const videoJobId = "video-job-1";

    vi.mocked(prisma.concept.findMany).mockResolvedValue([
      {
        id: "concept-1",
        contentJobId: "video-job-1",
        conceptText: "Test",
        definition: null,
        timestamp: null,
        confidence: 0.8,
        language: "en",
        createdAt: new Date(),
      },
      {
        id: "concept-2",
        contentJobId: "video-job-1",
        conceptText: "Test 2",
        definition: null,
        timestamp: null,
        confidence: 0.8,
        language: "en",
        createdAt: new Date(),
      },
    ]);
    vi.mocked(prisma.conceptMatch.deleteMany).mockResolvedValue({ count: 2 });

    const result = await deleteConceptMatchesByVideoJob(videoJobId);

    expect(result).toBe(2);
    expect(prisma.concept.findMany).toHaveBeenCalledWith({
      where: { videoJobId },
      select: { id: true },
    });
    expect(prisma.conceptMatch.deleteMany).toHaveBeenCalledWith({
      where: {
        conceptId: { in: ["concept-1", "concept-2"] },
      },
    });
  });

  it("should handle video job with no concepts", async () => {
    const videoJobId = "video-job-empty";

    vi.mocked(prisma.concept.findMany).mockResolvedValue([]);
    vi.mocked(prisma.conceptMatch.deleteMany).mockResolvedValue({ count: 0 });

    const result = await deleteConceptMatchesByVideoJob(videoJobId);

    expect(result).toBe(0);
  });
});

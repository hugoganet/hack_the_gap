-- AlterTable: Add new fields to flashcards table
ALTER TABLE "flashcards" ADD COLUMN "syllabusConceptId" TEXT;
ALTER TABLE "flashcards" ADD COLUMN "difficulty" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "flashcards" ADD COLUMN "hints" JSONB;
ALTER TABLE "flashcards" ADD COLUMN "state" TEXT NOT NULL DEFAULT 'locked';
ALTER TABLE "flashcards" ADD COLUMN "unlockedAt" TIMESTAMP(3);
ALTER TABLE "flashcards" ADD COLUMN "unlockedBy" TEXT;
ALTER TABLE "flashcards" ADD COLUMN "unlockProgress" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE "flashcards" ADD COLUMN "relatedContentIds" JSONB;
ALTER TABLE "flashcards" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Make answer nullable (for locked state)
ALTER TABLE "flashcards" ALTER COLUMN "answer" DROP NOT NULL;

-- Make conceptMatchId nullable (for locked state)
ALTER TABLE "flashcards" ALTER COLUMN "conceptMatchId" DROP NOT NULL;

-- Update existing flashcards to have syllabusConceptId from their conceptMatch
UPDATE "flashcards" f
SET "syllabusConceptId" = cm."syllabusConceptId"
FROM "concept_matches" cm
WHERE f."conceptMatchId" = cm.id;

-- Now make syllabusConceptId NOT NULL
ALTER TABLE "flashcards" ALTER COLUMN "syllabusConceptId" SET NOT NULL;

-- Update existing flashcards to unlocked state (they have answers)
UPDATE "flashcards" 
SET "state" = 'unlocked', 
    "unlockedAt" = "createdAt"
WHERE "answer" IS NOT NULL;

-- CreateTable: unlock_events
CREATE TABLE "unlock_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "contentJobId" TEXT NOT NULL,
    "conceptMatchId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unlock_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable: user_stats
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalUnlocks" INTEGER NOT NULL DEFAULT 0,
    "totalLocked" INTEGER NOT NULL DEFAULT 0,
    "totalMastered" INTEGER NOT NULL DEFAULT 0,
    "unlockRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastUnlockDate" TIMESTAMP(3),
    "firstUnlockAt" TIMESTAMP(3),
    "milestone10" TIMESTAMP(3),
    "milestone50" TIMESTAMP(3),
    "milestone100" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flashcards_userId_state_idx" ON "flashcards"("userId", "state");

-- CreateIndex
CREATE INDEX "flashcards_syllabusConceptId_idx" ON "flashcards"("syllabusConceptId");

-- CreateIndex
CREATE UNIQUE INDEX "flashcards_syllabusConceptId_userId_key" ON "flashcards"("syllabusConceptId", "userId");

-- CreateIndex
CREATE INDEX "unlock_events_userId_createdAt_idx" ON "unlock_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "unlock_events_contentJobId_idx" ON "unlock_events"("contentJobId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_key" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "user_stats_userId_idx" ON "user_stats"("userId");

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_syllabusConceptId_fkey" FOREIGN KEY ("syllabusConceptId") REFERENCES "syllabus_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ALTER COLUMN "conceptMatchId" DROP NOT NULL;
ALTER TABLE "flashcards" DROP CONSTRAINT IF EXISTS "flashcards_conceptMatchId_fkey";
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_conceptMatchId_fkey" FOREIGN KEY ("conceptMatchId") REFERENCES "concept_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_events" ADD CONSTRAINT "unlock_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_events" ADD CONSTRAINT "unlock_events_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_events" ADD CONSTRAINT "unlock_events_contentJobId_fkey" FOREIGN KEY ("contentJobId") REFERENCES "video_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unlock_events" ADD CONSTRAINT "unlock_events_conceptMatchId_fkey" FOREIGN KEY ("conceptMatchId") REFERENCES "concept_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Initialize user_stats for existing users
INSERT INTO "user_stats" ("id", "userId", "totalUnlocks", "totalLocked", "totalMastered", "unlockRate", "currentStreak", "longestStreak", "updatedAt")
SELECT 
    gen_random_uuid(),
    u.id,
    COUNT(CASE WHEN f.state = 'unlocked' THEN 1 END)::INTEGER,
    COUNT(CASE WHEN f.state = 'locked' THEN 1 END)::INTEGER,
    0,
    CASE 
        WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN f.state = 'unlocked' THEN 1 END)::FLOAT / COUNT(*)::FLOAT
        ELSE 0.0
    END,
    0,
    0,
    CURRENT_TIMESTAMP
FROM "user" u
LEFT JOIN "flashcards" f ON f."userId" = u.id
GROUP BY u.id
ON CONFLICT ("userId") DO NOTHING;

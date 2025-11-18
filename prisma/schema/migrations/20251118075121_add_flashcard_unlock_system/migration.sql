-- DropIndex
DROP INDEX "public"."flashcards_nextReviewAt_idx";

-- DropIndex
DROP INDEX "public"."flashcards_userId_idx";

-- AlterTable
ALTER TABLE "public"."flashcards" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "flashcards_userId_nextReviewAt_idx" ON "public"."flashcards"("userId", "nextReviewAt");

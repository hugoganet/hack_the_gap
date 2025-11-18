-- DropIndex (tolerant)
DROP INDEX IF EXISTS "public"."flashcards_nextReviewAt_idx";

-- DropIndex (tolerant)
DROP INDEX IF EXISTS "public"."flashcards_userId_idx";

-- AlterTable (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'flashcards'
      AND column_name = 'updatedAt'
  ) THEN
    EXECUTE 'ALTER TABLE "public"."flashcards" ALTER COLUMN "updatedAt" DROP DEFAULT';
  END IF;
END $$;

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "flashcards_userId_nextReviewAt_idx" ON "public"."flashcards"("userId", "nextReviewAt");

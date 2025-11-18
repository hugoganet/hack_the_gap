-- AlterTable
ALTER TABLE "public"."concepts" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "public"."flashcards" ADD COLUMN     "answerTranslation" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "questionTranslation" TEXT;

-- AlterTable
ALTER TABLE "public"."syllabus_concepts" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX "concepts_language_idx" ON "public"."concepts"("language");

-- CreateIndex
CREATE INDEX "flashcards_language_idx" ON "public"."flashcards"("language");

-- CreateIndex
CREATE INDEX "syllabus_concepts_language_idx" ON "public"."syllabus_concepts"("language");

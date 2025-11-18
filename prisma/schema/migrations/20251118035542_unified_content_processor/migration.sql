-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('youtube', 'tiktok', 'pdf', 'url', 'podcast');

-- AlterTable
ALTER TABLE "public"."video_jobs" ADD COLUMN     "contentType" "public"."ContentType" NOT NULL DEFAULT 'youtube',
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "pageCount" INTEGER;

-- CreateIndex
CREATE INDEX "video_jobs_contentType_idx" ON "public"."video_jobs"("contentType");

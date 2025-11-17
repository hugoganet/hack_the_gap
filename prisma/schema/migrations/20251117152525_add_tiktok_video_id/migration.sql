/*
  Warnings:

  - You are about to drop the `BetaInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."video_jobs" ADD COLUMN     "tiktokVideoId" TEXT;

-- DropTable
DROP TABLE "public"."BetaInvitation";

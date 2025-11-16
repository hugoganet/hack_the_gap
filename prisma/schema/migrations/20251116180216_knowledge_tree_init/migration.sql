/*
  Warnings:

  - You are about to drop the column `semesterId` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `yearId` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `activeOrganizationId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the `academic_years` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `semesters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_yearId_fkey";

-- DropForeignKey
ALTER TABLE "public"."invitation" DROP CONSTRAINT "invitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."invitation" DROP CONSTRAINT "invitation_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."member" DROP CONSTRAINT "member_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."member" DROP CONSTRAINT "member_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscription" DROP CONSTRAINT "subscription_referenceId_fkey";

-- DropIndex
DROP INDEX "public"."courses_semesterId_idx";

-- DropIndex
DROP INDEX "public"."courses_yearId_idx";

-- AlterTable
ALTER TABLE "public"."courses" DROP COLUMN "semesterId",
DROP COLUMN "yearId";

-- AlterTable
ALTER TABLE "public"."session" DROP COLUMN "activeOrganizationId";

-- AlterTable
ALTER TABLE "public"."video_jobs" ADD COLUMN     "transcript" TEXT;

-- DropTable
DROP TABLE "public"."academic_years";

-- DropTable
DROP TABLE "public"."invitation";

-- DropTable
DROP TABLE "public"."member";

-- DropTable
DROP TABLE "public"."organization";

-- DropTable
DROP TABLE "public"."semesters";

-- DropTable
DROP TABLE "public"."subscription";

-- CreateTable
CREATE TABLE "public"."BetaInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BetaInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."knowledge_nodes" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."node_syllabus_concepts" (
    "nodeId" TEXT NOT NULL,
    "syllabusConceptId" TEXT NOT NULL,
    "addedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "node_syllabus_concepts_pkey" PRIMARY KEY ("nodeId","syllabusConceptId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BetaInvitation_email_key" ON "public"."BetaInvitation"("email");

-- CreateIndex
CREATE INDEX "BetaInvitation_email_idx" ON "public"."BetaInvitation"("email");

-- CreateIndex
CREATE INDEX "BetaInvitation_status_idx" ON "public"."BetaInvitation"("status");

-- CreateIndex
CREATE INDEX "knowledge_nodes_subjectId_parentId_order_idx" ON "public"."knowledge_nodes"("subjectId", "parentId", "order");

-- CreateIndex
CREATE INDEX "knowledge_nodes_subjectId_idx" ON "public"."knowledge_nodes"("subjectId");

-- CreateIndex
CREATE INDEX "knowledge_nodes_parentId_idx" ON "public"."knowledge_nodes"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_nodes_subjectId_slug_key" ON "public"."knowledge_nodes"("subjectId", "slug");

-- CreateIndex
CREATE INDEX "node_syllabus_concepts_nodeId_idx" ON "public"."node_syllabus_concepts"("nodeId");

-- CreateIndex
CREATE INDEX "node_syllabus_concepts_syllabusConceptId_idx" ON "public"."node_syllabus_concepts"("syllabusConceptId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_key" ON "public"."subjects"("name");

-- AddForeignKey
ALTER TABLE "public"."knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."knowledge_nodes" ADD CONSTRAINT "knowledge_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."knowledge_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."node_syllabus_concepts" ADD CONSTRAINT "node_syllabus_concepts_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "public"."knowledge_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."node_syllabus_concepts" ADD CONSTRAINT "node_syllabus_concepts_syllabusConceptId_fkey" FOREIGN KEY ("syllabusConceptId") REFERENCES "public"."syllabus_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

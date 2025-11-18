-- AlterTable
ALTER TABLE "public"."flashcards" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."BetaInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BetaInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BetaInvitation_email_key" ON "public"."BetaInvitation"("email");

-- CreateIndex
CREATE INDEX "BetaInvitation_email_idx" ON "public"."BetaInvitation"("email");

-- CreateIndex
CREATE INDEX "BetaInvitation_status_idx" ON "public"."BetaInvitation"("status");

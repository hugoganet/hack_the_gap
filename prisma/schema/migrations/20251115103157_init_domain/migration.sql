-- CreateTable
CREATE TABLE "public"."subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."academic_years" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."semesters" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "yearId" TEXT,
    "semesterId" TEXT,
    "ueNumber" TEXT,
    "syllabusUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_courses" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "learnedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_courses_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "public"."syllabus_concepts" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "conceptText" TEXT NOT NULL,
    "category" TEXT,
    "importance" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "syllabus_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."video_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "youtubeVideoId" TEXT,
    "status" TEXT NOT NULL,
    "processedConceptsCount" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "video_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."concepts" (
    "id" TEXT NOT NULL,
    "videoJobId" TEXT NOT NULL,
    "conceptText" TEXT NOT NULL,
    "definition" TEXT,
    "timestamp" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."concept_matches" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "syllabusConceptId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "matchType" TEXT,
    "rationale" TEXT,
    "userFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."flashcards" (
    "id" TEXT NOT NULL,
    "conceptMatchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sourceTimestamp" TEXT,
    "timesReviewed" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "flashcardCount" INTEGER NOT NULL,
    "currentCardIndex" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "review_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."review_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "timeToRevealMs" INTEGER,
    "timeToRateMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subjects_name_idx" ON "public"."subjects"("name");

-- CreateIndex
CREATE INDEX "academic_years_level_idx" ON "public"."academic_years"("level");

-- CreateIndex
CREATE INDEX "semesters_number_idx" ON "public"."semesters"("number");

-- CreateIndex
CREATE INDEX "courses_subjectId_idx" ON "public"."courses"("subjectId");

-- CreateIndex
CREATE INDEX "courses_yearId_idx" ON "public"."courses"("yearId");

-- CreateIndex
CREATE INDEX "courses_semesterId_idx" ON "public"."courses"("semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "public"."courses"("code");

-- CreateIndex
CREATE INDEX "user_courses_learnedCount_idx" ON "public"."user_courses"("learnedCount");

-- CreateIndex
CREATE INDEX "syllabus_concepts_courseId_idx" ON "public"."syllabus_concepts"("courseId");

-- CreateIndex
CREATE INDEX "syllabus_concepts_importance_idx" ON "public"."syllabus_concepts"("importance");

-- CreateIndex
CREATE INDEX "video_jobs_userId_idx" ON "public"."video_jobs"("userId");

-- CreateIndex
CREATE INDEX "video_jobs_status_idx" ON "public"."video_jobs"("status");

-- CreateIndex
CREATE INDEX "concepts_videoJobId_idx" ON "public"."concepts"("videoJobId");

-- CreateIndex
CREATE INDEX "concepts_confidence_idx" ON "public"."concepts"("confidence");

-- CreateIndex
CREATE INDEX "concept_matches_conceptId_idx" ON "public"."concept_matches"("conceptId");

-- CreateIndex
CREATE INDEX "concept_matches_syllabusConceptId_idx" ON "public"."concept_matches"("syllabusConceptId");

-- CreateIndex
CREATE INDEX "concept_matches_confidence_idx" ON "public"."concept_matches"("confidence");

-- CreateIndex
CREATE INDEX "flashcards_conceptMatchId_idx" ON "public"."flashcards"("conceptMatchId");

-- CreateIndex
CREATE INDEX "flashcards_userId_idx" ON "public"."flashcards"("userId");

-- CreateIndex
CREATE INDEX "flashcards_nextReviewAt_idx" ON "public"."flashcards"("nextReviewAt");

-- CreateIndex
CREATE INDEX "review_sessions_userId_idx" ON "public"."review_sessions"("userId");

-- CreateIndex
CREATE INDEX "review_sessions_status_idx" ON "public"."review_sessions"("status");

-- CreateIndex
CREATE INDEX "review_events_sessionId_idx" ON "public"."review_events"("sessionId");

-- CreateIndex
CREATE INDEX "review_events_flashcardId_idx" ON "public"."review_events"("flashcardId");

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "public"."academic_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_courses" ADD CONSTRAINT "user_courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_courses" ADD CONSTRAINT "user_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."syllabus_concepts" ADD CONSTRAINT "syllabus_concepts_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."video_jobs" ADD CONSTRAINT "video_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."concepts" ADD CONSTRAINT "concepts_videoJobId_fkey" FOREIGN KEY ("videoJobId") REFERENCES "public"."video_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."concept_matches" ADD CONSTRAINT "concept_matches_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "public"."concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."concept_matches" ADD CONSTRAINT "concept_matches_syllabusConceptId_fkey" FOREIGN KEY ("syllabusConceptId") REFERENCES "public"."syllabus_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."flashcards" ADD CONSTRAINT "flashcards_conceptMatchId_fkey" FOREIGN KEY ("conceptMatchId") REFERENCES "public"."concept_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."flashcards" ADD CONSTRAINT "flashcards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_sessions" ADD CONSTRAINT "review_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_sessions" ADD CONSTRAINT "review_sessions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_events" ADD CONSTRAINT "review_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."review_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review_events" ADD CONSTRAINT "review_events_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "public"."flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

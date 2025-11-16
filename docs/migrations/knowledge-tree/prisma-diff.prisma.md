# Prisma Target Schema (Documentation)

Note: This is a documentation-only file. Use this schema as a reference for implementing the migration. Keep the active Prisma schema in prisma/schema/schema.prisma. To avoid IDE duplicate model errors, this documentation is saved with .md extension.

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../src/generated/prisma"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

/*
Target schema after migration:
- Remove AcademicYear and Semester models entirely
- Update Course: drop yearId and semesterId and their relations/indexes
- Add KnowledgeNode (tree-only hierarchy under Subject) with unique slug per subject
- Add NodeSyllabusConcept (junction between KnowledgeNode and SyllabusConcept)
- Keep other domain models unchanged
*/

model Feedback {
  id        String   @id @default(nanoid(11))
  review    Int
  message   String
  email     String?
  userId    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User?    @relation(fields: [userId], references: [id])
}

model BetaInvitation {
  id        String   @id @default(nanoid(11))
  email     String   @unique
  status    String   @default("pending")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@index([status])
}

model Subject {
  id        String          @id @default(uuid())
  name      String          @unique
  createdAt DateTime        @default(now())
  courses   Course[]
  nodes     KnowledgeNode[]  // NEW: tree nodes under this subject

  @@index([name])
  @@map("subjects")
}

// REMOVED models (for reference)
// model AcademicYear { ... }  // deleted
// model Semester { ... }      // deleted

model Course {
  id               String            @id @default(uuid())
  code             String            @unique
  name             String
  subjectId        String
  ueNumber         String?
  syllabusUrl      String?
  createdAt        DateTime          @default(now())
  subject          Subject           @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  reviewSessions   ReviewSession[]
  syllabusConcepts SyllabusConcept[]
  enrollments      UserCourse[]

  @@index([subjectId])
  @@map("courses")
}

model UserCourse {
  userId       String
  courseId     String
  isActive     Boolean
  learnedCount Int      @default(0)
  createdAt    DateTime @default(now())
  course       Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([userId, courseId])
  @@index([learnedCount])
  @@map("user_courses")
}

model SyllabusConcept {
  id             String         @id @default(uuid())
  courseId       String
  conceptText    String
  category       String?
  importance     Int?
  order          Int
  createdAt      DateTime       @default(now())
  conceptMatches ConceptMatch[]
  course         Course         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  // Note: attachments to KnowledgeNode via NodeSyllabusConcept

  @@index([courseId])
  @@index([importance])
  @@map("syllabus_concepts")
}

model VideoJob {
  id                     String    @id @default(uuid())
  userId                 String
  url                    String
  youtubeVideoId         String?
  transcript             String?   @db.Text
  status                 String
  processedConceptsCount Int?
  errorMessage           String?
  createdAt              DateTime  @default(now())
  completedAt            DateTime?
  concepts               Concept[]
  user                   User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("video_jobs")
}

model Concept {
  id             String         @id @default(uuid())
  videoJobId     String
  conceptText    String
  definition     String?
  timestamp      String?
  confidence     Float
  createdAt      DateTime       @default(now())
  conceptMatches ConceptMatch[]
  videoJob       VideoJob       @relation(fields: [videoJobId], references: [id], onDelete: Cascade)

  @@index([videoJobId])
  @@index([confidence])
  @@map("concepts")
}

model ConceptMatch {
  id                String          @id @default(uuid())
  conceptId         String
  syllabusConceptId String
  confidence        Float
  matchType         String?
  rationale         String?
  userFeedback      String?
  createdAt         DateTime        @default(now())
  concept           Concept         @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  syllabusConcept   SyllabusConcept @relation(fields: [syllabusConceptId], references: [id], onDelete: Cascade)
  flashcards        Flashcard[]

  @@index([conceptId])
  @@index([syllabusConceptId])
  @@index([confidence])
  @@map("concept_matches")
}

model Flashcard {
  id              String        @id @default(uuid())
  conceptMatchId  String
  userId          String
  question        String
  answer          String
  sourceTimestamp String?
  timesReviewed   Int           @default(0)
  timesCorrect    Int           @default(0)
  lastReviewedAt  DateTime?
  nextReviewAt    DateTime?
  createdAt       DateTime      @default(now())
  conceptMatch    ConceptMatch  @relation(fields: [conceptMatchId], references: [id], onDelete: Cascade)
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviewEvents    ReviewEvent[]

  @@index([conceptMatchId])
  @@index([userId])
  @@index([nextReviewAt])
  @@map("flashcards")
}

model ReviewSession {
  id               String        @id @default(uuid())
  userId           String
  courseId         String
  flashcardCount   Int
  currentCardIndex Int           @default(0)
  status           String
  startedAt        DateTime      @default(now())
  completedAt      DateTime?
  events           ReviewEvent[]
  course           Course        @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user             User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("review_sessions")
}

model ReviewEvent {
  id             String        @id @default(uuid())
  sessionId      String
  flashcardId    String
  difficulty     String
  timeToRevealMs Int?
  timeToRateMs   Int?
  createdAt      DateTime      @default(now())
  flashcard      Flashcard     @relation(fields: [flashcardId], references: [id], onDelete: Cascade)
  session        ReviewSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([flashcardId])
  @@map("review_events")
}

/*
NEW MODELS
*/

model KnowledgeNode {
  id         String          @id @default(uuid())
  subjectId  String
  parentId   String?
  name       String
  slug       String?         // Unique within subject when present
  order      Int             @default(0)
  metadata   Json?
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  subject    Subject         @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  parent     KnowledgeNode?  @relation("NodeToParent", fields: [parentId], references: [id])
  children   KnowledgeNode[] @relation("NodeToParent")
  concepts   NodeSyllabusConcept[]

  @@index([subjectId, parentId, order])
  @@index([subjectId])
  @@index([parentId])
  @@unique([subjectId, slug])
  @@map("knowledge_nodes")
}

model NodeSyllabusConcept {
  nodeId            String
  syllabusConceptId String
  addedByUserId     String?
  createdAt         DateTime @default(now())

  node             KnowledgeNode   @relation(fields: [nodeId], references: [id], onDelete: Cascade)
  syllabusConcept  SyllabusConcept @relation(fields: [syllabusConceptId], references: [id], onDelete: Cascade)

  @@id([nodeId, syllabusConceptId])
  @@index([nodeId])
  @@index([syllabusConceptId])
  @@map("node_syllabus_concepts")
}

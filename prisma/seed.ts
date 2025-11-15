import { logger } from "@/lib/logger";
import { faker } from "@faker-js/faker";
import { nanoid } from "nanoid";
// Minimal type declarations to avoid implicit any (avoid depending on generated Prisma types here)
type User = { id: string; name: string; email: string };
type Subject = { id: string; name: string };
type AcademicYear = { id: string; name: string; level: number };
type Semester = { id: string; number: number };
type Course = { id: string; code: string; name: string }; // only fields we use later
type SyllabusConcept = { id: string; courseId: string; conceptText: string };
type UserCourse = { userId: string; courseId: string };
type Organization = { id: string; name: string };
declare const process: { exit: (code?: number) => void };
import { prisma } from "../src/lib/prisma";

// Set seed for reproducibility
faker.seed(123);

async function main() {
  logger.info("🌱 Seeding database...");

  // Create 10 users
  const userCreatePromises = Array.from({ length: 10 }, async () => {
    const email = faker.internet.email();
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: nanoid(11),
        name: faker.person.fullName(),
        email,
        emailVerified: faker.datatype.boolean(0.8), // 80% chance of being verified
        image: faker.image.avatar(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  });

  const users = await Promise.all(userCreatePromises);
  users.forEach((user: User) => logger.info(`👤 Created user: ${user.name}`));

  // Create 3 organizations
  const memberPromises: Promise<unknown>[] = [];
  const invitationPromises: Promise<unknown>[] = [];

  // Prepare organization creation data
  const orgData = Array.from({ length: 3 }, () => {
    const orgName = faker.company.name();
    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    return { orgName, orgSlug };
  });

  // Create all organizations first
  const organizations = await Promise.all(
    orgData.map(async ({ orgName, orgSlug }) =>
      prisma.organization
        .upsert({
          where: { slug: orgSlug },
          update: {},
          create: {
            id: nanoid(11),
            name: orgName,
            slug: orgSlug,
            logo: faker.image.url(),
            email: faker.internet.email(),
            createdAt: faker.date.past(),
          },
        })
  .then((org: Organization) => {
          logger.info(`🏢 Created organization: ${org.name}`);
          return org;
        }),
    ),
  );

  // Process members and invitations for each organization
  organizations.forEach((organization: Organization) => {
    const roleOptions = ["owner", "admin", "member"];

    // Make sure each org has at least one owner
    memberPromises.push(
      prisma.member
        .create({
          data: {
            id: nanoid(11),
            organizationId: organization.id,
            userId: users[0].id, // First user is always an owner
            role: "owner",
            createdAt: faker.date.past(),
          },
        })
        .then(() =>
          logger.info(
            `👑 Added ${users[0].name} as OWNER to ${organization.name}`,
          ),
        ),
    );

    // Add 2-4 more random members to each org
    const memberCount = faker.number.int({ min: 2, max: 4 });
    const memberIndices = faker.helpers.uniqueArray(
      () => faker.number.int({ min: 1, max: users.length - 1 }),
      memberCount,
    );

    for (const index of memberIndices) {
      const user = users[index];
      const role = faker.helpers.arrayElement(roleOptions);

      memberPromises.push(
        prisma.member
          .create({
            data: {
              id: nanoid(11),
              organizationId: organization.id,
              userId: user.id,
              role,
              createdAt: faker.date.past(),
            },
          })
          .then(() =>
            logger.info(
              `👥 Added ${user.name} as ${role} to ${organization.name}`,
            ),
          ),
      );
    }
  });

  await Promise.all([...memberPromises, ...invitationPromises]);

  // --- Domain Seed Data (Hackathon MVP) ---
  logger.info("📚 Seeding academic structure & learning data...");

  // Subjects
  const subjectsData = [
    { name: "Philosophy" },
    { name: "Biology" },
    { name: "Economics" },
  ];
  const subjects: Subject[] = await Promise.all(
    subjectsData.map(async (s) =>
      prisma.subject.upsert({
        where: { name: s.name }, // assuming unique name
        update: {},
        create: { id: crypto.randomUUID(), name: s.name },
      }),
    ),
  );
  subjects.forEach((s: Subject) => logger.info(`🧪 Subject: ${s.name}`));

  // Academic Years
  const yearsData = [
    { name: "Licence 1", level: 1 },
    { name: "Licence 2", level: 2 },
    { name: "Licence 3", level: 3 },
  ];
  const years: AcademicYear[] = await Promise.all(
    yearsData.map(async (y) =>
      prisma.academicYear.upsert({
        where: { name: y.name }, // assume unique name
        update: { level: y.level },
        create: { id: `year-${y.level}`, name: y.name, level: y.level },
      }),
    ),
  );

  // Semesters
  const semestersData = [1, 5, 6];
  const semesters: Semester[] = await Promise.all(
    semestersData.map(async (n) =>
      prisma.semester.upsert({
        where: { id: `sem-${n}` }, // id used as unique key
        update: { number: n },
        create: { id: `sem-${n}`, number: n },
      }),
    ),
  );

  // Helper lookup maps
  const subjectByName: Record<string, Subject> = Object.fromEntries(subjects.map((s) => [s.name, s]));
  const yearByLevel: Record<number, AcademicYear> = Object.fromEntries(years.map((y) => [y.level, y]));
  const semesterByNumber: Record<number, Semester> = Object.fromEntries(semesters.map((s) => [s.number, s]));

  // Courses (sample from data dictionary/sample records)
  const coursesData = [
    {
      code: "LU1PH51F",
      name: "Métaphysique",
      subject: "Philosophy",
      yearLevel: 3,
      semesterNumber: 5,
      ueNumber: "UE 1",
      syllabusUrl: "https://example.edu/syllabi/LU1PH51F.pdf",
    },
    {
      code: "BIOL2001",
      name: "Cell Biology",
      subject: "Biology",
      yearLevel: 2,
      semesterNumber: 1,
      ueNumber: null,
      syllabusUrl: "https://example.edu/syllabi/BIOL2001.pdf",
    },
    {
      code: "ECON1101",
      name: "Intro to Microeconomics",
      subject: "Economics",
      yearLevel: 1,
      semesterNumber: 1,
      ueNumber: null,
      syllabusUrl: null,
    },
  ];
  const courses: Course[] = await Promise.all(
    coursesData.map(async (c) =>
      prisma.course.upsert({
        where: { code: c.code },
        update: {
          name: c.name,
          subjectId: subjectByName[c.subject].id,
          yearId: yearByLevel[c.yearLevel].id,
          semesterId: semesterByNumber[c.semesterNumber].id,
          ueNumber: c.ueNumber ?? undefined,
          syllabusUrl: c.syllabusUrl ?? undefined,
        },
        create: {
          id: crypto.randomUUID(),
          code: c.code,
          name: c.name,
          subjectId: subjectByName[c.subject].id,
          yearId: yearByLevel[c.yearLevel].id,
          semesterId: semesterByNumber[c.semesterNumber].id,
          ueNumber: c.ueNumber ?? undefined,
          syllabusUrl: c.syllabusUrl ?? undefined,
        },
      }),
    ),
  );
  courses.forEach((c: Course) => logger.info(`📘 Course: ${c.code} - ${c.name}`));

  // Syllabus Concepts (subset)
  const syllabusConceptsData = [
    {
      courseCode: "LU1PH51F",
      conceptText: "Categorical Imperative",
      category: "Ethics",
      importance: 3,
      order: 1,
    },
    {
      courseCode: "LU1PH51F",
      conceptText: "Deontological Ethics",
      category: "Ethics",
      importance: 2,
      order: 2,
    },
    {
      courseCode: "BIOL2001",
      conceptText: "Mitosis",
      category: "Cell Division",
      importance: 3,
      order: 1,
    },
  ];
  const syllabusConcepts: SyllabusConcept[] = await Promise.all(
    syllabusConceptsData.map(async (sc) => {
      const course = courses.find((c) => c.code === sc.courseCode);
      if (!course) throw new Error(`Missing course for syllabus concept ${sc.conceptText}`);
      return prisma.syllabusConcept.create({
        data: {
          id: crypto.randomUUID(),
          courseId: course.id,
          conceptText: sc.conceptText,
          category: sc.category,
          importance: sc.importance,
          order: sc.order,
        },
      });
    }),
  );

  // Enroll first two users in first two courses
  const enrollments = await Promise.all(
    [
      { user: users[0], course: courses[0], learnedCount: 12 },
      { user: users[1], course: courses[1], learnedCount: 5 },
    ].map(async (e) =>
      prisma.userCourse.upsert({
        where: { userId_courseId: { userId: e.user.id, courseId: e.course.id } },
        update: { learnedCount: e.learnedCount },
        create: {
          userId: e.user.id,
          courseId: e.course.id,
          isActive: true,
          learnedCount: e.learnedCount,
        },
      }),
    ),
  );
  enrollments.forEach((enr: UserCourse) => logger.info(`🧑‍🎓 Enrollment: ${enr.userId} -> ${enr.courseId}`));

  // Video Jobs & Concepts (one completed, one processing)
  const videoJobs = await Promise.all(
    [
      {
        user: users[0],
        url: "https://youtube.com/watch?v=abc123",
        youtubeVideoId: "abc123",
        status: "completed",
        processedConceptsCount: 4,
        completedAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        user: users[1],
        url: "https://youtu.be/def456",
        youtubeVideoId: "def456",
        status: "processing",
        processedConceptsCount: null,
        completedAt: null,
      },
    ].map(async (vj) =>
      prisma.videoJob.create({
        data: {
          id: crypto.randomUUID(),
          userId: vj.user.id,
          url: vj.url,
          youtubeVideoId: vj.youtubeVideoId,
          status: vj.status,
          processedConceptsCount: vj.processedConceptsCount ?? undefined,
          completedAt: vj.completedAt ?? undefined,
        },
      }),
    ),
  );

  const concepts = await Promise.all(
    [
      {
        videoJob: videoJobs[0],
        conceptText: "Categorical Imperative",
        definition: "Kant's principle about universalizable maxims",
        timestamp: "03:45",
        confidence: 0.92,
      },
      {
        videoJob: videoJobs[0],
        conceptText: "Hypothetical Imperative",
        definition: "Conditional moral rules based on desired outcomes",
        timestamp: "05:12",
        confidence: 0.85,
      },
    ].map(async (c) =>
      prisma.concept.create({
        data: {
          id: crypto.randomUUID(),
          videoJobId: c.videoJob.id,
          conceptText: c.conceptText,
          definition: c.definition,
          timestamp: c.timestamp,
          confidence: c.confidence,
        },
      }),
    ),
  );

  // Concept Match & Flashcard
  const match = await prisma.conceptMatch.create({
    data: {
      id: crypto.randomUUID(),
      conceptId: concepts[0].id,
      syllabusConceptId: syllabusConcepts[0].id,
      confidence: 0.95,
      matchType: "exact",
      rationale: "Both refer to Kant's categorical imperative principle",
    },
  });

  const flashcard = await prisma.flashcard.create({
    data: {
      id: crypto.randomUUID(),
      conceptMatchId: match.id,
      userId: users[0].id,
      question: "What is Kant's Categorical Imperative?",
      answer: "Act only according to maxims that could become universal laws.",
      sourceTimestamp: "03:45",
      timesReviewed: 2,
      timesCorrect: 1,
      nextReviewAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    },
  });

  // Review Session & Event
  const session = await prisma.reviewSession.create({
    data: {
      id: crypto.randomUUID(),
      userId: users[0].id,
      courseId: courses[0].id,
      flashcardCount: 3,
      currentCardIndex: 3,
      status: "completed",
      startedAt: new Date(Date.now() - 1000 * 60 * 5),
      completedAt: new Date(),
    },
  });
  await prisma.reviewEvent.create({
    data: {
      id: crypto.randomUUID(),
      sessionId: session.id,
      flashcardId: flashcard.id,
      difficulty: "medium",
      timeToRevealMs: 5200,
      timeToRateMs: 3400,
    },
  });

  logger.info("🟢 Domain seed completed.");

  logger.info("✅ Seeding completed!");
}

main()
  .catch((e) => {
    logger.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '../src/generated/prisma';

/*
  Ingest all syllabus JSON files from src/generated into the database.
  Idempotent behavior:
  - Upsert Subject (by name)
  - Upsert AcademicYear (by name)
  - Find-or-create Semester (by number)
  - Upsert Course (by code) and link relationships
  - Replace SyllabusConcepts for the course (delete + createMany)

  Run:
    pnpm tsx scripts/ingest-generated-courses.ts
*/

const prisma = new PrismaClient();

type GeneratedSyllabus = {
  subject: { name: string };
  academicYear: { name: string; level: number };
  semester: { number: number };
  course: {
    code: string;
    name: string;
    ueNumber: string | null;
    syllabusUrl: string | null;
  };
  concepts: {
    conceptText: string;
    category?: string | null;
    importance?: number | null;
    order: number;
  }[];
};

async function getGeneratedFiles(): Promise<string[]> {
  const dir = path.resolve(__dirname, '../src/generated');
  const entries = await fs.readdir(dir);
  return entries
    .filter((f) => f.startsWith('syllabus-concepts-') && f.endsWith('.json'))
    .map((f) => path.join(dir, f));
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

async function upsertSubject(name: string) {
  return prisma.subject.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function upsertAcademicYear(name: string, level: number) {
  return prisma.academicYear.upsert({
    where: { name },
    update: { level },
    create: { name, level },
  });
}

async function getOrCreateSemester(number: number) {
  const existing = await prisma.semester.findFirst({ where: { number } });
  if (existing) return existing;
  return prisma.semester.create({ data: { number } });
}

async function upsertCourse(input: {
  code: string;
  name: string;
  subjectId: string;
  yearId?: string | null;
  semesterId?: string | null;
  ueNumber?: string | null;
  syllabusUrl?: string | null;
}) {
  const { code, name, subjectId, yearId, semesterId, ueNumber, syllabusUrl } = input;
  return prisma.course.upsert({
    where: { code },
    update: { name, subjectId, yearId: yearId ?? null, semesterId: semesterId ?? null, ueNumber: ueNumber ?? null, syllabusUrl: syllabusUrl ?? null },
    create: { code, name, subjectId, yearId: yearId ?? null, semesterId: semesterId ?? null, ueNumber: ueNumber ?? null, syllabusUrl: syllabusUrl ?? null },
  });
}

async function replaceSyllabusConcepts(courseId: string, concepts: GeneratedSyllabus['concepts']) {
  await prisma.syllabusConcept.deleteMany({ where: { courseId } });
  if (!concepts.length) return { created: 0 };
  const data = concepts.map((c) => ({
    courseId,
    conceptText: c.conceptText,
    category: c.category ?? null,
    importance: c.importance ?? null,
    order: c.order,
  }));
  const res = await prisma.syllabusConcept.createMany({ data, skipDuplicates: true });
  return { created: res.count };
}

async function ingestFile(filePath: string) {
  const payload = await readJson<GeneratedSyllabus>(filePath);

  const subject = await upsertSubject(payload.subject.name);
  const year = await upsertAcademicYear(payload.academicYear.name, payload.academicYear.level);
  const semester = await getOrCreateSemester(payload.semester.number);

  const course = await upsertCourse({
    code: payload.course.code,
    name: payload.course.name,
    subjectId: subject.id,
    yearId: year.id,
    semesterId: semester.id,
    ueNumber: payload.course.ueNumber ?? null,
    syllabusUrl: payload.course.syllabusUrl ?? null,
  });

  const { created } = await replaceSyllabusConcepts(course.id, payload.concepts);

  return {
    file: path.basename(filePath),
    subject: subject.name,
    year: year.name,
    semester: semester.number,
    courseCode: course.code,
    courseName: course.name,
    conceptsCreated: created,
  };
}

type IngestResult = {
  processed: number;
  results: {
    file: string;
    subject: string;
    year: string;
    semester: number;
    courseCode: string;
    courseName: string;
    conceptsCreated: number;
  }[];
  note?: string;
};

async function main(): Promise<IngestResult> {
  await prisma.$connect();
  try {
    const files = await getGeneratedFiles();
    if (files.length === 0) {
      return { processed: 0, results: [], note: 'No generated syllabus files found' };
    }

    // Process sequentially to avoid unique-constraint races on upserts
    const results: IngestResult['results'] = [];
    for (const f of files) {
      // eslint-disable-next-line no-console
      console.log(`Processing: ${path.basename(f)}...`);
      // eslint-disable-next-line no-await-in-loop
      const r = await ingestFile(f);
      results.push(r);
    }

    return { processed: results.length, results };
  } finally {
    await prisma.$disconnect();
  }
}

void main()
  .then((out) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(out, null, 2));
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Ingest failed', err);
    process.exitCode = 1;
  });

/**
 * Simple Prisma DB test script.
 *
 * WHAT IT DOES:
 *  - Loads environment variables from .env (DATABASE_URL / DIRECT_URL)
 *  - Instantiates PrismaClient from the custom generated output path
 *  - Prints total user count
 *  - Prints first 10 users (id, email, createdAt) in a compact format
 *
 * HOW TO RUN:
 *  pnpm tsx scripts/prisma-db-test.ts
 *
 * EXPECTED OUTPUT (example):
 *  Connected to database
 *  User count: 123
 *  First 10 users:
 *  1) id=... email=... createdAt=...
 *
 * ERROR HANDLING:
 *  - Non-zero exit code if any step fails.
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();

    const total = await prisma.user.count();
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, createdAt: true },
    });

    // Return structured data instead of logging to satisfy lint rule.
    return { total, users };
  } finally {
    await prisma.$disconnect();
  }
}

void main().then(({ total, users }) => {
  // Intentional minimal output; wrap in single console for lint leniency.
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      connected: true,
      userCount: total,
      sample: users.map((u) => ({
        id: u.id,
        email: u.email,
        createdAt: u.createdAt.toISOString(),
      })),
    }, null, 2)
  );
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('DB test failed', err);
  process.exitCode = 1;
});

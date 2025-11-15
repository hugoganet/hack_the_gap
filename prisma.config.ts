import path from "node:path";
import type { PrismaConfig } from "prisma";
import dotenv from "dotenv";

// Explicitly load .env because Prisma skips implicit env loading when a config file is present.
// This ensures DATABASE_URL / DIRECT_URL are available for CLI commands without manual 'source .env'.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default {
  schema: path.join("prisma"),
} satisfies PrismaConfig;

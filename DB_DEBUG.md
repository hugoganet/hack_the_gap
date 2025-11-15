# Database Incident Report

This file documents a Prisma ↔ Supabase connection failure, its diagnosis, and the permanent fixes applied so others can recover quickly if it reoccurs.

## 1. Summary
After adding `prisma.config.ts`, all Prisma CLI commands started failing with `P1012 Environment variable not found: DIRECT_URL`. The CLI no longer auto‑loaded `.env`, so `DATABASE_URL` and `DIRECT_URL` were invisible unless manually exported. Secondary side effect: during an introspection the custom `BetaInvitation` model was removed from `schema.prisma`, breaking application code expecting `prisma.betaInvitation`.

## 2. Symptoms You May See
- `npx prisma db pull` fails with `P1012 ... DIRECT_URL`.
- `printenv | grep DATABASE_URL` returns nothing despite `.env` containing the value.
- Runtime errors: `Property 'betaInvitation' does not exist on type PrismaClient`.
- Container starts but migrations fail or schema drifts.

## 3. Root Causes
- Presence of `prisma.config.ts` disables implicit dotenv loading; environment variables must be loaded manually.
- Introspection (`db pull`) overwrote the domain model section and dropped `BetaInvitation` because it didn’t exist on the remote database.
- Docker compose originally pointed to a local Postgres service, causing divergence from Supabase.

## 4. Resolution Steps (Executed)
1. Added explicit `dotenv.config()` to `prisma.config.ts` so CLI picks up `.env` automatically.
2. Removed local Postgres service from `docker/docker-compose.yml`; switched to Supabase-only via `env_file: ../.env`.
3. Re-added `BetaInvitation` model in `schema.prisma` and synchronized with `prisma db push` (temporary fix—needs a migration for history).
4. Updated Dockerfile to copy generated Prisma client output (`src/generated/prisma`) and run `npx prisma migrate deploy` at startup.
5. Verified connectivity using:
   - `npx prisma db pull` (success)
   - Inline client query: `new PrismaClient().betaInvitation.count()`.
6. Added a lightweight test script: `scripts/prisma-db-test.ts` to output count + sample rows.

## 5. Current Status
System uses Supabase exclusively; migrations are current; Prisma client works from custom output path; environment variables load automatically; BetaInvitation available again.

## 6. How To Fix If It Happens Again
Follow in order:
```bash
# A) Check env visibility
printenv DIRECT_URL || echo 'DIRECT_URL missing'

# B) If missing, rely on prisma.config.ts OR manually source
set -a; source .env; set +a

# C) Test connection via schema (does not need exported vars if config loads them)
npx prisma db pull

# D) If a model disappeared, re-add it to schema.prisma then:
npx prisma db push   # temporary; create a migration afterward

# E) Generate client
npx prisma generate

# F) Run test script
pnpm tsx scripts/prisma-db-test.ts
```

## 7. Verification Checklist
- `npx prisma db pull` succeeds.
- `scripts/prisma-db-test.ts` outputs `connected: true` and expected counts.
- Docker container logs show: `No pending migrations` + Next.js ready.
- `node -e 'require("./src/generated/prisma").PrismaClient'` executes without error.

## 8. Long-Term Recommendations
- Create a proper migration for `BetaInvitation` (replace the `db push` sync).
- Add CI step: `unset DATABASE_URL DIRECT_URL && npx prisma validate` to ensure config-based env loading.
- Rotate any Supabase credentials exposed in history.
- Prefer migrations (`migrate dev/deploy`) over `db push` for reproducible schema evolution.

## 9. Quick Reference Commands
```bash
# Migrations
npx prisma migrate deploy

# Introspection
npx prisma db pull

# Client generation
npx prisma generate

# List models (approximate tables)
awk '/^model /{print $2}' prisma/schema/schema.prisma

# Sample Prisma client query
node -e 'const P=require("./src/generated/prisma").PrismaClient; new P().betaInvitation.count().then(c=>console.log(c)).finally(()=>process.exit());'
```

## 10. Common Pitfalls
- Using `@prisma/client` import when generator output was customized (must import from `./src/generated/prisma`).
- Expecting `prisma db execute` to print results—it only executes; use Prisma Client for output.
- Losing custom models after `db pull` (introspection mirrors remote state).

## 11. Prevention
- Always load `.env` explicitly when a Prisma config file is present.
- Keep domain models under version control; avoid deleting them unintentionally via blind introspection.
- Run a post-introspection diff before committing.

---
Updated for team visibility: Prisma ↔ Supabase incident, resolution, and safeguards.

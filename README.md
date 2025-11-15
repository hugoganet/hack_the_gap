# Database Setup (Supabase + Prisma)

### 1. Create Supabase Project

1. Sign in at <https://supabase.com> and create a new project.
2. Grab the project ref from the dashboard URL (e.g. `abcd1234`).
3. Get the database password (Settings → Database) and API keys (Settings → API).

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
SUPABASE_PROJECT_ID=abcd1234
SUPABASE_DB_PASSWORD=super-secret
SUPABASE_ANON_KEY=pk_...
SUPABASE_SERVICE_ROLE_KEY=sk_...
AUTH_SECRET=generate-a-random-32-byte-secret
```

`DATABASE_URL` and `DIRECT_URL` are constructed automatically in `.env.example` using the project ref and password. The username pattern must be `postgres.<project_ref>` and the host uses dots: `aws-1.eu-west-1.pooler.supabase.com`.

### 3. Install & Generate Prisma Client

Run (already configured in `schema.prisma`):

```bash
pnpm install
pnpm prisma generate
```

### 4. Apply Migrations

Initial migration creates hackathon MVP domain tables plus auth tables:

```bash
pnpm prisma migrate dev --name init
```

This uses `DIRECT_URL` for direct (non-pooled) connections.

### 5. Seed Data

The `prisma/seed.ts` script now seeds:

- Auth users, organizations, members
- Subjects, academic years, semesters
- Courses & syllabus concepts
- Enrollments (`user_courses`)
- Video jobs, concepts, concept match
- Flashcard, review session & event

Run:

```bash
pnpm prisma db seed
```

(If not wired yet, you can run: `ts-node prisma/seed.ts` or add a `prisma.seed` script in `package.json`).

### 6. Verify

Open the Supabase SQL editor or connect with psql to confirm tables populated:

```bash
pnpm prisma studio
```

### 7. Regeneration After Schema Changes

Whenever you edit `prisma/schema/schema.prisma`:

```bash
pnpm prisma migrate dev --name <change>
pnpm prisma generate
```

### Inconsistencies & Notes

- We avoided Prisma enums per repo conventions (string columns hold status/difficulty).
- Composite key for `user_courses` aligns with data dictionary (no surrogate id).
- Academic years & semesters seeded with deterministic IDs (`year-<level>`, `sem-<number>`) for idempotent upserts.
- Seed uses minimal inline type aliases to keep strict TypeScript without depending on generated Prisma types at build time.

### Troubleshooting

| Issue | Fix |
|-------|-----|
| Pool exhaustion during migration | Use `DIRECT_URL` (already set) |
| P1001 cannot reach host | Verify host uses dots (`aws-1.eu-west-1.pooler.supabase.com`) and username pattern `postgres.<ref>` |
| Wrong password | Copy again from Supabase Database settings (avoid quoting artifacts) |
| Local firewall/VPN block | Temporarily disable VPN or whitelist 5432/6543 |
| Missing tables after migrate | Ensure `.env` is loaded, re-run `pnpm prisma migrate dev` |
| Seed fails with type errors | Run `pnpm prisma generate` first |
| Auth tables missing | Regenerate Better-Auth file via CLI per `better-auth.prisma` header |

### Next Steps

- Add uniqueness constraints if subject names can collide.
- Add basic check constraints (confidence between 0 and 1) via raw SQL migration for additional safety.
- Introduce background job table for scaling video processing later (post-MVP).

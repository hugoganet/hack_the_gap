# Tech Stack

> This file captures the selected technologies for each layer, with rationale, tradeoffs, and risks.

## Tech Stack Overview

| Layer | Options | Choice | Rationale | Pros | Cons | Tradeoffs | Risks / Mitigations | Notes |
|-------|---------|--------|-----------|------|------|-----------|----------------------|-------|
| Frontend | React, Vue, Svelte | **Next.js 15.5** (React 19) | Modern React framework with App Router, RSC, streaming. Boilerplate provides auth, org management, UI components. | Fast dev, great DX, Vercel ecosystem, built-in optimization | React 19 RC (not stable), learning curve for RSC | Bleeding edge = potential bugs, but faster iteration | Risk: React 19 breaking changes. Mitigation: Pin versions, test thoroughly | Using Turbopack for dev |
| Backend / API | Express, Fastify, tRPC | **Next.js API Routes** + **Server Actions** | Collocated with frontend, type-safe with Zod, leverages RSC for data fetching | No separate backend needed, type safety, simple deployment | Coupled to Next.js, harder to scale independently | Monolith simplicity vs microservices flexibility | Risk: API complexity grows. Mitigation: Extract to separate service post-MVP if needed | Using next-safe-action for type-safe actions |
| Database | PostgreSQL, MySQL, MongoDB | **Supabase** (PostgreSQL) | Managed Postgres with real-time, auth, storage. Free tier sufficient for MVP. | Generous free tier, real-time subscriptions, built-in auth (not using), PostGIS support | Vendor lock-in, limited control over DB config | Managed convenience vs self-hosted control | Risk: Supabase outage. Mitigation: Connection pooling, fallback to direct Postgres if needed | Using Prisma as ORM |
| ORM | TypeORM, Drizzle, Kysely | **Prisma 6.14** | Type-safe queries, great DX, migrations, schema-first design. Boilerplate already configured. | Excellent TypeScript support, auto-generated types, migration tooling | Can be slow for complex queries, abstracts SQL | Type safety vs raw SQL performance | Risk: Performance bottlenecks. Mitigation: Use raw queries for complex operations, optimize indexes | Schema split: better-auth.prisma + schema.prisma |
| Auth | Clerk, Auth.js, Supabase Auth | **Better-Auth 1.3** | Modern auth library with org/team support, social providers, session management. Boilerplate integrated. | Multi-tenant ready, flexible, open-source, no vendor lock-in | Newer library (less battle-tested than Auth.js) | Flexibility vs maturity | Risk: Auth bugs. Mitigation: Thorough testing, fallback to email/password only for MVP | Supports Google, GitHub, email/password |
| AI Services | OpenAI, Anthropic, local models | **OpenAI (Vercel AI SDK)** | GPT-4 for concept extraction, embeddings for matching. Vercel AI SDK for streaming. | Best-in-class models, streaming support, good docs | API costs, rate limits, vendor lock-in | Quality vs cost | Risk: API costs exceed budget. Mitigation: Cache aggressively, use GPT-3.5 for non-critical tasks, monitor usage | Using @ai-sdk/openai + ai package |
| File/Blob Storage | Vercel Blob, Cloudflare R2, AWS S3 | **TBD** (disabled for MVP) | Not needed for MVP (YouTube URLs only). Post-MVP: Vercel Blob or R2. | N/A | N/A | N/A | N/A | Feature flag: enableImageUpload = false |
| Queue/Events | BullMQ, Inngest, Trigger.dev | **TBD** (post-MVP) | Not needed for MVP (synchronous processing). Post-MVP: Consider Inngest for video processing queue. | N/A | N/A | N/A | Risk: Video processing blocks UI. Mitigation: Show progress, allow cancellation | MVP uses synchronous API routes |
| Infra/Hosting | Vercel, Railway, Fly.io | **Vercel** | Next.js native platform, zero-config deployment, edge functions, preview deployments. | Seamless Next.js integration, great DX, automatic scaling | Expensive at scale, vendor lock-in | Convenience vs cost | Risk: Costs spike. Mitigation: Monitor usage, optimize edge functions, consider Railway for DB-heavy workloads | Free tier sufficient for MVP |
| Observability | Sentry, LogRocket, Datadog | **Console logs** (MVP) | Minimal observability for MVP. Post-MVP: Add Sentry for error tracking. | Simple, no setup | No structured logging, hard to debug production | Simplicity vs visibility | Risk: Production bugs hard to diagnose. Mitigation: Add Sentry before launch | Using tslog for structured logging in dev |
| CI/CD | GitHub Actions, Vercel CI | **Vercel CI** + **GitHub Actions** | Vercel auto-deploys on push. GitHub Actions for tests, linting. | Automatic deployments, preview URLs, fast feedback | Limited customization vs Jenkins/CircleCI | Speed vs flexibility | Risk: CI failures block deploys. Mitigation: Comprehensive test suite, manual deploy option | Playwright for E2E, Vitest for unit tests |
| Testing | Jest, Vitest, Playwright | **Vitest 3.2** + **Playwright 1.55** | Vitest for unit/integration (fast, Vite-native). Playwright for E2E (cross-browser). | Fast tests, great DX, comprehensive coverage | Playwright can be flaky | Speed vs reliability | Risk: Flaky E2E tests. Mitigation: Retry logic, stable selectors, headless mode in CI | Using @testing-library/react for component tests |
| UI Components | Custom, Material-UI, Ant Design | **shadcn/ui** (Radix + Tailwind) | Unstyled, accessible components. Copy-paste, full control. Boilerplate includes 20+ components. | Full customization, no bundle bloat, accessible | Manual updates (not npm package) | Control vs convenience | Risk: Component drift. Mitigation: Lock shadcn version, document customizations | Using Tailwind 4.1 + CVA for variants |
| Styling | CSS Modules, Styled Components, Tailwind | **Tailwind CSS 4.1** | Utility-first, fast iteration, consistent design system. | Rapid prototyping, small bundle, great DX | Verbose HTML, learning curve | Speed vs readability | Risk: Inconsistent styling. Mitigation: Use CVA for component variants, design tokens | Using tailwind-merge for conditional classes |
| Forms | React Hook Form, Formik, Tanstack Form | **React Hook Form 7.62** + **Zod 3.25** | Performant, minimal re-renders, Zod validation, great TypeScript support. | Type-safe validation, small bundle, great DX | Zod schemas can be verbose | Type safety vs boilerplate | Risk: Complex forms hard to maintain. Mitigation: Extract reusable field components | Using @hookform/resolvers for Zod integration |
| State Management | Redux, Zustand, Jotai | **Zustand 5.0** + **TanStack Query 5.85** | Zustand for client state (minimal). TanStack Query for server state (caching, refetching). | Simple API, no boilerplate, great caching | Less opinionated than Redux | Simplicity vs structure | Risk: State management chaos. Mitigation: Keep client state minimal, use server state for data | TanStack Query handles all API data |
| Emails | Nodemailer, SendGrid, Postmark | **Resend 6.0** + **React Email 4.2** | Modern email API, React components for templates, great DX. | Type-safe templates, preview in dev, generous free tier | Newer service (less mature than SendGrid) | DX vs maturity | Risk: Email delivery issues. Mitigation: Monitor delivery rates, fallback to SendGrid if needed | Using @react-email/components |
| Payments | Stripe, Paddle, LemonSqueezy | **Stripe 18.4** | Industry standard, comprehensive API, webhooks for subscriptions. Boilerplate includes webhook handling. | Mature, well-documented, flexible | Complex API, high fees (2.9% + 30¢) | Features vs cost | Risk: Webhook failures. Mitigation: Retry logic, idempotency keys, manual reconciliation | Not needed for MVP (no monetization yet) |

## Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI[Next.js App Router]
        RQ[TanStack Query]
    end

    subgraph Server["Next.js Server (Vercel)"]
        API[API Routes]
        SA[Server Actions]
        RSC[React Server Components]
    end

    subgraph External["External Services"]
        DB[(Supabase PostgreSQL)]
        AI[OpenAI API]
        Email[Resend]
        Auth[Better-Auth]
    end

    UI --> RSC
    UI --> RQ
    RQ --> API
    UI --> SA
    
    API --> DB
    SA --> DB
    RSC --> DB
    
    API --> AI
    SA --> AI
    
    API --> Email
    SA --> Auth
    
    style Client fill:#e1f5ff
    style Server fill:#fff4e1
    style External fill:#f0f0f0
```

## Key Architectural Decisions

### 1. Monolith vs Microservices

**Choice:** Monolith (Next.js full-stack)  
**Rationale:** 48-hour MVP timeline. Monolith = faster iteration, simpler deployment, no network overhead.  
**Post-MVP:** Extract video processing to separate service if performance becomes bottleneck.

### 2. Server Components vs Client Components

**Choice:** RSC by default, client components only when needed (interactivity, hooks)  
**Rationale:** Better performance (less JS shipped), simpler data fetching, SEO benefits.  
**Tradeoff:** Learning curve, debugging complexity.

### 3. Prisma vs Raw SQL

**Choice:** Prisma for CRUD, raw SQL for complex queries (concept matching)  
**Rationale:** Type safety for 90% of queries, performance for critical paths.

### 4. Synchronous vs Async Processing

**Choice:** Synchronous for MVP (video processing blocks until complete)  
**Rationale:** Simpler implementation, acceptable for demo (60s timeout).  
**Post-MVP:** Move to queue (Inngest/BullMQ) for production.

## ADRs to Draft

- **ADR-0010**: Database choice (Supabase PostgreSQL) - rationale, alternatives considered
- **ADR-0011**: Auth provider (Better-Auth vs Auth.js vs Clerk)
- **ADR-0012**: Monolith architecture (Next.js full-stack vs separate backend)
- **ADR-0013**: AI provider (OpenAI vs Anthropic vs local models)
- **ADR-0014**: Synchronous processing for MVP (vs async queue)

## Dependencies & Versions

**Critical dependencies:**

- Next.js: 15.5.0 (React 19.1.1)
- Prisma: 6.14.0
- Better-Auth: 1.3.8
- TanStack Query: 5.85.5
- Zod: 3.25.56
- Vercel AI SDK: 5.0.21

**Dev dependencies:**

- TypeScript: 5.9.2
- Vitest: 3.2.4
- Playwright: 1.55.0
- ESLint: 9.33.0
- Prettier: 3.6.2

## Environment Variables Required

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # For migrations

# Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# AI
OPENAI_API_KEY="sk-..."

# Email
RESEND_API_KEY="re_..."

# Stripe (optional for MVP)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Notes

- **Boilerplate:** Using NOW.TS boilerplate (v2.0.0) which includes auth, org management, UI components, email templates
- **Package Manager:** pnpm 10.14.0 (faster than npm, more reliable than yarn)
- **Node Version:** Requires Node 18+ (for Next.js 15)
- **Deployment:** Vercel recommended (zero-config), Railway acceptable alternative
- **Cost Estimate (MVP):** $0/month (all free tiers: Vercel, Supabase, OpenAI trial, Resend)

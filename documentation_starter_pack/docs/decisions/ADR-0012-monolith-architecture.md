# ADR-0012: Monolith Architecture

Date: 2025-11-18
Status: Accepted
Deciders: Founder

## Context

**Problem Statement:**
Need to decide on the application architecture for the MVP. Key considerations:
- 48-hour hackathon timeline
- Solo founder with limited time
- Need to iterate quickly
- Future scalability requirements unknown
- Want to minimize operational complexity

**Forces at Play:**
- Speed of development vs long-term scalability
- Simplicity vs flexibility
- Deployment complexity vs performance
- Development experience vs production optimization
- MVP constraints vs production requirements

## Decision

**Selected: Monolith Architecture (Next.js Full-Stack)**

Build a single Next.js 15.5 application that includes:
- Frontend (React 19 components)
- Backend (API Routes + Server Actions)
- Database access (Prisma ORM)
- Authentication (Better-Auth)
- All business logic collocated

**Architecture:**
```
Next.js App (Monolith)
├── Frontend (React Server Components + Client Components)
├── API Routes (REST endpoints)
├── Server Actions (mutations)
├── Database Layer (Prisma)
└── External Services (OpenAI, SocialKit, Supabase)
```

**Deployment:**
- Single Vercel deployment
- No separate backend service
- No microservices
- No API gateway
- Direct database connections

## Consequences

**Positive:**
- ✅ Fastest development velocity (no network overhead between services)
- ✅ Simpler deployment (single artifact)
- ✅ Easier debugging (everything in one codebase)
- ✅ Type safety across frontend/backend (shared TypeScript types)
- ✅ No API versioning complexity
- ✅ Lower operational costs (single service)
- ✅ Better DX with Next.js App Router features (RSC, Server Actions)
- ✅ Automatic code splitting and optimization
- ✅ Perfect for MVP and early validation

**Negative:**
- ❌ Harder to scale independently (frontend vs backend)
- ❌ All code deploys together (no independent service updates)
- ❌ Potential performance bottlenecks if one part is slow
- ❌ Harder to assign different teams to different services (not relevant for solo founder)
- ❌ Database connection pooling more complex
- ❌ May need refactoring if scaling requirements change

**Follow-ups:**
- Monitor performance metrics (response times, CPU, memory)
- Identify bottlenecks early (likely: video processing, AI calls)
- Plan extraction strategy for heavy workloads if needed
- Consider async queue for long-running tasks (Inngest, BullMQ)
- Implement caching layer (Redis) if database becomes bottleneck

## Alternatives Considered

### Option A: Microservices Architecture
**Structure:**
- Separate services: Frontend, Auth, Content Processing, Matching, Review
- API Gateway for routing
- Message queue for async communication
- Independent deployments

**Pros:**
- Independent scaling per service
- Technology flexibility per service
- Team autonomy (not relevant for solo)
- Fault isolation

**Cons:**
- Much slower development (weeks vs days)
- Complex deployment and orchestration
- Network latency between services
- Distributed debugging complexity
- Overkill for MVP
- Higher operational costs

**Rejected because:** Massive overkill for 48-hour MVP. Would take weeks to set up properly. Not worth the complexity for unknown scale requirements.

### Option B: Separate Frontend + Backend
**Structure:**
- Next.js frontend (static or SSR)
- Express/Fastify backend API
- Separate deployments

**Pros:**
- Clear separation of concerns
- Can scale backend independently
- Different teams can work independently
- Technology flexibility for backend

**Cons:**
- Slower development (need to coordinate APIs)
- Type safety harder to maintain
- Two deployments to manage
- Network overhead for every request
- More complex authentication flow
- Overkill for solo founder

**Rejected because:** Adds unnecessary complexity for solo founder. Next.js API Routes + Server Actions provide all needed backend functionality with better DX.

### Option C: Serverless Functions (Separate)
**Structure:**
- Next.js frontend
- Separate serverless functions (Vercel Functions, AWS Lambda)
- Event-driven architecture

**Pros:**
- Automatic scaling
- Pay per use
- No server management
- Good for spiky workloads

**Cons:**
- Cold start latency
- Complex state management
- Harder to debug
- Vendor lock-in
- More expensive at scale
- Overkill for MVP

**Rejected because:** Cold starts would hurt UX. Monolith provides better performance for MVP. Can always extract to serverless later if needed.

### Option D: Jamstack (Static + API)
**Structure:**
- Static Next.js site
- Third-party APIs (Supabase, etc.)
- Client-side data fetching

**Pros:**
- Fast page loads
- Great SEO
- Simple deployment
- Low cost

**Cons:**
- Limited backend logic
- Client-side data fetching (slower UX)
- Hard to implement complex features
- Security concerns (API keys in client)
- Not suitable for authenticated apps

**Rejected because:** Need server-side logic for AI processing, authentication, and complex business logic. Static site not suitable for our use case.

## Migration Path (If Needed)

If monolith becomes a bottleneck, extract in this order:

1. **Phase 1: Async Processing** (Easiest)
   - Extract video processing to background queue
   - Use Inngest or BullMQ
   - Keep everything else in monolith
   - Estimated effort: 1-2 weeks

2. **Phase 2: Separate Processing Service** (Medium)
   - Extract content processing to separate service
   - Keep frontend/API in monolith
   - Use message queue for communication
   - Estimated effort: 2-4 weeks

3. **Phase 3: Full Microservices** (Hardest)
   - Only if absolutely necessary
   - Extract all services independently
   - Implement API gateway
   - Estimated effort: 2-3 months

**Decision Point:** Only migrate if:
- Response times consistently >2s (p95)
- CPU/memory consistently >80%
- Clear bottleneck identified
- User growth justifies complexity

## Performance Targets

**Acceptable for MVP:**
- Video processing: <60s (p95)
- Dashboard load: <2s
- Review session: <500ms per card
- API response: <1s (p95)

**If these are met, monolith is sufficient.**

## Links

- **Related ADRs:**
  - ADR-0014: Synchronous processing for MVP
  - ADR-0011: Auth provider (Better-Auth)
  - ADR-0013: AI provider (OpenAI)
- **Tech Stack:** `docs/tech_stack.md`
- **Architecture:** `docs/architecture.md`
- **Next.js Docs:** https://nextjs.org/docs

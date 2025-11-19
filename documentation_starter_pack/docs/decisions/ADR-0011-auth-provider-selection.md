# ADR-0011: Auth Provider Selection (Better-Auth)

Date: 2025-11-18
Status: Accepted
Deciders: Founder

## Context

**Problem Statement:**
The application requires user authentication with the following requirements:
- Session-based authentication (not JWT-only)
- Social login providers (Google, GitHub)
- Email/password authentication
- Organization/team support for future multi-tenancy
- TypeScript-first with excellent DX
- No vendor lock-in
- Open-source preferred

**Forces at Play:**
- 48-hour MVP timeline requires fast integration
- Need flexibility for future features (org management, team invites)
- Want to avoid vendor lock-in and high costs
- Boilerplate already includes Better-Auth integration
- Team has limited auth implementation experience

## Decision

**Selected: Better-Auth 1.3**

Better-Auth is a modern, TypeScript-first authentication library that provides:
- Multi-tenant ready with built-in org/team support
- Flexible provider system (social + email/password)
- Session management with database persistence
- Open-source with no vendor lock-in
- Excellent TypeScript support and DX
- Active development and community

**Implementation:**
- Database: Prisma schema in `prisma/schema/better-auth.prisma`
- Configuration: `src/lib/auth.ts`
- Providers: Google, GitHub, Email/Password
- Session storage: PostgreSQL via Prisma
- Middleware: Next.js middleware for route protection

## Consequences

**Positive:**
- ✅ No vendor lock-in - fully self-hosted
- ✅ Multi-tenant ready out of the box
- ✅ Excellent TypeScript support and type safety
- ✅ Flexible and extensible architecture
- ✅ Active community and regular updates
- ✅ Already integrated in boilerplate (faster MVP)
- ✅ Lower cost than SaaS alternatives (Clerk, Auth0)

**Negative:**
- ❌ Newer library (v1.3) - less battle-tested than Auth.js
- ❌ Smaller ecosystem compared to Auth.js
- ❌ More responsibility for security updates
- ❌ Need to manage session storage ourselves
- ❌ Limited documentation compared to mature alternatives

**Follow-ups:**
- Monitor security advisories and update regularly
- Implement rate limiting for auth endpoints
- Add 2FA support post-MVP
- Consider adding magic link authentication
- Set up session cleanup cron job

## Alternatives Considered

### Option A: Auth.js (formerly NextAuth.js)
**Pros:**
- Most popular Next.js auth solution
- Mature and battle-tested
- Large ecosystem and community
- Extensive documentation
- Many provider integrations

**Cons:**
- Less TypeScript-friendly than Better-Auth
- Org/team support requires custom implementation
- JWT-first approach (we prefer sessions)
- More complex configuration
- Recent v5 rewrite caused breaking changes

**Rejected because:** Better-Auth provides better TypeScript DX and built-in org support, which aligns better with our multi-tenant future.

### Option B: Clerk
**Pros:**
- Excellent UX and pre-built components
- Comprehensive org/team management
- Great documentation and support
- Handles all security concerns
- Beautiful default UI

**Cons:**
- Vendor lock-in (SaaS only)
- Expensive at scale ($25/month + $0.02/MAU)
- Less flexibility for customization
- External dependency for critical path
- Data stored on their servers

**Rejected because:** Vendor lock-in and cost concerns. Want to maintain control over auth infrastructure.

### Option C: Supabase Auth
**Pros:**
- Integrated with Supabase (already using for DB)
- Good documentation
- Row-level security integration
- Social providers supported
- Free tier generous

**Cons:**
- Tied to Supabase ecosystem
- Limited org/team support
- Less flexible than Better-Auth
- Vendor lock-in to Supabase
- Migration complexity if we switch DB

**Rejected because:** Want auth decoupled from database provider. Better-Auth gives more flexibility.

### Option D: Custom Implementation
**Pros:**
- Complete control
- No dependencies
- Exactly what we need
- Learning opportunity

**Cons:**
- High security risk (easy to get wrong)
- Time-consuming (weeks of work)
- Need to implement all providers
- Maintenance burden
- Not feasible for 48h MVP

**Rejected because:** Security risk too high and timeline too short. Not worth reinventing the wheel.

## Links

- **Better-Auth Docs:** https://better-auth.com
- **GitHub:** https://github.com/better-auth/better-auth
- **Boilerplate Integration:** `src/lib/auth.ts`
- **Prisma Schema:** `prisma/schema/better-auth.prisma`
- **Related ADRs:** 
  - ADR-0010: Database choice (Supabase PostgreSQL)
  - ADR-0012: Monolith architecture
- **Tech Stack:** `docs/tech_stack.md`

# ADR-0015: Internationalization Strategy (next-intl)

Date: 2025-11-18
Status: Accepted
Deciders: Hugo Ganet

## Context

The application needs to support multiple languages (EN/FR) to serve a global student audience. Key requirements:

- **Locale routing**: URL-based locale selection (`/en/*`, `/fr/*`)
- **Type safety**: Compile-time validation of translation keys
- **Server/Client support**: Translations in both RSC and client components
- **Minimal overhead**: Fast builds, small bundle size
- **Next.js 15 compatibility**: Works with App Router and React Server Components

**Constraints:**
- Must work with Next.js 15.5 App Router
- Must support server-side rendering (RSC)
- Must provide type-safe translation keys
- Must handle locale detection (URL, cookie, Accept-Language header)

**Forces:**
- i18next: Most popular, large ecosystem, but complex setup with Next.js 15
- react-intl: Mature, but lacks Next.js-specific optimizations
- next-intl: Next.js-native, excellent App Router support, type-safe

## Decision

**Adopt next-intl 4.5.3** for comprehensive internationalization.

**Implementation:**

1. **Locale Routing**
   - Dynamic `[locale]` route segment: `/en/*`, `/fr/*`
   - Middleware-based locale detection (URL → cookie → Accept-Language → default)
   - Automatic redirection to localized routes

2. **Message Catalogs**
   - JSON files: `messages/en.json`, `messages/fr.json`
   - Namespaced structure: `dashboard.*`, `auth.*`, `navigation.*`
   - 300+ translation keys covering entire application

3. **Configuration**
   - `src/i18n.ts`: Locale definitions (`en`, `fr`), type guards
   - `src/i18n/request.ts`: Server-side locale resolution
   - `middleware.ts`: Locale detection and redirection
   - `next.config.ts`: next-intl plugin integration

4. **Component Usage**
   - Server components: `getTranslations('namespace')`
   - Client components: `useTranslations('namespace')`
   - Locale-aware links: Custom `Link` component with automatic locale prefix

5. **Language Switcher**
   - Dropdown in navigation
   - Updates cookie and redirects to localized route
   - Preserves current page path

## Consequences

**Positive:**
- ✅ Excellent Next.js 15 App Router integration
- ✅ Type-safe translations with TypeScript autocomplete
- ✅ Server and client component support
- ✅ Minimal configuration overhead
- ✅ Fast builds and small bundle size
- ✅ Automatic locale detection and routing
- ✅ Well-documented with active maintenance

**Negative:**
- ⚠️ Smaller ecosystem than i18next (fewer plugins)
- ⚠️ Less community resources (Stack Overflow, tutorials)
- ⚠️ Requires manual translation file management (no translation management UI)

**Follow-ups:**
- [ ] Add more locales (ES, DE, IT) if user demand grows
- [ ] Integrate translation management platform (Lokalise, Crowdin) for scale
- [ ] Add locale-specific date/number formatting
- [ ] Consider RTL support for Arabic/Hebrew

## Alternatives Considered

**Option A: i18next + react-i18next**
- Pros: Most popular, huge ecosystem, extensive plugins
- Cons: Complex Next.js 15 setup, requires custom middleware, larger bundle
- Rejected: Too much configuration overhead for MVP

**Option B: react-intl (FormatJS)**
- Pros: Mature, battle-tested, good TypeScript support
- Cons: No Next.js-specific optimizations, manual SSR setup, verbose API
- Rejected: Lacks Next.js App Router integration

**Option C: Custom solution (JSON + React Context)**
- Pros: Full control, minimal dependencies
- Cons: No type safety, manual routing, no SSR optimization, reinventing the wheel
- Rejected: Too much effort for limited benefit

## Links

- **Implementation:** Commit `07b72cd3` (feat(i18n): comprehensive EN/FR localization)
- **Migration:** `20251118035542_unified_content_processor` (includes i18n-related schema updates)
- **Related ADRs:** None
- **Docs:**
  - `docs/architecture.md`: Internationalization Architecture section
  - `docs/tech_stack.md`: i18n row in tech stack table
  - `messages/en.json`, `messages/fr.json`: Translation catalogs

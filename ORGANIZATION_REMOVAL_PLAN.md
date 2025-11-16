# Organization Removal Plan

## Executive Summary
This plan outlines the complete removal of the organization layer from the application, converting it to a single-user application. The organization concept is deeply integrated through better-auth's organization plugin, routing structure, database schema, and authorization logic.

## Information Gathered

### Current Architecture Analysis

#### 1. Database Schema (Prisma)
**Organization-related models in `prisma/schema/better-auth.prisma`:**
- `Organization` - Main organization model
- `Member` - Links users to organizations with roles
- `Invitation` - Organization invitations
- `Session.activeOrganizationId` - Tracks current org in session

**Main application models in `prisma/schema/schema.prisma`:**
- All core models (Course, Flashcard, ReviewSession, etc.) are user-based, NOT organization-based
- No foreign keys to Organization in application models
- This is GOOD - means minimal database impact

#### 2. Authentication & Authorization
**better-auth configuration (`src/lib/auth.ts`):**
- Uses `organization` plugin from better-auth
- Auto-creates organization on user signup
- Sends invitation emails
- Uses access control (ac) and roles for permissions

**Auth utilities:**
- `src/lib/organizations/get-org.ts` - Gets current organization from session
- `src/lib/auth/auth-permissions.ts` - Uses `activeOrganizationId` for permissions
- `src/lib/actions/safe-actions.ts` - Organization-based action authorization
- `src/lib/zod-route.ts` - Organization-based route authorization

#### 3. Routing Structure
**Current structure:**
```
/orgs/route.ts - Redirects to first org or creates new one
/orgs/[orgSlug]/layout.tsx - Org context wrapper
/orgs/[orgSlug]/(navigation)/ - All main app pages
  ├── courses/
  ├── users/
  └── settings/
/orgs/new/ - Create organization
/orgs/accept-invitation/ - Accept org invitations
```

**Target structure:**
```
/dashboard/ or /app/ - Main authenticated area
  ├── courses/
  ├── videos/
  └── settings/
```

#### 4. Admin Section
- Has organization management pages (`app/admin/organizations/`)
- These will be removed entirely

#### 5. Middleware
- `middleware.ts` redirects authenticated users from `/` to `/orgs`
- Needs update to redirect to new structure

## Detailed Migration Plan

### Phase 1: Database Schema Changes

#### 1.1 Remove Organization Models
**File: `prisma/schema/better-auth.prisma`**
- Remove `Organization` model
- Remove `Member` model  
- Remove `Invitation` model
- Remove `Session.activeOrganizationId` field
- Keep all other auth models (User, Session, Account, Verification)

#### 1.2 Update Subscription Model (if exists)
- Check if subscription model references Organization
- Either remove or link directly to User

#### 1.3 Create Migration
```bash
npx prisma migrate dev --name remove_organizations
```

### Phase 2: Authentication Configuration

#### 2.1 Update better-auth Configuration
**File: `src/lib/auth.ts`**
- Remove `organization` plugin import and configuration
- Remove organization creation in `databaseHooks.user.create.after`
- Remove invitation email sending
- Keep all other plugins (admin, emailOTP, nextCookies)
- Update imports to remove organization-related code

#### 2.2 Remove Organization Utilities
**Files to delete:**
- `src/lib/organizations/get-org.ts`
- `src/lib/organizations/is-in-roles.ts`
- Entire `src/lib/organizations/` directory

#### 2.3 Update Auth Client
**File: `src/lib/auth-client.ts`**
- Remove `organizationClient` import and usage

#### 2.4 Update Authorization Logic
**File: `src/lib/auth/auth-permissions.ts`**
- Remove organization-based permission checks
- Simplify to user-based permissions only
- Remove `activeOrganizationId` references

**File: `src/lib/actions/safe-actions.ts`**
- Remove `getRequiredCurrentOrg` import
- Remove organization validation from `authActionClient`
- Simplify to user-only authentication

**File: `src/lib/zod-route.ts`**
- Remove `getCurrentOrg` import
- Remove `orgRoute` function
- Keep only user-based route protection

#### 2.5 Update Metadata
**File: `src/lib/metadata.ts`**
- Remove `orgMetadata` function
- Keep only app-level metadata

### Phase 3: Routing Structure Migration

#### 3.1 Create New App Structure
**New directory: `app/(app)/`**
Create new authenticated app layout:
```
app/(app)/
  ├── layout.tsx (authenticated layout)
  ├── page.tsx (dashboard/home)
  ├── courses/
  ├── videos/
  └── settings/
```

#### 3.2 Move Pages from Orgs Structure
**Source:** `app/orgs/[orgSlug]/(navigation)/`
**Target:** `app/(app)/`

Move and update:
- `courses/` → `app/(app)/courses/`
- `users/` → `app/(app)/videos/` (rename to videos)
- `settings/` → `app/(app)/settings/`
- Main dashboard page

#### 3.3 Update Page Components
For each moved page:
- Remove `orgSlug` from params
- Remove organization context usage
- Update imports to remove org-related utilities
- Update navigation links

#### 3.4 Remove Organization Pages
**Delete entire directories:**
- `app/orgs/` (entire directory)
- `app/admin/organizations/` (org management in admin)

### Phase 4: Update Middleware & Navigation

#### 4.1 Update Middleware
**File: `middleware.ts`**
```typescript
// Change redirect from /orgs to /app or /dashboard
if (session) {
  url.pathname = "/app"; // or "/dashboard"
}
```

#### 4.2 Update Navigation Components
**Files to update:**
- Navigation components that reference org context
- Sidebar/header components
- Breadcrumbs

Remove:
- Organization switcher
- Organization settings links
- Member management links

#### 4.3 Update Root Page
**File: `app/page.tsx`**
- Update authenticated user redirect to new structure

### Phase 5: Update Components & Features

#### 5.1 Update Client Components
**Files using organization context:**
- `app/orgs/[orgSlug]/use-current-org.tsx` - DELETE
- Any components importing org utilities

#### 5.2 Update Server Components
Search and update all files using:
- `getCurrentOrg()`
- `getRequiredCurrentOrg()`
- `orgSlug` parameter
- Organization context

#### 5.3 Update API Routes
**Check and update:**
- `app/api/orgs/` - DELETE entire directory
- Any API routes using organization validation

### Phase 6: Update Actions

#### 6.1 Review All Actions
**Directory: `app/actions/`**
- Remove organization-based authorization
- Update to user-only authorization
- Check: generate-flashcards.action.ts, match-concepts.action.ts, etc.

### Phase 7: Admin Section Updates

#### 7.1 Remove Organization Management
**Delete:**
- `app/admin/organizations/` (entire directory)

#### 7.2 Update Admin Navigation
**File: `app/admin/_navigation/admin-navigation.links.ts`**
- Remove organization management link

### Phase 8: Testing & Validation

#### 8.1 Update Tests
**Files to update:**
- `__tests__/auth-permissions.test.ts`
- `__tests__/org-navigation-links.test.ts` - DELETE or update
- Any tests using organization context

#### 8.2 Update E2E Tests
**Files to update:**
- `e2e/create-organization.test.ts` - DELETE
- `e2e/org-details-update.spec.ts` - DELETE
- `e2e/org-slug-update.spec.ts` - DELETE
- `e2e/organization-members.spec.ts` - DELETE
- Update other e2e tests to use new routing

### Phase 9: Documentation & Configuration

#### 9.1 Update Documentation
- Update README.md
- Update architecture documentation
- Update any setup guides

#### 9.2 Update Environment Variables
- Remove any org-related environment variables

#### 9.3 Update Site Configuration
**File: `src/site-config.ts`**
- Remove organization-related configuration

## Migration Execution Order

### Step-by-Step Execution (MUST FOLLOW THIS ORDER):

1. **Backup Database** ⚠️
   ```bash
   pg_dump $DATABASE_URL > backup_before_org_removal.sql
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b remove-organizations
   ```

3. **Phase 1: Database Schema** (FIRST - Foundation)
   - Update Prisma schemas
   - Generate migration
   - Review migration SQL
   - Apply migration

4. **Phase 2: Authentication** (SECOND - Core Auth)
   - Update auth.ts
   - Remove organization plugin
   - Update auth utilities
   - Remove organization directory

5. **Phase 3: Create New Structure** (THIRD - New Foundation)
   - Create `app/(app)/` directory
   - Create new layout
   - Copy and update pages

6. **Phase 4: Update Middleware** (FOURTH - Routing)
   - Update redirects
   - Test authentication flow

7. **Phase 5: Update Components** (FIFTH - UI)
   - Update all components
   - Remove org context usage

8. **Phase 6: Update Actions** (SIXTH - Business Logic)
   - Update all server actions
   - Remove org authorization

9. **Phase 7: Clean Up** (SEVENTH - Remove Old)
   - Delete `app/orgs/` directory
   - Delete admin org pages
   - Delete org-related tests

10. **Phase 8: Testing** (EIGHTH - Validation)
    - Run all tests
    - Manual testing
    - E2E testing

11. **Phase 9: Documentation** (NINTH - Final)
    - Update docs
    - Update README

## Risk Assessment & Mitigation

### High Risk Areas:
1. **Database Migration** - Could lose data if not careful
   - Mitigation: Full backup, test in development first
   
2. **Authentication Flow** - Could break login/signup
   - Mitigation: Keep auth plugin changes minimal, test thoroughly

3. **Existing User Sessions** - Active sessions might break
   - Mitigation: Clear all sessions after migration, force re-login

### Medium Risk Areas:
1. **API Routes** - Some might still reference organizations
   - Mitigation: Comprehensive search and replace

2. **Client Components** - Might have org context dependencies
   - Mitigation: TypeScript will catch most issues

### Low Risk Areas:
1. **Core Application Logic** - Already user-based
2. **Database Models** - No org foreign keys in main models

## Rollback Plan

If issues occur:
1. Revert database migration: `npx prisma migrate resolve --rolled-back [migration_name]`
2. Restore database from backup
3. Revert git branch: `git reset --hard origin/main`
4. Redeploy previous version

## Success Criteria

- [ ] All organization models removed from database
- [ ] No organization plugin in better-auth
- [ ] All pages accessible without orgSlug parameter
- [ ] Authentication works without organization context
- [ ] All tests pass
- [ ] E2E tests pass with new routing
- [ ] No TypeScript errors
- [ ] Application runs without errors
- [ ] Users can sign up, log in, and use all features

## Estimated Timeline

- Phase 1 (Database): 1-2 hours
- Phase 2 (Auth): 2-3 hours
- Phase 3 (Routing): 3-4 hours
- Phase 4 (Middleware): 1 hour
- Phase 5 (Components): 3-4 hours
- Phase 6 (Actions): 2-3 hours
- Phase 7 (Admin): 1 hour
- Phase 8 (Testing): 2-3 hours
- Phase 9 (Docs): 1 hour

**Total: 16-24 hours of development time**

## Notes

- The application is already well-structured for this change - core models are user-based
- Organization was mainly a routing and authorization layer
- Most business logic won't need changes
- This is a significant but clean refactoring
- Better to do this early before more org-dependent features are built

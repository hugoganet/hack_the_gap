# TODO: Organization Removal Checklist

## ⚠️ BEFORE STARTING
- [ ] Read ORGANIZATION_REMOVAL_PLAN.md completely
- [ ] Backup database: `pg_dump $DATABASE_URL > backup_before_org_removal.sql`
- [ ] Create feature branch: `git checkout -b remove-organizations`
- [ ] Commit current work: `git add . && git commit -m "Pre-organization removal checkpoint"`

---

## PHASE 1: DATABASE SCHEMA CHANGES ✅

### 1.1 Update Prisma Schema - better-auth.prisma
- [ ] Open `prisma/schema/better-auth.prisma`
- [ ] Remove `Organization` model (entire model block)
- [ ] Remove `Member` model (entire model block)
- [ ] Remove `Invitation` model (entire model block)
- [ ] Remove `activeOrganizationId String?` from `Session` model
- [ ] Remove `subscription subscription?` from Organization (if exists)
- [ ] Save file

### 1.2 Check Main Schema
- [ ] Open `prisma/schema/schema.prisma`
- [ ] Verify no models reference Organization (should be clean)
- [ ] Check for any `organizationId` fields (should be none)

### 1.3 Generate and Apply Migration
- [ ] Run: `npx prisma format`
- [ ] Run: `npx prisma migrate dev --name remove_organizations --create-only`
- [ ] Review generated migration SQL in `prisma/migrations/`
- [ ] Verify migration only drops org tables
- [ ] Apply migration: `npx prisma migrate dev`
- [ ] Run: `npx prisma generate`

---

## PHASE 2: AUTHENTICATION CONFIGURATION ✅

### 2.1 Update better-auth Configuration
- [ ] Open `src/lib/auth.ts`
- [ ] Remove `organization` from imports: `import { admin, emailOTP, organization } from "better-auth/plugins";`
- [ ] Update to: `import { admin, emailOTP } from "better-auth/plugins";`
- [ ] Remove entire `organization({...})` plugin from plugins array
- [ ] Remove organization creation from `databaseHooks.user.create.after`
- [ ] Keep only `setupResendCustomer(user)` in the after hook
- [ ] Remove `ac, roles` imports from `./auth/auth-permissions`
- [ ] Save file

### 2.2 Update Auth Client
- [ ] Open `src/lib/auth-client.ts`
- [ ] Remove `organizationClient` from imports
- [ ] Remove `organizationClient()` from plugins array
- [ ] Save file

### 2.3 Update Auth Permissions
- [ ] Open `src/lib/auth/auth-permissions.ts`
- [ ] Remove organization-related permission checks
- [ ] Remove `activeOrganizationId` references
- [ ] Simplify to user-based permissions only
- [ ] Update or remove `ac` and `roles` exports if not needed
- [ ] Save file

### 2.4 Update Safe Actions
- [ ] Open `src/lib/actions/safe-actions.ts`
- [ ] Remove `import { getRequiredCurrentOrg } from "../organizations/get-org";`
- [ ] Remove organization validation from `authActionClient`
- [ ] Update to use only `getRequiredUser()`
- [ ] Remove organization-related metadata types
- [ ] Save file

### 2.5 Update Zod Route
- [ ] Open `src/lib/zod-route.ts`
- [ ] Remove `import { getCurrentOrg } from "./organizations/get-org";`
- [ ] Remove `orgRoute` function entirely
- [ ] Keep only user-based route protection
- [ ] Save file

### 2.6 Update Metadata
- [ ] Open `src/lib/metadata.ts`
- [ ] Remove `orgMetadata` function
- [ ] Remove organization-related imports
- [ ] Save file

### 2.7 Delete Organization Utilities
- [ ] Delete entire directory: `src/lib/organizations/`
- [ ] Verify deletion: `rm -rf src/lib/organizations`

---

## PHASE 3: CREATE NEW APP STRUCTURE ✅

### 3.1 Create New Authenticated Layout
- [ ] Create directory: `app/(app)/`
- [ ] Create `app/(app)/layout.tsx` with authenticated layout
- [ ] Add user authentication check
- [ ] Add navigation/sidebar
- [ ] Create `app/(app)/page.tsx` as dashboard/home

### 3.2 Move Dashboard/Home Content
- [ ] Copy content from `app/orgs/[orgSlug]/(navigation)/page.tsx`
- [ ] Update to `app/(app)/page.tsx`
- [ ] Remove `orgSlug` parameter
- [ ] Remove organization context usage
- [ ] Update imports

### 3.3 Move Courses Section
- [ ] Create `app/(app)/courses/` directory
- [ ] Copy all files from `app/orgs/[orgSlug]/(navigation)/courses/`
- [ ] Update each file:
  - [ ] Remove `orgSlug` from params
  - [ ] Update imports
  - [ ] Remove org context usage
- [ ] Test course pages work

### 3.4 Move Videos/Users Section
- [ ] Create `app/(app)/videos/` directory (rename from users)
- [ ] Copy files from `app/orgs/[orgSlug]/(navigation)/users/`
- [ ] Update each file:
  - [ ] Remove `orgSlug` from params
  - [ ] Update imports
  - [ ] Remove org context usage
- [ ] Update page title from "Users" to "Videos"

### 3.5 Move Settings Section
- [ ] Create `app/(app)/settings/` directory
- [ ] Copy files from `app/orgs/[orgSlug]/(navigation)/settings/`
- [ ] Update each file:
  - [ ] Remove `orgSlug` from params
  - [ ] Remove organization settings
  - [ ] Keep only user settings
  - [ ] Update imports

### 3.6 Move Navigation Components
- [ ] Copy navigation from `app/orgs/[orgSlug]/(navigation)/_navigation/`
- [ ] Create `app/(app)/_components/` or similar
- [ ] Update navigation links to remove `/orgs/[orgSlug]` prefix
- [ ] Remove organization switcher
- [ ] Remove member management links

---

## PHASE 4: UPDATE MIDDLEWARE & ROUTING ✅

### 4.1 Update Middleware
- [ ] Open `middleware.ts`
- [ ] Change redirect from `/orgs` to `/app`
- [ ] Update: `url.pathname = "/app";`
- [ ] Save file

### 4.2 Update Root Page
- [ ] Open `app/page.tsx`
- [ ] Update authenticated redirect to `/app`
- [ ] Remove any org-related logic
- [ ] Save file

### 4.3 Update Root Layout
- [ ] Open `app/layout.tsx`
- [ ] Verify no org-related code
- [ ] Update if needed

---

## PHASE 5: UPDATE COMPONENTS ✅

### 5.1 Search for Organization Usage
- [ ] Run: `grep -r "getCurrentOrg" src/`
- [ ] Run: `grep -r "getRequiredCurrentOrg" src/`
- [ ] Run: `grep -r "orgSlug" src/`
- [ ] Run: `grep -r "useCurrentOrg" src/`
- [ ] List all files found

### 5.2 Update Each Component File
For each file found:
- [ ] Remove organization imports
- [ ] Remove organization context usage
- [ ] Update to use user context only
- [ ] Update navigation links
- [ ] Test component still works

### 5.3 Update Shared Components
- [ ] Check `src/components/` for org usage
- [ ] Update any components using org context
- [ ] Update navigation components
- [ ] Update breadcrumbs

---

## PHASE 6: UPDATE ACTIONS ✅

### 6.1 Review All Actions
- [ ] Open `app/actions/generate-flashcards.action.ts`
- [ ] Remove org authorization, use user-only
- [ ] Open `app/actions/match-concepts.action.ts`
- [ ] Remove org authorization, use user-only
- [ ] Open `app/actions/process-content.action.ts`
- [ ] Remove org authorization, use user-only
- [ ] Open `app/actions/review-session.action.ts`
- [ ] Remove org authorization, use user-only
- [ ] Open `app/actions/beta-invitation.action.ts`
- [ ] Update if needed

### 6.2 Test Actions
- [ ] Verify all actions work with user-only auth
- [ ] Check TypeScript errors
- [ ] Run: `npm run type-check`

---

## PHASE 7: UPDATE API ROUTES ✅

### 7.1 Check API Routes
- [ ] List all routes: `find app/api -name "*.ts"`
- [ ] Check each route for org usage
- [ ] Update routes to use user-only auth

### 7.2 Delete Organization API Routes
- [ ] Delete `app/api/orgs/` directory if exists
- [ ] Verify: `rm -rf app/api/orgs`

---

## PHASE 8: ADMIN SECTION UPDATES ✅

### 8.1 Remove Organization Management
- [ ] Delete `app/admin/organizations/` directory
- [ ] Verify: `rm -rf app/admin/organizations`

### 8.2 Update Admin Navigation
- [ ] Open `app/admin/_navigation/admin-navigation.links.ts`
- [ ] Remove organization management link
- [ ] Save file

### 8.3 Update Admin Layout
- [ ] Open `app/admin/layout.tsx`
- [ ] Remove org-related code if any
- [ ] Save file

---

## PHASE 9: DELETE OLD ORGANIZATION STRUCTURE ✅

### 9.1 Delete Organization Routes
- [ ] Delete entire `app/orgs/` directory
- [ ] Verify: `rm -rf app/orgs`

### 9.2 Verify Deletion
- [ ] Run: `find app -name "*org*"`
- [ ] Check results, delete any remaining org files

---

## PHASE 10: UPDATE TESTS ✅

### 10.1 Delete Organization Tests
- [ ] Delete `__tests__/org-navigation-links.test.ts` if exists
- [ ] Delete `e2e/create-organization.test.ts`
- [ ] Delete `e2e/org-details-update.spec.ts`
- [ ] Delete `e2e/org-slug-update.spec.ts`
- [ ] Delete `e2e/organization-members.spec.ts`

### 10.2 Update Remaining Tests
- [ ] Open `__tests__/auth-permissions.test.ts`
- [ ] Remove org-related tests
- [ ] Update to user-only tests
- [ ] Open other test files
- [ ] Update routing in tests to new structure

### 10.3 Run Tests
- [ ] Run: `npm test`
- [ ] Fix any failing tests
- [ ] Run: `npm run test:e2e`
- [ ] Fix any failing e2e tests

---

## PHASE 11: DOCUMENTATION & CLEANUP ✅

### 11.1 Update Documentation
- [ ] Update `README.md`
- [ ] Remove organization setup instructions
- [ ] Update architecture docs
- [ ] Update `documentation_starter_pack/docs/architecture.md`

### 11.2 Update Configuration
- [ ] Check `src/site-config.ts` for org config
- [ ] Remove org-related config
- [ ] Check `.env.example` for org variables
- [ ] Remove if any

### 11.3 Clean Up Imports
- [ ] Run: `npm run lint`
- [ ] Fix any linting errors
- [ ] Run: `npm run type-check`
- [ ] Fix any TypeScript errors

---

## PHASE 12: FINAL TESTING ✅

### 12.1 Manual Testing Checklist
- [ ] Sign up new user
- [ ] Log in
- [ ] Navigate to dashboard
- [ ] Access courses
- [ ] Access videos
- [ ] Access settings
- [ ] Create flashcards
- [ ] Review flashcards
- [ ] Log out
- [ ] Log back in

### 12.2 Verify No Errors
- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Check database for orphaned data

### 12.3 Performance Check
- [ ] Test page load times
- [ ] Verify no broken links
- [ ] Test all major features

---

## PHASE 13: DEPLOYMENT PREPARATION ✅

### 13.1 Prepare for Deployment
- [ ] Run full test suite: `npm test`
- [ ] Run e2e tests: `npm run test:e2e`
- [ ] Build application: `npm run build`
- [ ] Fix any build errors

### 13.2 Database Migration Plan
- [ ] Document migration steps for production
- [ ] Plan for user session invalidation
- [ ] Prepare rollback plan

### 13.3 Git Cleanup
- [ ] Review all changes: `git diff main`
- [ ] Commit changes: `git add . && git commit -m "Remove organization layer"`
- [ ] Push branch: `git push origin remove-organizations`

---

## COMPLETION CHECKLIST ✅

- [ ] All organization models removed from database
- [ ] No organization plugin in better-auth
- [ ] All pages accessible without orgSlug
- [ ] Authentication works without organization
- [ ] All unit tests pass
- [ ] All e2e tests pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Application builds successfully
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Ready for code review

---

## ROLLBACK PROCEDURE (If Needed)

If something goes wrong:
1. Stop the application
2. Restore database: `psql $DATABASE_URL < backup_before_org_removal.sql`
3. Revert code: `git reset --hard origin/main`
4. Restart application

---

## NOTES

- Take breaks between phases
- Test after each phase
- Commit after each major phase
- Don't rush - this is a significant refactoring
- Ask for help if stuck
- Document any issues encountered

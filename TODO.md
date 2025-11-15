# TODO: Course Selection Page Implementation

## Completed Steps ✅

- [x] Create new git branch `first-page`
- [x] Create course enrollment action (`app/actions/course-enrollment.action.ts`)
  - [x] `enrollInCourse()` - Enroll user in a course
  - [x] `getAvailableCourses()` - Fetch all courses with enrollment status
  - [x] `hasAnyCourseEnrollment()` - Check if user has any enrollments
- [x] Create course selection page (`app/courses/select/page.tsx`)
- [x] Create course selection client component (`app/courses/select/course-selection-client.tsx`)
  - [x] Display 3 courses (Philosophy, Biology, Economics)
  - [x] Show course details (code, name, subject, year, semester, UE number)
  - [x] Show concept count for each course
  - [x] Handle enrollment with loading states
  - [x] French language UI
- [x] Update `/orgs` route to check for course enrollment
  - [x] Redirect to `/courses/select` if no enrollments
  - [x] Continue to organization dashboard if enrolled

## Remaining Steps 📋

- [ ] Test the complete flow:
  - [ ] Run database seed to populate courses: `pnpm prisma:seed`
  - [ ] Start development server: `pnpm dev`
  - [ ] Test new user login → redirects to course selection
  - [ ] Test course enrollment → redirects to organization dashboard
  - [ ] Test already enrolled user → goes directly to dashboard
- [ ] Verify TypeScript compilation: `pnpm ts`
- [ ] Commit changes to git

## Git Status 📦

Files to commit:
- `app/actions/course-enrollment.action.ts` (new)
- `app/courses/select/page.tsx` (new)
- `app/courses/select/course-selection-client.tsx` (new)
- `app/orgs/route.ts` (modified)
- `TODO.md` (new)

## Notes 📝

- The seed file (`prisma/seed.ts`) already contains the 3 courses:
  - LU1PH51F - Métaphysique (Philosophy, Licence 3, Semester 5)
  - BIOL2001 - Cell Biology (Biology, Licence 2, Semester 1)
  - ECON1101 - Intro to Microeconomics (Economics, Licence 1, Semester 1)
- UI is in French to match the course names
- Course cards show subject-specific icons and colors
- Enrollment status is tracked to prevent duplicate enrollments

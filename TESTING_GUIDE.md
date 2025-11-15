# Testing Guide - Course Selection Page

## Quick Start

### 1. Prepare Database
```bash
# Seed the database with courses (if not already done)
pnpm prisma:seed
```

### 2. Start Development Server
```bash
pnpm dev
```

### 3. Open Browser
Navigate to: `http://localhost:3000`

## Test Scenarios

### ✅ Test 1: New User Flow
**Goal**: Verify new users are redirected to course selection

**Steps:**
1. Sign up for a new account or use a test user without course enrollments
2. After successful login, you should be automatically redirected to `/courses/select`
3. Verify you see 3 course cards:
   - 🧠 **LU1PH51F - Métaphysique** (Philosophy, purple theme)
   - 🧬 **BIOL2001 - Cell Biology** (Biology, green theme)
   - 📊 **ECON1101 - Intro to Microeconomics** (Economics, blue theme)

**Expected Results:**
- ✅ Redirect to `/courses/select` happens automatically
- ✅ All 3 courses are displayed
- ✅ Each course shows: code, name, subject, year, semester, concept count
- ✅ "Sélectionner ce cours" button is enabled for all courses

---

### ✅ Test 2: Course Enrollment
**Goal**: Verify users can enroll in a course

**Steps:**
1. From the course selection page, click "Sélectionner ce cours" on any course
2. Observe the loading state (button shows "Inscription..." with spinner)
3. Wait for the enrollment to complete

**Expected Results:**
- ✅ Button shows loading state immediately
- ✅ Success toast appears: "Successfully enrolled in [Course Name]"
- ✅ Automatic redirect to organization dashboard (`/orgs/[orgSlug]`)
- ✅ No errors in browser console

---

### ✅ Test 3: Enrolled User Flow
**Goal**: Verify enrolled users skip course selection

**Steps:**
1. Login with a user who has already enrolled in a course
2. Observe the redirect behavior

**Expected Results:**
- ✅ User is redirected directly to organization dashboard
- ✅ Course selection page is skipped
- ✅ User lands on `/orgs/[orgSlug]` page

---

### ✅ Test 4: Return to Course Selection
**Goal**: Verify enrolled courses show correct status

**Steps:**
1. After enrolling in a course, manually navigate to `/courses/select`
2. Observe the enrolled course card

**Expected Results:**
- ✅ Enrolled course shows green "Inscrit" badge
- ✅ Button text changes to "Déjà inscrit"
- ✅ Button is disabled for enrolled course
- ✅ Other courses remain selectable

---

### ✅ Test 5: Multiple Enrollments
**Goal**: Verify users can enroll in multiple courses

**Steps:**
1. Enroll in first course
2. Navigate back to `/courses/select` (manually or via URL)
3. Enroll in second course
4. Return to `/courses/select` again

**Expected Results:**
- ✅ Both enrolled courses show "Inscrit" badge
- ✅ Both enrolled courses have disabled buttons
- ✅ Remaining course(s) are still selectable

---

### ✅ Test 6: Duplicate Enrollment Prevention
**Goal**: Verify system prevents duplicate enrollments

**Steps:**
1. Enroll in a course
2. Try to enroll in the same course again (if button somehow becomes enabled)

**Expected Results:**
- ✅ Error toast appears: "You are already enrolled in this course"
- ✅ No duplicate UserCourse record created in database

---

### ✅ Test 7: Unauthenticated Access
**Goal**: Verify authentication is required

**Steps:**
1. Sign out if logged in
2. Try to access `/courses/select` directly

**Expected Results:**
- ✅ Redirect to `/auth/signin`
- ✅ After login, redirect back to course selection (if no enrollments)

---

### ✅ Test 8: Responsive Design
**Goal**: Verify UI works on different screen sizes

**Steps:**
1. Open course selection page
2. Resize browser window or use device emulation
3. Test on mobile (< 768px), tablet (768-1024px), desktop (> 1024px)

**Expected Results:**
- ✅ Mobile: 1 column layout
- ✅ Tablet: 2 column layout
- ✅ Desktop: 3 column layout
- ✅ All elements remain readable and clickable
- ✅ No horizontal scrolling

---

### ✅ Test 9: Visual Feedback
**Goal**: Verify all interactive elements provide feedback

**Steps:**
1. Hover over course cards
2. Hover over buttons
3. Click buttons and observe states

**Expected Results:**
- ✅ Course cards show hover effect (shadow increases, border brightens)
- ✅ Buttons show hover effect
- ✅ Loading state shows spinner and "Inscription..." text
- ✅ Disabled buttons have reduced opacity
- ✅ Toast notifications appear for success/error

---

## Database Verification

### Check Enrollments
```bash
# Open Prisma Studio to view database
pnpm prisma studio
```

**Verify:**
1. Navigate to `UserCourse` table
2. Check that enrollment records exist with:
   - Correct `userId`
   - Correct `courseId`
   - `isActive: true`
   - `learnedCount: 0` (initial value)

### Check Courses
```bash
# In Prisma Studio, navigate to Course table
```

**Verify:**
1. 3 courses exist:
   - LU1PH51F
   - BIOL2001
   - ECON1101
2. Each course has:
   - Subject relation
   - Year relation
   - Semester relation
   - Syllabus concepts

---

## Troubleshooting

### Issue: Courses not appearing
**Solution:**
```bash
# Re-run seed
pnpm prisma:seed
```

### Issue: TypeScript errors
**Solution:**
```bash
# Regenerate Prisma client
pnpm prisma generate

# Check for errors
pnpm ts
```

### Issue: Redirect not working
**Check:**
1. User is authenticated (check browser dev tools → Application → Cookies)
2. UserCourse records exist in database
3. Browser console for errors

### Issue: Enrollment fails
**Check:**
1. Database connection is working
2. Course IDs are valid
3. User is authenticated
4. Check server logs for detailed error messages

---

## Success Criteria Checklist

After testing, verify:

- [ ] New users see course selection page after login
- [ ] All 3 courses display correctly with proper information
- [ ] Course enrollment works with one click
- [ ] Loading states appear during enrollment
- [ ] Success/error toasts show appropriate messages
- [ ] Enrolled users skip course selection page
- [ ] Enrolled courses show "Inscrit" badge
- [ ] Duplicate enrollments are prevented
- [ ] Responsive design works on all screen sizes
- [ ] No console errors during normal operation
- [ ] Database records are created correctly
- [ ] French language UI displays properly
- [ ] Subject-specific colors and icons appear correctly

---

## Performance Testing

### Load Time
- [ ] Course selection page loads in < 2 seconds
- [ ] Enrollment completes in < 1 second
- [ ] Redirect happens smoothly without flicker

### User Experience
- [ ] No layout shift during page load
- [ ] Smooth transitions and animations
- [ ] Immediate feedback on all interactions
- [ ] Clear visual hierarchy

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Notes

- The seed script creates sample users with enrollments. You may need to create a fresh user to test the new user flow.
- Course data is pre-populated by the seed script and matches the documentation.
- The UI is in French to match the course content language.
- All server actions include proper error handling and validation.

---

## Quick Commands Reference

```bash
# Start development
pnpm dev

# Seed database
pnpm prisma:seed

# Open database viewer
pnpm prisma studio

# Check TypeScript
pnpm ts

# Run linter
pnpm lint

# Format code
pnpm format

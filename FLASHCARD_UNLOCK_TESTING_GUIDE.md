# Flashcard Unlock System - Testing Guide

**Created:** 2025-11-18  
**Status:** Ready for Testing  
**Prerequisites:** Database migration applied, all code deployed

---

## 🎯 Testing Overview

This guide covers manual testing for the flashcard unlock system (Phase 1 + 2).

**What to Test:**
1. Locked flashcard creation during learning goal setup
2. Answer unlocking via content matching
3. User stats tracking (unlocks, streaks, milestones)
4. UI components (locked/unlocked/mastered states)
5. Notifications (unlock toasts, milestones, streaks)
6. Dashboard integration

---

## ✅ Testing Checklist

### **1. Locked Flashcard Creation**

**Test:** Add a new learning goal

- [ ] Navigate to dashboard
- [ ] Click "Add Learning Goal" or similar CTA
- [ ] Enter learning goal (e.g., "Kantian Ethics")
- [ ] Submit and wait for AI extraction
- [ ] Verify flashcards created with:
  - [ ] `state = 'locked'`
  - [ ] `answer = null`
  - [ ] `question` populated
  - [ ] `difficulty` set (easy/medium/hard)
  - [ ] `hints` array populated (if available)
  - [ ] `nextReviewAt = null`
- [ ] Check UserStats initialized:
  - [ ] `totalLocked` = number of flashcards created
  - [ ] `totalUnlocks = 0`
  - [ ] `currentStreak = 0`

**Expected Result:** Flashcards created in locked state, ready to be unlocked

---

### **2. Answer Unlocking**

**Test:** Process content that matches syllabus concepts

- [ ] Navigate to content submission page
- [ ] Submit YouTube video URL or upload PDF
- [ ] Wait for processing to complete
- [ ] Verify concept matching runs
- [ ] Check high-confidence matches (≥80%) trigger unlocks
- [ ] Verify flashcards updated:
  - [ ] `state` changed from 'locked' to 'unlocked'
  - [ ] `answer` populated with generated text
  - [ ] `unlockedAt` timestamp set
  - [ ] `unlockedBy` = contentJobId
  - [ ] `conceptMatchId` linked
  - [ ] `nextReviewAt` set to current time
- [ ] Check UnlockEvent created:
  - [ ] `userId` correct
  - [ ] `flashcardId` correct
  - [ ] `contentJobId` correct
  - [ ] `conceptMatchId` correct
  - [ ] `confidence` value stored

**Expected Result:** High-confidence matches unlock flashcard answers

---

### **3. User Stats Tracking**

**Test:** Stats update correctly after unlocks

- [ ] After first unlock, verify UserStats:
  - [ ] `totalUnlocks` incremented
  - [ ] `totalLocked` decremented
  - [ ] `unlockRate` calculated correctly
  - [ ] `currentStreak = 1`
  - [ ] `longestStreak = 1`
  - [ ] `lastUnlockDate` = today
  - [ ] `firstUnlockAt` set
- [ ] Unlock more flashcards same day:
  - [ ] `totalUnlocks` increments
  - [ ] `currentStreak` stays same (already counted today)
- [ ] Simulate next day unlock (change `lastUnlockDate` in DB):
  - [ ] `currentStreak` increments to 2
  - [ ] `longestStreak` updates if needed
- [ ] Simulate streak break (skip a day):
  - [ ] `currentStreak` resets to 1
  - [ ] `longestStreak` preserved

**Expected Result:** Stats accurately track unlocks and streaks

---

### **4. Milestone Detection**

**Test:** Milestones trigger at correct thresholds

- [ ] Unlock 10th flashcard:
  - [ ] `milestone10` timestamp set
  - [ ] Notification shown (if implemented)
- [ ] Unlock 50th flashcard:
  - [ ] `milestone50` timestamp set
  - [ ] Notification shown
- [ ] Unlock 100th flashcard:
  - [ ] `milestone100` timestamp set
  - [ ] Notification shown

**Expected Result:** Milestones detected and recorded

---

### **5. UI Components - Locked State**

**Test:** Locked flashcard display

- [ ] Navigate to flashcards page
- [ ] Find locked flashcard
- [ ] Verify UI shows:
  - [ ] Question text
  - [ ] 🔒 Lock icon
  - [ ] "locked" badge
  - [ ] Orange border/styling
  - [ ] "Answer locked" message
  - [ ] "Watch content to unlock" text
  - [ ] Hints displayed (if available)
  - [ ] No answer visible
  - [ ] Review button disabled or hidden

**Expected Result:** Locked state clearly communicated, hints visible

---

### **6. UI Components - Unlocked State**

**Test:** Unlocked flashcard display

- [ ] Find unlocked flashcard
- [ ] Verify UI shows:
  - [ ] Question text
  - [ ] 🔓 Unlock icon
  - [ ] "unlocked" badge
  - [ ] Blue border/styling
  - [ ] Unlock date displayed
  - [ ] Source attribution (video/PDF name)
  - [ ] "Show Answer" button
  - [ ] Answer revealed when clicked
  - [ ] Review button enabled

**Expected Result:** Unlocked state clear, answer accessible

---

### **7. UI Components - Mastered State**

**Test:** Mastered flashcard display (requires multiple reviews)

- [ ] Review a flashcard multiple times with high success rate
- [ ] Verify state changes to 'mastered'
- [ ] Verify UI shows:
  - [ ] ⭐ Star icon
  - [ ] "mastered" badge
  - [ ] Green border/styling
  - [ ] Review stats (times reviewed, success rate)
  - [ ] Answer visible by default

**Expected Result:** Mastered state shows achievement

---

### **8. Flashcard List Tabs**

**Test:** Tab filtering works correctly

- [ ] Navigate to flashcards page
- [ ] Verify 3 tabs: Unlocked, Locked, Mastered
- [ ] Click "Unlocked" tab:
  - [ ] Shows only unlocked flashcards
  - [ ] Count in tab label correct
- [ ] Click "Locked" tab:
  - [ ] Shows only locked flashcards
  - [ ] Count in tab label correct
- [ ] Click "Mastered" tab:
  - [ ] Shows only mastered flashcards
  - [ ] Count in tab label correct
- [ ] Verify empty states:
  - [ ] "No unlocked flashcards yet" when empty
  - [ ] "All flashcards unlocked! 🎉" when no locked
  - [ ] "No mastered flashcards yet" when empty

**Expected Result:** Tabs filter correctly, counts accurate

---

### **9. Progress Dashboard**

**Test:** Unlock progress cards display correctly

- [ ] Navigate to main dashboard
- [ ] Verify 4 stat cards displayed:
  - [ ] **Total Concepts:** Shows total count
  - [ ] **Locked:** Shows locked count (orange)
  - [ ] **Unlocked:** Shows unlocked count (blue)
  - [ ] **Mastered:** Shows mastered count (green)
- [ ] Verify progress bars:
  - [ ] Unlock percentage calculated correctly
  - [ ] Mastered percentage calculated correctly
- [ ] Verify streak card:
  - [ ] Current streak displayed
  - [ ] Longest streak displayed
  - [ ] Fire emoji badge shows for 3+ day streaks

**Expected Result:** Dashboard shows accurate unlock progress

---

### **10. Notifications**

**Test:** Toast notifications appear correctly

**Unlock Notification:**
- [ ] Process content that unlocks flashcards
- [ ] Verify toast appears with:
  - [ ] 🎉 Celebration emoji
  - [ ] "Unlocked X answers!" message
  - [ ] List of concept names
  - [ ] Source attribution
  - [ ] "Review now" action button
  - [ ] Auto-dismiss after 5 seconds

**Milestone Notification:**
- [ ] Reach 10 unlocks:
  - [ ] Toast shows "🎯 First 10 unlocks!"
- [ ] Reach 50 unlocks:
  - [ ] Toast shows "🚀 50 unlocks milestone!"
- [ ] Reach 100 unlocks:
  - [ ] Toast shows "🏆 100 unlocks achieved!"

**Streak Notification:**
- [ ] Maintain 3+ day streak:
  - [ ] Toast shows "🔥 X-day streak!"
  - [ ] Encouraging message displayed

**Expected Result:** Notifications appear at correct times with proper styling

---

### **11. Edge Cases**

**No Matching Content:**
- [ ] Add learning goal
- [ ] Process unrelated content
- [ ] Verify flashcards stay locked
- [ ] Verify no errors thrown

**Low Confidence Match (<80%):**
- [ ] Process content with low-confidence match
- [ ] Verify flashcard stays locked
- [ ] Verify no unlock triggered

**Duplicate Unlock Attempt:**
- [ ] Process same content twice
- [ ] Verify idempotent behavior (no errors)
- [ ] Verify flashcard not unlocked twice

**User with No Stats:**
- [ ] Create new user
- [ ] Add learning goal
- [ ] Verify UserStats created automatically
- [ ] Verify no errors

**Empty Hints Array:**
- [ ] Find flashcard with no hints
- [ ] Verify hints section not shown
- [ ] Verify no errors

**Very Long Question:**
- [ ] Find flashcard with long question
- [ ] Verify text wraps correctly
- [ ] Verify card layout not broken

---

### **12. Performance**

**Unlock Service Performance:**
- [ ] Process content with 50+ concept matches
- [ ] Measure unlock service execution time
- [ ] Target: <5 seconds for 50 matches
- [ ] Verify no timeout errors

**Dashboard Load Time:**
- [ ] Navigate to dashboard with 100+ flashcards
- [ ] Measure page load time
- [ ] Target: <2 seconds
- [ ] Verify smooth rendering

**Flashcard List Rendering:**
- [ ] Load flashcard list with 100+ cards
- [ ] Verify smooth scrolling
- [ ] Verify tabs switch quickly
- [ ] No lag or jank

---

### **13. Database Integrity**

**Foreign Key Constraints:**
- [ ] Verify all flashcards have valid `syllabusConceptId`
- [ ] Verify unlocked flashcards have valid `conceptMatchId`
- [ ] Verify all UnlockEvents have valid foreign keys

**Unique Constraints:**
- [ ] Verify one flashcard per (syllabusConceptId, userId)
- [ ] Attempt to create duplicate → Should fail gracefully

**Indexes:**
- [ ] Verify indexes created:
  - [ ] `flashcards_userId_state_idx`
  - [ ] `flashcards_syllabusConceptId_idx`
  - [ ] `unlock_events_userId_createdAt_idx`
  - [ ] `user_stats_userId_key` (unique)

---

### **14. API Endpoints**

**GET /api/flashcards:**
- [ ] Call without auth → 401 Unauthorized
- [ ] Call with auth → Returns flashcards
- [ ] Filter by courseId → Returns only that course
- [ ] Filter by state=locked → Returns only locked
- [ ] Filter by state=unlocked → Returns only unlocked
- [ ] Verify response structure matches expected type

**GET /api/user/stats:**
- [ ] Call without auth → 401 Unauthorized
- [ ] Call with auth → Returns stats
- [ ] Call for new user → Creates stats automatically
- [ ] Verify response structure correct

---

### **15. End-to-End Flow**

**Complete User Journey:**
- [ ] 1. User signs up
- [ ] 2. User adds learning goal (e.g., "Kantian Ethics")
- [ ] 3. AI extracts concepts + creates locked flashcards
- [ ] 4. User sees locked flashcards with questions + hints
- [ ] 5. User submits YouTube video about Kant
- [ ] 6. System matches concepts to syllabus
- [ ] 7. High-confidence matches unlock flashcards
- [ ] 8. User sees unlock notification
- [ ] 9. User navigates to flashcards page
- [ ] 10. User sees unlocked flashcards with answers
- [ ] 11. User starts review session
- [ ] 12. User completes reviews
- [ ] 13. Dashboard shows updated stats
- [ ] 14. Streak increments next day

**Expected Result:** Complete flow works without errors

---

## 🐛 Known Issues / Limitations

Document any issues found during testing:

- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

---

## 📊 Success Criteria

**Phase 1 (Core Functionality):**
- ✅ Locked flashcards created successfully
- ✅ Answers unlock on content match (≥80% confidence)
- ✅ UI shows locked/unlocked states correctly
- ✅ No database errors or constraint violations

**Phase 2 (Gamification):**
- ✅ Progress tracking accurate (locked/unlocked/mastered counts)
- ✅ Streaks calculated correctly
- ✅ Milestones trigger at 10, 50, 100
- ✅ Notifications appear and are dismissible

**Performance:**
- ✅ Unlock service handles 50+ matches in <5s
- ✅ Dashboard loads in <2s
- ✅ Flashcard list renders 100+ cards smoothly

---

## 🚀 Post-Testing Actions

After testing is complete:

- [ ] Fix any critical bugs found
- [ ] Document known limitations
- [ ] Update CHANGELOG.md with feature details
- [ ] Create ADR for flashcard unlock system design
- [ ] Update architecture.md with new data flow
- [ ] Update ERD with new models
- [ ] Deploy to production
- [ ] Monitor error logs for 24h
- [ ] Collect user feedback

---

## 📝 Test Results Log

**Date:** ___________  
**Tester:** ___________  
**Environment:** ___________

### Test Results:

| Test | Status | Notes |
|------|--------|-------|
| Locked flashcard creation | ⬜ | |
| Answer unlocking | ⬜ | |
| User stats tracking | ⬜ | |
| Milestone detection | ⬜ | |
| UI - Locked state | ⬜ | |
| UI - Unlocked state | ⬜ | |
| UI - Mastered state | ⬜ | |
| Flashcard list tabs | ⬜ | |
| Progress dashboard | ⬜ | |
| Notifications | ⬜ | |
| Edge cases | ⬜ | |
| Performance | ⬜ | |
| Database integrity | ⬜ | |
| API endpoints | ⬜ | |
| End-to-end flow | ⬜ | |

**Overall Status:** ⬜ Pass / ⬜ Fail / ⬜ Needs Fixes

**Critical Issues Found:**
1. 
2. 
3. 

**Minor Issues Found:**
1. 
2. 
3. 

---

## 🔧 Debugging Tips

**If flashcards not created:**
- Check console logs in `createKnowledgeStructure`
- Verify extraction response includes `flashcard` objects
- Check Prisma schema is up to date (`npx prisma generate`)

**If unlocks not working:**
- Check console logs in `unlockFlashcardAnswers`
- Verify match confidence ≥ 0.8
- Check flashcard exists and is in 'locked' state
- Verify `conceptMatchId` is being set

**If stats not updating:**
- Check `updateUserStatsAfterUnlock` logs
- Verify UserStats record exists
- Check streak calculation logic
- Verify date comparisons working correctly

**If UI not showing correct state:**
- Check API response structure
- Verify component props match expected types
- Check Tailwind classes applied correctly
- Verify state prop is 'locked' | 'unlocked' | 'mastered'

---

## 🎯 Next Steps After Testing

1. **If all tests pass:**
   - Mark implementation as complete
   - Deploy to production
   - Monitor for 24-48 hours
   - Collect user feedback

2. **If critical issues found:**
   - Document issues in GitHub/Linear
   - Prioritize fixes
   - Re-test after fixes
   - Deploy when stable

3. **If minor issues found:**
   - Document for future iteration
   - Deploy if not blocking
   - Schedule fixes for next sprint

---

**Testing Status:** 🟡 Ready for Testing

**Last Updated:** 2025-11-18

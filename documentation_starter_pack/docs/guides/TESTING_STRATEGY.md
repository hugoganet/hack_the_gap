# Testing Strategy

This document outlines the comprehensive testing approach for Recall, including test coverage goals, E2E scenarios, performance benchmarks, and testing tools.

## Test Coverage Goals

### Target Coverage

- **Unit Tests:** 80% coverage (business logic, utilities, helpers)
- **Integration Tests:** 60% coverage (API routes, database operations, AI services)
- **E2E Tests:** Critical paths only (full user journeys)
- **Performance Tests:** Key workflows <60s

### Current Coverage

- **Unit Tests:** ~40% (needs improvement)
- **Integration Tests:** ~30% (needs improvement)
- **E2E Tests:** ~20% (critical paths covered)
- **Performance Tests:** Manual testing only

**Priority:** Increase unit test coverage to 80% before launch.

---

## Test Pyramid

```
       /\
      /E2E\       10% - Critical user journeys (slow, expensive)
     /------\
    /  INT   \    30% - API + DB interactions (moderate speed)
   /----------\
  /   UNIT     \  60% - Business logic + utilities (fast, cheap)
 /--------------\
```

**Philosophy:**
- **Many unit tests:** Fast feedback, easy to maintain
- **Some integration tests:** Verify component interactions
- **Few E2E tests:** Validate critical user flows

---

## E2E Test Scenarios

### Critical Path: Full Pipeline (Priority: P0)

**Scenario:** Student completes entire learning flow from signup to review

**Steps:**
1. User signs up with email/password
2. User signs in
3. User uploads syllabus (PDF)
4. AI extracts concepts from syllabus
5. User submits video URL (YouTube)
6. AI extracts concepts from video
7. AI matches concepts to syllabus (≥70% confidence)
8. System generates flashcards
9. User confirms match → unlocks flashcard
10. User reviews flashcard
11. System schedules next review (SM-2 algorithm)
12. Dashboard shows progress update

**Expected Results:**
- All steps complete without errors
- Flashcard unlocked with correct answer
- Review scheduled for tomorrow
- Progress shows "1/X concepts mastered"

**Performance:**
- Total time: <90s (excluding AI processing)
- Video processing: <60s
- Concept matching: <10s

**Test File:** `e2e/full-pipeline.spec.ts`

---

### Scenario 2: Concept Matching with Low Confidence (Priority: P1)

**Scenario:** System rejects low-confidence matches

**Steps:**
1. User uploads syllabus (Philosophy 101)
2. User submits video URL (unrelated topic: cooking)
3. AI extracts concepts from video
4. AI attempts to match concepts to syllabus
5. System rejects all matches (<60% confidence)
6. User sees "No matches found" message

**Expected Results:**
- No flashcards generated
- Clear feedback to user
- Suggestion to try different content

**Test File:** `e2e/low-confidence-matching.spec.ts`

---

### Scenario 3: Multiple Content Submissions (Priority: P1)

**Scenario:** Student processes multiple videos for same course

**Steps:**
1. User uploads syllabus
2. User submits Video 1 → 3 concepts matched
3. User submits Video 2 → 5 concepts matched
4. User submits Video 3 → 2 concepts matched
5. Dashboard shows cumulative progress

**Expected Results:**
- All videos processed successfully
- No duplicate flashcards
- Progress shows "10/X concepts mastered"
- Unlock history tracks all sources

**Test File:** `e2e/multiple-content-submissions.spec.ts`

---

### Scenario 4: Review Session with Multiple Flashcards (Priority: P1)

**Scenario:** Student reviews multiple flashcards in one session

**Steps:**
1. User has 5 unlocked flashcards due for review
2. User starts review session
3. User reviews all 5 flashcards (mix of Easy/Good/Hard)
4. System updates review schedules based on ratings
5. Dashboard shows updated progress

**Expected Results:**
- All flashcards reviewed
- Next review dates calculated correctly (SM-2)
- Progress metrics updated
- Session logged in database

**Test File:** `e2e/review-session.spec.ts`

---

### Scenario 5: Progress Dashboard Updates (Priority: P2)

**Scenario:** Dashboard reflects real-time progress

**Steps:**
1. User starts with 0/30 concepts mastered
2. User unlocks 5 flashcards
3. Dashboard updates to show 5/30
4. User reviews 3 flashcards (marks as "Good")
5. Dashboard shows streak, unlock rate, etc.

**Expected Results:**
- Real-time progress updates
- Accurate concept count
- Streak tracking works
- Charts render correctly

**Test File:** `e2e/dashboard-updates.spec.ts`

---

### Scenario 6: Gap Analysis Display (Priority: P2)

**Scenario:** System identifies missing concepts

**Steps:**
1. User has mastered 15/30 concepts
2. User views gap analysis
3. System shows 15 missing concepts
4. System recommends content to fill gaps

**Expected Results:**
- Accurate gap identification
- Clear list of missing concepts
- Content recommendations (if available)

**Test File:** `e2e/gap-analysis.spec.ts`

---

## Integration Tests

### API Route Tests

**Test Coverage:**

1. **POST /api/upload-pdf**
   - Valid PDF upload (< 10MB)
   - Invalid file type (reject)
   - File too large (reject)
   - Missing file (400 error)

2. **POST /api/process-content**
   - Valid YouTube URL
   - Invalid URL format
   - Unsupported platform
   - API timeout handling

3. **GET /api/flashcards**
   - Fetch user's flashcards
   - Filter by course
   - Filter by unlock status
   - Pagination

4. **POST /api/review-session**
   - Create review session
   - Submit flashcard ratings
   - Update review schedules
   - Calculate next review dates

5. **GET /api/user/stats**
   - Fetch user progress
   - Calculate streak
   - Compute unlock rate
   - Generate charts data

**Test File:** `__tests__/api/*.test.ts`

---

### Database Operations

**Test Coverage:**

1. **Concept Matching**
   - Insert concept matches
   - Update confidence scores
   - Query by threshold
   - Handle duplicates

2. **Flashcard Unlocks**
   - Create unlock event
   - Update user stats
   - Track unlock source
   - Prevent duplicate unlocks

3. **Review Scheduling**
   - Calculate next review (SM-2)
   - Update flashcard state
   - Log review history
   - Handle edge cases (first review, etc.)

**Test File:** `__tests__/database/*.test.ts`

---

### AI Service Integration

**Test Coverage:**

1. **Concept Extraction**
   - Mock OpenAI API responses
   - Handle API errors
   - Validate extracted concepts
   - Test retry logic

2. **Concept Matching**
   - Mock embedding generation
   - Test similarity calculation
   - Validate confidence scores
   - Handle edge cases (no matches)

3. **Flashcard Generation**
   - Mock Claude API responses
   - Validate flashcard format
   - Test bilingual generation (EN/FR)
   - Handle API failures

**Test File:** `__tests__/ai-services/*.test.ts`

---

## Unit Tests

### Business Logic

**Test Coverage:**

1. **Concept Atomicity Validation**
   - Validate concept is atomic (one flashcard)
   - Detect non-atomic concepts
   - Suggest splitting strategies

2. **Confidence Threshold Logic**
   - HIGH: ≥80%
   - MEDIUM: ≥60%
   - REJECTED: <60%
   - Edge cases (exactly 60%, 80%)

3. **SM-2 Algorithm**
   - Calculate next review interval
   - Update ease factor
   - Handle first review
   - Test all rating levels (Easy/Good/Hard/Again)

4. **Progress Calculation**
   - Count mastered concepts
   - Calculate completion percentage
   - Compute streak
   - Handle edge cases (0 concepts, 100% complete)

**Test File:** `__tests__/business-logic/*.test.ts`

---

### Utilities & Helpers

**Test Coverage:**

1. **Date/Time Utilities**
   - Format dates
   - Calculate intervals
   - Handle timezones
   - Parse ISO strings

2. **String Utilities**
   - Truncate text
   - Sanitize input
   - Generate slugs
   - Validate URLs

3. **Validation Schemas (Zod)**
   - Validate user input
   - Test error messages
   - Handle edge cases
   - Type safety

**Test File:** `__tests__/utils/*.test.ts`

---

## Performance Testing

### Benchmarks

| Workflow | Target | Current | Status |
|----------|--------|---------|--------|
| Video processing (YouTube) | <60s | ~45s | ✅ PASS |
| PDF processing (10 pages) | <30s | ~25s | ✅ PASS |
| Concept extraction | <20s | ~15s | ✅ PASS |
| Concept matching | <10s | ~8s | ✅ PASS |
| Flashcard generation | <5s | ~3s | ✅ PASS |
| Page load (dashboard) | <2s | ~1.2s | ✅ PASS |
| Review session (10 cards) | <30s | ~20s | ✅ PASS |

### Performance Test Scenarios

1. **Load Testing**
   - Simulate 100 concurrent users
   - Process 50 videos simultaneously
   - Measure response times
   - Identify bottlenecks

2. **Stress Testing**
   - Push system to limits
   - Test with 1000+ concepts
   - Large PDF files (50+ pages)
   - Long videos (2+ hours)

3. **Endurance Testing**
   - Run for 24 hours
   - Monitor memory leaks
   - Check database connections
   - Verify no degradation

**Tools:**
- Lighthouse (web vitals)
- Playwright (E2E timing)
- Custom performance monitoring
- Vercel Analytics

---

## Testing Tools

### Unit & Integration Tests

**Framework:** Vitest 3.2.4

**Why Vitest:**
- Fast (Vite-native)
- Great DX (hot reload, watch mode)
- Compatible with Jest API
- Built-in TypeScript support

**Configuration:** `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/vitest.setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.ts',
        '**/*.d.ts'
      ]
    }
  }
});
```

---

### E2E Tests

**Framework:** Playwright 1.55.0

**Why Playwright:**
- Cross-browser (Chromium, Firefox, WebKit)
- Reliable (auto-wait, retry logic)
- Fast (parallel execution)
- Great debugging tools

**Configuration:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

---

### Component Tests

**Framework:** @testing-library/react

**Why Testing Library:**
- User-centric (test behavior, not implementation)
- Accessible (encourages a11y best practices)
- Simple API
- Works with Vitest

**Example:**
```typescript
import { render, screen } from '@testing-library/react';
import { FlashcardCard } from '@/components/flashcard-card';

test('renders locked flashcard', () => {
  render(<FlashcardCard flashcard={mockFlashcard} isLocked={true} />);
  expect(screen.getByText('🔒 Locked')).toBeInTheDocument();
  expect(screen.queryByText('Answer')).not.toBeInTheDocument();
});
```

---

### Mocking

**Framework:** Vitest mocks

**Mock Strategies:**

1. **API Mocks:**
```typescript
vi.mock('@/lib/ai/openai', () => ({
  generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, ...])
}));
```

2. **Database Mocks:**
```typescript
vi.mock('@/lib/db', () => ({
  prisma: {
    flashcard: {
      findMany: vi.fn().mockResolvedValue(mockFlashcards)
    }
  }
}));
```

3. **Date Mocks:**
```typescript
vi.setSystemTime(new Date('2025-01-01'));
```

---

## Running Tests

### Local Development

```bash
# Unit + Integration tests
pnpm test

# Watch mode (recommended during development)
pnpm test:watch

# Coverage report
pnpm test:coverage

# E2E tests (requires running dev server)
pnpm test:e2e

# E2E in UI mode (interactive debugging)
pnpm test:e2e:ui

# Specific test file
pnpm test src/features/flashcards/flashcard-generator.test.ts
```

### CI/CD

```bash
# Run all tests in CI
pnpm test:ci

# This runs:
# 1. Unit tests with coverage
# 2. Integration tests
# 3. E2E tests (headless)
# 4. Linting
# 5. Type checking
```

### Pre-commit Hooks

**Husky + lint-staged** runs tests on staged files:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "vitest related --run"
    ]
  }
}
```

---

## Test Data Management

### Fixtures

**Location:** `test/fixtures/`

**Examples:**
- `mockFlashcards.ts` - Sample flashcard data
- `mockConcepts.ts` - Sample concept data
- `mockUsers.ts` - Sample user data

### Database Seeding

**For E2E tests:**

```typescript
// test/setup.ts
beforeAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE flashcards CASCADE`;
  await prisma.flashcard.createMany({ data: mockFlashcards });
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Environment Variables

**Test environment:** `.env.test`

```bash
DATABASE_URL="postgresql://test:test@localhost:5432/recall_test"
OPENAI_API_KEY="sk-test-..."
ANTHROPIC_API_KEY="sk-ant-test-..."
```

---

## Continuous Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Coverage Reports

**Codecov Integration:**
- Automatic coverage reports on PRs
- Track coverage trends over time
- Fail PR if coverage drops >5%

**Target:** Maintain 80% unit test coverage

---

## Testing Best Practices

### DO

✅ **Test behavior, not implementation**
- Focus on what the user sees/does
- Avoid testing internal state

✅ **Use descriptive test names**
```typescript
test('unlocks flashcard when confidence ≥70%', () => { ... });
```

✅ **Arrange-Act-Assert pattern**
```typescript
// Arrange
const flashcard = createMockFlashcard();

// Act
const result = unlockFlashcard(flashcard, 0.75);

// Assert
expect(result.isUnlocked).toBe(true);
```

✅ **Test edge cases**
- Empty arrays
- Null/undefined values
- Boundary conditions (exactly 60%, 80%)

✅ **Keep tests isolated**
- No shared state between tests
- Clean up after each test

### DON'T

❌ **Don't test third-party libraries**
- Trust that React, Next.js, Prisma work
- Focus on your business logic

❌ **Don't test implementation details**
```typescript
// Bad
expect(component.state.count).toBe(5);

// Good
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

❌ **Don't write flaky tests**
- Avoid `setTimeout` in tests
- Use Playwright's auto-wait
- Mock time when needed

❌ **Don't skip tests**
- Fix failing tests immediately
- Remove obsolete tests

---

## Debugging Tests

### Vitest Debugging

```bash
# Run single test in debug mode
node --inspect-brk ./node_modules/vitest/vitest.mjs run test-file.test.ts

# Then open chrome://inspect in Chrome
```

### Playwright Debugging

```bash
# Run with UI mode (interactive)
pnpm test:e2e:ui

# Run with headed browser
pnpm test:e2e --headed

# Debug specific test
pnpm test:e2e --debug test-name
```

### Common Issues

**Issue:** Tests pass locally but fail in CI
- **Solution:** Check environment variables, database state, timing issues

**Issue:** Flaky E2E tests
- **Solution:** Add explicit waits, use `waitForSelector`, increase timeout

**Issue:** Slow tests
- **Solution:** Mock external APIs, use in-memory database, parallelize

---

## Related Documents

- [Architecture](../architecture.md) - System design
- [Tech Stack](../tech_stack.md) - Testing tools
- [Contributing](./CONTRIBUTING.md) - Development workflow
- [Deployment](./DEPLOYMENT.md) - CI/CD pipeline

---

**Document Created:** 2025-11-19  
**Last Updated:** 2025-11-19  
**Maintainer:** Engineering Team

# Review Session UI/UX Plan - US-0006

## 📋 Overview

This document outlines the detailed UI/UX design for the First Review Session feature, maintaining consistency with the existing design system.

---

## 🎨 Design System Analysis

### Existing Patterns Identified

**Colors & Variants:**
- Primary actions: `variant="default"` (blue/primary color)
- Secondary actions: `variant="outline"` (bordered, subtle)
- Destructive: `variant="destructive"` (red)
- Success: `variant="success"` (green) ✅ Available!
- Warning: `variant="warning"` (yellow) ✅ Available!

**Layout Patterns:**
- Cards with headers (`Card`, `CardHeader`, `CardTitle`, `CardDescription`)
- Full-width buttons for primary actions
- Icon + text combinations (Brain, BookOpen, Clock, CheckCircle2)
- Modal dialogs for focused interactions
- Progress indicators with text (e.g., "Card X of Y")

**Typography:**
- Headers: `text-3xl font-bold`
- Subheaders: `text-sm text-muted-foreground`
- Body: `text-base` or `text-lg`
- Metadata: `text-xs text-muted-foreground`

**Spacing:**
- Consistent `space-y-6` for major sections
- `space-y-2` for related items
- `gap-2`, `gap-3`, `gap-4` for flex layouts

---

## 🎯 User Flow

### Entry Points

**1. From Course Detail Page (Primary)**
```
Course Detail Page
  └─ "Concepts & Flashcards" Card
      └─ [Button: "Start Review Session" (if flashcards available)]
          └─ Review Session Page
```

**2. From Dashboard (Future)**
```
Dashboard
  └─ "Due for Review" Widget
      └─ [Button: "Review Now"]
          └─ Review Session Page
```

---

## 🖼️ Detailed UI/UX Design

### 1. **Review Session Entry (Course Detail Page Enhancement)**

**Location:** `app/orgs/[orgSlug]/(navigation)/courses/[courseId]/course-flashcards-view.tsx`

**Changes:**
- Add "Start Review Session" button at the top of the Concepts card
- Show count of available flashcards
- Disable if no flashcards or already in progress

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ 🧠 Concepts & Flashcards                            │
│ Click on a concept to view its flashcard            │
│                                                      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📚 3 flashcards ready for review                │ │
│ │                                                  │ │
│ │ [Start Review Session →]  (primary, full-width) │ │
│ └─────────────────────────────────────────────────┘ │
│                                                      │
│ [Concept List Below...]                             │
└─────────────────────────────────────────────────────┘
```

**Implementation:**
```tsx
{conceptMatches.length > 0 && (
  <div className="mb-4 rounded-lg border bg-accent/50 p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Brain className="size-5 text-primary" />
        <span className="font-medium">
          {totalFlashcards} flashcard{totalFlashcards !== 1 ? 's' : ''} ready for review
        </span>
      </div>
      <Button onClick={handleStartReview} size="lg">
        Start Review Session
        <ChevronRight className="size-4" />
      </Button>
    </div>
  </div>
)}
```

---

### 2. **Review Session Page (Full-Screen Experience)**

**Route:** `/orgs/[orgSlug]/courses/[courseId]/review`

**Layout:** Full-screen, centered card with minimal distractions

**Components:**
- Progress bar at top
- Large flashcard in center
- Action buttons at bottom
- Exit button in top-right

**Visual Design:**

#### **State 1: Question Shown**
```
┌─────────────────────────────────────────────────────┐
│ [← Exit]                          Card 1 of 3    [?]│
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ (33% progress)
│                                                      │
│                                                      │
│   ┌────────────────────────────────────────────┐   │
│   │                                             │   │
│   │  🧠 Categorical Imperative                 │   │
│   │                                             │   │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│   │                                             │   │
│   │  Question:                                  │   │
│   │                                             │   │
│   │  What is Kant's Categorical Imperative?    │   │
│   │                                             │   │
│   │                                             │   │
│   │                                             │   │
│   │  [Show Answer ▼]  (primary, large)         │   │
│   │                                             │   │
│   └────────────────────────────────────────────┘   │
│                                                      │
│                                                      │
│  Press Space to reveal answer                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

#### **State 2: Answer Revealed**
```
┌─────────────────────────────────────────────────────┐
│ [← Exit]                          Card 1 of 3    [?]│
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                      │
│   ┌────────────────────────────────────────────┐   │
│   │  🧠 Categorical Imperative                 │   │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│   │                                             │   │
│   │  Question:                                  │   │
│   │  What is Kant's Categorical Imperative?    │   │
│   │                                             │   │
│   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│   │                                             │   │
│   │  Answer:                                    │   │
│   │  Kant's principle that one should act only │   │
│   │  according to maxims that could become     │   │
│   │  universal laws, emphasizing duty over     │   │
│   │  consequences.                              │   │
│   │                                             │   │
│   │  🕐 Source: 00:15:42                       │   │
│   └────────────────────────────────────────────┘   │
│                                                      │
│  How well did you know this?                        │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ 🔴 Hard  │  │ 🟡 Medium│  │ 🟢 Easy  │         │
│  │ Again    │  │ Good     │  │ Perfect  │         │
│  │ <1 day   │  │ 3 days   │  │ 1 week   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                      │
│  Press 1, 2, or 3                                   │
└─────────────────────────────────────────────────────┘
```

#### **State 3: Completion Screen**
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                                                      │
│                  ✅                                  │
│                                                      │
│            Review Complete!                          │
│                                                      │
│         You reviewed 3 concepts                      │
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│  Next Review Schedule:                              │
│                                                      │
│  🔴 1 card tomorrow (Hard)                          │
│  🟡 1 card in 3 days (Medium)                       │
│  🟢 1 card in 1 week (Easy)                         │
│                                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                      │
│  [Back to Course →]  (primary, large)               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### 3. **Component Breakdown**

#### **A. ReviewSessionContainer**
- Full-screen layout
- Handles keyboard shortcuts
- Manages session state
- Auto-saves progress

```tsx
<div className="min-h-screen bg-background flex flex-col">
  <ReviewHeader />
  <div className="flex-1 flex items-center justify-center p-4">
    <ReviewCard />
  </div>
  <ReviewFooter />
</div>
```

#### **B. ReviewHeader**
- Exit button (top-left)
- Progress indicator (top-center)
- Help button (top-right)

```tsx
<header className="border-b bg-card">
  <div className="container mx-auto flex items-center justify-between p-4">
    <Button variant="ghost" onClick={handleExit}>
      <ArrowLeft className="size-4" />
      Exit
    </Button>
    <div className="text-sm font-medium">
      Card {currentIndex + 1} of {totalCards}
    </div>
    <Button variant="ghost" size="icon">
      <HelpCircle className="size-4" />
    </Button>
  </div>
  <ProgressBar current={currentIndex + 1} total={totalCards} />
</header>
```

#### **C. ReviewCard**
- Centered card (max-width: 600px)
- Question section
- Answer section (revealed)
- Difficulty buttons

```tsx
<Card className="w-full max-w-2xl">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Brain className="size-5" />
      {conceptName}
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Question */}
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground">
        Question
      </div>
      <div className="text-lg font-medium leading-relaxed">
        {question}
      </div>
    </div>

    {/* Show Answer Button or Answer */}
    {!revealed ? (
      <Button 
        onClick={handleReveal} 
        className="w-full" 
        size="lg"
      >
        Show Answer
        <ChevronDown className="size-4" />
      </Button>
    ) : (
      <>
        <Separator />
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Answer
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-base leading-relaxed">{answer}</p>
          </div>
          {sourceTimestamp && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Source: {sourceTimestamp}
            </div>
          )}
        </div>

        {/* Difficulty Buttons */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-center">
            How well did you know this?
          </div>
          <div className="grid grid-cols-3 gap-3">
            <DifficultyButton 
              difficulty="hard" 
              label="Hard"
              sublabel="Again"
              interval="<1 day"
              onClick={() => handleRate('hard')}
            />
            <DifficultyButton 
              difficulty="medium" 
              label="Medium"
              sublabel="Good"
              interval="3 days"
              onClick={() => handleRate('medium')}
            />
            <DifficultyButton 
              difficulty="easy" 
              label="Easy"
              sublabel="Perfect"
              interval="1 week"
              onClick={() => handleRate('easy')}
            />
          </div>
          <div className="text-xs text-center text-muted-foreground">
            Press 1, 2, or 3
          </div>
        </div>
      </>
    )}
  </CardContent>
</Card>
```

#### **D. DifficultyButton**
- Color-coded buttons
- Shows interval hint
- Large tap targets (mobile-friendly)

```tsx
<Button
  variant="outline"
  className={cn(
    "h-auto flex-col gap-2 py-4",
    difficulty === 'hard' && "border-destructive hover:bg-destructive/10",
    difficulty === 'medium' && "border-warning hover:bg-warning/10",
    difficulty === 'easy' && "border-success hover:bg-success/10"
  )}
  onClick={onClick}
>
  <span className="text-2xl">
    {difficulty === 'hard' && '🔴'}
    {difficulty === 'medium' && '🟡'}
    {difficulty === 'easy' && '🟢'}
  </span>
  <span className="font-semibold">{label}</span>
  <span className="text-xs text-muted-foreground">{sublabel}</span>
  <span className="text-xs text-muted-foreground">{interval}</span>
</Button>
```

#### **E. CompletionScreen**
- Success message
- Review summary
- Next review schedule
- Return to course button

```tsx
<Card className="w-full max-w-2xl text-center">
  <CardContent className="space-y-6 py-12">
    <div className="flex justify-center">
      <CheckCircle2 className="size-16 text-success" />
    </div>
    
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Review Complete!</h2>
      <p className="text-muted-foreground">
        You reviewed {totalReviewed} concept{totalReviewed !== 1 ? 's' : ''}
      </p>
    </div>

    <Separator />

    <div className="space-y-3 text-left">
      <h3 className="font-semibold">Next Review Schedule:</h3>
      {schedule.map((item) => (
        <div key={item.flashcardId} className="flex items-center gap-2">
          <span className="text-xl">
            {item.difficulty === 'hard' && '🔴'}
            {item.difficulty === 'medium' && '🟡'}
            {item.difficulty === 'easy' && '🟢'}
          </span>
          <span className="text-sm">
            {item.count} card{item.count !== 1 ? 's' : ''} {item.interval}
          </span>
        </div>
      ))}
    </div>

    <Button onClick={handleBackToCourse} size="lg" className="w-full">
      Back to Course
      <ChevronRight className="size-4" />
    </Button>
  </CardContent>
</Card>
```

---

## 📱 Mobile Optimization

### Touch Targets
- All buttons minimum 44px height
- Difficulty buttons: 80px+ height
- Large tap areas with padding

### Gestures (Optional Enhancement)
- Swipe up: Reveal answer
- Swipe left: Hard
- Swipe right: Easy
- Tap center: Medium

### Layout Adjustments
```tsx
<div className="min-h-screen flex flex-col p-4 md:p-8">
  {/* Mobile: Full width, Desktop: Max width */}
  <Card className="w-full md:max-w-2xl mx-auto">
    {/* Content */}
  </Card>
</div>
```

---

## ⌨️ Keyboard Shortcuts

```typescript
const SHORTCUTS = {
  ' ': 'reveal',      // Spacebar
  '1': 'hard',
  '2': 'medium',
  '3': 'easy',
  'ArrowLeft': 'hard',
  'ArrowDown': 'medium',
  'ArrowRight': 'easy',
  'Escape': 'exit'
};
```

**Implementation:**
```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === ' ' && !revealed) {
      e.preventDefault();
      handleReveal();
    } else if (revealed) {
      if (e.key === '1' || e.key === 'ArrowLeft') handleRate('hard');
      if (e.key === '2' || e.key === 'ArrowDown') handleRate('medium');
      if (e.key === '3' || e.key === 'ArrowRight') handleRate('easy');
    }
    if (e.key === 'Escape') handleExit();
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [revealed]);
```

---

## 🎨 Color Scheme

### Difficulty Colors
- **Hard (🔴):** `border-destructive`, `text-destructive`, `bg-destructive/10`
- **Medium (🟡):** `border-warning`, `text-warning`, `bg-warning/10`
- **Easy (🟢):** `border-success`, `text-success`, `bg-success/10`

### Progress Bar
```tsx
<div className="h-1 bg-muted">
  <div 
    className="h-full bg-primary transition-all duration-300"
    style={{ width: `${(current / total) * 100}%` }}
  />
</div>
```

---

## 🔄 State Management

### Session States
1. **Loading:** Fetching flashcards
2. **In Progress:** Showing cards
3. **Completed:** Summary screen
4. **Abandoned:** User exited early

### Card States
1. **Question:** Answer hidden
2. **Revealed:** Answer shown, awaiting rating
3. **Rated:** Moving to next card

### Auto-Save
- Save after each rating
- Update `currentCardIndex` in database
- Allow resume if user exits

---

## 🚀 Implementation Priority

### Phase 1: Core Functionality (MVP)
1. ✅ Review session page route
2. ✅ Single-card view with reveal
3. ✅ Three difficulty buttons
4. ✅ Progress indicator
5. ✅ Completion screen
6. ✅ Basic keyboard shortcuts

### Phase 2: Enhancements
7. ⏳ Mid-session exit with resume
8. ⏳ Timing metrics (time to reveal, time to rate)
9. ⏳ Help tooltip/modal
10. ⏳ Mobile gestures

### Phase 3: Polish
11. ⏳ Animations and transitions
12. ⏳ Sound effects (optional)
13. ⏳ Undo last rating
14. ⏳ Skip card option

---

## 📊 Success Metrics

### User Experience
- Session completion rate >80%
- Average time per card <30 seconds
- Mid-session abandonment <20%

### Technical
- Page load time <1 second
- Smooth animations (60fps)
- No layout shifts

---

## 🎯 Summary

This design maintains consistency with the existing UI while introducing a focused, distraction-free review experience. Key features:

✅ **Consistent Design:** Uses existing Card, Button, and color system
✅ **Mobile-First:** Large tap targets, responsive layout
✅ **Keyboard Support:** Full keyboard navigation
✅ **Clear Feedback:** Color-coded difficulty, progress indicator
✅ **User-Friendly:** Simple flow, clear instructions
✅ **Performant:** Auto-save, smooth transitions

The implementation will integrate seamlessly with the existing flashcard system and provide an excellent user experience for active recall learning.

# Feature Spec: US-0010 - Processing Progress Feedback (Tier 1: Quick Wins)

Owner: Founder
Status: Draft
Last Updated: 2025-01-18

## Summary

Provide granular, real-time progress feedback during content processing (3+ minutes) to prevent users from thinking the system is broken. Show distinct processing phases, encouraging messages, and celebrate micro-moments to transform waiting from frustration to engagement.

**Why now:** Critical UX issue - users abandon processing because they think it's a bug. 3+ minutes with only 2 progress states ("Processing..." and "Extracting concepts...") creates "black box" anxiety and high abandonment rates.

**Impact:** Reduces perceived wait time by 40-50%, eliminates "is it broken?" confusion, decreases abandonment from ~60-70% to <20%.

## User Stories

- As a Self-Directed Learner, I want to see detailed progress during content processing so that I know the system is working and understand what's happening.
- As a Self-Directed Learner, I want to see encouraging messages while I wait so that the experience feels intentional and supportive rather than frustrating.
- As a Self-Directed Learner, I want to know what content is being processed so that I can verify I submitted the right material.

## Acceptance Criteria

**Given** a user submits content (video URL or PDF upload)
**When** processing begins
**Then** the system displays the content name/title immediately

**Given** content is being processed
**When** the user views the processing screen
**Then** they see 5-6 distinct phases with visual indicators:
- Fetching content (10s estimated)
- AI reading content (45s estimated)
- Matching to learning goals (30s estimated)
- Creating flashcards (20s estimated)
- Unlocking cards (10s estimated)
- Complete

**Given** a processing phase is active
**When** the user views the progress
**Then** they see:
- Current phase name with animated icon
- Progress bar with percentage (0-100%)
- Rotating tips/status messages (changes every 3-5s)
- Estimated time remaining
- Phase indicators showing completed/current/upcoming phases

**Given** a processing phase completes
**When** transitioning to the next phase
**Then** the system shows a brief celebration:
- Confetti animation (30 particles, 2s duration)
- Success toast with phase-specific message
- Green checkmark on completed phase indicator

**Given** processing is in progress
**When** the user views the screen
**Then** they see Duolingo-style encouragement messages rotating every 8-10 seconds:
- "🧠 Your brain is about to get an upgrade!"
- "📚 We're turning passive watching into active learning"
- "🔥 This is where the magic happens!"
- (8 total messages)

**Detailed Acceptance Criteria:**

- [ ] Content name/title displayed before processing starts
- [ ] For YouTube: Show video title, duration, channel name (via oEmbed API)
- [ ] For PDFs: Show filename, page count, file size
- [ ] Progress bar updates smoothly (no backwards movement)
- [ ] Phase transitions are visually clear (animation + toast)
- [ ] Estimated time remaining updates based on actual progress
- [ ] All text is internationalized (EN/FR via next-intl)
- [ ] Mobile-responsive design (works on 320px+ screens)
- [ ] Accessible (ARIA labels, keyboard navigation, screen reader support)
- [ ] Processing state persists on page refresh (localStorage)

## UX & Flows

```
[User submits content]
    ↓
[Content Preview Card]
├─ Video thumbnail/icon
├─ Title: "Introduction to Photosynthesis"
├─ Metadata: "12:34 • Khan Academy" or "15 pages • 2.3 MB"
└─ [Processing begins automatically]
    ↓
[Processing Progress Card]
├─ Header
│  ├─ Animated icon (pulsing)
│  ├─ Current phase: "AI is reading your content"
│  └─ Content name: "Processing: Introduction to Photosynthesis"
├─ Progress Bar
│  ├─ Percentage: "47%"
│  └─ Current tip: "Identifying key concepts..."
├─ Phase Indicators (5-6 circles)
│  ├─ Completed: Green checkmark
│  ├─ Current: Pulsing primary color
│  └─ Upcoming: Gray/muted
├─ Time Estimate: "⏱️ About 85s remaining"
└─ Encouragement Message: "🔥 This is where the magic happens!"
    ↓
[Phase Completes]
├─ Confetti animation (2s)
├─ Toast: "AI reading complete ✓ Found 12 concepts! 🎯"
└─ Move to next phase
    ↓
[All Phases Complete]
├─ Success screen
├─ Summary: "Extracted 12 concepts, matched 9 to your goals"
└─ CTA: "Review Concepts →"
```

**Mobile-first wireframe:**

```
┌─────────────────────────────────┐
│ ┌─────┐ AI is reading your      │
│ │ 🧠  │ content                  │
│ └─────┘                          │
│ Processing: Intro to Photosyn... │
│                                  │
│ Identifying key concepts...  47% │
│ ████████████░░░░░░░░░░░░░░░░░░  │
│                                  │
│ ○ ● ○ ○ ○ ○                     │
│ Fetch Read Match Cards Done      │
│                                  │
│ ⏱️ About 85s remaining           │
│                                  │
│ 🔥 This is where the magic       │
│    happens!                      │
└─────────────────────────────────┘
```

## Scope

**In scope:**

- 5-6 distinct processing phases with visual indicators
- Progress bar with percentage and smooth animations
- Content name/title display (YouTube oEmbed, PDF metadata)
- Rotating tips per phase (3-5 second intervals)
- Duolingo-style encouragement messages (8-10 second intervals)
- Phase completion celebrations (confetti + toast)
- Estimated time remaining (updates dynamically)
- Phase indicator circles (completed/current/upcoming states)
- Internationalization (EN/FR)
- Mobile-responsive design
- Accessibility (ARIA, keyboard, screen reader)
- State persistence (localStorage for page refresh)

**Out of scope:**

- Background processing / "notify me when done" (Tier 2)
- Real-time concept preview (Tier 2)
- AI-generated contextual messages (Tier 3)
- Gamified waiting experience (trivia, quizzes) (Tier 3)
- Parallel processing queue (Tier 3)
- Smart recommendations during wait (Tier 3)
- Accurate time estimates based on content length (Tier 2)
- Educational tooltips explaining AI process (Tier 2)

## Technical Design

**Components impacted:**

- `app/dashboard/_components/content-inbox.tsx` (existing - update)
- `app/dashboard/_components/processing-progress.tsx` (new component)
- `app/dashboard/_components/content-preview-card.tsx` (new component)
- `app/actions/process-content.action.ts` (existing - no changes needed)

**New Component: ProcessingProgress**

```typescript
// app/dashboard/_components/processing-progress.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Download,
  Brain,
  Target,
  Sparkles,
  Unlock,
  CheckCircle,
  Check,
} from "lucide-react";

type ProcessingPhase = {
  id: string;
  label: string;
  icon: React.ReactNode;
  estimatedSeconds: number;
  tips: string[];
};

const PROCESSING_PHASES: ProcessingPhase[] = [
  {
    id: "fetching",
    label: "Fetching content",
    icon: <Download className="size-4" />,
    estimatedSeconds: 10,
    tips: [
      "Downloading video transcript...",
      "Extracting PDF text...",
      "Connecting to content source...",
    ],
  },
  {
    id: "analyzing",
    label: "AI is reading your content",
    icon: <Brain className="size-4 animate-pulse" />,
    estimatedSeconds: 45,
    tips: [
      "Identifying key concepts...",
      "Understanding the main ideas...",
      "Breaking down complex topics...",
      "Analyzing content structure...",
    ],
  },
  {
    id: "matching",
    label: "Matching to your learning goals",
    icon: <Target className="size-4" />,
    estimatedSeconds: 30,
    tips: [
      "Comparing with your syllabus...",
      "Finding relevant concepts...",
      "Calculating confidence scores...",
      "Semantic similarity analysis...",
    ],
  },
  {
    id: "generating",
    label: "Creating your flashcards",
    icon: <Sparkles className="size-4" />,
    estimatedSeconds: 20,
    tips: [
      "Crafting questions...",
      "Writing clear answers...",
      "Adding helpful hints...",
      "Optimizing for recall...",
    ],
  },
  {
    id: "unlocking",
    label: "Unlocking new cards",
    icon: <Unlock className="size-4" />,
    estimatedSeconds: 10,
    tips: [
      "Checking unlock thresholds...",
      "Revealing answers...",
      "Updating progress...",
    ],
  },
  {
    id: "complete",
    label: "All done!",
    icon: <CheckCircle className="size-4 text-green-500" />,
    estimatedSeconds: 0,
    tips: [],
  },
];

const ENCOURAGEMENT_MESSAGES = [
  { text: "🧠 Your brain is about to get an upgrade!", emoji: "✨" },
  { text: "📚 We're turning passive watching into active learning", emoji: "🎯" },
  { text: "🔥 This is where the magic happens!", emoji: "⚡" },
  { text: "🎓 Building your personal knowledge graph...", emoji: "🌟" },
  { text: "💡 Each concept = one step closer to mastery", emoji: "🚀" },
  { text: "🎨 Crafting the perfect flashcards for you...", emoji: "✨" },
  { text: "🧩 Connecting the dots in your learning journey", emoji: "🎯" },
  { text: "⚡ Almost there! Your flashcards are taking shape", emoji: "🎉" },
];

type ProcessingProgressProps = {
  contentName: string;
  contentType: "youtube" | "pdf" | "tiktok";
  onComplete?: () => void;
};

export function ProcessingProgress({
  contentName,
  contentType,
  onComplete,
}: ProcessingProgressProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const currentPhase = PROCESSING_PHASES[currentPhaseIndex];
  const currentTip = currentPhase.tips[currentTipIndex] || "";
  const currentMessage = ENCOURAGEMENT_MESSAGES[currentMessageIndex];

  // Calculate total estimated time remaining
  const estimatedTimeRemaining = PROCESSING_PHASES.slice(currentPhaseIndex)
    .reduce((sum, phase) => sum + phase.estimatedSeconds, 0);

  // Simulate progress through phases
  useEffect(() => {
    if (currentPhaseIndex >= PROCESSING_PHASES.length - 1) {
      onComplete?.();
      return;
    }

    const phase = PROCESSING_PHASES[currentPhaseIndex];
    const incrementPerSecond = 100 / phase.estimatedSeconds;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + incrementPerSecond;
        if (newProgress >= 100) {
          // Phase complete - celebrate!
          celebratePhaseComplete(phase);
          setCurrentPhaseIndex((p) => p + 1);
          return 0;
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhaseIndex, onComplete]);

  // Rotate tips within current phase
  useEffect(() => {
    const tips = currentPhase.tips;
    if (!tips.length) return;

    setCurrentTipIndex(0);

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(interval);
  }, [currentPhaseIndex]);

  // Rotate encouragement messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % ENCOURAGEMENT_MESSAGES.length);
    }, 8000); // Change message every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const celebratePhaseComplete = (phase: ProcessingPhase) => {
    // Confetti animation
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
    });

    // Success toast
    const messages: Record<string, string> = {
      fetching: "Content fetched successfully! ✓",
      analyzing: "Found concepts! 🎯",
      matching: "Matched to your goals! 🎉",
      generating: "Flashcards created! ✨",
      unlocking: "Cards unlocked! 🔓",
    };

    toast.success(messages[phase.id] || "Complete!", {
      duration: 2000,
    });
  };

  return (
    <Card className="w-full border-2 border-primary/20">
      <CardContent className="pt-6">
        {/* Header with content name */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            {currentPhase.icon}
            <div className="absolute -inset-1 bg-primary/20 rounded-full animate-ping" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">{currentPhase.label}</h3>
            <p className="text-sm text-muted-foreground truncate">
              Processing: <span className="font-medium">{contentName}</span>
            </p>
          </div>
        </div>

        {/* Progress bar with percentage */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{currentTip}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Phase indicators */}
        <div className="flex justify-between items-center mb-4">
          {PROCESSING_PHASES.slice(0, -1).map((phase, idx) => (
            <div key={phase.id} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center transition-all",
                  idx < currentPhaseIndex
                    ? "bg-green-500 text-white"
                    : idx === currentPhaseIndex
                    ? "bg-primary text-white animate-pulse"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {idx < currentPhaseIndex ? (
                  <Check className="size-4" />
                ) : (
                  phase.icon
                )}
              </div>
              <span className="text-xs text-center max-w-[60px] leading-tight">
                {phase.label.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Estimated time remaining */}
        <div className="text-center text-sm text-muted-foreground mb-3">
          ⏱️ About {estimatedTimeRemaining}s remaining
        </div>

        {/* Encouragement message */}
        <div className="text-center py-3 px-4 bg-primary/5 rounded-lg animate-fade-in">
          <p className="text-sm font-medium text-primary">
            {currentMessage.emoji} {currentMessage.text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

**New Component: ContentPreviewCard**

```typescript
// app/dashboard/_components/content-preview-card.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Youtube, FileText, Video } from "lucide-react";

type ContentMetadata = {
  type: "youtube" | "pdf" | "tiktok";
  title: string;
  subtitle?: string; // Duration + channel OR page count + file size
  thumbnail?: string;
};

type ContentPreviewCardProps = {
  metadata: ContentMetadata;
};

export function ContentPreviewCard({ metadata }: ContentPreviewCardProps) {
  const getIcon = () => {
    switch (metadata.type) {
      case "youtube":
        return <Youtube className="size-6 text-red-500" />;
      case "pdf":
        return <FileText className="size-6 text-orange-500" />;
      case "tiktok":
        return <Video className="size-6 text-cyan-500" />;
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{metadata.title}</p>
            {metadata.subtitle && (
              <p className="text-sm text-muted-foreground">{metadata.subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Update ContentInbox Component:**

```typescript
// app/dashboard/_components/content-inbox.tsx
// Add imports
import { ProcessingProgress } from "./processing-progress";
import { ContentPreviewCard } from "./content-preview-card";

// Add state for content metadata
const [contentMetadata, setContentMetadata] = useState<ContentMetadata | null>(null);

// Before processing, fetch metadata
const handleProcess = async () => {
  if (!url.trim()) return;
  
  setIsProcessing(true);
  
  // Fetch metadata first (YouTube oEmbed)
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    try {
      const videoId = extractYouTubeVideoId(url);
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);
      const data = await response.json();
      
      setContentMetadata({
        type: 'youtube',
        title: data.title,
        subtitle: `${data.author_name}`,
      });
    } catch (error) {
      console.error('Failed to fetch video metadata:', error);
      setContentMetadata({
        type: 'youtube',
        title: 'YouTube Video',
        subtitle: url,
      });
    }
  }
  
  // ... rest of processing logic
};

// In JSX, show preview and progress
{isProcessing && contentMetadata && (
  <>
    <ContentPreviewCard metadata={contentMetadata} />
    <ProcessingProgress
      contentName={contentMetadata.title}
      contentType={contentMetadata.type}
      onComplete={() => {
        setIsProcessing(false);
        setContentMetadata(null);
        // Show results...
      }}
    />
  </>
)}
```

**Dependencies:**

- `canvas-confetti` (11kb) - for celebration animations
- `sonner` (already installed) - for toast notifications
- YouTube oEmbed API (free, no auth required)

**Data model changes:**

None required - all state is client-side only.

**Internationalization:**

⚠️ **CRITICAL REQUIREMENT**: ALL text strings MUST be added to both `messages/en.json` and `messages/fr.json` to support the bilingual feature. NO hardcoded strings in components.

**Required additions to message files:**

```json
// messages/en.json
{
  "dashboard": {
    "processing": {
      "phases": {
        "fetching": "Fetching content",
        "analyzing": "AI is reading your content",
        "matching": "Matching to your learning goals",
        "generating": "Creating your flashcards",
        "unlocking": "Unlocking new cards",
        "complete": "All done!"
      },
      "tips": {
        "fetching": [
          "Downloading video transcript...",
          "Extracting PDF text...",
          "Connecting to content source..."
        ],
        "analyzing": [
          "Identifying key concepts...",
          "Understanding the main ideas...",
          "Breaking down complex topics...",
          "Analyzing content structure..."
        ],
        "matching": [
          "Comparing with your syllabus...",
          "Finding relevant concepts...",
          "Calculating confidence scores...",
          "Semantic similarity analysis..."
        ],
        "generating": [
          "Crafting questions...",
          "Writing clear answers...",
          "Adding helpful hints...",
          "Optimizing for recall..."
        ],
        "unlocking": [
          "Checking unlock thresholds...",
          "Revealing answers...",
          "Updating progress..."
        ]
      },
      "encouragement": [
        "🧠 Your brain is about to get an upgrade!",
        "📚 We're turning passive watching into active learning",
        "🔥 This is where the magic happens!",
        "🎓 Building your personal knowledge graph...",
        "💡 Each concept = one step closer to mastery",
        "🎨 Crafting the perfect flashcards for you...",
        "🧩 Connecting the dots in your learning journey",
        "⚡ Almost there! Your flashcards are taking shape"
      ],
      "timeRemaining": "About {seconds}s remaining",
      "processing": "Processing: {name}",
      "celebrations": {
        "fetching": "Content fetched successfully! ✓",
        "analyzing": "Found concepts! 🎯",
        "matching": "Matched to your goals! 🎉",
        "generating": "Flashcards created! ✨",
        "unlocking": "Cards unlocked! 🔓"
      }
    }
  }
}

// messages/fr.json
{
  "dashboard": {
    "processing": {
      "phases": {
        "fetching": "Récupération du contenu",
        "analyzing": "L'IA lit votre contenu",
        "matching": "Correspondance avec vos objectifs",
        "generating": "Création de vos flashcards",
        "unlocking": "Déverrouillage des cartes",
        "complete": "Terminé !"
      },
      "tips": {
        "fetching": [
          "Téléchargement de la transcription vidéo...",
          "Extraction du texte PDF...",
          "Connexion à la source de contenu..."
        ],
        "analyzing": [
          "Identification des concepts clés...",
          "Compréhension des idées principales...",
          "Décomposition des sujets complexes...",
          "Analyse de la structure du contenu..."
        ],
        "matching": [
          "Comparaison avec votre programme...",
          "Recherche de concepts pertinents...",
          "Calcul des scores de confiance...",
          "Analyse de similarité sémantique..."
        ],
        "generating": [
          "Création des questions...",
          "Rédaction de réponses claires...",
          "Ajout d'indices utiles...",
          "Optimisation pour la mémorisation..."
        ],
        "unlocking": [
          "Vérification des seuils de déverrouillage...",
          "Révélation des réponses...",
          "Mise à jour des progrès..."
        ]
      },
      "encouragement": [
        "🧠 Votre cerveau va être amélioré !",
        "📚 Nous transformons le visionnage passif en apprentissage actif",
        "🔥 C'est là que la magie opère !",
        "🎓 Construction de votre graphe de connaissances personnel...",
        "💡 Chaque concept = un pas de plus vers la maîtrise",
        "🎨 Création des flashcards parfaites pour vous...",
        "🧩 Connexion des points dans votre parcours d'apprentissage",
        "⚡ Presque terminé ! Vos flashcards prennent forme"
      ],
      "timeRemaining": "Environ {seconds}s restantes",
      "processing": "Traitement : {name}",
      "celebrations": {
        "fetching": "Contenu récupéré avec succès ! ✓",
        "analyzing": "Concepts trouvés ! 🎯",
        "matching": "Associé à vos objectifs ! 🎉",
        "generating": "Flashcards créées ! ✨",
        "unlocking": "Cartes déverrouillées ! 🔓"
      }
    }
  }
}
```

**Implementation Note**: Use `useTranslations('dashboard.processing')` hook in all components. Example:

```typescript
const t = useTranslations('dashboard.processing');

// Usage
<h3>{t('phases.analyzing')}</h3>
<p>{t('tips.analyzing.0')}</p>
<p>{t('encouragement.0')}</p>
<p>{t('timeRemaining', { seconds: 85 })}</p>
```

**Accessibility:**

```typescript
// Add ARIA labels
<div
  role="progressbar"
  aria-valuenow={Math.round(progress)}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${currentPhase.label}: ${Math.round(progress)}% complete`}
>
  <Progress value={progress} className="h-2" />
</div>

// Add screen reader announcements
<div className="sr-only" aria-live="polite" aria-atomic="true">
  {currentPhase.label} - {currentTip}
</div>
```

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Simulated progress doesn't match actual progress** | High | Medium | Accept for MVP - users care more about feedback than accuracy. Add real progress tracking in Tier 2. |
| **Confetti library adds bundle size** | Low | Low | canvas-confetti is only 11kb gzipped. Lazy load if needed. |
| **YouTube oEmbed API rate limits** | Low | Low | Cache results in localStorage. Fallback to URL if fetch fails. |
| **Phase timing estimates are wrong** | Medium | Low | Based on current averages. Will tune based on real data. |
| **Users still abandon despite improvements** | Low | High | Track metrics. If abandonment >20%, implement Tier 2 (background processing). |

## Rollout

**Migration/feature flags:**

- No database migration needed
- Feature flag: `processing_progress_v2` (killswitch)
- A/B test: 50% users see new progress, 50% see old (measure abandonment)

**Metrics:**

- Abandonment rate during processing (target: <20%, currently ~60-70%)
- Time to first interaction after processing starts (target: <5s)
- User satisfaction survey: "Did you understand what was happening?" (target: >80% yes)
- Support tickets mentioning "stuck" or "broken" (target: near zero)
- Processing completion rate (target: >80%, currently ~30-40%)

**Post-launch checklist:**

- [ ] Test with 10 different content types (short/long videos, small/large PDFs)
- [ ] Verify all 8 encouragement messages display correctly
- [ ] Test phase transitions and confetti animations
- [ ] Verify internationalization (EN/FR)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Verify accessibility (screen reader, keyboard navigation)
- [ ] Monitor bundle size impact (<50kb increase)
- [ ] A/B test results after 1 week (compare abandonment rates)

**Post-MVP improvements:**

- Real progress tracking (not simulated) - Tier 2
- Accurate time estimates based on content length - Tier 2
- Background processing option - Tier 2
- AI-generated contextual messages - Tier 3
- Gamified waiting experience - Tier 3

## Success Criteria

**Definition of Done:**

- [ ] All acceptance criteria met
- [ ] Component tests passing (Vitest)
- [ ] E2E test covering full processing flow (Playwright)
- [ ] Internationalization complete (EN/FR)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Mobile responsive (tested on 320px-1920px)
- [ ] Performance: <50kb bundle size increase
- [ ] Code review approved
- [ ] Deployed to staging and tested
- [ ] A/B test configured (50/50 split)

**User Validation:**

- 3 beta testers complete processing flow without confusion
- Post-processing survey: >80% say "I understood what was happening"
- Zero "is it broken?" questions during testing
- Abandonment rate <30% in first week (improvement from ~60-70%)

**Metrics to Track (Week 1):**

- Abandonment rate: Target <30% (baseline ~60-70%)
- Processing completion rate: Target >70% (baseline ~30-40%)
- Average time on processing screen: Track for insights
- Phase transition engagement: % users who see all phases
- Support tickets: Target <5 mentioning "stuck" or "broken"

## Notes

**Critical Success Factors:**

1. **Immediate feedback** - Content preview must show within 1 second
2. **Smooth animations** - No janky progress bar movements
3. **Personality** - Encouragement messages must feel authentic, not corporate
4. **Mobile-first** - Most users will experience this on mobile

**Trade-offs:**

- Simulated progress vs. real progress: Chose simulated for MVP speed. Users care more about feedback than accuracy.
- Confetti animations vs. bundle size: 11kb is acceptable for the delight factor.
- Phase granularity: 5-6 phases balances detail with simplicity. More phases = more complexity.

**Dependencies:**

- None - this is a pure UI enhancement
- Works with existing `process-content.action.ts` without changes

**Related Stories:**

- US-0011 (Tier 2): Background processing option
- US-0012 (Tier 3): Gamified waiting experience
- US-0002: Video URL submission (existing)
- US-0003: Concept extraction (existing)

---

## Related Documents

- **[Vision](../../vision.md)** - Product vision and user personas
- **[Architecture](../../architecture.md)** - System design and data flow
- **[US-0002: Video URL Submission](../specs/us-0002-video-url-submission.md)** - Content input
- **[US-0003: Concept Extraction](../specs/us-0003-concept-extraction.md)** - AI processing

# Feature Spec: US-0011 - Background Processing Option (Tier 2: Medium Effort)

Owner: Founder
Status: Draft
Last Updated: 2025-01-18

## Summary

Allow users to navigate away from the processing screen while content is being processed, with browser notifications when complete. This empowers users to be productive during the 3+ minute wait instead of being forced to watch a progress bar.

**Why now:** Even with improved progress feedback (US-0010), 3+ minutes is still a long time to stare at a screen. Users want to review flashcards, check progress, or browse other content while processing happens in the background.

**Impact:** Reduces perceived wait time by 60-70%, increases user satisfaction, enables multi-tasking, decreases abandonment from ~20% (post-US-0010) to <10%.

## User Stories

- As a Self-Directed Learner, I want to navigate away from the processing screen so that I can be productive while my content is being processed.
- As a Self-Directed Learner, I want to be notified when processing completes so that I can return and review my new flashcards.
- As a Self-Directed Learner, I want to see my processing status when I return to the app so that I know if my content is ready.

## Acceptance Criteria

**Given** content processing has started
**When** the user views the processing screen
**Then** they see an option: "Continue in background" with explanation

**Given** the user clicks "Continue in background"
**When** browser notification permission is requested
**Then** the system requests permission with clear explanation of benefits

**Given** the user grants notification permission
**When** they navigate away from the processing screen
**Then** processing continues in the background and job ID is stored in localStorage

**Given** processing completes while user is on another page
**When** the job finishes successfully
**Then** the user receives a browser notification:
- Title: "🎉 Your flashcards are ready!"
- Body: "Extracted X concepts and created Y flashcards"
- Click action: Navigate to results page

**Given** the user returns to the app while processing is ongoing
**When** they navigate to any page
**Then** they see a persistent banner/toast showing:
- "Processing in background: [content name]"
- Current phase and progress percentage
- Link to view full progress

**Given** processing fails while user is away
**When** the error occurs
**Then** the user receives a notification:
- Title: "⚠️ Processing failed"
- Body: "We couldn't process [content name]. Please try again."
- Click action: Navigate to error details

**Detailed Acceptance Criteria:**

- [ ] "Continue in background" option appears after 30 seconds of processing
- [ ] Clear explanation: "This will take about 3 minutes. You can close this page and we'll notify you when it's done."
- [ ] Two CTAs: "Notify me when done" (primary) and "I'll wait here" (secondary)
- [ ] Browser notification permission requested with context
- [ ] Processing job ID stored in localStorage with timestamp
- [ ] Polling mechanism checks job status every 10 seconds when user returns
- [ ] Persistent banner shows processing status across all pages
- [ ] Banner is dismissible but reappears on page navigation
- [ ] Notification click navigates to results page with job ID
- [ ] Notification includes concept count and flashcard count
- [ ] Works across browser tabs (same origin)
- [ ] Cleans up localStorage after job completes or expires (24h)
- [ ] Graceful degradation if notifications are blocked
- [ ] Internationalization (EN/FR)
- [ ] Mobile-responsive design

## UX & Flows

```
[Processing starts - US-0010 progress shown]
    ↓
[After 30 seconds]
    ↓
[Background Option Card appears]
├─ Icon: 🔔
├─ Title: "This will take about 3 minutes"
├─ Description: "You can close this page and we'll notify you when it's done"
├─ CTA 1: [Notify me when done] (primary)
└─ CTA 2: [I'll wait here] (ghost)
    ↓
[User clicks "Notify me when done"]
    ↓
[Request notification permission]
├─ Browser prompt: "Allow notifications from Recall?"
└─ Context: "We'll let you know when your flashcards are ready"
    ↓
[Permission granted]
    ↓
[Store job ID in localStorage]
├─ Key: `processing-job-${jobId}`
├─ Value: { jobId, contentName, startedAt, contentType }
└─ Expiry: 24 hours
    ↓
[User navigates away]
├─ To dashboard: Review due flashcards
├─ To courses: Browse learning goals
└─ To other content: Upload more videos
    ↓
[Processing continues in background]
    ↓
[User on any page - sees persistent banner]
┌─────────────────────────────────────────┐
│ ⏳ Processing in background:            │
│ "Introduction to Photosynthesis"        │
│ Current: Matching to goals (67%)        │
│ [View Progress] [Dismiss]               │
└─────────────────────────────────────────┘
    ↓
[Processing completes]
    ↓
[Browser notification sent]
┌─────────────────────────────────────────┐
│ 🎉 Your flashcards are ready!           │
│ Extracted 12 concepts and created       │
│ 9 flashcards from "Intro to Photo..."   │
│ [Click to view]                          │
└─────────────────────────────────────────┘
    ↓
[User clicks notification]
    ↓
[Navigate to results page]
├─ Show match results dialog
├─ Display unlocked flashcards
└─ Clear localStorage entry
```

**Mobile-first wireframe (Background Option Card):**

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ ℹ️  This will take about     │ │
│ │    3 minutes                 │ │
│ │                              │ │
│ │ You can close this page and  │ │
│ │ we'll notify you when it's   │ │
│ │ done.                        │ │
│ │                              │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ 🔔 Notify me when done  │ │ │
│ │ └─────────────────────────┘ │ │
│ │                              │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ I'll wait here          │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Persistent Banner (any page):**

```
┌─────────────────────────────────┐
│ ⏳ Processing in background:    │
│ "Introduction to Photosynthesis"│
│ Matching to goals (67%)          │
│ [View Progress] [×]              │
└─────────────────────────────────┘
```

## Scope

**In scope:**

- "Continue in background" option after 30s of processing
- Browser notification permission request with context
- localStorage persistence of job ID and metadata
- Polling mechanism (10s interval) when user returns
- Persistent banner showing processing status across pages
- Browser notifications on completion (success/failure)
- Notification click navigation to results
- localStorage cleanup after completion or 24h expiry
- Graceful degradation if notifications blocked
- Works across browser tabs (same origin)
- Internationalization (EN/FR)
- Mobile-responsive design

**Out of scope:**

- Server-side job queue (still synchronous processing)
- Email notifications (browser notifications only)
- Push notifications (native mobile apps)
- Processing history/log (just current job)
- Multiple concurrent jobs (one at a time)
- Job cancellation from background
- Real-time progress updates via WebSocket (polling only)
- Cross-device notifications (same browser only)

## Technical Design

**Components impacted:**

- `app/dashboard/_components/content-inbox.tsx` (existing - update)
- `app/dashboard/_components/processing-progress.tsx` (existing - update)
- `app/dashboard/_components/background-processing-banner.tsx` (new)
- `app/dashboard/_components/background-option-card.tsx` (new)
- `app/layout.tsx` (add banner to root layout)
- `app/api/content-jobs/[jobId]/status/route.ts` (new API endpoint)

**New API Endpoint: Job Status**

```typescript
// app/api/content-jobs/[jobId]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const user = await getRequiredUser();
    const { jobId } = params;

    const job = await prisma.contentJob.findUnique({
      where: { id: jobId, userId: user.id },
      select: {
        id: true,
        status: true,
        url: true,
        contentType: true,
        processedConceptsCount: true,
        createdAt: true,
        completedAt: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Calculate progress based on status
    let progress = 0;
    let currentPhase = "fetching";
    
    if (job.status === "text_extracted") {
      progress = 20;
      currentPhase = "analyzing";
    } else if (job.status === "concepts_extracted") {
      progress = 60;
      currentPhase = "matching";
    } else if (job.status === "matched") {
      progress = 80;
      currentPhase = "generating";
    } else if (job.status === "completed") {
      progress = 100;
      currentPhase = "complete";
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress,
        currentPhase,
        contentType: job.contentType,
        url: job.url,
        conceptCount: job.processedConceptsCount,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching job status:", error);
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 }
    );
  }
}
```

**New Component: BackgroundOptionCard**

```typescript
// app/dashboard/_components/background-option-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Info } from "lucide-react";
import { useTranslations } from "next-intl";

type BackgroundOptionCardProps = {
  jobId: string;
  contentName: string;
  contentType: string;
  estimatedTimeRemaining: number;
  onContinueInBackground: () => void;
  onStayHere: () => void;
};

export function BackgroundOptionCard({
  jobId,
  contentName,
  contentType,
  estimatedTimeRemaining,
  onContinueInBackground,
  onStayHere,
}: BackgroundOptionCardProps) {
  const t = useTranslations("dashboard.processing.background");
  const [isRequesting, setIsRequesting] = useState(false);

  const handleNotifyMe = async () => {
    setIsRequesting(true);

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      
      if (permission !== "granted") {
        // User denied - show fallback message
        alert(t("permissionDenied"));
        setIsRequesting(false);
        return;
      }
    }

    // Store job info in localStorage
    const jobInfo = {
      jobId,
      contentName,
      contentType,
      startedAt: Date.now(),
    };
    localStorage.setItem(`processing-job-${jobId}`, JSON.stringify(jobInfo));

    onContinueInBackground();
  };

  return (
    <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 mt-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm mb-2">
              {t("title", { minutes: Math.ceil(estimatedTimeRemaining / 60) })}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {t("description")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleNotifyMe}
                disabled={isRequesting}
                className="gap-2"
              >
                <Bell className="size-4" />
                {t("notifyMe")}
              </Button>
              <Button variant="ghost" size="sm" onClick={onStayHere}>
                {t("stayHere")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**New Component: BackgroundProcessingBanner**

```typescript
// app/dashboard/_components/background-processing-banner.tsx
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type JobInfo = {
  jobId: string;
  contentName: string;
  contentType: string;
  startedAt: number;
};

export function BackgroundProcessingBanner() {
  const router = useRouter();
  const t = useTranslations("dashboard.processing.banner");
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);

  // Check for active jobs on mount and poll for updates
  useEffect(() => {
    const checkForActiveJobs = () => {
      // Find any processing jobs in localStorage
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith("processing-job-")
      );

      if (keys.length === 0) {
        setJobInfo(null);
        return;
      }

      // Get the first active job
      const jobData = localStorage.getItem(keys[0]);
      if (!jobData) return;

      try {
        const job = JSON.parse(jobData) as JobInfo;
        
        // Check if job is expired (24 hours)
        if (Date.now() - job.startedAt > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(keys[0]);
          setJobInfo(null);
          return;
        }

        setJobInfo(job);
      } catch (error) {
        console.error("Failed to parse job info:", error);
        localStorage.removeItem(keys[0]);
      }
    };

    checkForActiveJobs();

    // Poll for updates every 10 seconds
    const interval = setInterval(checkForActiveJobs, 10000);

    return () => clearInterval(interval);
  }, []);

  // Poll job status when we have an active job
  useEffect(() => {
    if (!jobInfo) return;

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/content-jobs/${jobInfo.jobId}/status`);
        const data = await response.json();

        if (data.success) {
          setProgress(data.data.progress);
          setCurrentPhase(data.data.currentPhase);

          // Job completed
          if (data.data.status === "completed") {
            // Send notification
            if ("Notification" in window && Notification.permission === "granted") {
              const notification = new Notification(
                t("notification.title"),
                {
                  body: t("notification.body", {
                    concepts: data.data.conceptCount || 0,
                    name: jobInfo.contentName,
                  }),
                  icon: "/icon.png",
                  badge: "/badge.png",
                  tag: "processing-complete",
                }
              );

              notification.onclick = () => {
                window.focus();
                router.push("/dashboard");
                notification.close();
              };
            }

            // Clean up localStorage
            localStorage.removeItem(`processing-job-${jobInfo.jobId}`);
            setJobInfo(null);
            
            // Refresh the page to show new content
            router.refresh();
          }
        }
      } catch (error) {
        console.error("Failed to poll job status:", error);
      }
    };

    pollJobStatus();
    const interval = setInterval(pollJobStatus, 10000);

    return () => clearInterval(interval);
  }, [jobInfo, router, t]);

  if (!jobInfo || isDismissed) return null;

  return (
    <Card className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md shadow-lg border-primary/20">
      <div className="flex items-center gap-3 p-3">
        <Loader2 className="size-5 animate-spin text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {t("processing")}: {jobInfo.contentName}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(`phases.${currentPhase}`)} ({progress}%)
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => router.push("/dashboard")}
        >
          <ExternalLink className="size-3" />
          {t("view")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </Card>
  );
}
```

**Update Root Layout:**

```typescript
// app/layout.tsx
import { BackgroundProcessingBanner } from "@/app/dashboard/_components/background-processing-banner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <BackgroundProcessingBanner />
        {children}
      </body>
    </html>
  );
}
```

**Update ProcessingProgress Component:**

```typescript
// app/dashboard/_components/processing-progress.tsx
// Add state for background option
const [showBackgroundOption, setShowBackgroundOption] = useState(false);

// Show background option after 30 seconds
useEffect(() => {
  const timer = setTimeout(() => {
    setShowBackgroundOption(true);
  }, 30000); // 30 seconds

  return () => clearTimeout(timer);
}, []);

// Add handlers
const handleContinueInBackground = () => {
  // User chose to continue in background
  // Navigate away or close modal
  onBackgroundMode?.();
};

const handleStayHere = () => {
  setShowBackgroundOption(false);
};

// In JSX, add background option card
{showBackgroundOption && (
  <BackgroundOptionCard
    jobId={jobId}
    contentName={contentName}
    contentType={contentType}
    estimatedTimeRemaining={estimatedTimeRemaining}
    onContinueInBackground={handleContinueInBackground}
    onStayHere={handleStayHere}
  />
)}
```

**Internationalization:**

⚠️ **CRITICAL REQUIREMENT**: ALL text strings MUST be added to both `messages/en.json` and `messages/fr.json` to support the bilingual feature. NO hardcoded strings in components.

**Required additions to message files:**

```json
// messages/en.json
{
  "dashboard": {
    "processing": {
      "background": {
        "title": "This will take about {minutes} minutes",
        "description": "You can close this page and we'll notify you when it's done",
        "notifyMe": "Notify me when done",
        "stayHere": "I'll wait here",
        "permissionDenied": "Please enable notifications to use this feature"
      },
      "banner": {
        "processing": "Processing in background",
        "view": "View",
        "phases": {
          "fetching": "Fetching content",
          "analyzing": "Analyzing",
          "matching": "Matching to goals",
          "generating": "Creating flashcards",
          "unlocking": "Unlocking cards",
          "complete": "Complete"
        },
        "notification": {
          "title": "🎉 Your flashcards are ready!",
          "body": "Extracted {concepts} concepts from \"{name}\""
        }
      }
    }
  }
}

// messages/fr.json
{
  "dashboard": {
    "processing": {
      "background": {
        "title": "Cela prendra environ {minutes} minutes",
        "description": "Vous pouvez fermer cette page et nous vous préviendrons quand c'est terminé",
        "notifyMe": "Me prévenir quand c'est prêt",
        "stayHere": "Je vais attendre ici",
        "permissionDenied": "Veuillez activer les notifications pour utiliser cette fonctionnalité"
      },
      "banner": {
        "processing": "Traitement en arrière-plan",
        "view": "Voir",
        "phases": {
          "fetching": "Récupération du contenu",
          "analyzing": "Analyse",
          "matching": "Correspondance avec les objectifs",
          "generating": "Création des flashcards",
          "unlocking": "Déverrouillage des cartes",
          "complete": "Terminé"
        },
        "notification": {
          "title": "🎉 Vos flashcards sont prêtes !",
          "body": "{concepts} concepts extraits de \"{name}\""
        }
      }
    }
  }
}
```

**Implementation Note**: Use `useTranslations('dashboard.processing.background')` and `useTranslations('dashboard.processing.banner')` hooks in components. Example:

```typescript
const t = useTranslations('dashboard.processing.background');
const tBanner = useTranslations('dashboard.processing.banner');

// Usage
<p>{t('title', { minutes: 3 })}</p>
<p>{t('description')}</p>
<Button>{t('notifyMe')}</Button>
<span>{tBanner('processing')}</span>
<span>{tBanner('phases.analyzing')}</span>
```

**Dependencies:**

- Browser Notifications API (native, no library needed)
- localStorage API (native)
- No additional npm packages required

**Data model changes:**

None required - uses existing `contentJob` table and status field.

**Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **User denies notification permission** | Medium | Medium | Show fallback message, allow staying on page. Track permission denial rate. |
| **Browser doesn't support notifications** | Low | Low | Feature detection, graceful degradation. Show "stay here" option only. |
| **localStorage cleared while processing** | Low | Medium | Job continues server-side. User can check dashboard manually. |
| **Polling creates server load** | Low | Low | 10s interval is reasonable. Add rate limiting if needed. |
| **User closes all browser tabs** | Medium | High | Notification won't be sent. Consider email fallback (post-MVP). |
| **Job status endpoint is slow** | Low | Medium | Add caching, optimize query. Monitor p95 latency. |

## Rollout

**Migration/feature flags:**

- No database migration needed
- Feature flag: `background_processing` (killswitch)
- Gradual rollout: 10% → 50% → 100% over 1 week

**Metrics:**

- % users who choose "Continue in background" (target: >50%)
- % users who grant notification permission (target: >70%)
- Notification click-through rate (target: >60%)
- Abandonment rate with background option (target: <10%, currently ~20% post-US-0010)
- Average time between job start and user return (insights)
- % jobs completed while user is away (insights)

**Post-launch checklist:**

- [ ] Test notification permission flow on Chrome, Firefox, Safari
- [ ] Verify notifications work on mobile (iOS Safari, Android Chrome)
- [ ] Test localStorage persistence across page refreshes
- [ ] Verify polling doesn't create excessive server load
- [ ] Test banner display across all pages
- [ ] Verify notification click navigation works
- [ ] Test localStorage cleanup after 24h
- [ ] Monitor notification permission grant rate
- [ ] A/B test results after 1 week

**Post-MVP improvements:**

- Email notifications as fallback (if browser closed)
- WebSocket for real-time updates (instead of polling)
- Multiple concurrent jobs support
- Job cancellation from background
- Processing history/log
- Cross-device notifications (requires backend changes)

## Success Criteria

**Definition of Done:**

- [ ] All acceptance criteria met
- [ ] Component tests passing (Vitest)
- [ ] E2E test covering background flow (Playwright)
- [ ] Internationalization complete (EN/FR)
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)
- [ ] Mobile tested (iOS Safari, Android Chrome)
- [ ] Performance: Polling doesn't impact page load (<100ms overhead)
- [ ] Code review approved
- [ ] Deployed to staging and tested
- [ ] Feature flag configured

**User Validation:**

- 3 beta testers successfully use background processing
- Post-processing survey: >80% say "I liked being able to navigate away"
- Notification click-through rate >60%
- Abandonment rate <15% in first week (improvement from ~20% post-US-0010)

**Metrics to Track (Week 1):**

- Background option usage: Target >50% of users
- Notification permission grant rate: Target >70%
- Notification click-through rate: Target >60%
- Abandonment rate: Target <15% (baseline ~20% post-US-0010)
- Average time away: Track for insights
- % jobs completed while user away: Track for insights

## Notes

**Critical Success Factors:**

1. **Clear value proposition** - Users must understand WHY to enable notifications
2. **Seamless permission flow** - Don't interrupt with permission request too early
3. **Reliable notifications** - Must work across browsers and devices
4. **Persistent banner** - Users must know processing is happening in background

**Trade-offs:**

- Polling vs. WebSocket: Chose polling for MVP simplicity. WebSocket adds complexity but reduces latency.
- Browser notifications vs. Email: Browser notifications are faster but require user to have browser open. Email is fallback for post-MVP.
- Single job vs. Multiple jobs: Single job simplifies UX and reduces complexity. Multiple jobs in post-MVP.

**Dependencies:**

- US-0010 (Processing Progress Feedback) - Must be implemented first
- Browser Notifications API support (95%+ browsers)
- localStorage support (99%+ browsers)

**Related Stories:**

- US-0010 (Tier 1): Processing progress feedback (prerequisite)
- US-0012 (Tier 3): Gamified waiting experience
- US-0002: Video URL submission (existing)
- US-0003: Concept extraction (existing)

---

## Related Documents

- **[Vision](../../vision.md)** - Product vision and user personas
- **[Architecture](../../architecture.md)** - System design and data flow
- **[US-0010: Processing Progress Feedback](us-0010-processing-progress-feedback.md)** - Prerequisite
- **[US-0002: Video URL Submission](../specs/us-0002-video-url-submission.md)** - Content input

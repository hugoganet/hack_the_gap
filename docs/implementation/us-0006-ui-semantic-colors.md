# US-0006 — Semantic Color System for Flashcards & Reviews

Status: Implemented  
Date: 2025-11-18  
Owner: UI/UX + Frontend

## Summary

Introduce a gentle, anxiety-reducing semantic color system aligned with the specialist’s recommendations. Replace raw color usage with semantic Tailwind tokens (via CSS variables) and apply them to flashcards and review flow. Add a Sage → Coral “growth” gradient for progress.

Primary goals:
- Define semantic tokens for learning states (learning, needs-work, success) and related tones (due, overdue, connection).
- Map tokens into Tailwind classes using Tailwind v4 inline @theme in app/globals.css.
- Apply tokens to flashcard card, review card, difficulty buttons, and progress bar for subtle, consistent hierarchy.

No new dependencies.

---

## Global Styling Architecture

Tailwind: v4 inline theme. No tailwind.config file is present; components.json points Tailwind CSS to app/globals.css.

File: app/globals.css
- Adds semantic tokens and exposes them to Tailwind utilities via @theme inline mapping:
  - text-learning, border-learning, bg-learning, etc.
  - text-needs-work, border-needs-work, bg-needs-work, etc.
  - text-success, border-success, bg-success, etc.
  - text-connection, border-connection, bg-connection, etc.
- Light/dark values defined using OKLCH for better perceptual consistency.
- Adds utility .progress-growth with a Sage → Coral gradient for progress bars.

Key additions:
- @theme inline mappings:
  - --color-learning(-foreground), --color-needs-work(-foreground), --color-due, --color-overdue, --color-connection(-foreground)
- :root (light) and .dark (dark) token values:
  - --learning (Dusty Blue #8BA7C9)
  - --needs-work (Warm Gray/Beige #C9B5A6)
  - --success (Soft Sage #88C9A1)
  - --due (alias Coral #FF9B7C)
  - --overdue (alias Terracotta #D97757)
  - --connection (Warm Lavender #C8B5E8)
- Utility:
  - .progress-growth: linear-gradient(90deg, var(--success), var(--accent))

Why inline @theme:
- With Tailwind v4, inline theme tokens in CSS are the supported route to create semantic utilities like text-learning, border-needs-work without extending a JS config file.

---

## Refined Palette (Final Tokens)

Core Brand (existing):
- --accent: Coral #FF9B7C (warm confidence, gentle urgency)
- --primary: Terracotta #D97757 (deeper coral for emphasis)
- Neutrals: Cream #FFF8F3 (background), Charcoal #2A2A2A (foreground)

New Additions (semantic):
- Success/Mastered — Soft Sage: 
  - var(--success) = #88C9A1
  - Tailwind: text-success, border-success, bg-success/10
  - Usage: mastered borders, correct states, positive reinforcement

- Learning/Neutral — Dusty Blue:
  - var(--learning) = #8BA7C9
  - Tailwind: text-learning, border-learning, bg-learning/10
  - Usage: learning/neutral states, answer blocks, calm emphasis

- Needs Work/Incorrect — Warm Gray/Beige (no red):
  - var(--needs-work) = #C9B5A6
  - Tailwind: text-needs-work, border-needs-work, bg-needs-work/10
  - Usage: constructive feedback, “hard” rating accents

- Due Today — Coral (alias):
  - var(--due) = var(--accent) = #FF9B7C
  - Tailwind: text-due, border-due, etc.

- Overdue — Terracotta (alias):
  - var(--overdue) = var(--primary) = #D97757
  - Tailwind: text-overdue, border-overdue, etc.

- Connection/Prerequisite — Warm Lavender (optional):
  - var(--connection) = #C8B5E8
  - Tailwind: text-connection, border-connection, bg-connection/10
  - Usage: tags, knowledge graph connections

Notes:
- Never use bright red/yellow/neon — maintains a non-anxious, warm aesthetic.
- Avoid pure black/white; prefer warm neutrals for better harmony.

---

## Component Changes

1) Review Progress Bar
- File: src/components/reviews/progress-bar.tsx
- Change: progress fill from a flat primary to the new .progress-growth gradient (Sage → Coral).
- Rationale: communicates “growth” positively, avoids gamified neon.

2) Review Card answer block
- File: src/components/reviews/review-card.tsx
- Change: answer panel styled with Dusty Blue learning tone:
  - "rounded-lg border border-learning/30 bg-learning/10 p-4"
- Rationale: calm, neutral encouragement when revealing answers.

3) Difficulty buttons configuration
- File: src/features/reviews/types.ts
- Map difficulty to semantic colors:
  - hard → needs-work (warm beige): border-needs-work text-needs-work hover:bg-needs-work/10
  - medium → learning (dusty blue): border-learning text-learning hover:bg-learning/10
  - easy → success (sage): border-success text-success hover:bg-success/10
- Rationale: avoids “alarm red”; hard feels constructive, not punishing.

4) Flashcard Card
- File: src/components/flashcards/flashcard-card.tsx
- State border color:
  - locked → border-secondary (neutral)
  - mastered → border-success
  - else (unlocked/learning) → border-learning
- Category badge uses connection color:
  - "border-connection text-connection"
- Unlocked meta line:
  - "text-success"
- Answer block:
  - "rounded-lg border border-learning/30 bg-learning/10"
- Stats color:
  - successRate ≥ 70 → text-success (sage)
  - else → text-needs-work (warm beige)
- Locked content container:
  - "bg-secondary/40 ... text-foreground", neutralizing prior orange emphasis
- Rationale: introduce subtle hierarchy, consistent tone; avoid stress signals.

---

## Where These Colors Add Value (Reasoning)

- Answer reveal areas: Use Dusty Blue to keep the reveal calm and focused.
- Positive reinforcement (mastered/success): Use Soft Sage to encourage without shouting “win”.
- Constructive feedback (hard/needs work): Use Warm Beige instead of red — lowers anxiety.
- Connectivity & context (category/prereqs): Warm Lavender distinguishes relationship tags without clashing with warm brand tones.
- Due/Overdue: Reuse existing Coral/Terracotta as aliases to stay on-brand.

---

## How It Works Technically

- Tailwind v4 inline theme (@theme inline in app/globals.css) maps CSS variables → Tailwind utilities:
  - text-learning, border-learning, bg-learning, etc.
- Light/dark values are defined in :root and .dark scopes.
- No tailwind.config file modification required in this repo, since the theme is in CSS.
- shadcn setup points Tailwind to app/globals.css in components.json.

---

## Testing

Minimal checks performed:
- Verified tokens/classes compile and are referenced in changed components.
- Static code review (no runtime errors locally in the edited files).
- Fixed stray "use client" artifact and removed non-null assertion on answer.

Recommended critical-path testing (UI):
- /dashboard/courses/[courseId]/review:
  - ProgressBar shows gradient and updates width smoothly.
  - Reveal answer → learning tone panel appears; source timestamp legible.
  - Rate via buttons and keyboard; check colors & hover states.
  - Completion screen list items reflect difficulty accents.
- Flashcard card wherever used:
  - Locked: bg-secondary/40 with neutral text; hint bullets readable.
  - Unlocked: success “Unlocked…” meta, learning answer panel, stats coloring threshold logic.
  - Mastered: success border, star badge appearance.
  - Category: connection badge color.

Thorough testing:
- Light/dark mode contrast audit for learning/needs-work/success/connection.
- i18n-prefixed routes rendering unchanged wrt styles.
- CardsToReviewToday panel remains consistent on hover and states.
- Cross-component regression checks for shadcn defaults still using global tokens.

---

## Future Opportunities

- Dashboard concept status pills:
  - [Mastered] → sage bg with white text
  - [Learning] → blue bg with white text
  - [To Learn] → coral bg with white text
- Charts:
  - Sage for retention, Coral for learned concepts, Dusty Blue for study time — consistent with report.
- Additional utilities:
  - Optional gentle backgrounds for “due” and “overdue” panels using the aliases.
- Design tokens documentation page:
  - Quick reference for product/design to ensure consistent usage.

---

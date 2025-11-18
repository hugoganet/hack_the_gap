"use client";

import { BentoGrid, BentoGridItem } from "@/components/nowts/bentoo";
import { Loader } from "@/components/nowts/loader";
import { Typography } from "@/components/nowts/typography";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Lock,
  Target,
  Unlock,
} from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { SectionLayout } from "./section-layout";

export function BentoGridSection() {
  return (
    <SectionLayout>
      <BentoGrid className="mx-auto max-w-4xl md:auto-rows-[20rem]">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            className={cn("[&>p:text-lg]", item.className)}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </SectionLayout>
  );
}

const Skeleton1 = () => {
  const variants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex h-full flex-col gap-2"
    >
      <motion.div className="border-border bg-background flex flex-col gap-2 rounded-2xl border p-3">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-red-500" />
          <p className="text-xs text-neutral-500">Processing video...</p>
        </div>
        <p className="text-xs font-medium">
          "Kant's Categorical Imperative explained"
        </p>
      </motion.div>
      <motion.div
        variants={variants}
        className="border-border bg-background flex flex-col gap-2 rounded-2xl border p-3"
      >
        <div className="flex items-center gap-2">
          <CheckCircle size={12} className="text-green-500" />
          <p className="text-xs text-neutral-500">4 concepts extracted</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs">✓ Categorical Imperative</p>
          <p className="text-xs">✓ Deontological Ethics</p>
          <p className="text-xs">✓ Moral Law</p>
          <p className="text-xs">✓ Practical Reason</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Skeleton2 = () => {
  const variants: Variants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex h-full flex-col gap-2"
    >
      <motion.div>
        <Alert variant="default" className="">
          <Loader size={20} />
          <AlertTitle>Matching to Philosophy 101 syllabus...</AlertTitle>
        </Alert>
      </motion.div>
      <motion.div variants={variants}>
        <Alert variant="success" className="">
          <CheckCircle size={20} />
          <AlertTitle>3/4 concepts matched (92% confidence)</AlertTitle>
        </Alert>
      </motion.div>
      <motion.div variants={variants} className="mt-2">
        <div className="border-border bg-background rounded-lg border p-2">
          <p className="text-xs text-neutral-500">
            ✅ Categorical Imperative → Kant's moral philosophy
          </p>
          <p className="text-xs text-neutral-500">
            ✅ Deontological Ethics → Duty-based theories
          </p>
          <p className="text-xs text-neutral-500">
            ⚠️ Moral Law → Universal principles (67% - confirm?)
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
const Skeleton3 = () => {
  return (
    <motion.div className="flex size-full flex-col gap-2 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Today's Review</p>
        <Badge variant="secondary">3 min</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <div className="border-border bg-background rounded-lg border p-2">
          <p className="text-xs font-medium">Categorical Imperative</p>
          <p className="text-xs text-neutral-500">Due: Now</p>
        </div>
        <div className="border-border bg-background rounded-lg border p-2 opacity-50">
          <p className="text-xs font-medium">Deontological Ethics</p>
          <p className="text-xs text-neutral-500">Due: Tomorrow</p>
        </div>
        <div className="border-border bg-background rounded-lg border p-2 opacity-30">
          <p className="text-xs font-medium">Moral Law</p>
          <p className="text-xs text-neutral-500">Due: In 3 days</p>
        </div>
      </div>
    </motion.div>
  );
};
const Skeleton4 = () => {
  const first = {
    initial: { x: 20, rotate: -5 },
    hover: { x: 0, rotate: 0 },
  };
  const second = {
    initial: { x: -20, rotate: 5 },
    hover: { x: 0, rotate: 0 },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 flex-col gap-4"
    >
      <motion.div
        variants={first}
        className="border-border bg-background flex flex-col rounded-2xl border p-4"
      >
        <Typography variant="large" className="text-green-500">
          12/45 concepts mastered
        </Typography>
        <Typography variant="muted">Philosophy 101</Typography>
        <Progress value={26.7} className="mt-2" />
      </motion.div>
      <motion.div
        variants={second}
        className="border-border bg-background flex flex-col rounded-2xl border p-4"
      >
        <Typography variant="large" className="text-amber-500">
          You're missing:
        </Typography>
        <Typography variant="muted" className="text-xs mt-1">
          • Virtue Ethics (Aristotle)
        </Typography>
        <Typography variant="muted" className="text-xs">
          • Social Contract Theory
        </Typography>
        <Typography variant="muted" className="text-xs">
          • Utilitarianism (Mill)
        </Typography>
      </motion.div>
    </motion.div>
  );
};

const Skeleton5 = () => {
  const variants = {
    initial: { x: 0 },
    animate: { x: 10, rotate: 5, transition: { duration: 0.2 } },
  };
  const variantsSecond = {
    initial: { x: 0 },
    animate: { x: -10, rotate: -5, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-col gap-2"
    >
      <motion.div
        variants={variants}
        className="border-border bg-background flex items-center gap-2 rounded-2xl border p-3"
      >
        <Lock size={16} className="text-neutral-400" />
        <div>
          <p className="text-xs font-medium">Categorical Imperative</p>
          <p className="text-xs text-neutral-500">Locked (45% confidence)</p>
        </div>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="border-border bg-background flex items-center gap-2 rounded-2xl border p-3"
      >
        <Unlock size={16} className="text-green-500" />
        <div>
          <p className="text-xs font-medium">Deontological Ethics</p>
          <p className="text-xs text-green-500">Unlocked (85% confidence)</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const items = [
  {
    title: "Atomic Concept Extraction",
    description: (
      <span className="text-sm">
        AI breaks down videos and PDFs into learnable chunks. One concept = one flashcard.
        No more overwhelming walls of text.
      </span>
    ),
    header: <Skeleton1 />,
    className: "md:col-span-1",
    icon: <Brain size={20} />,
  },
  {
    title: "Syllabus Matching",
    description: (
      <span className="text-sm">
        See exactly which concepts you've learned vs. what's missing from your course requirements.
        68%+ accuracy, improving daily.
      </span>
    ),
    header: <Skeleton2 />,
    className: "md:col-span-1",
    icon: <Target size={20} />,
  },
  {
    title: "Spaced Repetition",
    description: (
      <span className="text-sm">
        Review 3 min/day. The system schedules optimal review times for long-term retention.
        Based on proven cognitive science.
      </span>
    ),
    header: <Skeleton3 />,
    className: "md:col-span-1",
    icon: <Calendar size={20} />,
  },
  {
    title: "Gap Analysis",
    description: (
      <span className="text-sm">
        "You're missing: [specific concepts]" before exams. Know exactly what you don't know.
        No more false confidence.
      </span>
    ),
    header: <Skeleton4 />,
    className: "md:col-span-2",
    icon: <BarChart3 size={20} />,
  },
  {
    title: "Unlock Progress",
    description: (
      <span className="text-sm">
        Gamified learning: flashcards unlock as you master concepts. Track your progress visually.
        Stay motivated.
      </span>
    ),
    header: <Skeleton5 />,
    className: "md:col-span-1",
    icon: <Unlock size={20} />,
  },
];

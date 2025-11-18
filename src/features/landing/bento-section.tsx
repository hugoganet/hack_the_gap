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
import { useTranslations } from "next-intl";
import { SectionLayout } from "./section-layout";

export function BentoGridSection() {
  const t = useTranslations("landing.bento.items");
  
  const items = [
    {
      title: t("extraction.title"),
      description: (
        <span className="text-sm">
          {t("extraction.description")}
        </span>
      ),
      header: <Skeleton1 />,
      className: "md:col-span-1",
      icon: <Brain size={20} />,
    },
    {
      title: t("matching.title"),
      description: (
        <span className="text-sm">
          {t("matching.description")}
        </span>
      ),
      header: <Skeleton2 />,
      className: "md:col-span-1",
      icon: <Target size={20} />,
    },
    {
      title: t("repetition.title"),
      description: (
        <span className="text-sm">
          {t("repetition.description")}
        </span>
      ),
      header: <Skeleton3 />,
      className: "md:col-span-1",
      icon: <Calendar size={20} />,
    },
    {
      title: t("progress.title"),
      description: (
        <span className="text-sm">
          {t("progress.description")}
        </span>
      ),
      header: <Skeleton4 />,
      className: "md:col-span-2",
      icon: <BarChart3 size={20} />,
    },
    {
      title: t("analytics.title"),
      description: (
        <span className="text-sm">
          {t("analytics.description")}
        </span>
      ),
      header: <Skeleton5 />,
      className: "md:col-span-1",
      icon: <Unlock size={20} />,
    },
  ];
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
  const t = useTranslations("landing.bento.items.extraction");
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
          <p className="text-xs text-neutral-500">{t("processing")}</p>
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
          <p className="text-xs text-neutral-500">4 {t("extracted")}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs">✓ {t("concepts.categorical")}</p>
          <p className="text-xs">✓ {t("concepts.deontological")}</p>
          <p className="text-xs">✓ {t("concepts.moral")}</p>
          <p className="text-xs">✓ {t("concepts.practical")}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Skeleton2 = () => {
  const t = useTranslations("landing.bento.items.matching");
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
          <AlertTitle>{t("analyzing")}</AlertTitle>
        </Alert>
      </motion.div>
      <motion.div variants={variants}>
        <Alert variant="success" className="">
          <CheckCircle size={20} />
          <AlertTitle>3/4 {t("matched")} Philosophy 101 (92% {t("confidence")})</AlertTitle>
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
  const t = useTranslations("landing.bento.items.repetition");
  return (
    <motion.div className="flex size-full flex-col gap-2 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{t("dueToday")}</p>
        <Badge variant="secondary">3 min</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <div className="border-border bg-background rounded-lg border p-2">
          <p className="text-xs font-medium">Categorical Imperative</p>
          <p className="text-xs text-neutral-500">Due: Now</p>
        </div>
        <div className="border-border bg-background rounded-lg border p-2 opacity-50">
          <p className="text-xs font-medium">Deontological Ethics</p>
          <p className="text-xs text-neutral-500">Due: {t("dueTomorrow")}</p>
        </div>
        <div className="border-border bg-background rounded-lg border p-2 opacity-30">
          <p className="text-xs font-medium">Moral Law</p>
          <p className="text-xs text-neutral-500">{t("mastered")}</p>
        </div>
      </div>
    </motion.div>
  );
};
const Skeleton4 = () => {
  const t = useTranslations("landing.bento.items.progress");
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
          12/45 {t("mastered")}
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
  const t = useTranslations("landing.bento.items.progress");
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
          <p className="text-xs text-neutral-500">{t("locked")}</p>
        </div>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="border-border bg-background flex items-center gap-2 rounded-2xl border p-3"
      >
        <Unlock size={16} className="text-green-500" />
        <div>
          <p className="text-xs font-medium">Deontological Ethics</p>
          <p className="text-xs text-green-500">{t("unlocked")}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};



"use client";

import { Typography } from "@/components/nowts/typography";
import { SectionLayout } from "./section-layout";

export const PainSection = () => {
  return (
    <SectionLayout
      variant="card"
      size="base"
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="flex w-full flex-col items-center gap-3 lg:gap-4 xl:gap-6">
        <Typography variant="h1">You're Already Learning...</Typography>
        <Typography variant="large" className="text-center max-w-2xl">
          But without a retention system, you're forgetting 85% within 2 weeks.
        </Typography>
        <div className="flex items-start gap-4 max-lg:flex-col">
          <div className="flex-1 rounded-lg bg-red-500/20 p-4 lg:p-6">
            <Typography variant="h3" className="text-red-500">
              😞 Learning Without Recall
            </Typography>
            <ul className="text-foreground/80 mt-4 ml-4 flex list-disc flex-col gap-2 text-lg">
              <li>Watch 10 hours of YouTube explainers</li>
              <li>Forget 85% within 2 weeks</li>
              <li>Panic-cram before exams</li>
              <li>Can't recall key concepts when needed</li>
              <li>Feel like time was wasted</li>
            </ul>
          </div>
          <div className="flex-1 rounded-lg bg-green-500/20 p-4 lg:p-6">
            <Typography variant="h3" className="text-green-500">
              😎 Learning WITH Recall
            </Typography>
            <ul className="text-foreground/80 mt-4 ml-4 flex list-disc flex-col gap-2 text-lg">
              <li>Upload your syllabus (60 seconds)</li>
              <li>Watch content you're already consuming</li>
              <li>AI extracts concepts + generates flashcards</li>
              <li>Review 3 min/day (spaced repetition)</li>
              <li>80% retention after 7 days</li>
              <li>See exactly what you know vs. don't know</li>
            </ul>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
};

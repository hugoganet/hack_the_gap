"use client";

import { Typography } from "@/components/nowts/typography";
import { useTranslations } from "next-intl";
import { SectionLayout } from "./section-layout";

export const PainSection = () => {
  const t = useTranslations("landing.pain");
  return (
    <SectionLayout
      variant="card"
      size="base"
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="flex w-full flex-col items-center gap-3 lg:gap-4 xl:gap-6">
        <Typography variant="h1">{t("title")}</Typography>
        <Typography variant="large" className="text-center max-w-2xl">
          {t("subtitle")}
        </Typography>
        <div className="flex items-start gap-4 max-lg:flex-col">
          <div className="flex-1 rounded-lg bg-red-500/20 p-4 lg:p-6">
            <Typography variant="h3" className="text-red-500">
              {t("without.title")}
            </Typography>
            <ul className="text-foreground/80 mt-4 ml-4 flex list-disc flex-col gap-2 text-lg">
              {(t.raw("without.items") as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="flex-1 rounded-lg bg-green-500/20 p-4 lg:p-6">
            <Typography variant="h3" className="text-green-500">
              {t("with.title")}
            </Typography>
            <ul className="text-foreground/80 mt-4 ml-4 flex list-disc flex-col gap-2 text-lg">
              {(t.raw("with.items") as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
};

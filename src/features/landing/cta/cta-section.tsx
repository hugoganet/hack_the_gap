"use client";

import { Typography } from "@/components/nowts/typography";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SectionLayout } from "../section-layout";

export function CtaSection() {
  const t = useTranslations("landing.ctaSection");
  return (
    <SectionLayout className="lg:flex lg:items-center lg:justify-between lg:px-8">
      <Typography variant="h3">
        <Typography variant="h2" as="span">
          {t("title")}
        </Typography>
        <br />
        <span className="text-muted-foreground">
          {t("subtitle")}
        </span>
      </Typography>
      <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:shrink-0">
        <Link className={buttonVariants({ size: "lg" })} href="/signup">
          {t("button")}
        </Link>
      </div>
    </SectionLayout>
  );
}

"use client";

import { Typography } from "@/components/nowts/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionLayout } from "./section-layout";

export const ReviewsAlert = () => {
  const t = useTranslations("landing.reviewsNotice");
  return (
    <SectionLayout size="sm" className="py-8 pb-0 lg:py-10 lg:pb-0">
      <div className="flex flex-col items-center gap-4">
        <Badge variant="secondary">{t("badge", { default: "Use Cases" })}</Badge>
        <Typography variant="h3" className="text-center">
          {t("title")}
        </Typography>
        <Alert className="w-full max-w-2xl">
          <AlertCircle size={16} />
          <AlertTitle>{t("title")}</AlertTitle>
          <AlertDescription>{t("description")}</AlertDescription>
        </Alert>
      </div>
    </SectionLayout>
  );
};

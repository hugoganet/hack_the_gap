"use client";

import { Typography } from "@/components/nowts/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionLayout } from "./section-layout";

export const BetaAlert = () => {
  const t = useTranslations("landing.trustSignals");
  return (
    <SectionLayout size="sm">
      <div className="flex flex-col items-center gap-4">
        <Badge variant="secondary">{t("earlyAccessTitle", { default: "Beta" })}</Badge>
        <Typography variant="h3" className="text-center">
          {t("beta.title")}
        </Typography>
        <Alert className="w-full max-w-2xl">
          <AlertCircle size={16} />
          <AlertTitle>{t("beta.title")}</AlertTitle>
          <AlertDescription>{t("beta.description")}</AlertDescription>
        </Alert>
      </div>
    </SectionLayout>
  );
};

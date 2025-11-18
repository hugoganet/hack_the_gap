"use client";

import { Typography } from "@/components/nowts/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionLayout } from "./section-layout";

export const TrustSignalsSection = () => {
  const t = useTranslations("landing.trustSignals");
  return (
    <SectionLayout size="sm">
      <div className="flex flex-col items-center gap-6">
        <Badge variant="secondary">{t("badge")}</Badge>
        <Typography variant="h3" className="text-center max-w-2xl">
          {t("title")}
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("cards.zettelkasten.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="muted" className="text-sm">
                {t("cards.zettelkasten.description")}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("cards.spacedRepetition.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="muted" className="text-sm">
                {t("cards.spacedRepetition.description")}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("cards.aiAutomation.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="muted" className="text-sm">
                {t("cards.aiAutomation.description")}
              </Typography>
            </CardContent>
          </Card>
        </div>
        <Alert className="mt-6">
          <AlertCircle size={16} />
          <AlertTitle>{t("beta.title")}</AlertTitle>
          <AlertDescription>
            {t("beta.description")}
          </AlertDescription>
        </Alert>
      </div>
    </SectionLayout>
  );
};

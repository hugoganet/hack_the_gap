"use client";

import { Typography } from "@/components/nowts/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, CheckCircle, Play, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionLayout } from "./section-layout";

export const HowItWorksSection = () => {
  const t = useTranslations("landing.howItWorks");
  
  const steps = [
    {
      number: t("steps.upload.number"),
      title: t("steps.upload.title"),
      description: t("steps.upload.description"),
      icon: <Upload size={24} />,
    },
    {
      number: t("steps.watch.number"),
      title: t("steps.watch.title"),
      description: t("steps.watch.description"),
      icon: <Play size={24} />,
    },
    {
      number: t("steps.extract.number"),
      title: t("steps.extract.title"),
      description: t("steps.extract.description"),
      icon: <Brain size={24} />,
    },
    {
      number: t("steps.review.number"),
      title: t("steps.review.title"),
      description: t("steps.review.description"),
      icon: <CheckCircle size={24} />,
    },
  ];

  return (
    <SectionLayout size="lg" id="how-it-works">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <Badge>{t("badge")}</Badge>
          <Typography variant="h2" className="mt-4">
            {t("title")}
          </Typography>
          <Typography variant="muted" className="mt-2 max-w-2xl">
            {t("description")}
          </Typography>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                    {step.icon}
                  </div>
                  <div className="text-4xl font-bold text-primary/20">
                    {step.number}
                  </div>
                </div>
                <CardTitle className="mt-4">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="muted" className="text-sm">
                  {step.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SectionLayout>
  );
};

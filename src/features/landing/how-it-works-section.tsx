"use client";

import { Typography } from "@/components/nowts/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, CheckCircle, Play, Upload } from "lucide-react";
import { SectionLayout } from "./section-layout";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      title: "Upload Your Syllabus",
      description:
        "PDF, text, or talk to our AI to define your learning goals. Works for any course, any educational system worldwide.",
      icon: <Upload size={24} />,
    },
    {
      number: "2",
      title: "Watch Content You're Already Consuming",
      description:
        "YouTube videos, articles, PDFs. No behavior change required. Just paste the URL or upload the file.",
      icon: <Play size={24} />,
    },
    {
      number: "3",
      title: "AI Extracts & Matches Concepts",
      description:
        "Within 60 seconds, concepts are extracted and matched to your syllabus. See exactly what you've learned vs. what's missing.",
      icon: <Brain size={24} />,
    },
    {
      number: "4",
      title: "Review 3 Min/Day",
      description:
        "Spaced repetition schedules optimal review times. Flashcards unlock as you master concepts. 80% retention after 7 days.",
      icon: <CheckCircle size={24} />,
    },
  ];

  return (
    <SectionLayout size="lg" id="how-it-works">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <Badge>How It Works</Badge>
          <Typography variant="h2" className="mt-4">
            From Passive Consumption to Active Retention
          </Typography>
          <Typography variant="muted" className="mt-2 max-w-2xl">
            No manual flashcard creation. No note-taking. No organizing.
            Just learn.
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

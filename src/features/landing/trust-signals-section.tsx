"use client";

import { Typography } from "@/components/nowts/typography";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { SectionLayout } from "./section-layout";

export const TrustSignalsSection = () => {
  return (
    <SectionLayout size="sm">
      <div className="flex flex-col items-center gap-6">
        <Badge variant="secondary">Built on Proven Science</Badge>
        <Typography variant="h3" className="text-center max-w-2xl">
          Zettelkasten Methodology + Spaced Repetition + AI Automation
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zettelkasten</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="muted" className="text-sm">
                Knowledge graph methodology used by Nobel Prize winners.
                Atomic notes, typed links, hierarchical structure.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spaced Repetition</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="muted" className="text-sm">
                Proven cognitive science technique. Review at optimal
                intervals for long-term retention (80% after 7 days).
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="muted" className="text-sm">
                GPT-4 + embeddings for concept extraction and matching.
                68%+ accuracy, improving daily with user feedback.
              </Typography>
            </CardContent>
          </Card>
        </div>
        <Alert className="mt-6">
          <AlertCircle size={16} />
          <AlertTitle>Currently in Beta</AlertTitle>
          <AlertDescription>
            We're testing with early users to improve accuracy before
            launching paid plans. Join now to get early access and help shape
            the product.
          </AlertDescription>
        </Alert>
      </div>
    </SectionLayout>
  );
};

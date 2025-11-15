import { LandingHeader } from "@/features/landing/landing-header";
import { Footer } from "@/features/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH1, TypographyH2, TypographyP } from "@/components/ui/typography";
import Link from "next/link";
import { Brain, Calendar, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="max-w-3xl space-y-4">
          <TypographyH1>
            Transform Passive Learning into Active Retention
          </TypographyH1>
          <TypographyP className="text-muted-foreground text-lg">
            AI-powered system that automatically converts your YouTube videos, lectures, and articles
            into personalized flashcards with spaced repetition. Remember what you learn, forever.
          </TypographyP>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <TypographyH2>How It Works</TypographyH2>
          <TypographyP className="text-muted-foreground mx-auto mt-4 max-w-2xl">
            A simple 3-step process to transform any content into long-term knowledge
          </TypographyP>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Brain className="mb-4 h-12 w-12 text-primary" />
              <CardTitle>AI Concept Extraction</CardTitle>
              <CardDescription>
                Watch a video or read an article. Our AI automatically extracts key concepts
                and creates atomic knowledge cards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="mb-4 h-12 w-12 text-primary" />
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription>
                Concepts are matched to your course syllabus with confidence scores.
                Track exactly what you've learned vs. what's required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="mb-4 h-12 w-12 text-primary" />
              <CardTitle>Spaced Repetition</CardTitle>
              <CardDescription>
                Review flashcards at optimal intervals. Just 3-5 minutes daily ensures
                long-term retention of everything you learn.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <TypographyH2 className="mb-4">Ready to Remember Everything?</TypographyH2>
          <TypographyP className="text-muted-foreground mx-auto mb-8 max-w-2xl">
            Join students who are transforming their passive content consumption into active learning
          </TypographyP>
          <Button size="lg" asChild>
            <Link href="/auth/signup">Start Learning Smarter</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

"use client";

import { LandingHeader } from "@/features/landing/landing-header";
import { Footer } from "@/features/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyH1, TypographyH2, TypographyH3, TypographyP } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Brain, Calendar, Zap, Clock, Mail, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { submitBetaInvitation } from "@app/actions/beta-invitation.action";

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Track mouse movement for dynamic gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  useEffect(() => {
    const targetDate = new Date("2025-11-17T10:00:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      
      const result = await submitBetaInvitation(formData);
      
      if (result.success) {
        toast.success(result.message);
        setEmail(""); // Clear the input
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col">
      <LandingHeader />

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <div className="max-w-3xl space-y-4">
          <TypographyH1 
            className="dynamic-gradient bg-gradient-to-r from-foreground via-primary to-foreground"
            style={{
              backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
            }}
          >
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

      {/* Beta Timer Banner */}
      <section className="relative overflow-hidden border-y border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 py-16">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="container relative mx-auto px-4">
          <Card className="mx-auto max-w-3xl border-primary/30 bg-gradient-to-br from-background/95 to-background/80 shadow-2xl shadow-primary/10 backdrop-blur-xl">
            <CardHeader className="space-y-6 pb-8 text-center">
              <div className="inline-flex items-center justify-center gap-3 rounded-full bg-primary/10 px-6 py-2 mx-auto">
                <Clock className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-primary">Free Beta Test Ends</span>
              </div>
              
              <div className="flex items-center justify-center gap-3 sm:gap-6">
                <div className="flex flex-col items-center rounded-xl bg-primary/5 p-4 min-w-[80px] border border-primary/20">
                  <span 
                    className="text-4xl sm:text-5xl font-bold dynamic-gradient bg-gradient-to-br from-primary to-primary/60"
                    style={{
                      backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                    }}
                  >
                    {timeLeft.days}
                  </span>
                  <span className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">days</span>
                </div>
                <span className="text-3xl font-bold text-primary/40">:</span>
                <div className="flex flex-col items-center rounded-xl bg-primary/5 p-4 min-w-[80px] border border-primary/20">
                  <span 
                    className="text-4xl sm:text-5xl font-bold dynamic-gradient bg-gradient-to-br from-primary to-primary/60"
                    style={{
                      backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                    }}
                  >
                    {timeLeft.hours}
                  </span>
                  <span className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">hours</span>
                </div>
                <span className="text-3xl font-bold text-primary/40">:</span>
                <div className="flex flex-col items-center rounded-xl bg-primary/5 p-4 min-w-[80px] border border-primary/20">
                  <span 
                    className="text-4xl sm:text-5xl font-bold dynamic-gradient bg-gradient-to-br from-primary to-primary/60"
                    style={{
                      backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                    }}
                  >
                    {timeLeft.minutes}
                  </span>
                  <span className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">minutes</span>
                </div>
                <span className="text-3xl font-bold text-primary/40">:</span>
                <div className="flex flex-col items-center rounded-xl bg-primary/5 p-4 min-w-[80px] border border-primary/20">
                  <span 
                    className="text-4xl sm:text-5xl font-bold dynamic-gradient bg-gradient-to-br from-primary to-primary/60"
                    style={{
                      backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                    }}
                  >
                    {timeLeft.seconds}
                  </span>
                  <span className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">seconds</span>
                </div>
              </div>

              <TypographyP className="text-muted-foreground text-sm">
                November 17, 2025 at 10:00 AM
              </TypographyP>
            </CardHeader>

            <CardContent className="space-y-6 pt-0">
              <div className="space-y-3 text-center">
                <TypographyH2 
                  className="dynamic-gradient bg-gradient-to-r from-primary via-primary/80 to-primary/60"
                  style={{
                    backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                  }}
                >
                  Get Early Access!
                </TypographyH2>
                <TypographyP className="text-muted-foreground mx-auto max-w-md">
                  Sign up now and get early access to the platform with exclusive features
                </TypographyP>
              </div>

              <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/60" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-12 border-primary/30 bg-background/50 pl-12 text-base focus-visible:ring-primary/50"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="h-12 bg-gradient-to-r from-primary to-primary/80 px-8 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Get Invitation"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
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
          <Card className="border-primary/20 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>AI Concept Extraction</CardTitle>
              <CardDescription>
                Watch a video or read an article. Our AI automatically extracts key concepts
                and creates atomic knowledge cards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription>
                Concepts are matched to your course syllabus with confidence scores.
                Track exactly what you've learned vs. what's required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-muted/50 to-primary/5 py-16">
        <div className="container relative mx-auto px-4 text-center">
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

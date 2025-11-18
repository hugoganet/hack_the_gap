"use client";

import { LandingHeader } from "@/features/landing/landing-header";
import { Footer } from "@/features/layout/footer";
import { Hero } from "@/features/landing/hero";
import { StatsSection } from "@/features/landing/stats-section";
import { BentoGridSection } from "@/features/landing/bento-section";
import { PainSection } from "@/features/landing/pain";
import { HowItWorksSection } from "@/features/landing/how-it-works-section";
import { TrustSignalsSection } from "@/features/landing/trust-signals-section";
import { ReviewGrid } from "@/features/landing/review/review-grid";
import { FAQSection } from "@/features/landing/faq-section";
import { CtaSection } from "@/features/landing/cta/cta-section";
import { BetaAlert } from "@/features/landing/beta-alert";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("landing");
  
  const reviewImages = [
    "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=128&h=128&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=128&h=128&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&auto=format",
  ];
  
  const reviews = (t.raw("reviews") as Array<{ review: string; name: string; role: string }>).map((review, index) => ({
    ...review,
    image: reviewImages[index],
  }));
  
  const faq = t.raw("faqItems") as Array<{ question: string; answer: string }>;
  


  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col">
      <LandingHeader />
      <Hero />
      <StatsSection />
      <PainSection />
      <HowItWorksSection />
      <BentoGridSection />
      <TrustSignalsSection />
      <ReviewGrid reviews={reviews} />
      <FAQSection faq={faq} />
      <BetaAlert />
      <CtaSection />
      <Footer />
    </div>
  );
}

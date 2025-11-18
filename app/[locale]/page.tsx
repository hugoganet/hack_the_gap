"use client";

import { LandingHeader } from "@/features/landing/landing-header";
import { Footer } from "@/features/layout/footer";
import { Hero } from "@/features/landing/hero";
import { StatsSection } from "@/features/landing/stats-section";
import { BentoGridSection } from "@/features/landing/bento-section";
import { PainSection } from "@/features/landing/pain";
import { ReviewGrid } from "@/features/landing/review/review-grid";
import { FAQSection } from "@/features/landing/faq-section";
import { CtaSection } from "@/features/landing/cta/cta-section";

export default function HomePage() {
  const reviews = [
    {
      review:
        "**This is a game changer.** I retain way more from videos now.",
      name: "Alex P.",
      role: "Student",
      image:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=128&h=128&fit=crop&auto=format",
    },
    {
      review:
        "The matching to my syllabus is surprisingly accurate. Saves me time.",
      name: "Priya K.",
      role: "Grad Researcher",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&auto=format",
    },
    {
      review:
        "I finally have a daily review habit. The unlocks feel rewarding!",
      name: "Marco D.",
      role: "Undergrad",
      image:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=128&h=128&fit=crop&auto=format",
    },
  ];

  const faq = [
    {
      question: "How does concept extraction work?",
      answer:
        "We use AI to extract atomic concepts from your videos, PDFs, and articles, then match them to your course syllabus.",
    },
    {
      question: "Will flashcards be generated automatically?",
      answer:
        "Yes. Once concepts match your syllabus, related flashcards unlock and become ready for review.",
    },
    {
      question: "Do I need to create a course first?",
      answer:
        "You can start processing content right away, but adding a course with a learning goal improves matching.",
    },
  ];

  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col">
      <LandingHeader />
      <Hero />
      <StatsSection />
      <BentoGridSection />
      <PainSection />
      <ReviewGrid reviews={reviews} />
      <FAQSection faq={faq} />
      <CtaSection />
      <Footer />
    </div>
  );
}

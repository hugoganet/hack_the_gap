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

export default function HomePage() {
  const reviews = [
    {
      review:
        "I failed my Philosophy 101 midterm despite watching 15 hours of YouTube. After using Recall for 2 weeks, I aced the final. **The concept matching is scary accurate.** I could see exactly which topics I was missing.",
      name: "Alex P.",
      role: "Philosophy Major, UC Berkeley",
      image:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=128&h=128&fit=crop&auto=format",
    },
    {
      review:
        "I'm a self-taught developer taking online courses. Recall helped me **actually retain** what I learned instead of just watching videos and forgetting. The spaced repetition is a game-changer.",
      name: "Priya K.",
      role: "Bootcamp Student, India",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&auto=format",
    },
    {
      review:
        "I finally have a daily review habit. **The unlocks feel rewarding** — like leveling up in a game. I can see my progress: 23/67 concepts mastered. It's addictive in the best way.",
      name: "Marco D.",
      role: "Biology Undergrad, Italy",
      image:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=128&h=128&fit=crop&auto=format",
    },
    {
      review:
        "I uploaded my Economics syllabus and processed 8 YouTube videos in one afternoon. **Within 60 seconds, I had flashcards matched to my course.** This would've taken me 10 hours to do manually.",
      name: "Sarah L.",
      role: "Economics Student, Canada",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&auto=format",
    },
    {
      review:
        "The gap analysis feature is incredible. Before my exam, it told me: **'You're missing: Social Contract Theory, Virtue Ethics.'** I watched 2 videos, reviewed the flashcards, and those were literally on the test.",
      name: "James K.",
      role: "Political Science Major, UK",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&auto=format",
    },
    {
      review:
        "I'm learning Japanese through YouTube videos. Recall extracts vocabulary and grammar concepts automatically. **I review 3 minutes every morning** and my retention has skyrocketed.",
      name: "Emily T.",
      role: "Language Learner, Australia",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&auto=format",
    },
  ];

  const faq = [
    {
      question: "How accurate is the AI matching?",
      answer:
        "Currently **68-80% accurate** (improving with feedback). We show confidence scores so you know which matches to trust. You can flag incorrect matches to help us improve. High-confidence matches (≥80%) are shown as 'Matched' with a green indicator.",
    },
    {
      question: "Do I need to create flashcards manually?",
      answer:
        "**No.** Upload your syllabus, watch a video, and flashcards appear automatically within 60 seconds. Review takes 3 min/day. Zero manual work required.",
    },
    {
      question: "What if I don't have a syllabus?",
      answer:
        "Talk to our AI to define your learning goals. Works for **self-learners, bootcamps, online courses** — any educational system worldwide. You can also upload PDFs, text files, or even handwritten notes (OCR coming soon).",
    },
    {
      question: "What content types are supported?",
      answer:
        "Currently: **YouTube videos and PDFs**. Coming soon: TikTok, articles, podcasts, lecture recordings. The core pipeline works the same for all content types.",
    },
    {
      question: "How does spaced repetition work?",
      answer:
        "The system schedules optimal review times based on **proven cognitive science**. You review each concept at increasing intervals (1 day, 3 days, 7 days, etc.). This moves information from short-term to long-term memory. Average review time: **3 min/day**.",
    },
    {
      question: "Can I edit or delete flashcards?",
      answer:
        "Yes. You can flag incorrect matches, delete flashcards, or add custom notes. We're building manual editing features post-MVP. For now, focus on flagging bad matches so we can improve the AI.",
    },
    {
      question: "Is this only for university students?",
      answer:
        "**No.** Works for anyone with learning goals: university students, self-learners, bootcamp participants, online course students, language learners, knowledge workers. If you consume educational content, Recall helps you retain it.",
    },
    {
      question: "How much does it cost?",
      answer:
        "Currently **free during beta**. We're testing with early users to improve accuracy before launching paid plans. Join now to get early access and help shape the product.",
    },
    {
      question: "What languages are supported?",
      answer:
        "Currently **English and French** for the interface. Content extraction works for **100+ languages** (our AI embeddings support cross-lingual matching). We're adding more interface languages post-MVP.",
    },
    {
      question: "How is this different from Anki or Quizlet?",
      answer:
        "**Zero manual work.** Anki/Quizlet require you to create flashcards manually (students won't do it). Recall automatically extracts concepts from content you're already consuming and matches them to your learning goals. It's Zettelkasten methodology with AI automation.",
    },
  ];

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
      <CtaSection />
      <Footer />
    </div>
  );
}

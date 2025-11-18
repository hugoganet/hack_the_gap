"use client";

import { ContactFeedbackPopover } from "./contact-feedback-popover";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

// A small floating circular button bottom-right that opens feedback popover.
// Appears after a short delay to avoid layout shift at initial page render.
export const FeedbackFloatingButton = () => {
  const [ready, setReady] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600); // appear after slight delay
    const stop = setTimeout(() => setAnimate(false), 8000); // stop animation after attention window
    return () => {
      clearTimeout(t);
      clearTimeout(stop);
    };
  }, []);

  if (!ready) return null;

  return (
    <ContactFeedbackPopover presetMessage="General feedback: ">
      <Button
        type="button"
        aria-label="Give feedback"
        className={
          "fixed bottom-16 right-4 z-50 rounded-full h-16 w-16 p-0 flex items-center justify-center overflow-hidden shadow-lg border border-accent/40 text-accent-foreground hover:shadow-xl transition bg-gradient-to-br from-[oklch(0.75_0.14_35)] via-[oklch(0.62_0.15_40)] to-[oklch(0.80_0.12_50)] " +
          (animate ? "animate-feedback-attention " : "") +
          "animate-feedback-cycle"
        }
      >
        <MessageCircle className="size-8" />
      </Button>
    </ContactFeedbackPopover>
  );
};

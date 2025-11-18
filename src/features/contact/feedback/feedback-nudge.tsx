"use client";

import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFeedbackPopover } from "./contact-feedback-popover";

export type FeedbackNudgeProps = {
  label?: string;
  presetMessage?: string;
  className?: string;
  size?: "sm" | "md";
};

export const FeedbackNudgeInline = ({
  label = "Quick feedback?",
  presetMessage,
  className,
  size = "sm",
}: FeedbackNudgeProps) => {
  return (
    <ContactFeedbackPopover presetMessage={presetMessage}>
      <Button
        type="button"
        variant="ghost"
        size={size === "sm" ? "sm" : "default"}
        className={cn(
          "text-muted-foreground hover:text-foreground h-7 px-2 py-1",
          "inline-flex items-center gap-1",
          className,
        )}
      >
        <MessageSquare className="size-3.5" />
        <span>{label}</span>
      </Button>
    </ContactFeedbackPopover>
  );
};

export const FeedbackNudgeChip = ({
  label = "Share feedback",
  presetMessage,
  className,
  size = "sm",
}: FeedbackNudgeProps) => {
  return (
    <ContactFeedbackPopover presetMessage={presetMessage}>
      <Button
        type="button"
        variant="outline"
        size={size === "sm" ? "sm" : "default"}
        className={cn(
          "h-7 rounded-full px-2 text-xs",
          "inline-flex items-center gap-1",
          className,
        )}
      >
        <MessageSquare className="size-3.5" />
        <span>{label}</span>
      </Button>
    </ContactFeedbackPopover>
  );
};

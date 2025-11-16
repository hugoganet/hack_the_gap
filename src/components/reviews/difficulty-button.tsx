"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DifficultyConfig } from "@/features/reviews/types";

type DifficultyButtonProps = {
  config: DifficultyConfig;
  onClick: () => void;
  disabled?: boolean;
};

export function DifficultyButton({
  config,
  onClick,
  disabled = false,
}: DifficultyButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-auto flex-col gap-2 py-4 transition-all",
        config.colorClass,
        config.hoverClass,
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      <span className="text-2xl">{config.emoji}</span>
      <span className="font-semibold">{config.label}</span>
      <span className="text-xs text-muted-foreground">{config.sublabel}</span>
      <span className="text-xs text-muted-foreground">{config.interval}</span>
    </Button>
  );
}

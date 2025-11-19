"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Youtube, FileText, Video } from "lucide-react";

export type ContentMetadata = {
  type: "youtube" | "pdf" | "tiktok";
  title: string;
  subtitle?: string; // Duration + channel OR page count + file size
  thumbnail?: string;
};

type ContentPreviewCardProps = {
  metadata: ContentMetadata;
};

export function ContentPreviewCard({ metadata }: ContentPreviewCardProps) {
  const getIcon = () => {
    switch (metadata.type) {
      case "youtube":
        return <Youtube className="size-6 text-red-500" />;
      case "pdf":
        return <FileText className="size-6 text-orange-500" />;
      case "tiktok":
        return <Video className="size-6 text-cyan-500" />;
    }
  };

  return (
    <Card className="mb-4 border-primary/20">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm sm:text-base">
              {metadata.title}
            </p>
            {metadata.subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {metadata.subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

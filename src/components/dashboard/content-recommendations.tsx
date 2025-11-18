"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Youtube, FileText, ExternalLink } from "lucide-react";

type ContentRecommendation = {
  id: string;
  title: string;
  type: "youtube" | "pdf" | "url";
  potentialUnlocks: number;
  concepts: string[];
};

type ContentRecommendationsProps = {
  recommendations: ContentRecommendation[];
  onSelect: (contentId: string) => void;
};

export function ContentRecommendations({
  recommendations,
  onSelect,
}: ContentRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Content</CardTitle>
        <p className="text-sm text-muted-foreground">
          Watch these to unlock the most answers
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {rec.type === "youtube" && (
                  <Youtube className="w-4 h-4 text-red-500" />
                )}
                {rec.type === "pdf" && (
                  <FileText className="w-4 h-4 text-blue-500" />
                )}
                {rec.type === "url" && (
                  <ExternalLink className="w-4 h-4 text-green-500" />
                )}
                <h4 className="font-medium">{rec.title}</h4>
              </div>

              <Badge variant="secondary">
                🔓 Unlocks {rec.potentialUnlocks} answer
                {rec.potentialUnlocks > 1 ? "s" : ""}
              </Badge>

              <div className="flex flex-wrap gap-1">
                {rec.concepts.slice(0, 3).map((concept, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {concept}
                  </Badge>
                ))}
                {rec.concepts.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{rec.concepts.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <Button onClick={() => onSelect(rec.id)} size="sm">
              Process
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

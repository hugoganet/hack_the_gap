"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type CourseCardProps = {
  course: {
    id: string;
    code: string;
    name: string;
    subject: {
      name: string;
    };
    enrolledAt: Date;
    learnedCount: number;
    syllabusConcepts: { id: string }[];
  };
  progress?: {
    progressPercentage: number;
    matchedConcepts: number;
    totalConcepts: number;
  };
};

export function CourseCard({ course, progress }: CourseCardProps) {
  const progressPercentage = progress?.progressPercentage ?? 0;
  const conceptsText = progress
    ? `${progress.matchedConcepts}/${progress.totalConcepts} concepts`
    : `${course.syllabusConcepts.length} concepts`;

  return (
    <Link href={`/dashboard/courses/${course.id}`}>
      <Card className="hover:border-primary transition-all cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
              <BookOpen className="text-primary size-5" />
            </div>
            <Badge variant="secondary">{course.subject.name}</Badge>
          </div>
          <CardTitle className="line-clamp-1">{course.name}</CardTitle>
          <CardDescription className="line-clamp-1">
            {course.code}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-4" />
              <span>
                Added {formatDistanceToNow(new Date(course.enrolledAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="text-muted-foreground text-sm">
            {conceptsText}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

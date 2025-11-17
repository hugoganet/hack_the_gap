"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";

type EmptyCoursesStateProps = {
  onCreateCourse: () => void;
};

export function EmptyCoursesState({ onCreateCourse }: EmptyCoursesStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="bg-muted flex size-20 items-center justify-center rounded-full mb-6">
          <BookOpen className="text-muted-foreground size-10" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Get started by creating your first course. Add your syllabus and start
          learning with AI-powered flashcards.
        </p>
        <Button onClick={onCreateCourse} size="lg">
          <Plus className="mr-2" />
          Add a new course
        </Button>
      </CardContent>
    </Card>
  );
}

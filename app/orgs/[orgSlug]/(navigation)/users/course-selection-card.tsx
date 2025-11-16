"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddCourseDialog } from "./add-course-dialog";

type Course = {
  id: string;
  code: string;
  name: string;
  subject: {
    name: string;
  };
  year?: {
    name: string;
  };
  semester?: {
    number: number;
  };
};

type CourseSelectionCardProps = {
  activeCourses?: Course[];
};

export function CourseSelectionCard({ activeCourses: initialCourses = [] }: CourseSelectionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeCourses, setActiveCourses] = useState<Course[]>(initialCourses);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchActiveCourses();
  }, []);

  const fetchActiveCourses = async () => {
    try {
      const response = await fetch("/api/user/courses");
      const data = await response.json();
      setActiveCourses(data.courses ?? []);
    } catch (error) {
      console.error("Error fetching active courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show first 3 active courses
  const displayedCourses = activeCourses.slice(0, 3);
  
  // Fill empty slots
  const emptySlots = Math.max(0, 3 - displayedCourses.length);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    // TODO: Show course details dialog
    console.log("Course clicked:", course);
  };

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Add Course Button - Top Left */}
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className={cn(
                "h-32 flex-col gap-2 border-2 border-dashed",
                "border-muted-foreground/25 bg-muted/20",
                "hover:border-muted-foreground/50 hover:bg-muted/30",
                "transition-all"
              )}
            >
              <Plus className="size-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Add Course
              </span>
            </Button>

            {/* Active Courses */}
            {displayedCourses.map((course) => (
              <Button
                key={course.id}
                variant="outline"
                onClick={() => handleCourseClick(course)}
                className={cn(
                  "h-32 flex-col gap-2 border-2 p-3",
                  "bg-card hover:bg-accent",
                  "transition-all"
                )}
              >
                <BookOpen className="size-6 text-primary flex-shrink-0" />
                <div className="flex flex-col items-center gap-1 w-full overflow-hidden">
                  <span className="text-sm font-semibold line-clamp-3 text-center break-words w-full px-1">
                    {course.name}
                  </span>
                </div>
              </Button>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: emptySlots }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className={cn(
                  "h-32 rounded-lg border-2 border-dashed",
                  "border-muted-foreground/15 bg-muted/10"
                )}
              />
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddCourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

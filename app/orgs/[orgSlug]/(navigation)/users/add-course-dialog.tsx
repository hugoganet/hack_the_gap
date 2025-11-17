"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Subject = {
  id: string;
  name: string;
};

type Course = {
  id: string;
  code: string;
  name: string;
  subjectId: string;
};

type AddCourseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SelectionStep = "subject" | "course";

export function AddCourseDialog({ open, onOpenChange }: AddCourseDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState<SelectionStep>("subject");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Data from API
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      void fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subjectsRes, coursesRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/courses"),
      ]);

      const [subjectsData, coursesData] = await Promise.all([
        subjectsRes.json(),
        coursesRes.json(),
      ]);

      setSubjects(subjectsData.subjects ?? []);
      setCourses(coursesData.courses ?? []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load course data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setCurrentStep("subject");
    setSelectedSubject(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentStep("course");
  };

  const handleCourseSelect = async (course: Course) => {
    setIsAdding(true);
    try {
      const response = await fetch("/api/user/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Added ${course.name} to your courses`);
        handleClose();
        // Refresh the page to show the new course
        window.location.reload();
      } else {
        toast.error(data.error ?? "Failed to add course");
      }
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBack = () => {
    if (currentStep === "course") {
      setCurrentStep("subject");
      setSelectedSubject(null);
    }
  };

  const getBreadcrumb = () => {
    const parts = [];
    if (selectedSubject) parts.push(selectedSubject.name);
    return parts.join(" → ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Course</DialogTitle>
          <DialogDescription>
            Search for a course or browse by subject
          </DialogDescription>
        </DialogHeader>

        {/* Breadcrumb */}
        {getBreadcrumb() && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-7 px-2"
            >
              ← Back
            </Button>
            <span className="font-medium">{getBreadcrumb()}</span>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            /* Search Command Palette */
            <Command className="rounded-lg border">
            <CommandInput
              placeholder="Quick search by course name or code..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="max-h-[400px]">
              <CommandEmpty>No results found.</CommandEmpty>

              {/* Search Results */}
              {searchQuery && (
                <CommandGroup heading="Search Results">
                  {courses
                    .filter(
                      (course) =>
                        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        course.code.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((course) => (
                      <CommandItem
                        key={course.id}
                        onSelect={() => void handleCourseSelect(course)}
                        className="flex items-center gap-3 py-3"
                      >
                        <BookOpen className="size-4 flex-shrink-0" />
                        <span className="font-medium line-clamp-2">{course.name}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {/* Progressive Selection */}
              {!searchQuery && (
                <>
                  {currentStep === "subject" && (
                    <CommandGroup heading="Select Subject">
                      {subjects.map((subject) => (
                        <CommandItem
                          key={subject.id}
                          onSelect={() => handleSubjectSelect(subject)}
                          className="flex items-center justify-between"
                        >
                          <span>{subject.name}</span>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {currentStep === "course" && (
                    <CommandGroup heading="Select Course">
                      {courses
                        .filter(
                          (course) =>
                            course.subjectId === selectedSubject?.id
                        )
                        .map((course) => (
                          <CommandItem
                            key={course.id}
                            onSelect={() => void handleCourseSelect(course)}
                            className="flex items-center gap-3 py-3"
                          >
                            <BookOpen className="size-4 flex-shrink-0" />
                            <span className="font-medium line-clamp-2">{course.name}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
          )}

          {/* Browse Hint */}
          {!isLoading && !searchQuery && currentStep === "subject" && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Or use the search above to find courses quickly
              </p>
            </div>
          )}
        </div>

        {isAdding && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm font-medium">Adding course...</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

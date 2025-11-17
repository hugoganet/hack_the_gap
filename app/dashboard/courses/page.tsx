"use client";

import { Button } from "@/components/ui/button";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CoursesList } from "./_components/courses-list";
import { CreateCourseDialog } from "./_components/create-course-dialog";
import { EmptyCoursesState } from "./_components/empty-courses-state";

type Course = {
  id: string;
  code: string;
  name: string;
  subject: {
    id: string;
    name: string;
  };
  enrolledAt: Date;
  learnedCount: number;
  syllabusConcepts: { id: string }[];
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await fetch("/api/courses");
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
        }

        // Fetch user info
        const userResponse = await fetch("/api/user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserName(userData.name);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  const welcomeMessage = userName ? `Welcome, ${userName}` : "Welcome";

  return (
    <>
      <Layout size="lg">
        <LayoutHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <LayoutTitle>{welcomeMessage}</LayoutTitle>
              <p className="text-muted-foreground text-sm">
                Manage your courses and track your learning progress
              </p>
            </div>
            {courses.length > 0 && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2" />
                New
              </Button>
            )}
          </div>
        </LayoutHeader>

        <LayoutContent className="flex flex-col gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My courses</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading courses...</div>
              </div>
            ) : courses.length === 0 ? (
              <EmptyCoursesState onCreateCourse={() => setIsDialogOpen(true)} />
            ) : (
              <CoursesList courses={courses} />
            )}
          </div>
        </LayoutContent>
      </Layout>

      <CreateCourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

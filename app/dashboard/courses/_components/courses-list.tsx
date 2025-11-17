"use client";

import { CourseCard } from "./course-card";

type CoursesListProps = {
  courses: {
    id: string;
    code: string;
    name: string;
    subject: {
      name: string;
    };
    enrolledAt: Date;
    learnedCount: number;
    syllabusConcepts: { id: string }[];
  }[];
};

export function CoursesList({ courses }: CoursesListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

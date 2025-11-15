import { getAvailableCourses } from "@/app/actions/course-enrollment.action";
import { getUser } from "@/lib/auth/auth-user";
import { redirect } from "next/navigation";
import { CourseSelectionClient } from "./course-selection-client";

export const metadata = {
  title: "Select Your Course",
  description: "Choose a course to start your learning journey",
};

export default async function CourseSelectPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const courses = await getAvailableCourses();

  return <CourseSelectionClient courses={courses} />;
}

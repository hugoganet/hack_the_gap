"use client";

import { enrollInCourse } from "@/app/actions/course-enrollment.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypographyH1, TypographyP } from "@/components/ui/typography";
import { BookOpen, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Course = {
  id: string;
  code: string;
  name: string;
  subject: string;
  year: string | null;
  semester: number | null;
  ueNumber: string | null;
  conceptCount: number;
  isEnrolled: boolean;
};

type CourseSelectionClientProps = {
  courses: Course[];
};

export function CourseSelectionClient({ courses }: CourseSelectionClientProps) {
  const router = useRouter();
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(
    null
  );

  const handleEnroll = async (courseId: string) => {
    setEnrollingCourseId(courseId);

    try {
      const result = await enrollInCourse(courseId);

      if (result.success) {
        toast.success(result.message);
        // Redirect to organization dashboard after successful enrollment
        router.push("/orgs");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const getSubjectIcon = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes("philosophy") || subjectLower.includes("philosophie")) {
      return "🧠";
    } else if (subjectLower.includes("biology") || subjectLower.includes("biologie")) {
      return "🧬";
    } else if (subjectLower.includes("economics") || subjectLower.includes("économie")) {
      return "📊";
    }
    return "📚";
  };

  const getSubjectColor = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    if (subjectLower.includes("philosophy") || subjectLower.includes("philosophie")) {
      return "from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40";
    } else if (subjectLower.includes("biology") || subjectLower.includes("biologie")) {
      return "from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40";
    } else if (subjectLower.includes("economics") || subjectLower.includes("économie")) {
      return "from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40";
    }
    return "from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40";
  };

  if (courses.length === 0) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>No Courses Available</CardTitle>
            <CardDescription>
              There are currently no courses available for enrollment. Please
              check back later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <TypographyH1 className="mb-4">
            Choisissez votre cours
          </TypographyH1>
          <TypographyP className="text-muted-foreground mx-auto max-w-2xl">
            Sélectionnez un cours pour commencer votre parcours d'apprentissage.
            Notre IA extraira automatiquement les concepts clés et créera des
            flashcards personnalisées pour vous.
          </TypographyP>
        </div>

        {/* Course Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={`relative overflow-hidden bg-gradient-to-br transition-all hover:shadow-lg ${getSubjectColor(
                course.subject
              )}`}
            >
              <CardHeader>
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background/50 text-2xl backdrop-blur-sm">
                    {getSubjectIcon(course.subject)}
                  </div>
                  {course.isEnrolled && (
                    <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Inscrit
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{course.name}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="font-mono text-sm font-semibold text-foreground">
                    {course.code}
                  </div>
                  <div className="text-sm">{course.subject}</div>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {course.year && (
                    <div className="flex items-center gap-1 rounded-md bg-background/50 px-2 py-1">
                      <span className="font-medium">Année:</span>
                      <span>{course.year}</span>
                    </div>
                  )}
                  {course.semester && (
                    <div className="flex items-center gap-1 rounded-md bg-background/50 px-2 py-1">
                      <span className="font-medium">Semestre:</span>
                      <span>{course.semester}</span>
                    </div>
                  )}
                  {course.ueNumber && (
                    <div className="flex items-center gap-1 rounded-md bg-background/50 px-2 py-1">
                      <span className="font-medium">UE:</span>
                      <span>{course.ueNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-background/50 p-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {course.conceptCount} concepts
                    </div>
                    <div className="text-xs text-muted-foreground">
                      à maîtriser
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleEnroll(course.id)}
                  disabled={
                    course.isEnrolled || enrollingCourseId === course.id
                  }
                  variant={course.isEnrolled ? "outline" : "default"}
                >
                  {enrollingCourseId === course.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription...
                    </>
                  ) : course.isEnrolled ? (
                    "Déjà inscrit"
                  ) : (
                    "Sélectionner ce cours"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 rounded-lg border bg-muted/50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Comment ça marche ?</h3>
              <p className="text-sm text-muted-foreground">
                Après avoir sélectionné votre cours, vous pourrez soumettre des
                vidéos YouTube, des articles ou d'autres contenus. Notre IA
                extraira automatiquement les concepts clés, les associera au
                programme du cours et créera des flashcards pour vous aider à
                mémoriser à long terme grâce à la répétition espacée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

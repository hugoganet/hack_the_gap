import { Brain, BookOpen, CreditCard, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { getDashboardStats } from "./get-dashboard-stats";

export default async function InformationCards() {
  // Get the current logged-in user
  const user = await getRequiredUser();
  
  // Fetch dashboard statistics for this user
  const stats = await getDashboardStats(user.id);

  // Helper function to format the change percentage
  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change}% from last month`;
  };

  return (
    <div className="flex w-full items-start gap-4 max-lg:flex-col lg:gap-8">
      <Card className="w-full flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Concepts Extracted</CardTitle>
          <Brain className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalConcepts.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">
            {formatChange(stats.conceptsChange)}
          </p>
        </CardContent>
      </Card>
      
      <Card className="w-full flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          <BookOpen className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCourses}</div>
          <p className="text-muted-foreground text-xs">
            {formatChange(stats.coursesChange)}
          </p>
        </CardContent>
      </Card>
      
      <Card className="w-full flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flashcards Created</CardTitle>
          <CreditCard className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFlashcards.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">
            {formatChange(stats.flashcardsChange)}
          </p>
        </CardContent>
      </Card>
      
      <Card className="w-full flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Review Sessions Completed</CardTitle>
          <CheckCircle className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedSessions.toLocaleString()}</div>
          <p className="text-muted-foreground text-xs">
            {formatChange(stats.sessionsChange)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

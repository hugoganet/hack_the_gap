import { Brain, BookOpen, CheckCircle } from "lucide-react";
import { getDashboardStats } from "../get-dashboard-stats";
import { getTranslations } from "next-intl/server";

type QuickStatsProps = {
  userId: string;
};

export async function QuickStats({ userId }: QuickStatsProps) {
  const stats = await getDashboardStats(userId);
  const t = await getTranslations("dashboard.learn.quickStats");

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Brain className="size-4" />
        <span>
          {stats.totalConcepts} {t("concepts")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <BookOpen className="size-4" />
        <span>
          {stats.activeCourses} {t("courses")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="size-4" />
        <span>
          {stats.completedSessions} {t("sessions")}
        </span>
      </div>
    </div>
  );
}

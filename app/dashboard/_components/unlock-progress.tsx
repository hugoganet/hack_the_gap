"use client";

import { Lock, Unlock, Star, TrendingUp, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

type UnlockProgressProps = {
  stats: {
    totalUnlocks: number;
    totalLocked: number;
    totalMastered: number;
    unlockRate: number;
    currentStreak: number;
    longestStreak: number;
  };
};

export function UnlockProgress({ stats }: UnlockProgressProps) {
  const t = useTranslations("dashboard.learn.unlock");

  const total = stats.totalUnlocks + stats.totalLocked + stats.totalMastered;
  const unlockPercentage = total > 0 ? (stats.totalUnlocks / total) * 100 : 0;
  const masteredPercentage = total > 0 ? (stats.totalMastered / total) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("totalConcepts")}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <Progress value={unlockPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {t("percentUnlocked", { percent: Math.round(unlockPercentage) })}
          </p>
        </CardContent>
      </Card>

      {/* Locked */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("locked.title")}</CardTitle>
          <Lock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.totalLocked}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t("locked.hint")}</p>
        </CardContent>
      </Card>

      {/* Unlocked */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("unlocked.title")}</CardTitle>
          <Unlock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalUnlocks}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t("unlocked.hint")}</p>
        </CardContent>
      </Card>

      {/* Mastered */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("mastered.title")}</CardTitle>
          <Star className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.totalMastered}
          </div>
          <Progress value={masteredPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {t("mastered.percent", { percent: Math.round(masteredPercentage) })}
          </p>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("streak.title")}</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-4">
            <div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">{t("streak.current")}</p>
            </div>
            <div>
              <div className="text-xl font-semibold text-muted-foreground">
                {stats.longestStreak}
              </div>
              <p className="text-xs text-muted-foreground">{t("streak.longest")}</p>
            </div>
          </div>
          {stats.currentStreak >= 3 && (
            <Badge variant="default" className="mt-2">
              {t("streak.badge")}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

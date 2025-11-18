import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { ClientOrg } from "./client-org";
import { CardsToReviewToday } from "./cards-to-review-today";
import { UnlockProgress } from "@/components/dashboard/unlock-progress";
import { getTranslations } from "next-intl/server";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
// import { CourseSelectionCard } from "./course-selection-card";

export default async function RoutePage() {
  const t = await getTranslations("dashboard.users");
  const user = await getRequiredUser();

  // Fetch user unlock stats
  const stats = await prisma.userStats.findUnique({
    where: { userId: user.id },
  });

  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>{t("title")}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-4 lg:gap-6">
        {/* Unlock Progress (Gamification) */}
        {stats && (
          <UnlockProgress
            stats={{
              totalUnlocks: stats.totalUnlocks,
              totalLocked: stats.totalLocked,
              totalMastered: stats.totalMastered,
              unlockRate: stats.unlockRate,
              currentStreak: stats.currentStreak,
              longestStreak: stats.longestStreak,
            }}
          />
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* <CourseSelectionCard /> */}
          <ClientOrg />
        </div>
        <CardsToReviewToday />
      </LayoutContent>
    </Layout>
  );
}

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { getRequiredUser } from "@/lib/auth/auth-user";
import { prisma } from "@/lib/prisma";
import { getTranslations, getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { QuickStats } from "./_components/quick-stats";
import { ContentInbox } from "./_components/content-inbox";
import { ReviewQueue } from "./_components/review-queue";
import { UnlockProgress } from "./_components/unlock-progress";

export default async function LearnPage() {
  const user = await getRequiredUser();
  const t = await getTranslations("dashboard.learn");
  const locale = await getLocale();
  const messages = (await import(`../../messages/${locale}.json`)).default;

  // Fetch user unlock stats for gamification
  const stats = await prisma.userStats.findUnique({
    where: { userId: user.id },
  });

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <Layout size="lg">
      <LayoutHeader>
        <div className="space-y-1">
          <LayoutTitle>
            {t("welcome", { name: user.name || "there" })}
          </LayoutTitle>
          <p className="text-muted-foreground text-sm">
            {t("subtitle")}
          </p>
        </div>
      </LayoutHeader>

      <LayoutContent className="flex flex-col gap-6">
        {/* Quick Stats - Inline metrics */}
        <QuickStats userId={user.id} />

        {/* Content Inbox - Drag-and-drop processing */}
        <ContentInbox />

        {/* Review Queue - Cards due today */}
        <ReviewQueue userId={user.id} />

        {/* Gamification - Unlock Progress */}
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
      </LayoutContent>
      </Layout>
    </NextIntlClientProvider>
  );
}

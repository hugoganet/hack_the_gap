import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { ClientOrg } from "./client-org";
import { CardsToReviewToday } from "./cards-to-review-today";
import { getTranslations } from "next-intl/server";
// import { CourseSelectionCard } from "./course-selection-card";

export default async function RoutePage() {
  const t = await getTranslations("dashboard.users");
  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>{t("title")}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* <CourseSelectionCard /> */}
          <ClientOrg />
        </div>
        <CardsToReviewToday />
      </LayoutContent>
    </Layout>
  );
}

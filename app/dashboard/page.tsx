import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import InformationCards from "./information-cards";
import { SubscribersChart } from "./subscribers-charts";
import { getTranslations } from "next-intl/server";

export default async function RoutePage() {
  const t = await getTranslations("dashboard.overview");
  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>{t("title")}</LayoutTitle>
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-4 lg:gap-8">
        <InformationCards />
        <SubscribersChart />
      </LayoutContent>
    </Layout>
  );
}

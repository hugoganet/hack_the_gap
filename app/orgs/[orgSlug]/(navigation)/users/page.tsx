import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { ClientOrg } from "./client-org";
import { DonutChart } from "./donuts-chart";
import { CourseSelectionCard } from "./course-selection-card";

export default function RoutePage() {
  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Videos</LayoutTitle>
      </LayoutHeader>
      <LayoutContent className="flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          <CourseSelectionCard />
          <ClientOrg />
        </div>
        <DonutChart />
      </LayoutContent>
    </Layout>
  );
}

"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTranslations, useFormatter } from "next-intl";

const chartData = [
  { month: 0, desktop: 186, mobile: 80 },
  { month: 1, desktop: 305, mobile: 200 },
  { month: 2, desktop: 237, mobile: 120 },
  { month: 3, desktop: 73, mobile: 190 },
  { month: 4, desktop: 209, mobile: 130 },
  { month: 5, desktop: 214, mobile: 140 },
];

export function UsersChart() {
  const t = useTranslations("dashboard.users.charts.users");
  const f = useFormatter();

  const start = new Date(2024, 0, 1);
  const end = new Date(2024, 5, 1);
  const startLabel = f.dateTime(start, { month: "long" });
  const endLabel = f.dateTime(end, { month: "long" });

  const chartConfig: ChartConfig = {
    desktop: {
      label: t("series.desktop"),
      color: "var(--chart-1)",
    },
    mobile: {
      label: t("series.mobile"),
      color: "var(--chart-2)",
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) =>
                f.dateTime(new Date(2024, value, 1), { month: "short" })
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {t("footer.trending", { percent: 5.2 })} <TrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {startLabel} - {endLabel} 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

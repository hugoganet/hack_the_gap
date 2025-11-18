"use client";

import { animate } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { SectionLayout } from "./section-layout";

type StatProps = {
  number: number;
  suffix: string;
  text: string;
};

export function StatsSection() {
  const t = useTranslations("landing.stats");
  
  const stats: StatProps[] = [
    {
      number: Number(t("forgetting.number")),
      suffix: t("forgetting.suffix"),
      text: t("forgetting.text"),
    },
    {
      number: Number(t("reviewTime.number")),
      suffix: t("reviewTime.suffix"),
      text: t("reviewTime.text"),
    },
    {
      number: Number(t("accuracy.number")),
      suffix: t("accuracy.suffix"),
      text: t("accuracy.text"),
    },
    {
      number: Number(t("manual.number")),
      suffix: t("manual.suffix"),
      text: t("manual.text"),
    },
  ];
  return (
    <SectionLayout size="sm">
      <div className="grid w-full items-center gap-12 sm:grid-cols-2 md:-mx-5 md:max-w-none md:grid-cols-4 md:gap-0">
        {stats.map((stat, index) => (
          <div key={index} className="relative text-center md:px-5">
            <h4 className="mb-2 text-2xl font-bold tabular-nums md:text-3xl">
              <Counter from={0} to={stat.number} />

              {stat.suffix}
            </h4>
            <p className="text-muted-foreground text-sm">{stat.text}</p>
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}

function Counter({
  from,
  to,
  duration = 2,
}: {
  from: number;
  to: number;
  duration?: number;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!nodeRef.current) return;
    const node = nodeRef.current;

    const controls = animate(from, to, {
      duration,
      ease: "easeInOut",

      onUpdate(value) {
        // Show integers for whole numbers, otherwise show 1 decimal place
        node.textContent = Number.isInteger(to) 
          ? Math.round(value).toString() 
          : value.toFixed(1);
      },
    });

    return () => controls.stop();
  }, [from, to, duration]);

  return <span ref={nodeRef}>{from}</span>;
}

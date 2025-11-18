"use client";

import { SiteConfig } from "@/site-config";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthButtonClient } from "../auth/auth-button-client";
import { ThemeToggle } from "../theme/theme-toggle";
import { BrandFont } from "@/styles/fonts";
import { buttonVariants } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
function useBoundedScroll(threshold: number) {
  const { scrollY } = useScroll();
  const scrollYBounded = useMotionValue(0);
  const scrollYBoundedProgress = useTransform(
    scrollYBounded,
    [0, threshold],
    [0, 1],
  );

  useEffect(() => {
    const onChange = (current: number) => {
      const previous = scrollY.getPrevious() ?? 0;
      const diff = current - previous;
      const newScrollYBounded = scrollYBounded.get() + diff;

      scrollYBounded.set(clamp(newScrollYBounded, 0, threshold));
    };

    const deleteEvent = scrollY.on("change", onChange);

    const listener = () => {
      const currentScroll = window.scrollY;
      onChange(currentScroll);
    };

    window.addEventListener("scroll", listener);

    return () => {
      deleteEvent();
      window.removeEventListener("scroll", listener);
    };
  }, [threshold, scrollY, scrollYBounded]);

  return { scrollYBounded, scrollYBoundedProgress };
}

export function LandingHeader() {
  const { scrollYBoundedProgress } = useBoundedScroll(400);
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const scrollYBoundedProgressDelayed = useTransform(
    scrollYBoundedProgress,
    [0, 0.75, 1],
    [0, 0, 1],
  );

  const changeLanguage = (newLocale: string) => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const pathWithoutLocale = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");

    if (typeof document !== "undefined") {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    }

    const dest = pathWithoutLocale === pathname
      ? `/${newLocale}`
      : `/${newLocale}${pathWithoutLocale}${search}`;

    router.replace(dest);
    router.refresh();
  };

  return (
    <motion.header
      style={{
        height: useTransform(scrollYBoundedProgressDelayed, [0, 1], [80, 50]),
      }}
      className="fixed inset-x-0 z-50 flex h-20 w-screen"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-1">
          <motion.p
            style={{
              scale: useTransform(
                scrollYBoundedProgressDelayed,
                [0, 1],
                [1, 0.9],
              ),
              opacity: useTransform(
                scrollYBoundedProgressDelayed,
                [0, 1],
                [1, 0],
              ),
              fontFamily:
                '"BangersLocal", var(--font-brand), var(--font-caption), var(--font-geist-sans), sans-serif',
            }}
            className={`${BrandFont.className} font-brand flex origin-left items-center text-2xl sm:text-3xl font-semibold uppercase`}
          >
            {SiteConfig.title}
          </motion.p>
        </div>
        <motion.nav
          style={{
            opacity: useTransform(
              scrollYBoundedProgressDelayed,
              [0, 1],
              [1, 0],
            ),
          }}
          className="text-muted-foreground flex items-center gap-4 text-sm font-medium"
        >
          <button
            type="button"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            onClick={() => changeLanguage(locale.startsWith("fr") ? "en" : "fr")}
            aria-label="Toggle language"
          >
            {locale.toUpperCase() === "FR" ? "FR" : "EN"}
          </button>
          <AuthButtonClient />
          <ThemeToggle />
        </motion.nav>
      </div>
    </motion.header>
  );
}

const clamp = (number: number, min: number, max: number) =>
  Math.min(Math.max(number, min), max);
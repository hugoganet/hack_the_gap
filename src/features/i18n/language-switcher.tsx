"use client";

import { Button } from "@/components/ui/button";
import { isLocale, locales, type Locale } from "@/i18n";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function withLocale(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) {
    parts[1] = nextLocale;
  } else {
    parts.splice(1, 0, nextLocale);
  }
  let nextPath = parts.join("/");
  if (!nextPath.startsWith("/")) nextPath = `/${  nextPath}`;
  return nextPath.replace(/\/+$/, "");
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const other = (locales.find((l) => l !== locale) || "en") as Locale;

  const onToggle = () => {
    const nextPath = withLocale(pathname || "/", other);
    const qs = params.toString();
    const href = qs ? `${nextPath}?${qs}` : nextPath;
    // persist preference for non-locale URLs as well
    document.cookie = `NEXT_LOCALE=${other}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push(href as any);
  };

  return (
    <Button variant="ghost" size="sm" onClick={onToggle} className="uppercase">
      {other}
    </Button>
  );
}

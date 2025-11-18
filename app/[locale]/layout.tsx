import { NextIntlClientProvider } from "next-intl";
// import { unstable_setRequestLocale } from "next-intl/server"; // Removed in newer next-intl versions
import type { ReactNode } from "react";
import { isLocale, type Locale } from "@/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : "en";

  // unstable_setRequestLocale(locale); // No longer needed

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

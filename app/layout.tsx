import { TailwindIndicator } from "@/components/utils/tailwind-indicator";
import { FloatingLegalFooter } from "@/features/legal/floating-legal-footer";
import { NextTopLoader } from "@/features/page/next-top-loader";
import { ServerToaster } from "@/features/server-sonner/server-toaster";
import { getServerUrl } from "@/lib/server-url";
import { cn } from "@/lib/utils";
import { SiteConfig } from "@/site-config";
import type { LayoutParams } from "@/types/next";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, Suspense } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { FeedbackFloatingButton } from "@/features/contact/feedback/feedback-floating-button";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: SiteConfig.title,
  description: SiteConfig.description,
  metadataBase: new URL(getServerUrl()),
  // Favicon sources:
  // - app/icon.png (served at /icon.png by Next special file route)
  // - public/images/icon.ico (served at /images/icon.ico )
  // Keep both; browsers auto-try /favicon.ico, but we removed it. If you want that path, also copy ICO to public/favicon.ico and add it here.
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/images/icon.png", type: "image/png" },
      { url: "/images/icon.svg", type: "image/svg+xml" },
      { url: "/images/icon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
    shortcut: [
      { url: "/icon.png" },
      { url: "/images/icon.ico" },
    ],
  },
  alternates: {
    languages: {
      en: "/en",
      fr: "/fr",
    },
  },
};

// Martian Grotesk - Main font for body and headings
const MartianGrotesk = localFont({
  src: [
    {
      path: "../public/fonts/MartianGrotesk-StdRg.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/MartianGrotesk-StdMd.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/MartianGrotesk-StdBd.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/MartianGrotesk-StdxBd.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

// Martian Grotesk Bold for headings/titles
const MartianGroteskDisplay = localFont({
  src: [
    {
      path: "../public/fonts/MartianGrotesk-StdBd.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/MartianGrotesk-StdxBd.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-caption",
  display: "swap",
});

 // Monospace for code
const GeistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Brand font for site name "Recall"
const BrandFont = localFont({
  src: [
    { path: "../public/fonts/Bangers-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Bangers-Regular.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Bangers-Regular.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-brand",
  display: "swap",
});

export default async function RootLayout({
  children,
  modal,
}: LayoutParams & { modal?: ReactNode }) {
  const locale = await getLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;
  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "bg-background h-full font-sans antialiased",
          GeistMono.variable,
          MartianGrotesk.variable,
          MartianGroteskDisplay.variable,
          BrandFont.variable,
        )}
      >
        <NuqsAdapter>
          <Providers>
            <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
              <NextTopLoader
                delay={100}
                showSpinner={false}
                color="hsl(var(--primary))"
              />
              {children}
              {modal}
              <TailwindIndicator />
              <FloatingLegalFooter />
              {/* Global feedback floating access */}
              <FeedbackFloatingButton />
              <Suspense>
                <ServerToaster />
              </Suspense>
              <Analytics />
              <SpeedInsights />
            </NextIntlClientProvider>
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}

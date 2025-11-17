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
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
  title: SiteConfig.title,
  description: SiteConfig.description,
  metadataBase: new URL(getServerUrl()),
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

export default async function RootLayout({
  children,
  modal,
}: LayoutParams & { modal?: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className="h-full" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "bg-background h-full font-sans antialiased",
          GeistMono.variable,
          MartianGrotesk.variable,
          MartianGroteskDisplay.variable,
        )}
      >
        <NuqsAdapter>
          <Providers>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <NextTopLoader
                delay={100}
                showSpinner={false}
                color="hsl(var(--primary))"
              />
              {children}
              {modal}
              <TailwindIndicator />
              <FloatingLegalFooter />
              <Suspense>
                <ServerToaster />
              </Suspense>
            </NextIntlClientProvider>
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Layout, LayoutContent } from "@/features/page/layout";
import { SiteConfig } from "@/site-config";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BrandFont } from "@/styles/fonts";

export function Footer() {
  const locale = useLocale();
  const t = useTranslations("footer");
  return (
    <footer className="bg-background border-t pb-8">
      <Layout className="my-14">
        <LayoutContent>
          <div className="flex flex-col gap-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr]">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold tracking-tight font-brand">
                  {SiteConfig.title}
                </h3>
                <p className="text-muted-foreground max-w-xs text-sm">
                  {SiteConfig.description}
                </p>
              </div>

              {/* <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">{t("sections.product")}</h4>
                  <nav className="flex flex-col gap-2">
                    <Button
                      asChild
                      variant="link"
                      className="h-auto justify-start p-0"
                    >
                      <Link href={`/${locale}/posts`}>{t("links.blog")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="link"
                      className="h-auto justify-start p-0"
                    >
                      <Link href={`/${locale}/docs`}>{t("links.docs")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="link"
                      className="h-auto justify-start p-0"
                    >
                      <Link href={`/${locale}/orgs`}>{t("links.dashboard")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="link"
                      className="h-auto justify-start p-0"
                    >
                      <Link href={`/${locale}/account`}>{t("links.account")}</Link>
                    </Button>
                  </nav>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">{t("sections.company")}</h4>
                  <nav className="flex flex-col gap-2">
                    <Button
                      asChild
                      variant="link"
                      className="h-auto justify-start p-0"
                    >
                      <Link href={`/${locale}/about`}>{t("links.about")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="link"
                      className="h-auto justify-start p-0"
                    >
                      <Link href={`/${locale}/contact`}>{t("links.contact")}</Link>
                    </Button>
                  </nav>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="font-medium">{t("sections.legal")}</h4>
                  <nav className="flex flex-col gap-2">
                    <Button
                      asChild
                      variant="link"
                      className="h-auto justify-start p-0"
                    >
                      <Link href={`/${locale}/legal/terms`}>{t("links.terms")}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="link"
                      className="h-auto justify-start p-0"
                    >
                      <Link href={`/${locale}/legal/privacy`}>{t("links.privacy")}</Link>
                    </Button>
                  </nav>
                </div>
              </div> */}
            </div>

            <div className="flex flex-col gap-4 pt-8 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-1">
                {/* <p className="text-muted-foreground text-sm">
                  {SiteConfig.company.address}
                </p> */}
                <p className="text-muted-foreground text-sm">
                  © {new Date().getFullYear()} {SiteConfig.company.name}. All
                  rights reserved.
                </p>
              </div>
            </div>
          </div>
        </LayoutContent>
      </Layout>
    </footer>
  );
}

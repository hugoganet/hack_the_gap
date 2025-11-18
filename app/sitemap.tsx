import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getServerUrl } from "@/lib/server-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerUrl().replace(/\/$/, "");
  const now = new Date();

  // Emit locale roots with language alternates
  const entries: MetadataRoute.Sitemap = locales.map((l) => ({
    url: `${base}/${l}`,
    lastModified: now,
    changeFrequency: "monthly",
    alternates: {
      languages: Object.fromEntries(locales.map((ll) => [ll, `${base}/${ll}`])),
    },
  }));

  return entries;
}

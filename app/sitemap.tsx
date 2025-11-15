import type { MetadataRoute } from "next";

// Posts removed for hackathon - simplified sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: "https://codeline.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    {
      url: "https://codeline.app/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
    {
      url: "https://codeline.app/home",
      lastModified: new Date(),
      changeFrequency: "monthly",
    },
  ];
}

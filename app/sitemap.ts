import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: new URL("/", base).href, changeFrequency: "monthly", priority: 1 },
    { url: new URL("/login", base).href, changeFrequency: "yearly", priority: 0.5 },
  ];
}

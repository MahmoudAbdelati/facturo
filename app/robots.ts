import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      // The app itself is behind the login.
      disallow: ["/overview", "/invoices", "/clients", "/settings", "/welcome-back", "/api/"],
    },
    sitemap: new URL("/sitemap.xml", base).href,
  };
}

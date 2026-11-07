import "@/app/globals.css";
import { geistMono, geistSans } from "@/lib/fonts";
import { Providers } from "@/components/theme/providers";
import { site, siteUrl } from "@/lib/site";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    template: `%s | ${site.name}`,
    default: `${site.name} – ${site.tagline.replace(/\.$/, "")}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} – ${site.tagline.replace(/\.$/, "")}`,
    description: site.description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} – ${site.tagline.replace(/\.$/, "")}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: site.colors.background },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

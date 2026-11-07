/** Public facts about the product, shared by metadata, the OG image, the manifest and robots. */
export const site = {
  name: "Facturo",
  tagline: "Get paid, not chased.",
  description:
    "Facturo is invoicing for freelancers and small studios: send invoices, track what's paid, due and overdue, and see your cash flow.",
  /** Brand colours for places CSS tokens can't reach (images, manifest). */
  colors: {
    background: "#09090b", // zinc-950
    accent: "#10b981", // emerald-500, the dark-mode accent
    fold: "#a7f3d0", // emerald-200, the logo's folded corner in dark mode
  },
};

/**
 * The site's public origin, for absolute URLs in metadata (OG images, canonical links).
 * SITE_URL wins; on Vercel the production domain is used; locally, localhost.
 */
export function siteUrl() {
  if (process.env.SITE_URL) return new URL(process.env.SITE_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}

/** The logo mark's paths (32×32), for images rendered outside React DOM (OG image, icons). */
export const logoPaths = {
  sheet: "M8 0H24L32 8V24A8 8 0 0 1 24 32H8A8 8 0 0 1 0 24V8A8 8 0 0 1 8 0Z",
  fold: "M24 0V6A2 2 0 0 0 26 8H32Z",
  letter:
    "M10 9.5A1.5 1.5 0 0 1 11.5 8H21.5A1.5 1.5 0 0 1 23 9.5V10.5A1.5 1.5 0 0 1 21.5 12H14V14.5H19.5A1.5 1.5 0 0 1 21 16V16.5A1.5 1.5 0 0 1 19.5 18H14V22.5A1.5 1.5 0 0 1 12.5 24H11.5A1.5 1.5 0 0 1 10 22.5Z",
};

// Server only: imported by server actions and server components, never by "use client" files.

/** The shared demo workspace created by `pnpm db:seed`. Same defaults as the seed script. */
export const demoAccount = {
  email: process.env.DEMO_EMAIL ?? "demo@facturo.app",
  password: process.env.DEMO_PASSWORD ?? "facturo-demo",
};

/** Set DEMO_DISABLED=1 to hide "Try the demo" (for a workspace with real data). */
export const demoEnabled = process.env.DEMO_DISABLED !== "1";

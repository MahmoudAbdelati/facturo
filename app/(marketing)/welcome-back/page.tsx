import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";

// The landing page for signed-in visitors. The auth middleware serves it at `/`
// (a rewrite, so the URL stays `/`) and sends direct visits here back to `/`.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SignedInLandingPage() {
  return <LandingPage signedIn />;
}

import { Geist, Geist_Mono, Lusitana } from "next/font/google";

export const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

// Still used by the old dashboard screens until they are rebuilt.
export const lusitana = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
});

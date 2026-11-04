import "@/app/ui/global.css";
import { geistMono, geistSans } from "@/app/ui/fonts";
import { Providers } from "@/components/theme/providers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Facturo",
    default: "Facturo – Get paid, not chased",
  },
  description:
    "Facturo is invoicing for freelancers and small studios: send invoices, track what's paid, due and overdue, and see your cash flow.",
  applicationName: "Facturo",
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

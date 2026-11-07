"use client";

import { useEffect } from "react";
import Link from "next/link";
import "@/app/globals.css";
import { geistMono, geistSans } from "@/lib/fonts";
import { StatusPage } from "@/components/layout/status-page";
import { buttonClasses } from "@/components/ui/button";

// Replaces the root layout when it fails, so it brings its own <html>. Without the theme
// provider, the inline script applies the saved theme (or the device's) itself.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Something went wrong | Facturo</title>
        <script
          // Same choice the theme provider would make, without loading it.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <StatusPage
          code="500"
          title="Something went wrong"
          description="Facturo hit an error it couldn't recover from. Your data is safe; reloading usually fixes it."
          actions={
            <>
              <button type="button" onClick={() => reset()} className={buttonClasses()}>
                Try again
              </button>
              <Link href="/" className={buttonClasses("secondary")}>
                Facturo home
              </Link>
            </>
          }
          footnote={error.digest && `Reference ${error.digest}`}
        />
      </body>
    </html>
  );
}

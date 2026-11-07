import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

/** The signed-in landing page, only ever served at `/` (see the authorized callback). */
const SIGNED_IN_HOME = "/welcome-back";

const appRoutes = ["/overview", "/invoices", "/clients", "/settings"];

function isAppRoute(pathname: string) {
  return appRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      if (isAppRoute(nextUrl.pathname)) return isLoggedIn;

      // Both landing pages are static; signed-in visitors get the one without "Try the demo",
      // which would switch them to the demo account. The URL stays `/`.
      if (nextUrl.pathname === "/" && isLoggedIn) {
        return NextResponse.rewrite(new URL(SIGNED_IN_HOME, nextUrl));
      }
      if (nextUrl.pathname === SIGNED_IN_HOME) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/overview", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

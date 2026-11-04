import type { NextAuthConfig } from "next-auth";

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

      if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/overview", nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

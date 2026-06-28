import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const role = token?.role;

    // CLIENT hitting /therapist/* -> redirect /dashboard
    if (pathname.startsWith("/therapist") && role === "CLIENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // THERAPIST hitting /dashboard -> redirect /therapist/dashboard
    if (pathname.startsWith("/dashboard") && role === "THERAPIST") {
      return NextResponse.redirect(new URL("/therapist/dashboard", req.url));
    }

    // Authenticated user hitting /auth/* -> redirect based on role
    if (pathname.startsWith("/auth/")) {
      if (role === "THERAPIST") {
        return NextResponse.redirect(new URL("/therapist/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // All /api/* and /auth/* paths are public (except if logged in and hitting /auth/*, handled in middleware redirect above)
        if (pathname.startsWith("/api/") || (pathname.startsWith("/auth/") && !token)) {
          return true;
        }

        const protectedPaths = [
          "/dashboard",
          "/journal",
          "/match",
          "/messages",
          "/onboarding",
          "/resources",
          "/session",
          "/therapist",
          "/profile",
          "/settings",
        ];

        const isProtected = protectedPaths.some(
          (path) => pathname === path || pathname.startsWith(path + "/")
        );

        if (isProtected) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/journal/:path*",
    "/match/:path*",
    "/messages/:path*",
    "/onboarding/:path*",
    "/resources/:path*",
    "/session/:path*",
    "/therapist/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};

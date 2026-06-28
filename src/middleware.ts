import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  const protectedPaths = [
    "/dashboard",
    "/journal",
    "/match",
    "/messages",
    "/resources",
    "/session",
    "/therapist",
    "/onboarding",
  ];

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/auth/")) {
    if (token) {
      try {
        const res = await fetch(`${req.nextUrl.origin}/api/user/role`, {
          headers: { cookie: req.headers.get("cookie") || "" },
        });
        const data = await res.json();
        if (data.role === "therapist") {
          return NextResponse.redirect(new URL("/therapist/dashboard", req.url));
        }
      } catch (e) {
        console.warn("Middleware role query failed, defaulting:", e);
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/journal/:path*",
    "/match/:path*",
    "/messages/:path*",
    "/resources/:path*",
    "/session/:path*",
    "/therapist/:path*",
    "/onboarding/:path*",
    "/auth/:path*",
  ],
};

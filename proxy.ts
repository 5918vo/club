import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware running for:", pathname);
  console.log("Cookies:", request.cookies.getAll());

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("token")?.value;
    console.log("Token:", token ? "exists" : "not found");

    if (!token) {
      console.log("No token, redirecting to login");
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const decoded = verifyToken(token);
    console.log("Decoded token:", decoded ? "valid" : "invalid");

    if (!decoded) {
      console.log("Invalid token, redirecting to login");
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
      return response;
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    const token = request.cookies.get("token")?.value;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        console.log("Already logged in, redirecting to admin");
        const adminUrl = new URL("/admin", request.url);
        return NextResponse.redirect(adminUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};

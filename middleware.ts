import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const userProtectedPaths = ["/publish", "/settings"];
const userAuthPages = ["/login", "/register"];

const adminProtectedPaths = ["/admin"];
const adminAuthPages = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userToken = request.cookies.get("token")?.value;
  const adminToken = request.cookies.get("admin_token")?.value;

  const isUserProtectedPath = userProtectedPaths.some((path) => pathname.startsWith(path));
  const isUserAuthPage = userAuthPages.some((path) => pathname === path);

  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminPath && !isAdminLogin) {
    if (!adminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isAdminLogin && adminToken) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isUserProtectedPath && !userToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  if (isUserAuthPage && userToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/publish/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};

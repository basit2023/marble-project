import NextAuth, { type NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { buildCsp } from "@/lib/security";

const { auth } = NextAuth(authConfig);
export default auth(function middleware(request: NextAuthRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !request.auth?.user?.id) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }
  if (pathname === "/admin/login" && request.auth?.user?.id) {
    return NextResponse.redirect(new URL(request.auth.user.forcePasswordChange ? "/admin/change-password" : "/admin", request.url));
  }
  if (pathname.startsWith("/admin") && pathname !== "/admin/change-password" && request.auth?.user?.forcePasswordChange) {
    return NextResponse.redirect(new URL("/admin/change-password", request.url));
  }
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const headers = new Headers(request.headers);
  headers.set("Content-Security-Policy", csp);
  headers.set("x-nonce", nonce);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
});
export const config = { matcher: ["/admin/:path*"] };

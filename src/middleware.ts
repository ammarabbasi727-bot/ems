import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC = ["/", "/login", "/signup"];
const ADMIN_ONLY = ["/dashboard/settings"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname) || pathname.startsWith("/api/auth")) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = (token.role as string)?.toUpperCase();
  if (ADMIN_ONLY.some(p => pathname.startsWith(p)) && role !== "ADMIN" && role !== "ADMINISTRATOR") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/employees/:path*", "/api/departments/:path*", "/api/stats/:path*"],
};

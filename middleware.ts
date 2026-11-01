import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const ADMIN_COOKIE = "nyayasetu_admin_session";
const USER_COOKIE = "nyayasetu_user_session";
const DEFAULT_SECRET = "nayayasetu-institutional-super-secure-jwt-signing-secret-key-2026";
const DEFAULT_USER_SECRET = "nayayasetu-portal-user-authentication-jwt-secret-key-32chars";

function getJwtSecret(isAdmin = true): Uint8Array {
  const secret = isAdmin
    ? process.env.ADMIN_JWT_SECRET || DEFAULT_SECRET
    : process.env.USER_JWT_SECRET || process.env.ADMIN_JWT_SECRET || DEFAULT_USER_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Middleware that protects /admin/* and /dashboard/* routes.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow admin auth API unconditionally
  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  // ── Protected Dashboard Route ─────────────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const userToken = request.cookies.get(USER_COOKIE)?.value;
    if (!userToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    try {
      await jwtVerify(userToken, getJwtSecret(false));
      return NextResponse.next();
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Protected Admin Routes ───────────────────────────────────────────────
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const secret = getJwtSecret(true);
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  let valid = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      valid = payload.role === "admin";
    } catch {
      valid = false;
    }
  }

  // Also accept user session token if user has admin role
  if (!valid) {
    const userToken = request.cookies.get(USER_COOKIE)?.value;
    if (userToken) {
      try {
        const { payload } = await jwtVerify(userToken, getJwtSecret(false));
        valid = payload.role === "admin";
      } catch {
        valid = false;
      }
    }
  }

  if (valid) {
    if (pathname === "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*"],
};

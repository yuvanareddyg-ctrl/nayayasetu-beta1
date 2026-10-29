import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const ADMIN_COOKIE = "nyayasetu_admin_session";

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

/**
 * Edge middleware that protects all /admin/* page routes and
 * /api/admin/login-records (the auth endpoint itself must remain open).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the admin auth API (login / logout) through unconditionally
  if (pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const secret = getJwtSecret();
  if (!secret) {
    // JWT secret not configured — block all admin access
    if (isAdminPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "config");
      return NextResponse.redirect(url);
    }
    return NextResponse.json(
      { error: "Admin authentication is not configured." },
      { status: 503 },
    );
  }

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

  // Allow already-logged-in admins through
  if (valid) {
    // Redirect /admin/login → /admin if already authenticated
    if (pathname === "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Unauthenticated → redirect pages to login, return 401 for APIs
  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Let /admin/login through for unauthenticated users
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

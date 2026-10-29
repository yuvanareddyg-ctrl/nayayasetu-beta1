import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signAdminToken, verifyAdminPassword, ADMIN_COOKIE } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/auth-validation";

export const runtime = "nodejs";

/**
 * POST /api/admin/auth
 *
 * Accepts an admin password, verifies it against the bcrypt hash in the
 * environment, and sets a signed HttpOnly JWT cookie on success.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Request body is required." },
        { status: 400 },
      );
    }

    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 },
      );
    }

    const valid = await verifyAdminPassword(parsed.data.password);
    if (!valid) {
      // Intentionally generic message to avoid username enumeration
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const token = await signAdminToken();
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/admin/auth] Error:", error);
    const isConfig =
      error instanceof Error && error.message.startsWith("ADMIN_");
    return NextResponse.json(
      {
        error: isConfig
          ? "Admin authentication is not configured. Check server environment variables."
          : "Authentication failed. Please try again.",
      },
      { status: isConfig ? 503 : 500 },
    );
  }
}

/**
 * DELETE /api/admin/auth
 *
 * Clears the admin session cookie (sign-out).
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}

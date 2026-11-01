import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/repository";
import { verifyPassword, signUserToken, USER_COOKIE } from "@/lib/auth-user";
import { signAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import { userLoginSchema } from "@/lib/auth-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Request body is required." }, { status: 400 });
    }

    const parsed = userLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await getUserByEmail(email);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { error: "This account has been suspended. Please contact the registry administrator." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const sessionPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      organization: user.organization,
      barCouncilNumber: user.barCouncilNumber,
    };

    const token = await signUserToken(sessionPayload);
    const cookieStore = await cookies();
    cookieStore.set(USER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (user.role === "admin") {
      const adminToken = await signAdminToken();
      cookieStore.set(ADMIN_COOKIE, adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }

    return NextResponse.json({ ok: true, user: sessionPayload });
  } catch (error) {
    console.error("[/api/auth/login] Error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}

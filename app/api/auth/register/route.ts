import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, getUserByEmail } from "@/lib/repository";
import { hashPassword, signUserToken, USER_COOKIE } from "@/lib/auth-user";
import { userRegisterSchema } from "@/lib/auth-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Request body is required." }, { status: 400 });
    }

    const parsed = userRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration details.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role, phone, organization, barCouncilNumber } = parsed.data;

    // Check if email already registered
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      name,
      email,
      passwordHash,
      role,
      phone,
      organization,
      barCouncilNumber,
      status: "active",
    });

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

    return NextResponse.json({ ok: true, user: sessionPayload }, { status: 201 });
  } catch (error) {
    console.error("[/api/auth/register] Error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}


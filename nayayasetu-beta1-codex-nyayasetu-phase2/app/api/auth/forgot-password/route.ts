import { NextResponse } from "next/server";
import { getUserByEmail, updateUser } from "@/lib/repository";
import { forgotPasswordSchema } from "@/lib/auth-validation";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Request body is required." }, { status: 400 });
    }

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const user = await getUserByEmail(parsed.data.email);
    // Generic message to avoid email enumeration
    if (!user) {
      return NextResponse.json({
        ok: true,
        message: "If an account exists with this email, password reset instructions have been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await updateUser(user._id, {
      resetToken,
      resetTokenExpiry: resetExpiry,
    });

    return NextResponse.json({
      ok: true,
      message: "If an account exists with this email, password reset instructions have been sent.",
      // For developer / testing accessibility:
      devResetLink: `/reset-password?token=${resetToken}`,
    });
  } catch (error) {
    console.error("[/api/auth/forgot-password] Error:", error);
    return NextResponse.json(
      { error: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}

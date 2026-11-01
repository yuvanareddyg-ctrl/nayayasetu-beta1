import { NextResponse } from "next/server";
import { listUsers, updateUser } from "@/lib/repository";
import { hashPassword } from "@/lib/auth-user";
import { resetPasswordSchema } from "@/lib/auth-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Request body is required." }, { status: 400 });
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid password reset data.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Find user with this reset token
    const users = await listUsers();
    // Since listUsers strips passwordHash, let's find user directly or via memory/mongo
    // In memory or mongo, let's look for matching token:
    const user = users.find((u) => u.resetToken === token);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    await updateUser(user._id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpiry: undefined,
    });

    return NextResponse.json({
      ok: true,
      message: "Password has been reset successfully. You may now sign in.",
    });
  } catch (error) {
    console.error("[/api/auth/reset-password] Error:", error);
    return NextResponse.json(
      { error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}

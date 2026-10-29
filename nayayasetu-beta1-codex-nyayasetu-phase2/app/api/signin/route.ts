import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { LoginRecordModel } from "@/models/LoginRecord";
import { signInInputSchema } from "@/lib/auth-validation";

export const runtime = "nodejs";

/**
 * POST /api/signin
 *
 * Validates the sign-in payload (username + email), persists a login event
 * to MongoDB, and returns a JSON response. This endpoint does NOT issue an
 * authenticated session — it records that a user identified themselves for
 * audit purposes.
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

    const parsed = signInInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid sign-in data.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { username, email } = parsed.data;

    // Capture request metadata for the audit record
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    await connectToDatabase();

    const record = await LoginRecordModel.create({
      username,
      email,
      loginAt: new Date(),
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        message: "Sign-in recorded successfully.",
        record: {
          id: String(record._id),
          username: record.username,
          email: record.email,
          loginAt: record.loginAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[/api/signin] Error:", error);
    return NextResponse.json(
      { error: "Unable to record sign-in. Please try again." },
      { status: 500 },
    );
  }
}

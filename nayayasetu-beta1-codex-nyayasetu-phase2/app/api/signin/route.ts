import { NextResponse } from "next/server";
import { connectToDatabase, hasMongoUri } from "@/lib/db";
import { LoginRecordModel } from "@/models/LoginRecord";
import { signInInputSchema } from "@/lib/auth-validation";
import { sampleLoginRecords } from "@/lib/sample-data";

export const runtime = "nodejs";

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

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") ?? undefined;

    let recordId = `rec-${Date.now()}`;
    const loginAt = new Date();

    if (hasMongoUri()) {
      try {
        await connectToDatabase();
        const record = await LoginRecordModel.create({
          username,
          email,
          loginAt,
          ipAddress,
          userAgent,
        });
        recordId = String(record._id);
      } catch (dbErr) {
        console.warn("[/api/signin] Mongo connection error, persisting to in-memory audit log:", dbErr);
        sampleLoginRecords.unshift({
          _id: recordId,
          username,
          email,
          loginAt: loginAt.toISOString(),
          ipAddress,
          userAgent,
        });
      }
    } else {
      sampleLoginRecords.unshift({
        _id: recordId,
        username,
        email,
        loginAt: loginAt.toISOString(),
        ipAddress,
        userAgent,
      });
    }

    return NextResponse.json(
      {
        message: "Sign-in recorded successfully.",
        record: {
          id: recordId,
          username,
          email,
          loginAt,
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

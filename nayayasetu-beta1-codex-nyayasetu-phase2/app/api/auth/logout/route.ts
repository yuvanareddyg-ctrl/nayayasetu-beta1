import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER_COOKIE } from "@/lib/auth-user";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
  return NextResponse.json({ ok: true, message: "Logged out successfully." });
}


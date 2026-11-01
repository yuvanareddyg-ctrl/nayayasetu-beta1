import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not retrieve stats.", detail: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}


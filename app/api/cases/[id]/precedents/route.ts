import { NextResponse } from "next/server";
import { recommendPrecedents } from "@/lib/insights";
import { getCase, listPrecedents } from "@/lib/repository";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_: Request, { params }: Context) {
  try {
    const record = await getCase((await params).id);
    if (!record) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    return NextResponse.json({
      label: "Mock relevance recommendations — judicial review required",
      precedents: recommendPrecedents(record, await listPrecedents()),
    });
  } catch (error) {
    return NextResponse.json({ error: "Could not retrieve precedents.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCase, listDocuments } from "@/lib/repository";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_: Request, { params }: Context) {
  try {
    const { id } = await params;
    if (!await getCase(id)) return NextResponse.json({ error: "Case not found." }, { status: 404 });
    return NextResponse.json({ documents: await listDocuments(id) });
  } catch (error) {
    return NextResponse.json({ error: "Could not load documents.", detail: error instanceof Error ? error.message : undefined }, { status: 500 });
  }
}
